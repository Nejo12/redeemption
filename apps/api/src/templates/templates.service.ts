import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TemplateCategoryValue,
  TemplateFieldView,
  TemplateListResponse,
  TemplateResponse,
  TemplateView,
} from './templates.contract';
import { templateCategoryValues } from './payload-parsers';
import { TemplatesRepository } from './templates.repository';
import { TemplateRecord } from './templates.types';

@Injectable()
export class TemplatesService {
  constructor(private readonly templatesRepository: TemplatesRepository) {}

  async listTemplates(
    search: string | null,
    category: TemplateCategoryValue | null,
  ): Promise<TemplateListResponse> {
    const templates = await this.templatesRepository.findAll(
      search?.trim() ? search.trim() : null,
      category,
    );

    return {
      templates: templates.map((template) => this.toTemplateView(template)),
      availableCategories: templateCategoryValues,
    };
  }

  async getTemplate(templateSlug: string): Promise<TemplateResponse> {
    const template = await this.templatesRepository.findBySlug(templateSlug);
    if (!template) {
      throw new NotFoundException('Template not found.');
    }

    return {
      template: this.toTemplateView(template),
    };
  }

  private toTemplateView(template: TemplateRecord): TemplateView {
    return {
      id: template.id,
      slug: template.slug,
      name: template.name,
      category: template.category,
      summary: template.summary,
      description: template.description,
      widthMm: template.widthMm,
      heightMm: template.heightMm,
      orientation: template.orientation,
      previewLabel: template.previewLabel,
      previewHeadline: template.previewHeadline,
      previewMessage: template.previewMessage,
      accentHex: template.accentHex,
      surfaceHex: template.surfaceHex,
      textHex: template.textHex,
      isActive: template.isActive,
      fields: template.fields.map((field) => this.toTemplateFieldView(field)),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  private toTemplateFieldView(
    field: TemplateRecord['fields'][number],
  ): TemplateFieldView {
    return {
      key: field.key,
      label: field.label,
      kind: field.kind,
      required: field.required,
      placeholder: field.placeholder,
      maxLength: field.maxLength,
      position: field.position,
    };
  }
}
