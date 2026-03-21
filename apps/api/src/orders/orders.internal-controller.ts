import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type {
  ClaimPrintableAssetsResponse,
  CompletePrintableAssetRequestBody,
  FailPrintableAssetRequestBody,
} from './orders.contract';
import { OrdersService } from './orders.service';

@Controller('internal/orders')
export class OrdersInternalController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('claim-printable-assets')
  claimPrintableAssets(
    @Headers('x-internal-worker-token') receivedToken: string | undefined,
  ): Promise<ClaimPrintableAssetsResponse> {
    this.assertInternalWorkerToken(receivedToken);
    return this.ordersService.claimPrintableAssets();
  }

  @Post(':orderId/complete-printable-asset')
  completePrintableAsset(
    @Headers('x-internal-worker-token') receivedToken: string | undefined,
    @Param('orderId') orderId: string,
    @Body() body: CompletePrintableAssetRequestBody,
  ): Promise<{ completed: true }> {
    this.assertInternalWorkerToken(receivedToken);
    return this.ordersService.completePrintableAsset(orderId, body);
  }

  @Post(':orderId/fail-printable-asset')
  failPrintableAsset(
    @Headers('x-internal-worker-token') receivedToken: string | undefined,
    @Param('orderId') orderId: string,
    @Body() body: FailPrintableAssetRequestBody,
  ): Promise<{ failed: true }> {
    this.assertInternalWorkerToken(receivedToken);
    return this.ordersService.failPrintableAsset(orderId, body);
  }

  private assertInternalWorkerToken(receivedToken: string | undefined): void {
    const expectedToken = process.env.INTERNAL_WORKER_TOKEN;

    if (!expectedToken) {
      throw new ServiceUnavailableException(
        'INTERNAL_WORKER_TOKEN is not configured.',
      );
    }

    if (!receivedToken) {
      throw new UnauthorizedException('Missing internal worker token.');
    }

    const expectedBuffer = Buffer.from(expectedToken);
    const receivedBuffer = Buffer.from(receivedToken);

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new UnauthorizedException('Invalid internal worker token.');
    }
  }
}
