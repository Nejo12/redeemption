import { AddressValidationStatus } from '@prisma/client';
import { AddressesRepository } from './addresses.repository';
import { AddressesService } from './addresses.service';
import { AddressRecord } from './addresses.types';

class AddressesRepositoryFake {
  addresses: AddressRecord[] = [
    {
      id: 'address_1',
      line1: '12 Orchard Row',
      line2: null,
      city: 'Berlin',
      region: 'Berlin',
      postalCode: '10115',
      countryCode: 'DE',
      validationStatus: AddressValidationStatus.VALID,
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
    },
  ];

  findAllByUserId() {
    return Promise.resolve(this.addresses);
  }

  findById(_userId: string, addressId: string) {
    return Promise.resolve(
      this.addresses.find((address) => address.id === addressId) ?? null,
    );
  }

  create(params: Parameters<AddressesRepository['create']>[0]) {
    const record: AddressRecord = {
      id: `address_${this.addresses.length + 1}`,
      line1: params.line1,
      line2: params.line2,
      city: params.city,
      region: params.region,
      postalCode: params.postalCode,
      countryCode: params.countryCode,
      validationStatus: params.validationStatus,
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    };
    this.addresses.push(record);
    return Promise.resolve(record);
  }

  update(
    _userId: string,
    addressId: string,
    params: Parameters<AddressesRepository['create']>[0],
  ) {
    const index = this.addresses.findIndex(
      (address) => address.id === addressId,
    );
    const updatedRecord: AddressRecord = {
      ...this.addresses[index],
      line1: params.line1,
      line2: params.line2,
      city: params.city,
      region: params.region,
      postalCode: params.postalCode,
      countryCode: params.countryCode,
      validationStatus: params.validationStatus,
      updatedAt: new Date('2026-03-21T00:00:00.000Z'),
    };
    this.addresses[index] = updatedRecord;
    return Promise.resolve(updatedRecord);
  }

  delete(_userId: string, addressId: string) {
    this.addresses = this.addresses.filter(
      (address) => address.id !== addressId,
    );
    return Promise.resolve();
  }
}

describe('AddressesService', () => {
  let addressesRepository: AddressesRepositoryFake;
  let addressesService: AddressesService;

  beforeEach(() => {
    addressesRepository = new AddressesRepositoryFake();
    addressesService = new AddressesService(
      addressesRepository as unknown as AddressesRepository,
    );
  });

  it('lists addresses for the current user', async () => {
    const response = await addressesService.listAddresses('user_1', null);

    expect(response.addresses).toHaveLength(1);
    expect(response.addresses[0]?.city).toBe('Berlin');
  });

  it('creates a valid address record when required fields are present', async () => {
    const response = await addressesService.createAddress('user_1', {
      line1: '48 Market Street',
      city: 'Dublin',
      region: 'Leinster',
      postalCode: 'D02',
      countryCode: 'IE',
    });

    expect(response.address.validationStatus).toBe('VALID');
    expect(response.address.countryCode).toBe('IE');
  });
});
