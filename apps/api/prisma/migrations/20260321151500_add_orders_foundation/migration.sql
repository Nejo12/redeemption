CREATE TYPE "OrderStatus" AS ENUM (
  'AWAITING_PAYMENT',
  'PAYMENT_FAILED',
  'PAID',
  'FULFILLMENT_PENDING',
  'FULFILLED',
  'CANCELLED'
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "draftId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "contactFirstName" TEXT NOT NULL,
  "contactLastName" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "templateSlug" TEXT NOT NULL,
  "templateName" TEXT NOT NULL,
  "renderPreviewId" TEXT NOT NULL,
  "artifactObjectId" TEXT NOT NULL,
  "photoObjectId" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
  "headline" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "fieldValues" JSONB NOT NULL,
  "photoFit" "RenderPhotoFit",
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "occurrenceDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Order_draftId_key" ON "Order"("draftId");
CREATE INDEX "Order_userId_status_createdAt_idx" ON "Order"("userId", "status", "createdAt");
CREATE INDEX "Order_artifactObjectId_idx" ON "Order"("artifactObjectId");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_artifactObjectId_fkey"
  FOREIGN KEY ("artifactObjectId") REFERENCES "StoredObject"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_photoObjectId_fkey"
  FOREIGN KEY ("photoObjectId") REFERENCES "StoredObject"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
