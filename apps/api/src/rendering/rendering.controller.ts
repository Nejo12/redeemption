import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { AuthenticatedRequest } from '../auth/session-auth.guard';
import { RenderPreviewResponse } from './rendering.contract';
import { parseCreateRenderPreviewBody } from './payload-parsers';
import { RenderingService } from './rendering.service';

@Controller('render-previews')
@UseGuards(SessionAuthGuard)
export class RenderingController {
  constructor(private readonly renderingService: RenderingService) {}

  @Post()
  createPreview(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<RenderPreviewResponse> {
    return this.renderingService.createPreview(
      request.authUser!.sub,
      parseCreateRenderPreviewBody(body),
    );
  }
}
