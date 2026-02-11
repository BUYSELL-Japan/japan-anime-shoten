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

async function testI18n() {
    const query = `
    query ProductTitle($language: LanguageCode) @inContext(language: $language) {
      products(first: 1) {
        edges {
          node {
            id
            title
            description
          }
        }
      }
    }
  `;

    console.log("Fetching in ZH_CN...");
    const dataCn = await fetchShopify(query, { language: 'ZH_CN' });
    if (dataCn.errors) console.error(JSON.stringify(dataCn.errors, null, 2));
    else console.log("ZH_CN Title:", dataCn.data.products.edges[0]?.node.title);

    console.log("Fetching in JA...");
    const dataJa = await fetchShopify(query, { language: 'JA' });
    if (dataJa.errors) console.error(JSON.stringify(dataJa.errors, null, 2));
    else console.log("JA Title:", dataJa.data.products.edges[0]?.node.title);

    console.log("Fetching in EN...");
    const dataEn = await fetchShopify(query, { language: 'EN' });
    if (dataEn.errors) console.error(JSON.stringify(dataEn.errors, null, 2));
    else console.log("EN Title:", dataEn.data.products.edges[0]?.node.title);
}

testI18n();
