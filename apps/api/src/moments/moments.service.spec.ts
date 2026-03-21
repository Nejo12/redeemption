import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { MomentsRepository } from './moments.repository';
import { StorageService } from '../storage/storage.service';
import { RenderingService } from '../rendering/rendering.service';
import { MomentCreationContext } from './moments.types';

class MomentsRepositoryFake {
  createdDraftStatus: string | null = null;
  finalizedDecision: {
    finalStatus: 'APPROVED' | 'SKIPPED';
    nextOccurrenceAt: Date | null;
    nextDraftAt: Date | null;
    nextDraft: unknown;
  } | null = null;
  snoozedDraftReadyAt: Date | null = null;
  updatedDraftPayload: {
    headline: string;
    message: string;
    fieldValues: Record<string, string>;
    photoObjectId: string | null;
    photoFit: 'FIT' | 'COVER' | null;
    renderPreviewId: string;
  } | null = null;

  private buildDraft(
    status:
      | 'SCHEDULED'
      | 'PROCESSING'
      | 'READY_FOR_REVIEW'
      | 'APPROVED'
      | 'SKIPPED' = 'READY_FOR_REVIEW',
  ) {
    return {
      id: 'draft_1',
      momentRuleId: 'moment_1',
      status,
      scheduledFor: new Date('2099-04-16T00:00:00.000Z'),
      draftReadyAt: new Date('2099-04-09T00:00:00.000Z'),
      occurrenceDate: new Date('2099-04-16T00:00:00.000Z'),
      headline: 'Mira Cole',
      message: 'Happy birthday, Mira. From Olaniyi A..',
      fieldValues: {
        recipient_name: 'Mira Cole',
        message_body: 'Happy birthday, Mira. From Olaniyi A..',
      },
      photoObjectId: null,
      photoFit: null,
      renderPreviewId: 'preview_1',
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      contact: {
        id: 'contact_1',
        firstName: 'Mira',
        lastName: 'Cole',
        birthday: new Date('1992-04-16T00:00:00.000Z'),
      },
      template: {
        id: 'template_1',
        slug: 'birthday-bloom',
        name: 'Birthday Bloom',
      },
    };
  }

  private buildMomentCreationContext(): MomentCreationContext {
    return {
      user: {
        id: 'user_1',
        displayName: 'Olaniyi',
        profile: {
          fullName: 'Olaniyi A.',
        },
      },
      contact: {
        id: 'contact_1',
        firstName: 'Mira',
        lastName: 'Cole',
        birthday: new Date('1992-04-16T00:00:00.000Z'),
      },
      template: {
        id: 'template_1',
        slug: 'birthday-bloom',
        name: 'Birthday Bloom',
        fields: [
          {
            key: 'recipient_name',
            label: 'Recipient name',
            kind: 'TEXT' as const,
            required: true,
            maxLength: 40,
            position: 1,
          },
          {
            key: 'message_body',
            label: 'Message',
            kind: 'TEXTAREA' as const,
            required: true,
            maxLength: 420,
            position: 2,
          },
          {
            key: 'photo',
            label: 'Photo',
            kind: 'PHOTO' as const,
            required: false,
            maxLength: null,
            position: 3,
          },
        ],
      },
    };
  }

  private buildDraftDecisionContext(): MomentCreationContext & {
    momentRule: {
      id: string;
      eventType: 'CONTACT_BIRTHDAY';
      leadTimeDays: number;
      deliveryPreference: 'ARRIVE_BY';
      approvalMode: 'ALWAYS_ASK';
      messageTemplate: string;
      photoObjectId: string | null;
    };
    draft: ReturnType<MomentsRepositoryFake['buildDraft']>;
  } {
    return {
      ...this.buildMomentCreationContext(),
      momentRule: {
        id: 'moment_1',
        eventType: 'CONTACT_BIRTHDAY',
        leadTimeDays: 7,
        deliveryPreference: 'ARRIVE_BY',
        approvalMode: 'ALWAYS_ASK',
        messageTemplate: 'Happy {occasion}, {first_name}. From {sender_name}.',
        photoObjectId: null,
      },
      draft: this.buildDraft(),
    };
  }

  findMomentCreationContext(): Promise<MomentCreationContext | null> {
    return Promise.resolve(this.buildMomentCreationContext());
  }

