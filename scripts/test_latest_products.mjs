import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .dev.vars
const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
const envConfig = dotenv.parse(fs.readFileSync(devVarsPath));

const SHOPIFY_ENDPOINT = `https://${envConfig.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
const HEADERS = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': envConfig.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

async function fetchShopify(query, variables = {}) {
    const response = await fetch(SHOPIFY_ENDPOINT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ query, variables }),
    });
    return response.json();
}

async function checkLatestProducts() {
    console.log("Fetching latest 10 products from Storefront API...");

    const query = `
    query LatestProducts {
      products(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            publishedAt
            updatedAt
          }
        }
      }
    }
  `;

    try {
        const data = await fetchShopify(query);
        if (data.errors) {
            console.error("GraphQL Errors:", JSON.stringify(data.errors, null, 2));
            return;
        }

        const products = data.data.products.edges;
        console.log(`Found ${products.length} products.`);

        products.forEach((p, index) => {
            console.log(`${index + 1}. [${p.node.title}] (Handle: ${p.node.handle})`);
            console.log(`   - Available: ${p.node.availableForSale}`);
            console.log(`   - Published At: ${p.node.publishedAt}`);
            console.log(`   - ID: ${p.node.id}`);
        });

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

checkLatestProducts();
