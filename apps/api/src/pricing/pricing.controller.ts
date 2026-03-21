import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { OrderPricingResponse, ShippingTypeValue } from './pricing.contract';
import { PricingService } from './pricing.service';

@Controller('orders')
@UseGuards(SessionAuthGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get(':orderId/pricing')
  getOrderPricing(
    @Req() request: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Query('shippingType') shippingType: string | undefined,
  ): Promise<OrderPricingResponse> {
    return this.pricingService.getOrderPricing(
      request.authUser!.sub,
      orderId,
      parseShippingType(shippingType),
    );
  }
}

function parseShippingType(value: string | undefined): ShippingTypeValue {
  if (!value) {
    return 'STANDARD';
  }

  if (value === 'STANDARD' || value === 'PRIORITY') {
    return value;
  }

  throw new BadRequestException('shippingType must be STANDARD or PRIORITY.');
}
