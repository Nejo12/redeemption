import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MomentEventType, RenderPhotoFit } from '@prisma/client';
import { RenderingService } from '../rendering/rendering.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateMomentRuleRequestBody,
  DraftResponse,
  DraftMaterializationResponse,
  DraftListResponse,
  DraftView,
  MomentRuleListResponse,
  MomentRuleResponse,
  MomentRuleView,
  SnoozeDraftRequestBody,
  UpdateDraftRequestBody,
} from './moments.contract';
import { MomentsRepository } from './moments.repository';
import {
  DraftDecisionContext,
  DraftDueRecord,
  DraftRecord,
  MomentCreationContext,
  MomentRuleRecord,
} from './moments.types';

const dayInMilliseconds = 24 * 60 * 60 * 1000;
const defaultDraftMaterializationBatchSize = 25;

@Injectable()
export class MomentsService {
  constructor(
    private readonly momentsRepository: MomentsRepository,
    private readonly storageService: StorageService,
    private readonly renderingService: RenderingService,
  ) {}

  async listMoments(userId: string): Promise<MomentRuleListResponse> {
    const moments = await this.momentsRepository.listMomentsByUserId(userId);

    return {
      moments: moments.map((moment) => this.toMomentRuleView(moment)),
    };
  }

  async listDrafts(userId: string): Promise<DraftListResponse> {
    const drafts = await this.momentsRepository.listDraftsByUserId(userId);

    return {
      drafts: drafts.map((draft) => this.toDraftView(draft)),
    };
  }

  async createMomentRule(
    userId: string,
    body: CreateMomentRuleRequestBody,
  ): Promise<MomentRuleResponse> {
    const context = await this.momentsRepository.findMomentCreationContext(
      userId,
      body.contactId,
      body.templateId,
    );
    if (!context) {
      throw new NotFoundException('Contact or template not found.');
    }

    if (body.photoObjectId) {
      await this.storageService.assertOwnedPhotoUpload(
        userId,
        body.photoObjectId,
      );
    }

    const occurrenceDate = this.computeNextOccurrenceDate(context, body);
    const draftReadyAt = new Date(
      occurrenceDate.getTime() - body.leadTimeDays * dayInMilliseconds,
    );
    const personalizedMessage = this.interpolateMessageTemplate(
      context,
      body.messageTemplate,
      body.eventType,
    );
    const draftFieldValues = this.buildDraftFieldValues(
      context,
      personalizedMessage,
    );
    const textField = context.template.fields.find(
      (field) => field.kind === 'TEXT',
    );
    const headline = textField
      ? (draftFieldValues[textField.key] ?? context.contact.firstName)
      : context.contact.firstName;

    const moment = await this.momentsRepository.createMomentRule({
      userId,
      contactId: context.contact.id,
      templateId: context.template.id,
      photoObjectId: body.photoObjectId,
      name: body.name,
      eventType: body.eventType,
      oneOffDate:
        body.eventType === 'ONE_OFF_DATE' && body.oneOffDate
          ? this.parseDateOnly(body.oneOffDate)
          : null,
      leadTimeDays: body.leadTimeDays,
      deliveryPreference: body.deliveryPreference,
      approvalMode: body.approvalMode,
      messageTemplate: body.messageTemplate,
      nextOccurrenceAt: occurrenceDate,
      nextDraftAt: draftReadyAt,
    });

    await this.momentsRepository.createDraft({
      userId,
      momentRuleId: moment.id,
      contactId: context.contact.id,
      templateId: context.template.id,
      photoObjectId: body.photoObjectId,
      status: 'SCHEDULED',
      scheduledFor: occurrenceDate,
      draftReadyAt,
      occurrenceDate,
      headline,
      message: personalizedMessage,
      fieldValues: draftFieldValues,
      photoFit: this.toRenderPhotoFit(body.photoFit),
      renderPreviewId: null,
    });

    const refreshedMoments =
      await this.momentsRepository.listMomentsByUserId(userId);
    const createdMoment = refreshedMoments.find(
      (entry) => entry.id === moment.id,
    );
    if (!createdMoment) {
      throw new NotFoundException('Saved moment could not be reloaded.');
    }

    return {
      moment: this.toMomentRuleView(createdMoment),
    };
  }

