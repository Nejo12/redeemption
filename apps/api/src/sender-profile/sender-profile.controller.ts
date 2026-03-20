import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { SenderProfileResponse } from './sender-profile.contract';
import { parseUpsertSenderProfileBody } from './payload-parsers';
import { SenderProfileService } from './sender-profile.service';

@Controller('sender-profile')
@UseGuards(SessionAuthGuard)
export class SenderProfileController {
  constructor(private readonly senderProfileService: SenderProfileService) {}

  @Get()
  getCurrentProfile(
    @Req() request: AuthenticatedRequest,
  ): Promise<SenderProfileResponse> {
    return this.senderProfileService.getProfile(request.authUser!.sub);
  }

  @Put()
  upsertCurrentProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<SenderProfileResponse> {
    return this.senderProfileService.upsertProfile(
      request.authUser!.sub,
      parseUpsertSenderProfileBody(body),
    );
  }
}
