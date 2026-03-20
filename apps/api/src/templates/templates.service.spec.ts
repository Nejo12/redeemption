import {
  TemplateCategory,
  TemplateFieldKind,
  TemplateOrientation,
} from '@prisma/client';
import { TemplatesRepository } from './templates.repository';
import { TemplatesService } from './templates.service';
import { TemplateRecord } from './templates.types';

class TemplatesRepositoryFake {
  private readonly templates: TemplateRecord[] = [
    {
      id: 'template_birthday_bloom',
      slug: 'birthday-bloom',
      name: 'Birthday Bloom',
      category: TemplateCategory.BIRTHDAY,
      summary: 'A floral portrait card with room for a warm birthday note.',
      description: 'Built for milestone birthdays and intimate celebrations.',
      widthMm: 127,
      heightMm: 177,
      orientation: TemplateOrientation.PORTRAIT,
      previewLabel: 'Birthday / Portrait',
      previewHeadline: 'Send a birthday note that feels quietly personal.',
      previewMessage:
        'Soft florals, one hero photo, and a generous writing area.',
      accentHex: '#E38B6D',
      surfaceHex: '#F8EDE5',
      textHex: '#2F211D',
      isActive: true,
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
      fields: [
        {
          key: 'recipient_name',
          label: 'Recipient name',
          kind: TemplateFieldKind.TEXT,
          required: true,
          placeholder: 'Amina',
          maxLength: 40,
          position: 1,
        },
        {
          key: 'message_body',
          label: 'Message',
          kind: TemplateFieldKind.TEXTAREA,
          required: true,
          placeholder: 'Write the birthday note here.',
          maxLength: 420,
          position: 2,
        },
      ],
    },
    {
      id: 'template_general_stillness',
      slug: 'general-stillness',
      name: 'General Stillness',
      category: TemplateCategory.GENERAL,
      summary: 'A versatile everyday note with restrained editorial balance.',
      description:
        'Suitable for check-ins and encouragement without feeling occasion-specific.',
      widthMm: 127,
      heightMm: 177,
      orientation: TemplateOrientation.PORTRAIT,
      previewLabel: 'General / Editorial',
      previewHeadline:
        'For thoughtful notes that do not need an occasion to matter.',
      previewMessage:
        'More room for message length and a quiet optional photo.',
      accentHex: '#7C9070',
      surfaceHex: '#F3F0E8',
      textHex: '#263026',
      isActive: true,
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
      fields: [
        {
          key: 'recipient_name',
          label: 'Recipient name',
          kind: TemplateFieldKind.TEXT,
          required: true,
          placeholder: 'Elena',
          maxLength: 40,
          position: 1,
        },
      ],
    },
  ];

  findAll(search: string | null, category: TemplateCategory | null) {
    return Promise.resolve(
      this.templates.filter((template) => {
        const matchesCategory = category
          ? template.category === category
          : true;
        const matchesSearch = search
          ? [template.name, template.summary, template.description]
              .join(' ')
              .toLowerCase()
              .includes(search.toLowerCase())
          : true;

        return matchesCategory && matchesSearch;
      }),
    );
  }

  findBySlug(slug: string) {
    return Promise.resolve(
      this.templates.find((template) => template.slug === slug) ?? null,
    );
  }
}

describe('TemplatesService', () => {
  let templatesService: TemplatesService;

  beforeEach(() => {
    templatesService = new TemplatesService(
      new TemplatesRepositoryFake() as unknown as TemplatesRepository,
    );
  });

  it('lists templates with category metadata', async () => {
    const response = await templatesService.listTemplates(null, null);

    expect(response.templates).toHaveLength(2);
    expect(response.availableCategories).toContain('BIRTHDAY');
  });

  it('returns a single template by slug', async () => {
    const response = await templatesService.getTemplate('birthday-bloom');

    expect(response.template.slug).toBe('birthday-bloom');
    expect(response.template.fields[0]?.kind).toBe('TEXT');
  });
});
