import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { shopifyFetch } from "~/utils/shopify.server";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
    const locale = params.lang || "en";
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    if (!query || query.length < 2) {
        return json({ products: [] });
    }

    // Parse cookies for currency/country
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader?.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>) || {};

    const preferredCurrency = cookies['preferred_currency'];

    const currencyToCountry: Record<string, string> = {
        "TWD": "TW", "CNY": "CN", "KRW": "KR", "THB": "TH", "USD": "US",
        "EUR": "DE", "GBP": "GB", "CAD": "CA", "JPY": "JP"
    };

    let detectedCountry = "JP";
    if (preferredCurrency && currencyToCountry[preferredCurrency]) {
        detectedCountry = currencyToCountry[preferredCurrency];
    } else {
        const cf = (request as any).cf;
        detectedCountry = cf?.country || "JP";
    }

    const PREDICTIVE_SEARCH_QUERY = `
        query PredictiveSearch($query: String!) {
            predictiveSearch(query: $query) {
                products {
                    id
                    title
                    handle
                    availableForSale
                    priceRange {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    images(first: 1) {
                        edges {
                            node {
                                url
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await shopifyFetch({
            query: PREDICTIVE_SEARCH_QUERY,
            variables: { query },
            context,
            language: locale,
            country: detectedCountry,
        });

        const currencySymbols: Record<string, string> = {
            'USD': '$', 'JPY': '¥', 'CNY': '¥', 'KRW': '₩', 'THB': '฿',
            'TWD': 'NT$', 'EUR': '€', 'GBP': '£', 'CAD': 'CA$'
        };

        const products = (data.predictiveSearch?.products || []).slice(0, 6).map((node: any) => {
            const currencyCode = node.priceRange.minVariantPrice.currencyCode;
            const amount = parseFloat(node.priceRange.minVariantPrice.amount);
            const symbol = currencySymbols[currencyCode] || currencyCode;

            let formattedPrice = '';
            if (['JPY', 'KRW', 'TWD', 'THB', 'CNY'].includes(currencyCode)) {
                formattedPrice = amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
            } else {
                formattedPrice = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }

            return {
                id: node.id,
                title: node.title,
                handle: node.handle,
                price: `${symbol}${formattedPrice}`,
                image: node.images.edges[0]?.node.url || "",
                availableForSale: node.availableForSale,
            };
        });

        return json({ products });
    } catch (error) {
        console.error("Predictive Search Error:", error);
        return json({ products: [] });
    }
}