  createMomentRule() {
    return Promise.resolve({
      id: 'moment_1',
      name: 'Mira birthday',
      eventType: 'CONTACT_BIRTHDAY' as const,
      oneOffDate: null,
      leadTimeDays: 7,
      deliveryPreference: 'ARRIVE_BY' as const,
      approvalMode: 'ALWAYS_ASK' as const,
      messageTemplate: 'Happy {occasion}, {first_name}. From {sender_name}.',
      photoObjectId: null,
      nextOccurrenceAt: new Date('2099-04-16T00:00:00.000Z'),
      nextDraftAt: new Date('2099-04-09T00:00:00.000Z'),
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
      contact: {
        id: 'contact_1',
        firstName: 'Mira',
        lastName: 'Cole',
        birthday: new Date('1992-04-16T00:00:00.000Z'),
      },
      template: {
        id: 'template_1',
        slug: 'birthday-bloom',
        name: 'Birthday Bloom',
      },
      drafts: [],
    });
  }

  createDraft(params: { status: string }) {
    this.createdDraftStatus = params.status;
    return Promise.resolve({
      ...this.buildDraft(params.status as 'SCHEDULED' | 'READY_FOR_REVIEW'),
      renderPreviewId: null,
    });
  }

  listMomentsByUserId() {
    return Promise.resolve([
      {
        id: 'moment_1',
        name: 'Mira birthday',
        eventType: 'CONTACT_BIRTHDAY' as const,
        oneOffDate: null,
        leadTimeDays: 7,
        deliveryPreference: 'ARRIVE_BY' as const,
        approvalMode: 'ALWAYS_ASK' as const,
        messageTemplate: 'Happy {occasion}, {first_name}. From {sender_name}.',
        photoObjectId: null,
        nextOccurrenceAt: new Date('2099-04-16T00:00:00.000Z'),
        nextDraftAt: new Date('2099-04-09T00:00:00.000Z'),
        createdAt: new Date('2026-03-21T00:00:00.000Z'),
        updatedAt: new Date('2026-03-21T00:00:00.000Z'),
        contact: {
          id: 'contact_1',
          firstName: 'Mira',
          lastName: 'Cole',
          birthday: new Date('1992-04-16T00:00:00.000Z'),
        },
        template: {
          id: 'template_1',
          slug: 'birthday-bloom',
          name: 'Birthday Bloom',
        },
        drafts: [
          {
            ...this.buildDraft('SCHEDULED'),
            renderPreviewId: null,
          },
        ],
      },
    ]);
  }

  listDraftsByUserId() {
    return Promise.resolve([]);
  }

  listDueScheduledDraftsByUserId() {
    return Promise.resolve([]);
  }

  findDraftDecisionContext() {
    return Promise.resolve(this.buildDraftDecisionContext());
  }

  findDraftByUserId() {
    return Promise.resolve(this.buildDraft('APPROVED'));
  }

  updateDraftAsReadyForReview() {
    return Promise.resolve();
  }

  updateDraftForReview(
    draftId: string,
    params: {
      headline: string;
      message: string;
      fieldValues: Record<string, string>;
      photoObjectId: string | null;
      photoFit: 'FIT' | 'COVER' | null;
      renderPreviewId: string;
    },
  ) {
    void draftId;
    this.updatedDraftPayload = params;

    return Promise.resolve({
      ...this.buildDraft('READY_FOR_REVIEW'),
      headline: params.headline,
      message: params.message,
      fieldValues: params.fieldValues,
      photoObjectId: params.photoObjectId,
      photoFit: params.photoFit,
      renderPreviewId: params.renderPreviewId,
    });
  }

  snoozeDraft(draftId: string, draftReadyAt: Date) {
    void draftId;
    this.snoozedDraftReadyAt = draftReadyAt;

    return Promise.resolve({
      ...this.buildDraft('SCHEDULED'),
      draftReadyAt,
      renderPreviewId: null,
    });
  }

  finalizeDraftDecision(params: {
    finalStatus: 'APPROVED' | 'SKIPPED';
    nextOccurrenceAt: Date | null;
    nextDraftAt: Date | null;
    nextDraft: unknown;
  }) {
    this.finalizedDecision = params;
    return Promise.resolve();
  }

  deleteMomentRule() {
    return Promise.resolve(true);
  }
}

class StorageServiceFake {
  assertOwnedPhotoUpload() {
    return Promise.resolve({
      id: 'photo_1',
    });
  }
}

class RenderingServiceFake {
  createPreview() {
    return Promise.resolve({
      preview: {
        id: 'preview_1',
        headline: 'Updated headline',
        message: 'Updated message body',
        fieldValues: {
          recipient_name: 'Updated headline',
          message_body: 'Updated message body',
        },
        photoObjectId: 'photo_1',
        photoFit: 'FIT' as const,
      },
    });
  }
}

