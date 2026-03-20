import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import {
  DraftListResponse,
  MomentRuleListResponse,
  MomentRuleResponse,
} from './moments.contract';
import { MomentsService } from './moments.service';
import { parseCreateMomentRuleBody } from './payload-parsers';

@Controller()
@UseGuards(SessionAuthGuard)
export class MomentsController {
  constructor(private readonly momentsService: MomentsService) {}

  @Get('moments')
  listMoments(
    @Req() request: AuthenticatedRequest,
  ): Promise<MomentRuleListResponse> {
    return this.momentsService.listMoments(request.authUser!.sub);
  }

  @Post('moments')
  createMomentRule(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<MomentRuleResponse> {
    return this.momentsService.createMomentRule(
      request.authUser!.sub,
      parseCreateMomentRuleBody(body),
    );
  }

  @Delete('moments/:momentId')
  deleteMomentRule(
    @Req() request: AuthenticatedRequest,
    @Param('momentId') momentId: string,
  ): Promise<{ deleted: true }> {
    return this.momentsService.deleteMomentRule(
      request.authUser!.sub,
      momentId,
    );
  }

  @Get('drafts')
  listDrafts(@Req() request: AuthenticatedRequest): Promise<DraftListResponse> {
    return this.momentsService.listDrafts(request.authUser!.sub);
  }
}
