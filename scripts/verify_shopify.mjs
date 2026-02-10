import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .dev.vars
const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
const envConfig = dotenv.parse(fs.readFileSync(devVarsPath));

const SHOP = envConfig.SHOPIFY_STORE_DOMAIN;
const TOKEN = envConfig.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function verify() {
  const query = `
    {
      products(first: 3) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  console.log(`Verifying connection to ${SHOP}...`);

  try {
    const response = await fetch(`https://${SHOP}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error(`Status: ${response.status}`);
      const text = await response.text();
      console.error(text);
      return;
    }

    const { data, errors } = await response.json();
    if (errors) {
      console.error("GraphQL Errors:", errors);
    } else {
      console.log("Success! Products found:");
      if (data.products.edges.length === 0) {
        console.log("(None)");
      } else {
        data.products.edges.forEach(edge => {
          console.log(`- [${edge.node.id}] ${edge.node.title}`);
        });
      }
    }
  } catch (e) {
    console.error("Network Error:", e);
  }
}

verify();
