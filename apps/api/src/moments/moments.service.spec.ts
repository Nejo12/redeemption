import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MomentsService } from './moments.service';
import { MomentsRepository } from './moments.repository';
import { StorageService } from '../storage/storage.service';
import { RenderingService } from '../rendering/rendering.service';
import { MomentCreationContext } from './moments.types';

class MomentsRepositoryFake {
  createdDraftStatus: string | null = null;

  findMomentCreationContext(): Promise<MomentCreationContext | null> {
    return Promise.resolve({
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
    });
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
      id: 'draft_1',
      momentRuleId: 'moment_1',
      status: params.status as 'SCHEDULED' | 'READY_FOR_REVIEW',
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
      renderPreviewId: null,
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
            id: 'draft_1',
            momentRuleId: 'moment_1',
            status: 'SCHEDULED' as const,
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
            renderPreviewId: null,
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

  updateDraftAsReadyForReview() {
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
});
