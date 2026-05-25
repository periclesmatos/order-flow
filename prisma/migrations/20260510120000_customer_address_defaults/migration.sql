-- Customer + Address: isActive, isDefault, relação N:1, índice parcial para um default por cliente.

-- 1) Coluna opcional para backfill quando existia o modelo antigo (customer.addressId).
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "customerId" TEXT;

UPDATE "addresses" AS a
SET "customerId" = c.id
FROM "customers" AS c
WHERE c."addressId" IS NOT NULL
  AND c."addressId" = a.id
  AND a."customerId" IS NULL;

ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_addressId_fkey";
ALTER TABLE "customers" DROP COLUMN IF EXISTS "addressId";

DELETE FROM "addresses" WHERE "customerId" IS NULL;

ALTER TABLE "addresses" ALTER COLUMN "customerId" SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

UPDATE "addresses" AS a
SET "isDefault" = true
WHERE NOT EXISTS (
  SELECT 1 FROM "addresses" x WHERE x."customerId" = a."customerId" AND x."isDefault" = true
)
AND NOT EXISTS (
  SELECT 1 FROM "addresses" y WHERE y."customerId" = a."customerId" AND y.id <> a.id
);

CREATE UNIQUE INDEX IF NOT EXISTS "addresses_one_default_per_customer_idx"
  ON "addresses" ("customerId")
  WHERE "isDefault" = true;
