import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateDraftParams,
  CreateMomentRuleParams,
  DraftDueRecord,
  DraftRecord,
  MomentCreationContext,
  MomentRuleRecord,
} from './moments.types';

const draftSelect = {
  id: true,
  momentRuleId: true,
  status: true,
  scheduledFor: true,
  draftReadyAt: true,
  occurrenceDate: true,
  headline: true,
  message: true,
  fieldValues: true,
  photoObjectId: true,
  photoFit: true,
  renderPreviewId: true,
  createdAt: true,
  updatedAt: true,
  contact: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthday: true,
    },
  },
  template: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
} as const;

@Injectable()
export class MomentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMomentCreationContext(
    userId: string,
    contactId: string,
    templateId: string,
  ): Promise<MomentCreationContext | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        contacts: {
          some: {
            id: contactId,
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        profile: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const [contact, template] = await Promise.all([
      this.prisma.contact.findFirst({
        where: {
          id: contactId,
          userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthday: true,
        },
      }),
      this.prisma.template.findFirst({
        where: {
          id: templateId,
          isActive: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          fields: {
            orderBy: {
              position: 'asc',
            },
            select: {
              key: true,
              label: true,
              kind: true,
              required: true,
              maxLength: true,
              position: true,
            },
          },
        },
      }),
    ]);

    if (!contact || !template) {
      return null;
    }

    return {
      user,
      contact,
      template,
    };
  }

  createMomentRule(params: CreateMomentRuleParams): Promise<MomentRuleRecord> {
    return this.prisma.momentRule.create({
      data: params,
      select: {
        id: true,
        name: true,
        eventType: true,
        oneOffDate: true,
        leadTimeDays: true,
        deliveryPreference: true,
        approvalMode: true,
        messageTemplate: true,
        photoObjectId: true,
        nextOccurrenceAt: true,
        nextDraftAt: true,
        createdAt: true,
        updatedAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthday: true,
          },
        },
        template: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        drafts: {
          orderBy: [{ occurrenceDate: 'asc' }, { createdAt: 'asc' }],
          take: 1,
          select: draftSelect,
        },
      },
    });
  }

  createDraft(params: CreateDraftParams): Promise<DraftRecord> {
    return this.prisma.draft.create({
      data: {
        ...params,
        fieldValues: params.fieldValues,
      },
      select: draftSelect,
    });
  }

  listMomentsByUserId(userId: string): Promise<MomentRuleRecord[]> {
    return this.prisma.momentRule.findMany({
      where: {
        userId,
      },
      orderBy: [{ nextDraftAt: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        eventType: true,
        oneOffDate: true,
        leadTimeDays: true,
        deliveryPreference: true,
        approvalMode: true,
        messageTemplate: true,
        photoObjectId: true,
        nextOccurrenceAt: true,
        nextDraftAt: true,
        createdAt: true,
        updatedAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthday: true,
          },
        },
        template: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        drafts: {
          orderBy: [{ occurrenceDate: 'asc' }, { createdAt: 'asc' }],
          take: 1,
          select: draftSelect,
        },
      },
    });
  }

  listDraftsByUserId(userId: string): Promise<DraftRecord[]> {
    return this.prisma.draft.findMany({
      where: {
        userId,
      },
      orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'asc' }],
      select: draftSelect,
    });
  }

  listDueScheduledDraftsByUserId(userId: string): Promise<DraftDueRecord[]> {
    return this.prisma.draft.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        draftReadyAt: {
          lte: new Date(),
        },
        renderPreviewId: null,
      },
      orderBy: [{ draftReadyAt: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        photoObjectId: true,
        photoFit: true,
        fieldValues: true,
        momentRuleId: true,
        template: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    }) as Promise<DraftDueRecord[]>;
  }

  updateDraftAsReadyForReview(
    draftId: string,
    renderPreviewId: string,
  ): Promise<void> {
    return this.prisma.draft
      .update({
        where: {
          id: draftId,
        },
        data: {
          status: 'READY_FOR_REVIEW',
          renderPreviewId,
        },
      })
      .then(() => undefined);
  }

  deleteMomentRule(userId: string, momentId: string): Promise<boolean> {
    return this.prisma.momentRule
      .deleteMany({
        where: {
          id: momentId,
          userId,
        },
      })
      .then((result: { count: number }) => result.count > 0);
  }
}
