import { SenderProfileService } from './sender-profile.service';
import { SenderProfileRepository } from './sender-profile.repository';

class SenderProfileRepositoryFake {
  profile = null as Awaited<
    ReturnType<SenderProfileRepository['findByUserId']>
  >;

  findByUserId() {
    return Promise.resolve(this.profile);
  }

  upsert(params: Parameters<SenderProfileRepository['upsert']>[0]) {
    this.profile = {
      fullName: params.fullName,
      addressLine1: params.addressLine1,
      addressLine2: params.addressLine2,
      city: params.city,
      region: params.region,
      postalCode: params.postalCode,
      countryCode: params.countryCode,
      preferredLocale: params.preferredLocale,
      preferredCurrency: params.preferredCurrency,
    };

    return Promise.resolve(this.profile);
  }
}

describe('SenderProfileService', () => {
  let senderProfileRepository: SenderProfileRepositoryFake;
  let senderProfileService: SenderProfileService;

  beforeEach(() => {
    senderProfileRepository = new SenderProfileRepositoryFake();
    senderProfileService = new SenderProfileService(
      senderProfileRepository as unknown as SenderProfileRepository,
    );
  });

  it('reports missing readiness fields when no profile exists', async () => {
    const response = await senderProfileService.getProfile('user_1');

    expect(response.readiness.isReadyForCheckout).toBe(false);
    expect(response.readiness.missingFields).toContain('fullName');
    expect(response.readiness.missingFields).toContain('preferredCurrency');
  });

  it('marks the profile ready after a complete update', async () => {
    const response = await senderProfileService.upsertProfile('user_1', {
      fullName: 'Jordan Example',
      addressLine1: '12 Example Street',
      city: 'Berlin',
      region: 'Berlin',
      postalCode: '10115',
      countryCode: 'de',
      preferredLocale: 'en-US',
      preferredCurrency: 'eur',
      addressLine2: '',
    });

    expect(response.profile.countryCode).toBe('DE');
    expect(response.profile.preferredCurrency).toBe('EUR');
    expect(response.readiness.isReadyForCheckout).toBe(true);
    expect(response.readiness.missingFields).toHaveLength(0);
  });
});
