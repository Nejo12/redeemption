import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { AddressListResponse, AddressResponse } from './addresses.contract';
import { AddressesService } from './addresses.service';
import { parseUpsertAddressBody } from './payload-parsers';

@Controller('addresses')
@UseGuards(SessionAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  listAddresses(
    @Req() request: AuthenticatedRequest,
    @Query('q') query: string | undefined,
  ): Promise<AddressListResponse> {
    return this.addressesService.listAddresses(
      request.authUser!.sub,
      query ?? null,
    );
  }

  @Post()
  createAddress(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<AddressResponse> {
    return this.addressesService.createAddress(
      request.authUser!.sub,
      parseUpsertAddressBody(body),
    );
  }

  @Patch(':addressId')
  updateAddress(
    @Req() request: AuthenticatedRequest,
    @Param('addressId') addressId: string,
    @Body() body: unknown,
  ): Promise<AddressResponse> {
    return this.addressesService.updateAddress(
      request.authUser!.sub,
      addressId,
      parseUpsertAddressBody(body),
    );
  }

  @Delete(':addressId')
  async deleteAddress(
    @Req() request: AuthenticatedRequest,
    @Param('addressId') addressId: string,
  ): Promise<{ deleted: true }> {
    await this.addressesService.deleteAddress(request.authUser!.sub, addressId);
    return { deleted: true };
  }
}
