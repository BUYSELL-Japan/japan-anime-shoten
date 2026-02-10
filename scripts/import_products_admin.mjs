import fetch from 'node-fetch';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .dev.vars
const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
const envConfig = dotenv.parse(fs.readFileSync(devVarsPath));

const SHOP = envConfig.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = envConfig.SHOPIFY_ADMIN_ACCESS_TOKEN;
const DB_BINDING = "DB";

async function importProductsAdmin() {
  console.log("Fetching products from Shopify Admin API...");

  if (!ADMIN_TOKEN) {
    console.error("Missing Admin Token in .dev.vars");
    return;
  }

  // Admin API uses a different endpoint and header
  const query = `
    {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            variants(first: 1) {
              edges {
                node {
                  sku
                  price
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://${SHOP}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN
      },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      console.error("Admin API Error:", res.status, await res.text());
      return;
    }

    const { data } = await res.json();
    const products = data.products.edges.map(e => e.node);
    console.log(`Found ${products.length} products (Admin API).`);

    for (const p of products) {
      const sku = p.variants.edges[0]?.node.sku || p.handle;
      const shopifyId = p.id;
      const title = p.title.replace(/'/g, "''");
      const status = p.status; // ACTIVE, DRAFT, ARCHIVED
      console.log(`- [${status}] ${p.title} (SKU: ${sku})`);

      // Insert into D1
      try {
        const sqlProduct = `INSERT OR IGNORE INTO products (sku, shopify_product_id, status) VALUES ('${sku}', '${shopifyId}', '${status.toLowerCase()}');`; // Store status from Shopify
        execSync(`npx wrangler d1 execute ${DB_BINDING} --local --command "${sqlProduct}"`, { stdio: 'ignore' });

        // Initial Translation (Source)
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

importProductsAdmin();
