import fetch from 'node-fetch';
import { execSync } from 'child_process';

// Load from .dev.vars (simulation)
const SHOP = "japan-anime-shoten-2.myshopify.com";
const TOKEN = "e79eb575863a1dbda71469fc21d6a6f2";
const DB_BINDING = "DB";

async function importProducts() {
    console.log("Fetching products from Shopify...");
    const query = `
    {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            variants(first: 1) {
              edges {
                node {
                  sku
                }
              }
            }
          }
        }
      }
    }
  `;

    try {
        const res = await fetch(`https://${SHOP}/api/2024-01/graphql.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": TOKEN
            },
            body: JSON.stringify({ query })
        });

        const { data } = await res.json();
        const products = data.products.edges.map(e => e.node);
        console.log(`Found ${products.length} products.`);

        for (const p of products) {
            const sku = p.variants.edges[0]?.node.sku || p.handle;
            const shopifyId = p.id;
            const title = p.title.replace(/'/g, "''"); // Escape quotes for SQL

            console.log(`Syncing ${p.title} (SKU: ${sku})...`);

            // Check exist
            // Simplified: Just try insert. If fail (unique), ignore.
            // Actually, we should upsert if possible, or ignore.
            // For CLI, we can't easily check result in loop without parsing JSON.
            // Let's just INSERT OR IGNORE into products.

            try {
                const sqlProduct = `INSERT OR IGNORE INTO products (sku, shopify_product_id, status) VALUES ('${sku}', '${shopifyId}', 'active');`;
                execSync(`npx wrangler d1 execute ${DB_BINDING} --local --command "${sqlProduct}"`, { stdio: 'ignore' });

                // Get ID (Assuming sku is unique)
                // We can't easily get the ID back here efficiently.
                // But we can INSERT OR IGNORE into translations using subquery on SKU?
                const sqlTrans = `
                INSERT OR IGNORE INTO product_translations (product_id, language_code, title, is_source, translation_status)
                SELECT id, 'ja', '${title}', TRUE, 'completed' FROM products WHERE sku='${sku}';
            `;
                execSync(`npx wrangler d1 execute ${DB_BINDING} --local --command "${sqlTrans}"`, { stdio: 'ignore' });

            } catch (err) {
                console.error(`Failed to insert ${p.title}:`, err.message);
            }
        }
        console.log("Import completed.");

    } catch (e) {
        console.error("Error:", e);
    }
}

importProducts();
