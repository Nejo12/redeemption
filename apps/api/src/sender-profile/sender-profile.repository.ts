import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  SenderProfileRecord,
  UpsertSenderProfileParams,
} from './sender-profile.types';

@Injectable()
export class SenderProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<SenderProfileRecord | null> {
    return this.prisma.senderProfile.findUnique({
      where: { userId },
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

  async upsert(
    params: UpsertSenderProfileParams,
  ): Promise<SenderProfileRecord> {
    return this.prisma.senderProfile.upsert({
      where: { userId: params.userId },
      update: {
        fullName: params.fullName,
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,
        city: params.city,
        region: params.region,
        postalCode: params.postalCode,
        countryCode: params.countryCode,
        preferredLocale: params.preferredLocale,
        preferredCurrency: params.preferredCurrency,
      },
      create: {
        userId: params.userId,
        fullName: params.fullName,
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,
        city: params.city,
        region: params.region,
        postalCode: params.postalCode,
        countryCode: params.countryCode,
        preferredLocale: params.preferredLocale,
        preferredCurrency: params.preferredCurrency,
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
