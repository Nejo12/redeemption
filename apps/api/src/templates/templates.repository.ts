import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { TemplateCategoryValue } from './templates.contract';
import { TemplateRecord, templateSelect } from './templates.types';

@Injectable()
export class TemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    search: string | null,
    category: TemplateCategoryValue | null,
  ): Promise<TemplateRecord[]> {
    const where: Prisma.TemplateWhereInput = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          summary: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.template.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: templateSelect,
    });
  }

  findBySlug(slug: string): Promise<TemplateRecord | null> {
    return this.prisma.template.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: templateSelect,
    });
  }
}
