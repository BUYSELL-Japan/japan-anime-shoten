import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .dev.vars
const devVarsPath = path.resolve(__dirname, '../.dev.vars');
const envConfig = dotenv.parse(fs.readFileSync(devVarsPath));

const SHOPIFY_ENDPOINT = `https://${envConfig.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
const HEADERS = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': envConfig.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
};

const QUERY = `
    query HomePage {
      featured: products(first: 8, sortKey: BEST_SELLING) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
      newArrivals: products(first: 8, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
`;

async function fetchShopify(query, variables = {}) {
    console.log(`Fetching from ${SHOPIFY_ENDPOINT}...`);
    try {
        const response = await fetch(SHOPIFY_ENDPOINT, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
            return null;
        }

        return result.data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

async function run() {
    console.log("Running debug query...");
    const data = await fetchShopify(QUERY);

    if (data) {
        console.log("Featured Products Count:", data.featured.edges.length);
        console.log("New Arrivals Count:", data.newArrivals.edges.length);

        if (data.featured.edges.length > 0) {
            console.log("Sample Featured:", data.featured.edges[0].node.title);
        }
        if (data.newArrivals.edges.length > 0) {
            console.log("Sample New Arrival:", data.newArrivals.edges[0].node.title);
        }
    } else {
        console.log("No data returned or error occurred.");
    }
}

run();
