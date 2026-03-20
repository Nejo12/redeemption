import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AddressRecord, UpsertAddressParams } from './addresses.types';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(
    userId: string,
    search: string | null,
  ): Promise<AddressRecord[]> {
    const where: Prisma.AddressWhereInput = {
      userId,
      ...(search
        ? {
            OR: [
              {
                line1: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                city: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                region: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                postalCode: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                countryCode: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.address.findMany({
      where,
      orderBy: [
        { countryCode: 'asc' },
        { city: 'asc' },
        { postalCode: 'asc' },
        { line1: 'asc' },
      ],
      select: {
        id: true,
        line1: true,
        line2: true,
        city: true,
        region: true,
        postalCode: true,
        countryCode: true,
        validationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(
    userId: string,
    addressId: string,
  ): Promise<AddressRecord | null> {
    return this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
      select: {
        id: true,
        line1: true,
        line2: true,
        city: true,
        region: true,
        postalCode: true,
        countryCode: true,
        validationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(params: UpsertAddressParams): Promise<AddressRecord> {
    return this.prisma.address.create({
      data: {
        userId: params.userId,
        line1: params.line1,
        line2: params.line2,
        city: params.city,
        region: params.region,
        postalCode: params.postalCode,
        countryCode: params.countryCode,
        validationStatus: params.validationStatus,
      },
      select: {
        id: true,
        line1: true,
        line2: true,
        city: true,
        region: true,
        postalCode: true,
        countryCode: true,
        validationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    _userId: string,
    addressId: string,
    params: UpsertAddressParams,
  ): Promise<AddressRecord> {
    return this.prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        line1: params.line1,
        line2: params.line2,
        city: params.city,
        region: params.region,
        postalCode: params.postalCode,
        countryCode: params.countryCode,
        validationStatus: params.validationStatus,
      },
      select: {
        id: true,
        line1: true,
        line2: true,
        city: true,
        region: true,
        postalCode: true,
        countryCode: true,
        validationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(_userId: string, addressId: string): Promise<void> {
    await this.prisma.address.delete({
      where: {
        id: addressId,
      },
    });
  }
}
