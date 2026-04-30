-- AlterTable
ALTER TABLE "public"."collections" ALTER COLUMN "shopifyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."product" ALTER COLUMN "shopifyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."product_images" ALTER COLUMN "variantIds" SET DATA TYPE TEXT[],
ALTER COLUMN "shopifyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."product_variants" ALTER COLUMN "shopifyId" SET DATA TYPE TEXT;
