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
import { ContactListResponse, ContactResponse } from './contacts.contract';
import { parseUpsertContactBody } from './payload-parsers';
import { ContactsService } from './contacts.service';

@Controller('contacts')
@UseGuards(SessionAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  listContacts(
    @Req() request: AuthenticatedRequest,
    @Query('q') query: string | undefined,
  ): Promise<ContactListResponse> {
    return this.contactsService.listContacts(
      request.authUser!.sub,
      query ?? null,
    );
  }

  @Post()
  createContact(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<ContactResponse> {
    return this.contactsService.createContact(
      request.authUser!.sub,
      parseUpsertContactBody(body),
    );
  }

  @Patch(':contactId')
  updateContact(
    @Req() request: AuthenticatedRequest,
    @Param('contactId') contactId: string,
    @Body() body: unknown,
  ): Promise<ContactResponse> {
    return this.contactsService.updateContact(
      request.authUser!.sub,
      contactId,
      parseUpsertContactBody(body),
    );
  }

  @Delete(':contactId')
  async deleteContact(
    @Req() request: AuthenticatedRequest,
    @Param('contactId') contactId: string,
  ): Promise<{ deleted: true }> {
    await this.contactsService.deleteContact(request.authUser!.sub, contactId);
    return { deleted: true };
  }
}
