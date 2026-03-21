ALTER TYPE "StoredObjectKind" ADD VALUE 'PRINTABLE_ASSET';

CREATE TYPE "PrintableAssetStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

ALTER TABLE "Order"
ADD COLUMN "printableAssetError" TEXT,
ADD COLUMN "printableAssetGeneratedAt" TIMESTAMP(3),
ADD COLUMN "printableAssetObjectId" TEXT,
ADD COLUMN "printableAssetStatus" "PrintableAssetStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "templateAccentHex" TEXT NOT NULL DEFAULT '#A54D36',
ADD COLUMN "templateHeightMm" INTEGER NOT NULL DEFAULT 180,
ADD COLUMN "templateOrientation" "TemplateOrientation" NOT NULL DEFAULT 'PORTRAIT',
ADD COLUMN "templatePreviewLabel" TEXT NOT NULL DEFAULT 'PRINT ASSET',
ADD COLUMN "templateSurfaceHex" TEXT NOT NULL DEFAULT '#F3ECE6',
ADD COLUMN "templateTextHex" TEXT NOT NULL DEFAULT '#2B1F1B',
ADD COLUMN "templateWidthMm" INTEGER NOT NULL DEFAULT 130;

CREATE UNIQUE INDEX "Order_printableAssetObjectId_key" ON "Order"("printableAssetObjectId");
CREATE INDEX "Order_userId_printableAssetStatus_createdAt_idx" ON "Order"("userId", "printableAssetStatus", "createdAt");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_printableAssetObjectId_fkey"
FOREIGN KEY ("printableAssetObjectId") REFERENCES "StoredObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