  async deleteMomentRule(
    userId: string,
    momentId: string,
  ): Promise<{ deleted: true }> {
    const deleted = await this.momentsRepository.deleteMomentRule(
      userId,
      momentId,
    );
    if (!deleted) {
      throw new NotFoundException('Moment rule not found.');
    }

    return { deleted: true };
  }

  async updateDraft(
    userId: string,
    draftId: string,
    body: UpdateDraftRequestBody,
  ): Promise<DraftResponse> {
    const context = await this.momentsRepository.findDraftDecisionContext(
      userId,
      draftId,
    );
    if (!context) {
      throw new NotFoundException('Draft not found.');
    }

    this.assertDraftReadyForReview(context.draft.status);

    if (body.photoObjectId) {
      await this.storageService.assertOwnedPhotoUpload(
        userId,
        body.photoObjectId,
      );
    }

    const preview = await this.renderingService.createPreview(userId, {
      templateSlug: context.template.slug,
      fieldValues: body.fieldValues,
      photoObjectId: body.photoObjectId,
      photoFit: body.photoFit,
    });

    const updatedDraft = await this.momentsRepository.updateDraftForReview(
      draftId,
      {
        headline: preview.preview.headline,
        message: preview.preview.message,
        fieldValues: preview.preview.fieldValues,
        photoObjectId: preview.preview.photoObjectId,
        photoFit: this.toRenderPhotoFit(preview.preview.photoFit),
        renderPreviewId: preview.preview.id,
      },
    );

    return {
      draft: this.toDraftView(updatedDraft),
    };
  }

  async approveDraft(userId: string, draftId: string): Promise<DraftResponse> {
    return this.finalizeDraftDecision(userId, draftId, 'APPROVED');
  }

  async skipDraft(userId: string, draftId: string): Promise<DraftResponse> {
    return this.finalizeDraftDecision(userId, draftId, 'SKIPPED');
  }

  async snoozeDraft(
    userId: string,
    draftId: string,
    body: SnoozeDraftRequestBody,
  ): Promise<DraftResponse> {
    const context = await this.momentsRepository.findDraftDecisionContext(
      userId,
      draftId,
    );
    if (!context) {
      throw new NotFoundException('Draft not found.');
    }

    this.assertDraftReadyForReview(context.draft.status);

    const nextDraftReadyAt = new Date(body.draftReadyAt);
    if (nextDraftReadyAt.getTime() <= Date.now()) {
      throw new BadRequestException('draftReadyAt must be in the future.');
    }

    if (nextDraftReadyAt.getTime() >= context.draft.scheduledFor.getTime()) {
      throw new BadRequestException(
        'draftReadyAt must be earlier than the send date.',
      );
    }

    const updatedDraft = await this.momentsRepository.snoozeDraft(
      draftId,
      nextDraftReadyAt,
    );

    return {
      draft: this.toDraftView(updatedDraft),
    };
  }

  async materializeDueDrafts(
    limit = defaultDraftMaterializationBatchSize,
  ): Promise<DraftMaterializationResponse> {
    const dueDrafts =
      await this.momentsRepository.listDueScheduledDrafts(limit);
    let claimedDrafts = 0;
    let processedDrafts = 0;
    let failedDrafts = 0;

    for (const draft of dueDrafts) {
      const claimed = await this.momentsRepository.claimDraftForProcessing(
        draft.id,
      );
      if (!claimed) {
        continue;
      }

      claimedDrafts += 1;

      try {
        await this.materializeDraft(draft);
        processedDrafts += 1;
      } catch (error) {
        failedDrafts += 1;
        await this.momentsRepository.resetDraftToScheduled(draft.id);

        if (error instanceof Error) {
          console.error(
            `moments: failed to materialize draft ${draft.id}: ${error.message}`,
          );
        } else {
          console.error(`moments: failed to materialize draft ${draft.id}`);
        }
      }
    }

    return {
      claimedDrafts,
      processedDrafts,
      failedDrafts,
    };
  }

