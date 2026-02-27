import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import ProductGrid from "~/components/ProductGrid";
import { shopifyFetch } from "~/utils/shopify.server";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
    return [
        { title: "Search | Japan Anime Shoten" },
        { name: "description", content: "Search for authentic anime goods from Japan." },
    ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
    const locale = params.lang || "en";
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";

    if (!query.trim()) {
        return json({ products: [], query: "", locale, detectedCurrency: "JPY", totalCount: 0 });
    }

    // Parse cookies for currency/country
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader?.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>) || {};

    const preferredCurrency = cookies['preferred_currency'];

    const countryToCurrency: Record<string, string> = {
        "TW": "TWD", "CN": "CNY", "KR": "KRW", "TH": "THB", "US": "USD",
        "GB": "GBP", "CA": "CAD", "DE": "EUR", "FR": "EUR", "IT": "EUR",
        "ES": "EUR", "NL": "EUR", "BE": "EUR", "AT": "EUR", "JP": "JPY"
    };
    const currencyToCountry: Record<string, string> = {
        "TWD": "TW", "CNY": "CN", "KRW": "KR", "THB": "TH", "USD": "US",
        "EUR": "DE", "GBP": "GB", "CAD": "CA", "JPY": "JP"
    };

    let detectedCountry = "JP";
    let detectedCurrency = "JPY";

    if (preferredCurrency && currencyToCountry[preferredCurrency]) {
        detectedCountry = currencyToCountry[preferredCurrency];
        detectedCurrency = preferredCurrency;
    } else {
        const cf = (request as any).cf;
        detectedCountry = cf?.country || "JP";
        detectedCurrency = countryToCurrency[detectedCountry] || "JPY";
    }

    const SEARCH_QUERY = `
        query SearchProducts($query: String!, $first: Int!) {
            search(query: $query, types: [PRODUCT], first: $first) {
                totalCount
                edges {
                    node {
                        ... on Product {
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
                            variants(first: 1) {
                                edges {
                                    node {
                                        id
                                        quantityAvailable
                                    }
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
            }
        }
    `;

    try {
        const data = await shopifyFetch({
            query: SEARCH_QUERY,
            variables: { query: query.trim(), first: 40 },
            context,
            language: locale,
            country: detectedCountry,
        });

        const currencySymbols: Record<string, string> = {
            'USD': '$', 'JPY': '¥', 'CNY': '¥', 'KRW': '₩', 'THB': '฿',
            'TWD': 'NT$', 'EUR': '€', 'GBP': '£', 'CAD': 'CA$'
        };

        const products = (data.search?.edges || [])
            .filter((edge: any) => edge.node?.id)
            .map((edge: any) => {
                const node = edge.node;
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
                    image: node.images?.edges[0]?.node.url || "https://placehold.co/400x400?text=No+Image",
                    rating: 5,
                    variantId: node.variants?.edges[0]?.node.id,
                    availableForSale: node.availableForSale,
                    inventoryQuantity: node.variants?.edges[0]?.node.quantityAvailable,
                };
            });

        return json({
            products,
            query,
            locale,
            detectedCurrency,
            totalCount: data.search?.totalCount || 0,
        });
    } catch (error) {
        console.error("Search Loader Error:", error);
        return json({
            products: [],
            query,
            locale,
            detectedCurrency: "JPY",
            totalCount: 0,
        });
    }
}

export default function SearchPage() {
    const { products, query, detectedCurrency, totalCount } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header currentCurrency={detectedCurrency} />

            <main style={{ flex: 1, padding: "var(--spacing-2xl) 0" }} className="container">
                <h1 className="title-main" style={{ textAlign: "center", marginBottom: "8px" }}>
                    {t("search_results", { defaultValue: "Search Results" })}
                </h1>

                {query && (
                    <p style={{ textAlign: "center", color: "#666", marginBottom: "var(--spacing-xl)", fontSize: "1rem" }}>
                        {t("search_results_for", { defaultValue: `Search results for "{{query}}"`, query })}
                        {totalCount > 0 && (
                            <span style={{ marginLeft: "8px", color: "#999" }}>
                                ({totalCount} {totalCount === 1 ? "item" : "items"})
                            </span>
                        )}
                    </p>
                )}

                {products.length > 0 ? (
                    <ProductGrid products={products} hideHeader={true} />
                ) : (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        color: "#999",
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
                        <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
                            {query
                                ? t("search_no_results", { defaultValue: `No results found for "{{query}}"`, query })
                                : t("search_placeholder", { defaultValue: "Search products..." })
                            }
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                            {query ? t("search_try_different", { defaultValue: "Try different keywords or check the spelling." }) : ""}
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
