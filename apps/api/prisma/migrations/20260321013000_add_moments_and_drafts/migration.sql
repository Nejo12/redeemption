-- CreateEnum
CREATE TYPE "MomentEventType" AS ENUM ('CONTACT_BIRTHDAY', 'ONE_OFF_DATE');

-- CreateEnum
CREATE TYPE "MomentDeliveryPreference" AS ENUM ('ARRIVE_BY', 'SHIP_ON');

-- CreateEnum
CREATE TYPE "MomentApprovalMode" AS ENUM ('ALWAYS_ASK');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('SCHEDULED', 'READY_FOR_REVIEW');

-- CreateTable
CREATE TABLE "MomentRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "photoObjectId" TEXT,
    "name" TEXT NOT NULL,
    "eventType" "MomentEventType" NOT NULL,
    "oneOffDate" TIMESTAMP(3),
    "leadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "deliveryPreference" "MomentDeliveryPreference" NOT NULL DEFAULT 'ARRIVE_BY',
    "approvalMode" "MomentApprovalMode" NOT NULL DEFAULT 'ALWAYS_ASK',
    "messageTemplate" TEXT NOT NULL,
    "nextOccurrenceAt" TIMESTAMP(3),
    "nextDraftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MomentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "momentRuleId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "photoObjectId" TEXT,
    "renderPreviewId" TEXT,
    "status" "DraftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "draftReadyAt" TIMESTAMP(3) NOT NULL,
    "occurrenceDate" TIMESTAMP(3) NOT NULL,
    "headline" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fieldValues" JSONB NOT NULL,
    "photoFit" "RenderPhotoFit",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MomentRule_userId_nextDraftAt_idx" ON "MomentRule"("userId", "nextDraftAt");

-- CreateIndex
CREATE INDEX "MomentRule_contactId_eventType_idx" ON "MomentRule"("contactId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_momentRuleId_occurrenceDate_key" ON "Draft"("momentRuleId", "occurrenceDate");

-- CreateIndex
CREATE INDEX "Draft_userId_status_draftReadyAt_idx" ON "Draft"("userId", "status", "draftReadyAt");

-- CreateIndex
CREATE INDEX "Draft_contactId_scheduledFor_idx" ON "Draft"("contactId", "scheduledFor");

-- AddForeignKey
ALTER TABLE "MomentRule" ADD CONSTRAINT "MomentRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentRule" ADD CONSTRAINT "MomentRule_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentRule" ADD CONSTRAINT "MomentRule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentRule" ADD CONSTRAINT "MomentRule_photoObjectId_fkey" FOREIGN KEY ("photoObjectId") REFERENCES "StoredObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_momentRuleId_fkey" FOREIGN KEY ("momentRuleId") REFERENCES "MomentRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_photoObjectId_fkey" FOREIGN KEY ("photoObjectId") REFERENCES "StoredObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_renderPreviewId_fkey" FOREIGN KEY ("renderPreviewId") REFERENCES "RenderPreview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
