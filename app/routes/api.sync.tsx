import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { shopifyFetch } from "~/utils/shopify.server";

// We'll define the sync logic here directly for now as it's cleaner than importing a type-unsafe module
async function syncShopifyToD1(context: any) {
    const db = context.cloudflare.env.DB;

    // 1. Fetch products from Shopify
    const query = `
    {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            variants(first: 1) {
              edges {
                node {
                  sku
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

    let products = [];
    try {
        const data = await shopifyFetch({ query, context });
        if (data && data.products) {
            products = data.products.edges.map((e: any) => e.node);
        }
    } catch (e) {
        console.error("Shopify fetch failed during sync", e);
        throw e;
    }

    console.log(`Found ${products.length} products in Shopify.`);

    let synced = 0;
    let errors = [];

    for (const p of products) {
        const variant = p.variants.edges[0]?.node;
        const sku = variant?.sku || p.handle;
        const shopifyId = p.id;

        // Check if exists
        try {
            const existing = await db.prepare("SELECT id FROM products WHERE shopify_product_id = ?").bind(shopifyId).first();

            if (!existing) {
                // Insert
                await db.prepare(`
                INSERT INTO products (sku, shopify_product_id, status)
                VALUES (?, ?, 'active')
            `).bind(sku, shopifyId).run();
                synced++;

                // Also insert initial Japanese translation (Source)
                const newProduct = await db.prepare("SELECT id FROM products WHERE shopify_product_id = ?").bind(shopifyId).first();
                if (newProduct) {
                    await db.prepare(`
                    INSERT INTO product_translations (product_id, language_code, title, is_source, translation_status)
                    VALUES (?, 'ja', ?, TRUE, 'completed')
                `).bind(newProduct.id, p.title).run();
                }
            }
        } catch (dbError) {
            console.error(`DB Error for ${p.title}:`, dbError);
            errors.push({ title: p.title, error: dbError.message });
        }
    }

    return { synced, total: products.length, errors };
}

export async function loader({ context }: LoaderFunctionArgs) {
    try {
        const result = await syncShopifyToD1(context);
        return json({ success: true, ...result });
    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
