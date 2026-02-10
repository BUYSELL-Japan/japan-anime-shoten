import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .dev.vars manually since we are running with node
const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
const envConfig = dotenv.parse(fs.readFileSync(devVarsPath));

const SHOPIFY_STORE_DOMAIN = envConfig.SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN = envConfig.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function verifyAdmin() {
    console.log(`Verifying Admin Access for ${SHOPIFY_STORE_DOMAIN}...`);

    // 1. Fetch Shop Info
    const shopQuery = `
    query {
        shop {
            name
            email
        }
    }`;

    const shopResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ACCESS_TOKEN
        },
        body: JSON.stringify({ query: shopQuery })
    });

    const shopData = await shopResponse.json();
    if (shopData.errors) {
        console.error("Shop Query Error:", JSON.stringify(shopData.errors, null, 2));
        return;
    }
    console.log("Shop Info:", shopData.data.shop);

    // 2. Fetch Publications (Channels)
    const pubQuery = `
    query {
        publications(first: 10) {
            edges {
                node {
                    id
                    name
                    catalog {
                        title
                    }
                }
            }
        }
    }`;

    const pubResponse = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ACCESS_TOKEN
        },
        body: JSON.stringify({ query: pubQuery })
    });

    const pubData = await pubResponse.json();
    if (pubData.errors) {
        console.error("Publications Query Error:", JSON.stringify(pubData.errors, null, 2));
        return;
    }

    console.log("Available Publications (Channels):");
    pubData.data.publications.edges.forEach(edge => {
        console.log(`- ID: ${edge.node.id}, Name: ${edge.node.name}, Catalog: ${edge.node.catalog?.title}`);
    });
}

verifyAdmin();
