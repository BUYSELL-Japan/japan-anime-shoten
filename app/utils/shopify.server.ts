import { AppLoadContext } from "@remix-run/cloudflare";

/**
 * Fetch Shopify credentials from environment variables or D1 database
 * Priority: Environment variables > D1 database
 */
async function getShopifyCredentials(env: any): Promise<{ domain: string; token: string }> {
    // Try environment variables first (for Cloudflare Pages deployment)
    if (env.SHOPIFY_STORE_DOMAIN && env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
        console.log("[ShopifyAuth] Using credentials from environment variables");
        return {
            domain: env.SHOPIFY_STORE_DOMAIN,
            token: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
        };
    }

    // Fallback to D1
    console.log("[ShopifyAuth] Environment variables not found, trying D1...");

    if (!env.DB) {
        throw new Error("Neither environment variables nor D1 database binding found. Please configure Shopify credentials.");
    }

    try {
        const results = await env.DB.prepare(`
            SELECT key, value 
            FROM app_settings 
            WHERE key IN ('shopify_shop_domain', 'shopify_access_token')
        `).all();

        if (!results.results || results.results.length === 0) {
            throw new Error("Shopify credentials not found in D1. Please add to app_settings or use environment variables.");
        }

        const settings: Record<string, string> = {};
        results.results.forEach((row: any) => {
            settings[row.key] = row.value;
        });

        const domain = settings['shopify_shop_domain'];
        const token = settings['shopify_access_token'];

        if (!domain || !token) {
            throw new Error(`Missing Shopify credentials in D1. Found: domain=${!!domain}, token=${!!token}`);
        }

        console.log("[ShopifyAuth] Using credentials from D1");
        console.log(`[ShopifyAuth] IMPORTANT: Token type = ${token.startsWith('shpat_') ? 'Admin (WRONG for Storefront API!)' : 'Storefront (Correct)'}`);

        if (token.startsWith('shpat_')) {
            throw new Error(
                "Admin Access Token detected in D1! Storefront API requires a Storefront Access Token. " +
                "Please update app_settings with the correct token type (starts with lowercase letters/numbers, not 'shpat_')."
            );
        }

        return { domain, token };
    } catch (error) {
        console.error("Failed to fetch Shopify credentials from D1:", error);
        throw error;
    }
}

export async function shopifyFetch({
    query,
    variables,
    context,
    language,
}: {
    query: string;
    variables?: Record<string, any>;
    context: AppLoadContext;
    language?: string; // Add language parameter (e.g., "EN", "ZH_CN", "JA")
}) {
    const env = context.cloudflare.env as any;

    // Get credentials from environment or D1
    const { domain, token } = await getShopifyCredentials(env);

    const endpoint = `https://${domain}/api/2024-01/graphql.json`;

    // Convert language code to Shopify format (e.g., "zh-CN" -> "ZH_CN")
    let shopifyLanguage = "JA"; // Default to Japanese
    if (language) {
        shopifyLanguage = language.toUpperCase().replace("-", "_");
    }

    // Inject @inContext directive if language is specified
    let modifiedQuery = query;
    if (language && !query.includes("@inContext")) {
        // Insert @inContext after the first query/mutation definition
        modifiedQuery = query.replace(
            /(query|mutation)\s+(\w+)(\s*\(.*?\))?\s*{/,
            `$1 $2$3 @inContext(language: ${shopifyLanguage}) {`
        );
    }

    console.log(`[ShopifyFetch] Language: ${shopifyLanguage}, Query modified: ${query !== modifiedQuery}`);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": token,
            },
            body: JSON.stringify({ query: modifiedQuery, variables }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${text}`);
        }

        const json = await response.json();

        if (json.errors) {
            throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
        }

        return json.data;
    } catch (error) {
        console.error("Shopify Fetch Error:", error);
        throw error;
    }
}
