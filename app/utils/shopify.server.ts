import { AppLoadContext } from "@remix-run/cloudflare";

export async function shopifyFetch({
    query,
    variables,
    context,
}: {
    query: string;
    variables?: Record<string, any>;
    context: AppLoadContext;
}) {
    const env = context.cloudflare.env as any;

    if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
        console.error("Missing Shopify credentials in environment");
        throw new Error("Shopify credentials missing. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.");
    }

    const endpoint = `https://${env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query, variables }),
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
