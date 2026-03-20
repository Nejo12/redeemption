import { Injectable } from '@nestjs/common';
import { ContactAddressKind, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  AddressOwnershipRecord,
  ContactRecord,
  DuplicateContactRecord,
  UpsertContactParams,
} from './contacts.types';

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly contactSelect = {
    id: true,
    firstName: true,
    lastName: true,
    relationshipTag: true,
    birthday: true,
    timezone: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    addressLinks: {
      orderBy: [{ kind: 'asc' }, { createdAt: 'asc' }],
      select: {
        kind: true,
        address: {
          select: {
            id: true,
            line1: true,
            line2: true,
            city: true,
            region: true,
            postalCode: true,
            countryCode: true,
            validationStatus: true,
          },
        },
      },
    },
  } satisfies Prisma.ContactSelect;

  async findAllByUserId(
    userId: string,
    search: string | null,
  ): Promise<ContactRecord[]> {
    const where: Prisma.ContactWhereInput = {
      userId,
      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                notes: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.contact.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: this.contactSelect,
    });
  }

  async findById(
    userId: string,
    contactId: string,
  ): Promise<ContactRecord | null> {
    return this.prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
      select: this.contactSelect,
    });
  }

  async create(params: UpsertContactParams): Promise<ContactRecord> {
    return this.prisma.$transaction(async (tx) => {
      const createdContact = await tx.contact.create({
        data: {
          userId: params.userId,
          firstName: params.firstName,
          lastName: params.lastName,
          relationshipTag: params.relationshipTag,
          birthday: params.birthday,
          timezone: params.timezone,
          notes: params.notes,
        },
        select: {
          id: true,
        },
      });

      await this.replaceAddressAssignments(
        tx,
        createdContact.id,
        params.primaryAddressId,
        params.alternateAddressIds,
      );

      return this.findByIdWithClient(tx, params.userId, createdContact.id);
    });
  }

  async update(
    userId: string,
    contactId: string,
    params: UpsertContactParams,
  ): Promise<ContactRecord> {
    return this.prisma.$transaction(async (tx) => {
      await tx.contact.update({
        where: {
          id: contactId,
        },
        data: {
          firstName: params.firstName,
          lastName: params.lastName,
          relationshipTag: params.relationshipTag,
          birthday: params.birthday,
          timezone: params.timezone,
          notes: params.notes,
        },
      });

      await this.replaceAddressAssignments(
        tx,
        contactId,
        params.primaryAddressId,
        params.alternateAddressIds,
      );

      return this.findByIdWithClient(tx, userId, contactId);
    });
  }

  async delete(_userId: string, contactId: string): Promise<void> {
    await this.prisma.contact.delete({
      where: {
        id: contactId,
      },
    });
  }

  async findPotentialDuplicates(
    userId: string,
    firstName: string,
    lastName: string,
    excludedContactId?: string,
  ): Promise<DuplicateContactRecord[]> {
    return this.prisma.contact.findMany({
      where: {
        userId,
        firstName: {
          equals: firstName,
          mode: 'insensitive',
        },
        lastName: {
          equals: lastName,
          mode: 'insensitive',
        },
        ...(excludedContactId
          ? {
              NOT: {
                id: excludedContactId,
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });
  }

  async findAddressesByIds(
    userId: string,
    addressIds: string[],
  ): Promise<AddressOwnershipRecord[]> {
    if (addressIds.length === 0) {
      return [];
    }

    return this.prisma.address.findMany({
      where: {
        userId,
        id: {
          in: addressIds,
        },
      },
      select: {
        id: true,
      },
    });
  }

  private async findByIdWithClient(
    client: Prisma.TransactionClient,
    userId: string,
    contactId: string,
  ): Promise<ContactRecord> {
    const contact = await client.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
      select: this.contactSelect,
    });

    if (!contact) {
      throw new Error('Contact disappeared during transaction.');
    }

    return contact;
  }

  private async replaceAddressAssignments(
    client: Prisma.TransactionClient,
    contactId: string,
    primaryAddressId: string | null,
    alternateAddressIds: string[],
  ): Promise<void> {
    await client.contactAddress.deleteMany({
      where: {
        contactId,
      },
    });

    const assignments = [
      ...(primaryAddressId
        ? [
            {
              contactId,
              addressId: primaryAddressId,
              kind: ContactAddressKind.PRIMARY,
            },
          ]
        : []),
      ...alternateAddressIds.map((addressId) => ({
        contactId,
        addressId,
        kind: ContactAddressKind.ALTERNATE,
      })),
    ];

    if (assignments.length === 0) {
      return;
    }

    await client.contactAddress.createMany({
      data: assignments,
    });
  }
}
