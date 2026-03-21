import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { OrderListResponse, OrderResponse } from './orders.contract';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(SessionAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listOrders(@Req() request: AuthenticatedRequest): Promise<OrderListResponse> {
    return this.ordersService.listOrders(request.authUser!.sub);
  }

  @Post('from-drafts/:draftId')
  createOrderFromDraft(
    @Req() request: AuthenticatedRequest,
    @Param('draftId') draftId: string,
  ): Promise<OrderResponse> {
    return this.ordersService.createOrderFromDraft(
      request.authUser!.sub,
      draftId,
    );
  }
}
