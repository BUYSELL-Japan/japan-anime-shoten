import { shopifyFetch } from "~/utils/shopify.server";

// Simple script to run via Remix Resource Route or standalone node script if env vars are loaded.
// Since we need D1 access, running as a Remix Resource Route / API endpoint is easiest locally.

export async function syncShopifyToD1(context: any) {
    const db = context.cloudflare.env.DB;

    // 1. Fetch all products from Shopify
    const query = `
    {
      products(first: 250) {
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

    const data = await shopifyFetch({ query, context });
    const products = data.products.edges.map((e: any) => e.node);

    console.log(`Found ${products.length} products in Shopify.`);

    let count = 0;
    for (const p of products) {
        const sku = p.variants.edges[0]?.node.sku || p.handle; // Fallback to handle if SKU missing
        const shopifyId = p.id;

        // 2. Insert or Update D1
        // We use SKU as the unique key for our master data, or we can use shopifyId if that's the anchor.
        // Let's use shopify_product_id as the anchor for now since we are syncing FROM shopify.

        // Check if exists
        const existing = await db.prepare("SELECT id FROM products WHERE shopify_product_id = ?").bind(shopifyId).first();

        if (existing) {
            // Update? Maybe not essential fields, but status maybe.
            console.log(`Skipping existing: ${p.title}`);
        } else {
            console.log(`Inserting: ${p.title}`);
            await db.prepare(`
            INSERT INTO products (sku, shopify_product_id, status)
            VALUES (?, ?, 'active')
        `).bind(sku, shopifyId).run();

            // Also insert default translation?
            // We can do that later.
            count++;
        }
    }

    return { synced: count, total: products.length };
}
