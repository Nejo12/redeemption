-- CreateEnum
CREATE TYPE "ContactAddressKind" AS ENUM ('PRIMARY', 'ALTERNATE');

-- CreateTable
CREATE TABLE "ContactAddress" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "kind" "ContactAddressKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactAddress_contactId_addressId_key" ON "ContactAddress"("contactId", "addressId");

-- CreateIndex
CREATE INDEX "ContactAddress_contactId_kind_idx" ON "ContactAddress"("contactId", "kind");

-- CreateIndex
CREATE INDEX "ContactAddress_addressId_idx" ON "ContactAddress"("addressId");

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactAddress" ADD CONSTRAINT "ContactAddress_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;
