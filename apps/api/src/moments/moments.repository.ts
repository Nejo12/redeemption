import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateDraftParams,
  DraftDecisionContext,
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

  findDraftByUserId(
    userId: string,
    draftId: string,
  ): Promise<DraftRecord | null> {
    return this.prisma.draft.findFirst({
      where: {
        id: draftId,
        userId,
      },
      select: draftSelect,
    });
  }

  async findDraftDecisionContext(
    userId: string,
    draftId: string,
  ): Promise<DraftDecisionContext | null> {
    const draft = await this.prisma.draft.findFirst({
      where: {
        id: draftId,
        userId,
      },
      select: draftSelect,
    });

    if (!draft) {
      return null;
    }

    const momentRule = await this.prisma.momentRule.findFirst({
      where: {
        id: draft.momentRuleId,
        userId,
      },
      select: {
        id: true,
        eventType: true,
        leadTimeDays: true,
        deliveryPreference: true,
        approvalMode: true,
        messageTemplate: true,
        photoObjectId: true,
      },
    });

    if (!momentRule) {
      return null;
    }

    const [user, template] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: userId,
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
      }),
      this.prisma.template.findFirst({
        where: {
          id: draft.template.id,
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

    if (!user || !template) {
      return null;
    }

    return {
      user,
      contact: draft.contact,
      template,
      momentRule,
      draft,
    };
  }

  listDueScheduledDrafts(limit: number): Promise<DraftDueRecord[]> {
    return this.prisma.draft.findMany({
      where: {
        status: 'SCHEDULED',
        draftReadyAt: {
          lte: new Date(),
        },
        renderPreviewId: null,
      },
      orderBy: [{ draftReadyAt: 'asc' }, { createdAt: 'asc' }],
      take: limit,
      select: {
        id: true,
        userId: true,
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

  claimDraftForProcessing(draftId: string): Promise<boolean> {
    return this.prisma.draft
      .updateMany({
        where: {
          id: draftId,
          status: 'SCHEDULED',
          renderPreviewId: null,
        },
        data: {
          status: 'PROCESSING',
        },
      })
      .then((result: { count: number }) => result.count > 0);
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

  updateDraftForReview(
    draftId: string,
    params: {
      headline: string;
      message: string;
      fieldValues: Record<string, string>;
      photoObjectId: string | null;
      photoFit: CreateDraftParams['photoFit'];
      renderPreviewId: string;
    },
  ): Promise<DraftRecord> {
    return this.prisma.draft.update({
      where: {
        id: draftId,
      },
      data: {
        status: 'READY_FOR_REVIEW',
        headline: params.headline,
        message: params.message,
        fieldValues: params.fieldValues,
        photoObjectId: params.photoObjectId,
        photoFit: params.photoFit,
        renderPreviewId: params.renderPreviewId,
      },
      select: draftSelect,
    });
  }

  snoozeDraft(draftId: string, draftReadyAt: Date): Promise<DraftRecord> {
    return this.prisma.draft.update({
      where: {
        id: draftId,
      },
      data: {
        status: 'SCHEDULED',
        draftReadyAt,
        renderPreviewId: null,
      },
      select: draftSelect,
    });
  }

  finalizeDraftDecision(params: {
    draftId: string;
    finalStatus: 'APPROVED' | 'SKIPPED';
    momentRuleId: string;
    nextOccurrenceAt: Date | null;
    nextDraftAt: Date | null;
    nextDraft: CreateDraftParams | null;
  }): Promise<void> {
    return this.prisma
      .$transaction(async (transaction) => {
        await transaction.draft.update({
          where: {
            id: params.draftId,
          },
          data: {
            status: params.finalStatus,
          },
        });

        await transaction.momentRule.update({
          where: {
            id: params.momentRuleId,
          },
          data: {
            nextOccurrenceAt: params.nextOccurrenceAt,
            nextDraftAt: params.nextDraftAt,
          },
        });

        if (params.nextDraft) {
          await transaction.draft.create({
            data: {
              ...params.nextDraft,
              fieldValues: params.nextDraft.fieldValues,
            },
          });
        }
      })
      .then(() => undefined);
  }

  resetDraftToScheduled(draftId: string): Promise<void> {
    return this.prisma.draft
      .update({
        where: {
          id: draftId,
        },
        data: {
          status: 'SCHEDULED',
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
