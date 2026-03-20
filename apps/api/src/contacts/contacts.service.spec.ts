import { RelationshipTag } from '@prisma/client';
import { ContactsRepository } from './contacts.repository';
import { ContactsService } from './contacts.service';
import { ContactRecord } from './contacts.types';

class ContactsRepositoryFake {
  contacts: ContactRecord[] = [
    {
      id: 'contact_1',
      firstName: 'Jordan',
      lastName: 'Example',
      relationshipTag: RelationshipTag.FRIEND,
      birthday: new Date('1991-04-16T00:00:00.000Z'),
      timezone: 'Europe/Berlin',
      notes: 'College friend',
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
    },
  ];

  findAllByUserId() {
    return Promise.resolve(this.contacts);
  }

  findById(_userId: string, contactId: string) {
    return Promise.resolve(
      this.contacts.find((contact) => contact.id === contactId) ?? null,
    );
  }

  create(params: Parameters<ContactsRepository['create']>[0]) {
    const record = {
      id: `contact_${this.contacts.length + 1}`,
      firstName: params.firstName,
      lastName: params.lastName,
      relationshipTag: params.relationshipTag,
      birthday: params.birthday,
      timezone: params.timezone,
      notes: params.notes,
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    };
    this.contacts.push(record);
    return Promise.resolve(record);
  }

  update(
    _userId: string,
    contactId: string,
    params: Parameters<ContactsRepository['create']>[0],
  ) {
    const index = this.contacts.findIndex(
      (contact) => contact.id === contactId,
    );
    const updatedRecord = {
      ...this.contacts[index],
      firstName: params.firstName,
      lastName: params.lastName,
      relationshipTag: params.relationshipTag,
      birthday: params.birthday,
      timezone: params.timezone,
      notes: params.notes,
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    };
    this.contacts[index] = updatedRecord;
    return Promise.resolve(updatedRecord);
  }

  delete(_userId: string, contactId: string) {
    this.contacts = this.contacts.filter((contact) => contact.id !== contactId);
    return Promise.resolve();
  }

  findPotentialDuplicates(
    _userId: string,
    firstName: string,
    lastName: string,
    excludedContactId?: string,
  ) {
    return Promise.resolve(
      this.contacts
        .filter(
          (contact) =>
            contact.firstName.toLowerCase() === firstName.toLowerCase() &&
            contact.lastName.toLowerCase() === lastName.toLowerCase() &&
            contact.id !== excludedContactId,
        )
        .map((contact) => ({ id: contact.id })),
    );
  }
}

describe('ContactsService', () => {
  let contactsRepository: ContactsRepositoryFake;
  let contactsService: ContactsService;

  beforeEach(() => {
    contactsRepository = new ContactsRepositoryFake();
    contactsService = new ContactsService(
      contactsRepository as unknown as ContactsRepository,
    );
  });

  it('lists contacts for the current user', async () => {
    const response = await contactsService.listContacts('user_1', null);

    expect(response.contacts).toHaveLength(1);
    expect(response.contacts[0]?.firstName).toBe('Jordan');
  });

  it('returns a duplicate warning when a similar contact already exists', async () => {
    const response = await contactsService.createContact('user_1', {
      firstName: 'Jordan',
      lastName: 'Example',
      relationshipTag: 'FAMILY',
      birthday: '1990-01-01',
      timezone: 'Europe/Berlin',
      notes: 'Sibling',
    });

    expect(response.warning?.duplicateContactIds).toContain('contact_1');
  });
});
