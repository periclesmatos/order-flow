-- Invariantes de estoque como rede de segurança (defesa em profundidade).
-- O CHECK não é modelado no schema.prisma (vive só aqui, como a order_number_seq).
-- Com o lock pessimista + gravação correta na aplicação, não dispara no fluxo
-- normal — barra apenas violações de bugs futuros.

DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_reserved_nonneg" CHECK ("reservedQuantity" >= 0);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_stock_nonneg" CHECK ("stockOnHand" >= 0);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "products" ADD CONSTRAINT "products_reserved_le_stock" CHECK ("reservedQuantity" <= "stockOnHand");
EXCEPTION WHEN duplicate_object THEN null; END $$;
