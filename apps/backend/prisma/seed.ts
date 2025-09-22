const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function safeDate(dateStr?: string) {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
}

async function main() {
    const filePath = path.join(__dirname, 'data', 'shop_data.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const { collections, products } = JSON.parse(rawData);

    // Seed collections
    for (const collection of collections) {
        await prisma.collection.upsert({
            where: { shopifyId: String(collection.id) },
            update: {
                title: collection.title,
                handle: collection.handle,
                description: collection.description,
                updatedAt: new Date(),
            },
            create: {
                shopifyId: String(collection.id),
                title: collection.title,
                handle: collection.handle,
                description: collection.description,
                published: true,
                createdAt: safeDate(collection.published_at),
                updatedAt: safeDate(collection.updated_at),
            },
        });
        console.log(`Seeded collection: ${collection.title}`);
    }

    // Seed products
    for (const product of products) {
        const createdProduct = await prisma.product.upsert({
            where: { shopifyId: String(product.id) },
            update: {
                title: product.title,
                handle: product.handle,
                updatedAt: new Date(),
            },
            create: {
                shopifyId: String(product.id),
                title: product.title,
                handle: product.handle,
                bodyHtml: product.body_html,
                vendor: product.vendor,
                tags: product.tags || [],
                status: 'ACTIVE',
                publishedAt: product.published_at ? safeDate(product.published_at) : null,
                createdAt: safeDate(product.created_at),
                updatedAt: safeDate(product.updated_at),

                images: {
                    create: (product.images || []).map((img: any) => ({
                        shopifyId: String(img.id),
                        src: img.src,
                        alt: img.alt,
                        width: img.width,
                        height: img.height,
                        position: img.position,
                        variantIds: (img.variant_ids || []).map((id: any) => String(id)),
                    })),
                },

                variants: {
                    create: (product.variants || []).map((variant: any) => ({
                        shopifyId: String(variant.id),
                        title: variant.title,
                        sku: variant.sku,
                        barcode: variant.barcode || null,
                        price: variant.price,
                        compareAtPrice: variant.compare_at_price,
                        inventoryQty: variant.inventory_quantity || 0,
                        position: variant.position,
                        weight: variant.grams,
                        requiresShipping: variant.requires_shipping,
                        taxable: variant.taxable,
                        available: variant.available,
                        option1: variant.option1,
                        option2: variant.option2,
                        option3: variant.option3,
                    })),
                },

                options: {
                    create: (product.options || [])
                        .filter((opt: any) => opt && (opt.name || opt.values?.length))
                        .map((opt: any, index: any) => ({
                            name: opt.name || `Option ${index + 1}`,
                            position: opt.position || index + 1,
                            values: opt.values || [],
                        })),
                },
            },
        });

        console.log(`Seeded product: ${createdProduct.title}`);

        // Link variants to images based on image.variant_ids
        for (const img of product.images || []) {
            if (img.variant_ids && img.variant_ids.length > 0) {
                const image = await prisma.productImage.findUnique({
                    where: { shopifyId: String(img.id) },
                });

                if (image) {
                    for (const variantShopifyId of img.variant_ids) {
                        await prisma.productVariant.update({
                            where: { shopifyId: String(variantShopifyId) },
                            data: { imageId: image.id },
                        });
                    }
                }
            }
        }

        // Link product to its collections
        for (const cid of product.collectionIds || []) {
            const collection = await prisma.collection.findUnique({
                where: { shopifyId: String(cid) },
            });

            if (collection) {
                await prisma.productCollection.upsert({
                    where: {
                        productId_collectionId: {
                            productId: createdProduct.id,
                            collectionId: collection.id,
                        },
                    },
                    update: {},
                    create: {
                        productId: createdProduct.id,
                        collectionId: collection.id,
                    },
                });
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
