import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .dev.vars
const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
const envConfig = dotenv.parse(fs.readFileSync(devVarsPath));

const SHOP = envConfig.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = envConfig.SHOPIFY_CLIENT_ID;
const PROXY_SECRET = envConfig.SHOPIFY_CLIENT_SECRET;

async function checkStore() {
    console.log(`Checking store: ${SHOP}`);
    try {
        const res = await fetch(`https://${SHOP}`);
        console.log(`Store Homepage Status: ${res.status}`);
    } catch (e) {
        console.error("Store unreachable:", e.message);
    }
}

async function tryBasicAuth() {
    console.log("Trying Basic Auth with Secret...");
    const auth = Buffer.from(`${CLIENT_ID}:${PROXY_SECRET}`).toString('base64');
    try {
        const res = await fetch(`https://${SHOP}/admin/api/2024-01/shop.json`, {
            headers: {
                "Authorization": `Basic ${auth}`
            }
        });
        console.log(`Basic Auth Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log("Basic Auth Success! Shop ID:", data.shop?.id);
        } else {
            const text = await res.text();
            console.log("Basic Auth Failed Body:", text.substring(0, 200));
        }
    } catch (e) {
        console.error("Basic Auth Error:", e.message);
    }
}

async function tryOAuth() {
    console.log("Trying /admin/oauth/access_token...");
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", PROXY_SECRET);
    params.append("grant_type", "client_credentials");

    try {
        const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
            method: "POST",
            body: params,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        console.log(`OAuth Status: ${res.status}`);
        const text = await res.text();
        console.log("OAuth Body:", text.substring(0, 500));
    } catch (e) {
        console.error("OAuth Error:", e.message);
    }
}

async function main() {
    if (!CLIENT_ID || !PROXY_SECRET) {
        console.error("Missing Credentials in .dev.vars");
        return;
    }
    await checkStore();
    await tryBasicAuth();
    await tryOAuth();
}

main();
