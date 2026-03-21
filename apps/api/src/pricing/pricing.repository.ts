import { ContactAddressKind } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  PricingOrderRecord,
  PricingPrimaryAddressRecord,
  PricingSenderProfileRecord,
  PricingTemplateRecord,
} from './pricing.types';

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOrderById(
    userId: string,
    orderId: string,
  ): Promise<PricingOrderRecord | null> {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        contactId: true,
        templateId: true,
        status: true,
      },
    });
  }

  findTemplateById(templateId: string): Promise<PricingTemplateRecord | null> {
    return this.prisma.template.findUnique({
      where: {
        id: templateId,
      },
      select: {
        id: true,
        widthMm: true,
        heightMm: true,
      },
    });
  }

  async findPrimaryAddressForContact(
    userId: string,
    contactId: string,
  ): Promise<PricingPrimaryAddressRecord | null> {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
      select: {
        addressLinks: {
          where: {
            kind: ContactAddressKind.PRIMARY,
          },
          take: 1,
          select: {
            address: {
              select: {
                countryCode: true,
                validationStatus: true,
              },
            },
          },
        },
      },
    });

    return contact?.addressLinks[0]?.address ?? null;
  }

  findSenderProfileByUserId(
    userId: string,
  ): Promise<PricingSenderProfileRecord | null> {
    return this.prisma.senderProfile.findUnique({
      where: {
        userId,
      },
      select: {
        fullName: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        region: true,
        postalCode: true,
        countryCode: true,
        preferredLocale: true,
        preferredCurrency: true,
      },
    });
  }
}
