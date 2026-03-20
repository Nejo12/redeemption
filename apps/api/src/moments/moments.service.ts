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
  DraftListResponse,
  DraftView,
  MomentRuleListResponse,
  MomentRuleResponse,
  MomentRuleView,
} from './moments.contract';
import { MomentsRepository } from './moments.repository';
import {
  DraftDueRecord,
  DraftRecord,
  MomentCreationContext,
  MomentRuleRecord,
} from './moments.types';

const dayInMilliseconds = 24 * 60 * 60 * 1000;

@Injectable()
export class MomentsService {
  constructor(
    private readonly momentsRepository: MomentsRepository,
    private readonly storageService: StorageService,
    private readonly renderingService: RenderingService,
  ) {}

  async listMoments(userId: string): Promise<MomentRuleListResponse> {
    await this.materializeDueDrafts(userId);
    const moments = await this.momentsRepository.listMomentsByUserId(userId);

    return {
      moments: moments.map((moment) => this.toMomentRuleView(moment)),
    };
  }

  async listDrafts(userId: string): Promise<DraftListResponse> {
    await this.materializeDueDrafts(userId);
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

    await this.materializeDueDrafts(userId);

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

  private async materializeDueDrafts(userId: string): Promise<void> {
    const dueDrafts =
      await this.momentsRepository.listDueScheduledDraftsByUserId(userId);

    for (const draft of dueDrafts) {
      await this.materializeDraft(userId, draft);
    }
  }

  private async materializeDraft(
    userId: string,
    draft: DraftDueRecord,
  ): Promise<void> {
    const preview = await this.renderingService.createPreview(userId, {
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
