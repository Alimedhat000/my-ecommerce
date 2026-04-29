/*
  Warnings:

  - A unique constraint covering the columns `[shopifyId]` on the table `collections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyId]` on the table `product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyId]` on the table `product_images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyId]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."collections" ADD COLUMN     "shopifyId" BIGINT;

-- AlterTable
ALTER TABLE "public"."product" ADD COLUMN     "shopifyId" BIGINT;

-- AlterTable
ALTER TABLE "public"."product_images" ADD COLUMN     "shopifyId" BIGINT;

-- AlterTable
ALTER TABLE "public"."product_variants" ADD COLUMN     "shopifyId" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "collections_shopifyId_key" ON "public"."collections"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "product_shopifyId_key" ON "public"."product"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "product_images_shopifyId_key" ON "public"."product_images"("shopifyId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_shopifyId_key" ON "public"."product_variants"("shopifyId");
