import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PricingModule } from '../pricing/pricing.module';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { StripeClientService } from './stripe-client.service';

@Module({
  imports: [AuthModule, PricingModule],
  controllers: [PaymentsController],
  providers: [PaymentsRepository, PaymentsService, StripeClientService],
})
export class PaymentsModule {}
