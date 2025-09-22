(async () => {
    await import('dotenv/config'); // load environment variables first

    const fs = (await import('fs')).default;
    const fetch = (await import('node-fetch')).default;

    const SHOP_URL = process.env.SHOPIFY_SHOP_URL;
    if (!SHOP_URL) throw new Error('SHOPIFY_SHOP_URL is not defined');

    console.log('SHOP_URL:', SHOP_URL);

    const LIMIT = 250;
    const OUTPUT_FILE = 'shop_data.json';

    async function fetchCollectionsAndProducts() {
        let allCollections = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const url = `${SHOP_URL}/collections.json?limit=${LIMIT}&page=${page}`;
            console.log(`Fetching collections page ${page}...`);

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Error fetching collections: ${res.statusText}`);

            const data = await res.json();
            const collections = data.collections || [];

            if (collections.length === 0) hasMore = false;
            else {
                allCollections = allCollections.concat(collections);
                page++;
            }
        }

        console.log(`Fetched ${allCollections.length} collections.`);

        const collectionsData = allCollections.map((c) => ({
            id: c.id,
            title: c.title,
            handle: c.handle,
            description: c.description,
            image: c.image || null,
        }));

        const allProductsMap = new Map();

        for (const collection of allCollections) {
            console.log(`Fetching products for collection: ${collection.handle}`);
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const url = `${SHOP_URL}/collections/${collection.handle}/products.json?limit=${LIMIT}&page=${page}`;
                const res = await fetch(url);
                if (!res.ok) {
                    console.error(
                        `Error fetching products for ${collection.handle}:`,
                        res.statusText
                    );
                    break;
                }

                const data = await res.json();
                const products = data.products || [];

                if (products.length === 0) hasMore = false;
                else {
                    for (const product of products) {
                        if (!allProductsMap.has(product.id)) {
                            allProductsMap.set(product.id, {
                                ...product,
                                collectionIds: [collection.id],
                            });
                        } else {
                            allProductsMap.get(product.id).collectionIds.push(collection.id);
                        }
                    }
                    page++;
                }
            }
        }

        const productsData = Array.from(allProductsMap.values());

        const finalData = { collections: collectionsData, products: productsData };
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
        console.log(`Saved to ${OUTPUT_FILE}`);
    }

    await fetchCollectionsAndProducts();
})();
