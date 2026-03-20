import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SenderProfileReadinessView,
  SenderProfileResponse,
  SenderProfileView,
  UpsertSenderProfileRequestBody,
} from './sender-profile.contract';
import { SenderProfileRepository } from './sender-profile.repository';
import {
  SenderProfileRecord,
  senderProfileRequiredFields,
} from './sender-profile.types';

const emptyProfile: SenderProfileView = {
  fullName: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  region: null,
  postalCode: null,
  countryCode: null,
  preferredLocale: null,
  preferredCurrency: null,
};

@Injectable()
export class SenderProfileService {
  constructor(
    private readonly senderProfileRepository: SenderProfileRepository,
  ) {}

  async getProfile(userId: string): Promise<SenderProfileResponse> {
    const profile = await this.senderProfileRepository.findByUserId(userId);
    return this.toResponse(profile);
  }

  async upsertProfile(
    userId: string,
    input: UpsertSenderProfileRequestBody,
  ): Promise<SenderProfileResponse> {
    const normalizedProfile = {
      userId,
      fullName: this.normalizeRequiredText(input.fullName, 'fullName'),
      addressLine1: this.normalizeRequiredText(
        input.addressLine1,
        'addressLine1',
      ),
      addressLine2: this.normalizeOptionalText(input.addressLine2),
      city: this.normalizeRequiredText(input.city, 'city'),
      region: this.normalizeRequiredText(input.region, 'region'),
      postalCode: this.normalizeRequiredText(input.postalCode, 'postalCode'),
      countryCode: this.normalizeCountryCode(input.countryCode),
      preferredLocale: this.normalizeLocale(input.preferredLocale),
      preferredCurrency: this.normalizeCurrency(input.preferredCurrency),
    };

    const profile =
      await this.senderProfileRepository.upsert(normalizedProfile);
    return this.toResponse(profile);
  }

  private toResponse(
    profile: SenderProfileRecord | null,
  ): SenderProfileResponse {
    const normalizedProfile = profile ?? emptyProfile;
    return {
      profile: normalizedProfile,
      readiness: this.toReadiness(normalizedProfile),
    };
  }

  private toReadiness(profile: SenderProfileView): SenderProfileReadinessView {
    const missingFields = senderProfileRequiredFields.filter(
      (field) => !profile[field],
    );

    return {
      isReadyForCheckout: missingFields.length === 0,
      missingFields,
    };
  }

  private normalizeRequiredText(value: string, fieldName: string): string {
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return normalized;
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeCountryCode(value: string): string {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) {
      throw new BadRequestException(
        'countryCode must be a two-letter ISO code.',
      );
    }

    return normalized;
  }

  private normalizeCurrency(value: string): string {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new BadRequestException(
        'preferredCurrency must be a three-letter currency code.',
      );
    }

    return normalized;
  }

  private normalizeLocale(value: string): string {
    const normalized = value.trim();
    if (!/^[a-z]{2}-[A-Z]{2}$/.test(normalized)) {
      throw new BadRequestException(
        'preferredLocale must use a locale like en-US.',
      );
    }

    return normalized;
  }
}