  private async finalizeDraftDecision(
    userId: string,
    draftId: string,
    finalStatus: 'APPROVED' | 'SKIPPED',
  ): Promise<DraftResponse> {
    const context = await this.momentsRepository.findDraftDecisionContext(
      userId,
      draftId,
    );
    if (!context) {
      throw new NotFoundException('Draft not found.');
    }

    this.assertDraftReadyForReview(context.draft.status);

    const nextOccurrenceAt = this.computeFollowingOccurrenceDate(context);
    const nextDraftAt = nextOccurrenceAt
      ? new Date(
          nextOccurrenceAt.getTime() -
            context.momentRule.leadTimeDays * dayInMilliseconds,
        )
      : null;

    await this.momentsRepository.finalizeDraftDecision({
      draftId,
      finalStatus,
      momentRuleId: context.momentRule.id,
      nextOccurrenceAt,
      nextDraftAt,
      nextDraft:
        nextOccurrenceAt && nextDraftAt
          ? this.buildNextScheduledDraft(context, nextOccurrenceAt, nextDraftAt)
          : null,
    });

    const finalizedDraft = await this.momentsRepository.findDraftByUserId(
      userId,
      draftId,
    );
    if (!finalizedDraft) {
      throw new NotFoundException('Updated draft could not be reloaded.');
    }

    return {
      draft: this.toDraftView(finalizedDraft),
    };
  }

  private async materializeDraft(draft: DraftDueRecord): Promise<void> {
    const preview = await this.renderingService.createPreview(draft.userId, {
      templateSlug: draft.template.slug,
      fieldValues: draft.fieldValues,
      photoObjectId: draft.photoObjectId,
      photoFit: draft.photoFit,
    });

    await this.momentsRepository.updateDraftAsReadyForReview(
      draft.id,
      preview.preview.id,
    );
  }

  private assertDraftReadyForReview(status: DraftRecord['status']): void {
    if (status !== 'READY_FOR_REVIEW') {
      throw new BadRequestException(
        'Only drafts waiting for review can be updated.',
      );
    }
  }

  private computeFollowingOccurrenceDate(
    context: DraftDecisionContext,
  ): Date | null {
    if (context.momentRule.eventType === 'ONE_OFF_DATE') {
      return null;
    }

    const birthday = context.contact.birthday;
    if (!birthday) {
      throw new BadRequestException(
        'Selected contact does not have a birthday saved.',
      );
    }

    return this.computeNextBirthdayAfter(
      birthday,
      context.draft.occurrenceDate,
    );
  }

  private computeNextBirthdayAfter(birthday: Date, afterDate: Date): Date {
    const nextDay = new Date(afterDate.getTime() + dayInMilliseconds);
    const nextDayStart = new Date(
      Date.UTC(
        nextDay.getUTCFullYear(),
        nextDay.getUTCMonth(),
        nextDay.getUTCDate(),
      ),
    );
    const candidate = new Date(
      Date.UTC(
        nextDayStart.getUTCFullYear(),
        birthday.getUTCMonth(),
        birthday.getUTCDate(),
      ),
    );

    if (candidate.getTime() >= nextDayStart.getTime()) {
      return candidate;
    }

    return new Date(
      Date.UTC(
        nextDayStart.getUTCFullYear() + 1,
        birthday.getUTCMonth(),
        birthday.getUTCDate(),
      ),
    );
  }

  private buildNextScheduledDraft(
    context: DraftDecisionContext,
    occurrenceDate: Date,
    draftReadyAt: Date,
  ) {
    const personalizedMessage = this.interpolateMessageTemplate(
      {
        user: context.user,
        contact: context.contact,
        template: context.template,
      },
      context.momentRule.messageTemplate,
      context.momentRule.eventType,
    );
    const fieldValues = this.buildDraftFieldValues(
      {
        user: context.user,
        contact: context.contact,
        template: context.template,
      },
      personalizedMessage,
    );
    const textField = context.template.fields.find(
      (field) => field.kind === 'TEXT',
    );

    return {
      userId: context.user.id,
      momentRuleId: context.momentRule.id,
      contactId: context.contact.id,
      templateId: context.template.id,
      photoObjectId: context.momentRule.photoObjectId,
      status: 'SCHEDULED' as const,
      scheduledFor: occurrenceDate,
      draftReadyAt,
      occurrenceDate,
      headline: textField
        ? (fieldValues[textField.key] ?? context.contact.firstName)
        : context.contact.firstName,
      message: personalizedMessage,
      fieldValues,
      photoFit: context.draft.photoFit,
      renderPreviewId: null,
    };
  }

  private computeNextOccurrenceDate(
    context: MomentCreationContext,
    body: CreateMomentRuleRequestBody,
  ): Date {
    if (body.eventType === 'CONTACT_BIRTHDAY') {
      if (!context.contact.birthday) {
        throw new BadRequestException(
          'Selected contact does not have a birthday saved.',
        );
      }

      return this.computeNextBirthday(context.contact.birthday);
    }

    if (!body.oneOffDate) {
      throw new BadRequestException(
        'oneOffDate is required for one-off moment rules.',
      );
    }

    const oneOffDate = this.parseDateOnly(body.oneOffDate);
    if (oneOffDate.getTime() < this.startOfToday().getTime()) {
      throw new BadRequestException('oneOffDate must be today or later.');
    }

    return oneOffDate;
  }

