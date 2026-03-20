import { Controller, Get, Param, Query } from '@nestjs/common';
import { parseTemplateCategory } from './payload-parsers';
import { TemplateListResponse, TemplateResponse } from './templates.contract';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  listTemplates(
    @Query('q') query: string | undefined,
    @Query('category') category: string | undefined,
  ): Promise<TemplateListResponse> {
    return this.templatesService.listTemplates(
      query ?? null,
      parseTemplateCategory(category),
    );
  }

  @Get(':templateSlug')
  getTemplate(
    @Param('templateSlug') templateSlug: string,
  ): Promise<TemplateResponse> {
    return this.templatesService.getTemplate(templateSlug);
  }
}