describe('MomentsService', () => {
  let repository: MomentsRepositoryFake;
  let service: MomentsService;

  beforeEach(() => {
    repository = new MomentsRepositoryFake();
    service = new MomentsService(
      repository as unknown as MomentsRepository,
      new StorageServiceFake() as unknown as StorageService,
      new RenderingServiceFake() as unknown as RenderingService,
    );
  });

  it('creates a moment rule and schedules its next draft', async () => {
    const response = await service.createMomentRule('user_1', {
      name: 'Mira birthday',
      contactId: 'contact_1',
      templateId: 'template_1',
      eventType: 'CONTACT_BIRTHDAY',
      oneOffDate: null,
      leadTimeDays: 7,
      deliveryPreference: 'ARRIVE_BY',
      approvalMode: 'ALWAYS_ASK',
      messageTemplate: 'Happy {occasion}, {first_name}. From {sender_name}.',
      photoObjectId: null,
      photoFit: null,
    });

    expect(response.moment.name).toBe('Mira birthday');
    expect(repository.createdDraftStatus).toBe('SCHEDULED');
    expect(response.moment.nextDraft?.headline).toBe('Mira Cole');
  });

  it('rejects birthday moments when the contact has no birthday', async () => {
    repository.findMomentCreationContext = () =>
      Promise.resolve({
        user: {
          id: 'user_1',
          displayName: 'Olaniyi',
          profile: null,
        },
        contact: {
          id: 'contact_1',
          firstName: 'Mira',
          lastName: 'Cole',
          birthday: null,
        },
        template: {
          id: 'template_1',
          slug: 'birthday-bloom',
          name: 'Birthday Bloom',
          fields: [],
        },
      });

    await expect(
      service.createMomentRule('user_1', {
        name: 'Mira birthday',
        contactId: 'contact_1',
        templateId: 'template_1',
        eventType: 'CONTACT_BIRTHDAY',
        oneOffDate: null,
        leadTimeDays: 7,
        deliveryPreference: 'ARRIVE_BY',
        approvalMode: 'ALWAYS_ASK',
        messageTemplate: 'Happy {occasion}, {first_name}.',
        photoObjectId: null,
        photoFit: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects one-off moments in the past', async () => {
    await expect(
      service.createMomentRule('user_1', {
        name: 'Housewarming',
        contactId: 'contact_1',
        templateId: 'template_1',
        eventType: 'ONE_OFF_DATE',
        oneOffDate: '2020-01-01',
        leadTimeDays: 7,
        deliveryPreference: 'ARRIVE_BY',
        approvalMode: 'ALWAYS_ASK',
        messageTemplate: 'Enjoy the new place.',
        photoObjectId: null,
        photoFit: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails when the contact or template context is missing', async () => {
    repository.findMomentCreationContext = () => Promise.resolve(null);

    await expect(
      service.createMomentRule('user_1', {
        name: 'Housewarming',
        contactId: 'contact_1',
        templateId: 'template_1',
        eventType: 'ONE_OFF_DATE',
        oneOffDate: '2099-01-01',
        leadTimeDays: 7,
        deliveryPreference: 'ARRIVE_BY',
        approvalMode: 'ALWAYS_ASK',
        messageTemplate: 'Enjoy the new place.',
        photoObjectId: null,
        photoFit: null,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a review-ready draft and regenerates its preview', async () => {
    const response = await service.updateDraft('user_1', 'draft_1', {
      fieldValues: {
        recipient_name: 'Updated headline',
        message_body: 'Updated message body',
      },
      photoObjectId: 'photo_1',
      photoFit: 'FIT',
    });

    expect(repository.updatedDraftPayload?.renderPreviewId).toBe('preview_1');
    expect(response.draft.headline).toBe('Updated headline');
    expect(response.draft.photoObjectId).toBe('photo_1');
  });

  it('approves a review-ready draft and schedules the next occurrence', async () => {
    const response = await service.approveDraft('user_1', 'draft_1');

    expect(repository.finalizedDecision?.finalStatus).toBe('APPROVED');
    expect(repository.finalizedDecision?.nextOccurrenceAt?.toISOString()).toBe(
      '2100-04-16T00:00:00.000Z',
    );
    expect(repository.finalizedDecision?.nextDraftAt?.toISOString()).toBe(
      '2100-04-09T00:00:00.000Z',
    );
    expect(response.draft.status).toBe('APPROVED');
  });

  it('rejects snooze requests that move the draft to or past the send date', async () => {
    await expect(
      service.snoozeDraft('user_1', 'draft_1', {
        draftReadyAt: '2099-04-16T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
