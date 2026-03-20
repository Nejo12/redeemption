-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('BIRTHDAY', 'GENERAL', 'HOLIDAY', 'THANK_YOU', 'ANNIVERSARY');

-- CreateEnum
CREATE TYPE "TemplateOrientation" AS ENUM ('PORTRAIT', 'LANDSCAPE');

-- CreateEnum
CREATE TYPE "TemplateFieldKind" AS ENUM ('TEXT', 'TEXTAREA', 'PHOTO');

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "orientation" "TemplateOrientation" NOT NULL,
    "previewLabel" TEXT NOT NULL,
    "previewHeadline" TEXT NOT NULL,
    "previewMessage" TEXT NOT NULL,
    "accentHex" TEXT NOT NULL,
    "surfaceHex" TEXT NOT NULL,
    "textHex" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateField" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "TemplateFieldKind" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "maxLength" INTEGER,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TemplateField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE INDEX "Template_category_isActive_name_idx" ON "Template"("category", "isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateField_templateId_key_key" ON "TemplateField"("templateId", "key");

-- CreateIndex
CREATE INDEX "TemplateField_templateId_position_idx" ON "TemplateField"("templateId", "position");

-- AddForeignKey
ALTER TABLE "TemplateField" ADD CONSTRAINT "TemplateField_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SeedTemplates
INSERT INTO "Template" (
    "id",
    "slug",
    "name",
    "category",
    "summary",
    "description",
    "widthMm",
    "heightMm",
    "orientation",
    "previewLabel",
    "previewHeadline",
    "previewMessage",
    "accentHex",
    "surfaceHex",
    "textHex",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES
    (
        'template_birthday_bloom',
        'birthday-bloom',
        'Birthday Bloom',
        'BIRTHDAY',
        'A floral portrait card with room for a warm birthday note.',
        'Built for milestone birthdays and intimate celebrations with a soft portrait layout and a single photo slot.',
        127,
        177,
        'PORTRAIT',
        'Birthday / Portrait',
        'Send a birthday note that feels quietly personal.',
        'Soft florals, one hero photo, and a generous writing area keep this template intimate instead of overly busy.',
        '#E38B6D',
        '#F8EDE5',
        '#2F211D',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'template_birthday_confetti',
        'birthday-confetti',
        'Birthday Confetti',
        'BIRTHDAY',
        'A brighter landscape card for celebratory messages and playful copy.',
        'Designed for upbeat greetings with bold color pops, a wide hero area, and a shorter message field.',
        148,
        105,
        'LANDSCAPE',
        'Birthday / Landscape',
        'A louder birthday moment without losing the handwritten feel.',
        'Confetti framing and a wide composition keep the card energetic while preserving message clarity.',
        '#D96C54',
        '#FFF2E8',
        '#2B1E1A',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'template_general_stillness',
        'general-stillness',
        'General Stillness',
        'GENERAL',
        'A versatile everyday note with restrained editorial balance.',
        'This general-purpose design supports thank-you notes, check-ins, and encouragement without feeling occasion-specific.',
        127,
        177,
        'PORTRAIT',
        'General / Editorial',
        'For thoughtful notes that do not need an occasion to matter.',
        'The layout leaves more space for message length and minimal visual framing around a small optional photo.',
        '#7C9070',
        '#F3F0E8',
        '#263026',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'template_holiday_evergreen',
        'holiday-evergreen',
        'Holiday Evergreen',
        'HOLIDAY',
        'A seasonal portrait card with evergreen framing and a centered message block.',
        'Made for winter holidays and year-end gratitude, with visual restraint that keeps it usable across traditions.',
        127,
        177,
        'PORTRAIT',
        'Holiday / Portrait',
        'A seasonal note that still feels calm and personal.',
        'Evergreen accents, high contrast text, and a balanced hierarchy support both family and business holiday messages.',
        '#56715D',
        '#EEF2EC',
        '#1F2922',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'template_thank_you_mineral',
        'thank-you-mineral',
        'Thank You Mineral',
        'THANK_YOU',
        'A simple gratitude card tuned for short, sincere copy.',
        'This card keeps the visual system sparse so the thank-you message carries most of the emotional weight.',
        127,
        177,
        'PORTRAIT',
        'Thank you / Minimal',
        'Built for gratitude that should feel clear, not ornamental.',
        'Muted mineral tones and a concise message field make it suitable for both personal and professional follow-up.',
        '#8B7565',
        '#F5EEE8',
        '#2D2622',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'template_anniversary_dusk',
        'anniversary-dusk',
        'Anniversary Dusk',
        'ANNIVERSARY',
        'A romantic landscape card with space for one photo and a longer reflection.',
        'The composition leans more cinematic, making it suitable for anniversaries, relationship milestones, and sentimental keepsakes.',
        148,
        105,
        'LANDSCAPE',
        'Anniversary / Landscape',
        'A quieter, more cinematic layout for reflective milestone notes.',
        'It balances a wide photo treatment with a longer message field so the card can hold memory, gratitude, and future plans.',
        '#9D6C78',
        '#F5EAEE',
        '#301E24',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- SeedTemplateFields
INSERT INTO "TemplateField" (
    "id",
    "templateId",
    "key",
    "label",
    "kind",
    "required",
    "placeholder",
    "maxLength",
    "position"
) VALUES
    ('template_field_birthday_bloom_recipient_name', 'template_birthday_bloom', 'recipient_name', 'Recipient name', 'TEXT', true, 'Amina', 40, 1),
    ('template_field_birthday_bloom_message_body', 'template_birthday_bloom', 'message_body', 'Message', 'TEXTAREA', true, 'Write the birthday note here.', 420, 2),
    ('template_field_birthday_bloom_photo', 'template_birthday_bloom', 'photo', 'Photo', 'PHOTO', false, NULL, NULL, 3),

    ('template_field_birthday_confetti_recipient_name', 'template_birthday_confetti', 'recipient_name', 'Recipient name', 'TEXT', true, 'Jordan', 40, 1),
    ('template_field_birthday_confetti_message_body', 'template_birthday_confetti', 'message_body', 'Message', 'TEXTAREA', true, 'Celebrate the milestone with a short message.', 320, 2),
    ('template_field_birthday_confetti_photo', 'template_birthday_confetti', 'photo', 'Photo', 'PHOTO', false, NULL, NULL, 3),

    ('template_field_general_stillness_recipient_name', 'template_general_stillness', 'recipient_name', 'Recipient name', 'TEXT', true, 'Elena', 40, 1),
    ('template_field_general_stillness_message_body', 'template_general_stillness', 'message_body', 'Message', 'TEXTAREA', true, 'Share the note you want them to keep.', 500, 2),
    ('template_field_general_stillness_photo', 'template_general_stillness', 'photo', 'Photo', 'PHOTO', false, NULL, NULL, 3),

    ('template_field_holiday_evergreen_household_name', 'template_holiday_evergreen', 'household_name', 'Household name', 'TEXT', true, 'The Adesinas', 60, 1),
    ('template_field_holiday_evergreen_message_body', 'template_holiday_evergreen', 'message_body', 'Holiday message', 'TEXTAREA', true, 'Send a warm year-end note.', 360, 2),
    ('template_field_holiday_evergreen_photo', 'template_holiday_evergreen', 'photo', 'Photo', 'PHOTO', false, NULL, NULL, 3),

    ('template_field_thank_you_mineral_recipient_name', 'template_thank_you_mineral', 'recipient_name', 'Recipient name', 'TEXT', true, 'Ngozi', 40, 1),
    ('template_field_thank_you_mineral_message_body', 'template_thank_you_mineral', 'message_body', 'Thank-you note', 'TEXTAREA', true, 'Keep the gratitude direct and specific.', 360, 2),

    ('template_field_anniversary_dusk_partner_name', 'template_anniversary_dusk', 'partner_name', 'Partner name', 'TEXT', true, 'Maya', 40, 1),
    ('template_field_anniversary_dusk_message_body', 'template_anniversary_dusk', 'message_body', 'Anniversary note', 'TEXTAREA', true, 'Reflect on the year and what comes next.', 500, 2),
    ('template_field_anniversary_dusk_photo', 'template_anniversary_dusk', 'photo', 'Photo', 'PHOTO', false, NULL, NULL, 3);
