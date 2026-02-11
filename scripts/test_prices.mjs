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

async function checkPrices() {
    // Test with different country contexts
    const countries = ['US', 'JP', 'CN', 'KR'];

    const query = `
    query ProductPrice($country: CountryCode) @inContext(country: $country) {
      products(first: 1) {
        edges {
          node {
            id
            title
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

    for (const country of countries) {
        console.log(`\n=== Country: ${country} ===`);
        const data = await fetchShopify(query, { country });

        if (data.errors) {
            console.error('Errors:', JSON.stringify(data.errors, null, 2));
            continue;
        }

        const product = data.data.products.edges[0]?.node;
        if (product) {
            console.log(`Title: ${product.title}`);
            console.log(`Price Range: ${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`);
            console.log(`Variant Price: ${product.variants.edges[0]?.node.price.amount} ${product.variants.edges[0]?.node.price.currencyCode}`);
        }
    }

    // Also test without country context
    console.log(`\n=== No Country Context (Default) ===`);
    const defaultQuery = `
    query ProductPrice {
      products(first: 1) {
        edges {
          node {
            title
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
    const defaultData = await fetchShopify(defaultQuery);
    const defaultProduct = defaultData.data.products.edges[0]?.node;
    if (defaultProduct) {
        console.log(`Title: ${defaultProduct.title}`);
        console.log(`Price Range: ${defaultProduct.priceRange.minVariantPrice.amount} ${defaultProduct.priceRange.minVariantPrice.currencyCode}`);
    }
}

checkPrices();
