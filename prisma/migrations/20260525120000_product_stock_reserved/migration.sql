-- AlterTable
ALTER TABLE "products" RENAME COLUMN "amount" TO "stockOnHand";

ALTER TABLE "products" ADD COLUMN "reservedQuantity" INTEGER NOT NULL DEFAULT 0;
