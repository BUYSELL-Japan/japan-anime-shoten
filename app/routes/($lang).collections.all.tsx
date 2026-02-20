import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, useNavigate } from "@remix-run/react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import ProductGrid from "~/components/ProductGrid";
import { shopifyFetch } from "~/utils/shopify.server";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
    return [
        { title: "All Products | Japan Anime Shoten" },
        { name: "description", content: "View all authentic anime goods directly from Japan." },
    ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
    const locale = params.lang || "en";
    const url = new URL(request.url);
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    // Pagination basics
    const limit = 20;

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

    // Build pagination variables
    let queryVars: any = {};
    if (before) {
        queryVars = { last: limit, before };
    } else if (after) {
        queryVars = { first: limit, after };
    } else {
        queryVars = { first: limit };
    }

    const QUERY = `
    query AllProducts($first: Int, $after: String, $last: Int, $before: String) {
      products(first: $first, after: $after, last: $last, before: $before) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            id
            title
            handle
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
  `;

    try {
        const shopifyData = await shopifyFetch({
            query: QUERY,
            variables: queryVars,
            context,
            language: locale,
            country: detectedCountry
        });

        const formatProduct = (node: any) => {
            const currencyCode = node.priceRange.minVariantPrice.currencyCode;
            const amount = parseFloat(node.priceRange.minVariantPrice.amount);

            const currencySymbols: Record<string, string> = {
                'USD': '$', 'JPY': '¥', 'CNY': '¥', 'KRW': '₩', 'THB': '฿',
                'TWD': 'NT$', 'EUR': '€', 'GBP': '£', 'CAD': 'CA$'
            };
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
                currencyCode,
                image: node.images.edges[0]?.node.url || "https://placehold.co/400x400?text=No+Image",
                rating: 5,
                variantId: node.variants?.edges[0]?.node.id,
            };
        };

        const products = shopifyData.products.edges.map((edge: any) => formatProduct(edge.node));
        const pageInfo = shopifyData.products.pageInfo;

        return json({
            products,
            pageInfo,
            locale,
            detectedCurrency
        });
    } catch (error) {
        console.error("Loader Error:", error);
        return json({
            products: [],
            pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
            locale,
            detectedCurrency: "JPY"
        });
    }
}

export default function AllProducts() {
    const { products, pageInfo, detectedCurrency, locale } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleNext = () => {
        if (pageInfo.hasNextPage && pageInfo.endCursor) {
            navigate(`/${locale}/collections/all?after=${pageInfo.endCursor}`);
        }
    };

    const handlePrevious = () => {
        if (pageInfo.hasPreviousPage && pageInfo.startCursor) {
            navigate(`/${locale}/collections/all?before=${pageInfo.startCursor}`);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header currentCurrency={detectedCurrency} />

            <main style={{ flex: 1, padding: "var(--spacing-2xl) 0" }} className="container">
                <h1 className="title-main" style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
                    {t('view_all_products', { defaultValue: 'All Products' })}
                </h1>

                {products.length > 0 ? (
                    <>
                        <ProductGrid products={products} hideHeader={true} />

                        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "var(--spacing-2xl)" }}>
                            <button
                                className="btn-secondary"
                                onClick={handlePrevious}
                                disabled={!pageInfo.hasPreviousPage}
                                style={{ opacity: pageInfo.hasPreviousPage ? 1 : 0.5, cursor: pageInfo.hasPreviousPage ? 'pointer' : 'not-allowed' }}
                            >
                                &larr; Previous
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={handleNext}
                                disabled={!pageInfo.hasNextPage}
                                style={{ opacity: pageInfo.hasNextPage ? 1 : 0.5, cursor: pageInfo.hasNextPage ? 'pointer' : 'not-allowed' }}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: "40px" }}>No products found.</div>
                )}
            </main>

            <Footer />
        </div>
    );
}
