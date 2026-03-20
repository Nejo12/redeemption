import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressValidationStatus } from '@prisma/client';
import {
  AddressListResponse,
  AddressResponse,
  AddressView,
  UpsertAddressRequestBody,
} from './addresses.contract';
import { AddressesRepository } from './addresses.repository';
import { AddressRecord } from './addresses.types';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async listAddresses(
    userId: string,
    search: string | null,
  ): Promise<AddressListResponse> {
    const addresses = await this.addressesRepository.findAllByUserId(
      userId,
      search?.trim() ? search.trim() : null,
    );

    return {
      addresses: addresses.map((address) => this.toAddressView(address)),
    };
  }

  async createAddress(
    userId: string,
    input: UpsertAddressRequestBody,
  ): Promise<AddressResponse> {
    const address = await this.addressesRepository.create(
      this.toUpsertParams(userId, input),
    );

    return {
      address: this.toAddressView(address),
    };
  }

  async updateAddress(
    userId: string,
    addressId: string,
    input: UpsertAddressRequestBody,
  ): Promise<AddressResponse> {
    const existingAddress = await this.addressesRepository.findById(
      userId,
      addressId,
    );
    if (!existingAddress) {
      throw new NotFoundException('Address not found.');
    }

    const address = await this.addressesRepository.update(
      userId,
      addressId,
      this.toUpsertParams(userId, input),
    );

    return {
      address: this.toAddressView(address),
    };
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const existingAddress = await this.addressesRepository.findById(
      userId,
      addressId,
    );
    if (!existingAddress) {
      throw new NotFoundException('Address not found.');
    }

    await this.addressesRepository.delete(userId, addressId);
  }

  private toUpsertParams(userId: string, input: UpsertAddressRequestBody) {
    return {
      userId,
      line1: input.line1.trim(),
      line2: input.line2?.trim() || null,
      city: input.city.trim(),
      region: input.region?.trim() || null,
      postalCode: input.postalCode.trim(),
      countryCode: input.countryCode.trim().toUpperCase(),
      validationStatus: AddressValidationStatus.VALID,
    };
  }

  private toAddressView(address: AddressRecord): AddressView {
    return {
      id: address.id,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      validationStatus: address.validationStatus,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    };
  }
}
