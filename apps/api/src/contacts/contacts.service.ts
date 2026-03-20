import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContactAddressKind } from '@prisma/client';
import {
  ContactAddressView,
  ContactListResponse,
  ContactResponse,
  ContactView,
  DuplicateContactWarning,
  UpsertContactRequestBody,
} from './contacts.contract';
import { ContactsRepository } from './contacts.repository';
import { ContactRecord } from './contacts.types';

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  async listContacts(
    userId: string,
    search: string | null,
  ): Promise<ContactListResponse> {
    const contacts = await this.contactsRepository.findAllByUserId(
      userId,
      search?.trim() ? search.trim() : null,
    );

    return {
      contacts: contacts.map((contact) => this.toContactView(contact)),
    };
  }

  async createContact(
    userId: string,
    input: UpsertContactRequestBody,
  ): Promise<ContactResponse> {
    const params = this.toUpsertParams(userId, input);
    await this.assertAssignedAddressesBelongToUser(
      userId,
      params.primaryAddressId,
      params.alternateAddressIds,
    );
    const contact = await this.contactsRepository.create(params);
    const warning = await this.buildDuplicateWarning(
      userId,
      contact.firstName,
      contact.lastName,
      contact.id,
    );

    return {
      contact: this.toContactView(contact),
      ...(warning ? { warning } : {}),
    };
  }

  async updateContact(
    userId: string,
    contactId: string,
    input: UpsertContactRequestBody,
  ): Promise<ContactResponse> {
    const existingContact = await this.contactsRepository.findById(
      userId,
      contactId,
    );
    if (!existingContact) {
      throw new NotFoundException('Contact not found.');
    }

    const params = this.toUpsertParams(userId, input);
    await this.assertAssignedAddressesBelongToUser(
      userId,
      params.primaryAddressId,
      params.alternateAddressIds,
    );

    const contact = await this.contactsRepository.update(
      userId,
      contactId,
      params,
    );
    const warning = await this.buildDuplicateWarning(
      userId,
      contact.firstName,
      contact.lastName,
      contact.id,
    );

    return {
      contact: this.toContactView(contact),
      ...(warning ? { warning } : {}),
    };
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const existingContact = await this.contactsRepository.findById(
      userId,
      contactId,
    );
    if (!existingContact) {
      throw new NotFoundException('Contact not found.');
    }

    await this.contactsRepository.delete(userId, contactId);
  }

  private toUpsertParams(userId: string, input: UpsertContactRequestBody) {
    return {
      userId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      relationshipTag: input.relationshipTag ?? null,
      birthday: input.birthday
        ? new Date(`${input.birthday}T00:00:00.000Z`)
        : null,
      timezone: input.timezone?.trim() || null,
      notes: input.notes?.trim() || null,
      primaryAddressId: input.primaryAddressId?.trim() || null,
      alternateAddressIds: [...new Set(input.alternateAddressIds ?? [])],
    };
  }

  private async assertAssignedAddressesBelongToUser(
    userId: string,
    primaryAddressId: string | null,
    alternateAddressIds: string[],
  ): Promise<void> {
    const addressIds = [
      ...(primaryAddressId ? [primaryAddressId] : []),
      ...alternateAddressIds,
    ];

    if (addressIds.length === 0) {
      return;
    }

    const distinctAddressIds = [...new Set(addressIds)];

    if (primaryAddressId && alternateAddressIds.includes(primaryAddressId)) {
      throw new BadRequestException(
        'Primary and alternate addresses must be different.',
      );
    }

    const ownedAddresses = await this.contactsRepository.findAddressesByIds(
      userId,
      distinctAddressIds,
    );

    if (ownedAddresses.length !== distinctAddressIds.length) {
      throw new BadRequestException(
        'Assigned addresses must belong to the authenticated user.',
      );
    }
  }

  private async buildDuplicateWarning(
    userId: string,
    firstName: string,
    lastName: string,
    excludedContactId: string,
  ): Promise<DuplicateContactWarning | undefined> {
    const duplicates = await this.contactsRepository.findPotentialDuplicates(
      userId,
      firstName,
      lastName,
      excludedContactId,
    );

    if (duplicates.length === 0) {
      return undefined;
    }

    return {
      duplicateContactIds: duplicates.map((contact) => contact.id),
      message:
        'Potential duplicate contact detected with the same first and last name.',
    };
  }

  private toContactView(contact: ContactRecord): ContactView {
    const primaryAddress =
      contact.addressLinks.find(
        (link) => link.kind === ContactAddressKind.PRIMARY,
      )?.address ?? null;
    const alternateAddresses = contact.addressLinks
      .filter((link) => link.kind === ContactAddressKind.ALTERNATE)
      .map((link) => link.address);

    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      relationshipTag: contact.relationshipTag,
      birthday: contact.birthday?.toISOString().slice(0, 10) ?? null,
      timezone: contact.timezone,
      notes: contact.notes,
      primaryAddress: primaryAddress
        ? this.toContactAddressView(primaryAddress)
        : null,
      alternateAddresses: alternateAddresses.map((address) =>
        this.toContactAddressView(address),
      ),
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    };
  }

  private toContactAddressView(
    address: ContactRecord['addressLinks'][number]['address'],
  ): ContactAddressView {
    return {
      id: address.id,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      validationStatus: address.validationStatus,
    };
  }
}