  private computeNextBirthday(birthday: Date): Date {
    const today = this.startOfToday();
    const currentYearOccurrence = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        birthday.getUTCMonth(),
        birthday.getUTCDate(),
      ),
    );

    if (currentYearOccurrence.getTime() >= today.getTime()) {
      return currentYearOccurrence;
    }

    return new Date(
      Date.UTC(
        today.getUTCFullYear() + 1,
        birthday.getUTCMonth(),
        birthday.getUTCDate(),
      ),
    );
  }

  private interpolateMessageTemplate(
    context: MomentCreationContext,
    messageTemplate: string,
    eventType: MomentEventType,
  ): string {
    const senderName =
      context.user.profile?.fullName?.trim() ||
      context.user.displayName?.trim() ||
      'Your friend';
    const occasion =
      eventType === 'CONTACT_BIRTHDAY' ? 'birthday' : 'special day';

    return messageTemplate
      .replaceAll('{first_name}', context.contact.firstName)
      .replaceAll('{sender_name}', senderName)
      .replaceAll('{occasion}', occasion);
  }

  private buildDraftFieldValues(
    context: MomentCreationContext,
    message: string,
  ): Record<string, string> {
    const fieldValues: Record<string, string> = {};
    const textField = context.template.fields.find(
      (field) => field.kind === 'TEXT',
    );
    const textareaField = context.template.fields.find(
      (field) => field.kind === 'TEXTAREA',
    );

    if (textField) {
      fieldValues[textField.key] =
        `${context.contact.firstName} ${context.contact.lastName}`.trim();
    }

    if (textareaField) {
      fieldValues[textareaField.key] = message;
    }

    return fieldValues;
  }

  private parseDateOnly(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private startOfToday(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  private toRenderPhotoFit(
    photoFit: 'FIT' | 'COVER' | null,
  ): RenderPhotoFit | null {
    return photoFit;
  }

  private toMomentRuleView(moment: MomentRuleRecord): MomentRuleView {
    return {
      id: moment.id,
      name: moment.name,
      eventType: moment.eventType,
      oneOffDate: moment.oneOffDate?.toISOString() ?? null,
      leadTimeDays: moment.leadTimeDays,
      deliveryPreference: moment.deliveryPreference,
      approvalMode: moment.approvalMode,
      messageTemplate: moment.messageTemplate,
      photoObjectId: moment.photoObjectId,
      nextOccurrenceAt: moment.nextOccurrenceAt?.toISOString() ?? null,
      nextDraftAt: moment.nextDraftAt?.toISOString() ?? null,
      contact: {
        id: moment.contact.id,
        firstName: moment.contact.firstName,
        lastName: moment.contact.lastName,
        birthday: moment.contact.birthday?.toISOString() ?? null,
      },
      template: {
        id: moment.template.id,
        slug: moment.template.slug,
        name: moment.template.name,
      },
      nextDraft: moment.drafts[0] ? this.toDraftView(moment.drafts[0]) : null,
      createdAt: moment.createdAt.toISOString(),
      updatedAt: moment.updatedAt.toISOString(),
    };
  }

  private toDraftView(draft: DraftRecord): DraftView {
    return {
      id: draft.id,
      momentRuleId: draft.momentRuleId,
      contact: {
        id: draft.contact.id,
        firstName: draft.contact.firstName,
        lastName: draft.contact.lastName,
        birthday: draft.contact.birthday?.toISOString() ?? null,
      },
      template: {
        id: draft.template.id,
        slug: draft.template.slug,
        name: draft.template.name,
      },
      status: draft.status,
      scheduledFor: draft.scheduledFor.toISOString(),
      draftReadyAt: draft.draftReadyAt.toISOString(),
      occurrenceDate: draft.occurrenceDate.toISOString(),
      headline: draft.headline,
      message: draft.message,
      fieldValues: draft.fieldValues as Record<string, string>,
      photoObjectId: draft.photoObjectId,
      photoFit: draft.photoFit,
      renderPreviewId: draft.renderPreviewId,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    };
  }
}
