import { Injectable, NotFoundException } from '@nestjs/common';
import {
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

    const contact = await this.contactsRepository.update(
      userId,
      contactId,
      this.toUpsertParams(userId, input),
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
    };
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
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      relationshipTag: contact.relationshipTag,
      birthday: contact.birthday?.toISOString().slice(0, 10) ?? null,
      timezone: contact.timezone,
      notes: contact.notes,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    };
  }
}
