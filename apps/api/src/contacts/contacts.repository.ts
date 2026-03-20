import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  ContactRecord,
  DuplicateContactRecord,
  UpsertContactParams,
} from './contacts.types';

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationshipTag: true,
        birthday: true,
        timezone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationshipTag: true,
        birthday: true,
        timezone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(params: UpsertContactParams): Promise<ContactRecord> {
    return this.prisma.contact.create({
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
        firstName: true,
        lastName: true,
        relationshipTag: true,
        birthday: true,
        timezone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    _userId: string,
    contactId: string,
    params: UpsertContactParams,
  ): Promise<ContactRecord> {
    return this.prisma.contact.update({
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        relationshipTag: true,
        birthday: true,
        timezone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
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
}
