-- CreateEnum
CREATE TYPE "RenderPhotoFit" AS ENUM ('FIT', 'COVER');

-- CreateTable
CREATE TABLE "RenderPreview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "photoObjectId" TEXT,
    "artifactObjectId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fieldValues" JSONB NOT NULL,
    "photoFit" "RenderPhotoFit",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderPreview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RenderPreview_artifactObjectId_key" ON "RenderPreview"("artifactObjectId");

-- CreateIndex
CREATE INDEX "RenderPreview_userId_createdAt_idx" ON "RenderPreview"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RenderPreview_templateId_createdAt_idx" ON "RenderPreview"("templateId", "createdAt");

-- AddForeignKey
ALTER TABLE "RenderPreview" ADD CONSTRAINT "RenderPreview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderPreview" ADD CONSTRAINT "RenderPreview_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderPreview" ADD CONSTRAINT "RenderPreview_photoObjectId_fkey" FOREIGN KEY ("photoObjectId") REFERENCES "StoredObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderPreview" ADD CONSTRAINT "RenderPreview_artifactObjectId_fkey" FOREIGN KEY ("artifactObjectId") REFERENCES "StoredObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
