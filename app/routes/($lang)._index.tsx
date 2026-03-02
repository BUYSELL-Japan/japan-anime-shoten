import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Hero from "~/components/Hero";
import ProductGrid from "~/components/ProductGrid";
import NewArrivals from "~/components/NewArrivals";
import TrustBadges from "~/components/TrustBadges";
import ShopIntro from "~/components/ShopIntro";
import { shopifyFetch } from "~/utils/shopify.server";
import i18next from "~/i18n.server";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  return [
    { title: "Japan Anime Shoten | Authentic Anime Goods" },
    {
      name: "description",
      content: "Authentic Anime Goods directly from Japan! We ship figures and merchandise worldwide.",
    },
  ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as any;
  const locale = params.lang || "en";

  // Parse cookies
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader?.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>) || {};

  const preferredCurrency = cookies['preferred_currency'];

  // Map country to currency
  const countryToCurrency: Record<string, string> = {
    "TW": "TWD",
    "CN": "CNY",
    "KR": "KRW",
    "TH": "THB",
    "US": "USD",
    "GB": "GBP",
    "CA": "CAD",
    "DE": "EUR",
    "FR": "EUR",
    "IT": "EUR",
    "ES": "EUR",
    "NL": "EUR",
    "BE": "EUR",
    "AT": "EUR",
    "JP": "JPY"
  };

  // Reverse mapping: currency to country
  const currencyToCountry: Record<string, string> = {
    "TWD": "TW",
    "CNY": "CN",
    "KRW": "KR",
    "THB": "TH",
    "USD": "US",
    "EUR": "DE", // Using DE as a representative country for EUR
    "GBP": "GB",
    "CAD": "CA",
    "JPY": "JP"
  };

  // Priority: Cookie > Cloudflare location > Default
  let detectedCountry = "JP";
  let detectedCurrency = "JPY";

  if (preferredCurrency && currencyToCountry[preferredCurrency]) {
    // User has manually selected a currency
    detectedCountry = currencyToCountry[preferredCurrency];
    detectedCurrency = preferredCurrency;
    console.log(`[Loader] Using preferred currency from cookie: ${preferredCurrency} (${detectedCountry})`);
  } else {
    // Use Cloudflare location detection
    const cf = (request as any).cf;
    detectedCountry = cf?.country || "JP";
    detectedCurrency = countryToCurrency[detectedCountry] || "JPY";
    console.log(`[Loader] Cloudflare detected country: ${detectedCountry}, Currency: ${detectedCurrency}`);
  }

  const QUERY = `
    query HomePage {
      collections(first: 10, sortKey: UPDATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            image {
              url
            }
            products(first: 1) {
              edges {
                node {
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
      }
      featured: products(first: 8, sortKey: BEST_SELLING) {
        edges {
          node {
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
      newArrivals: products(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
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
  `;

  // Separate query for Sale collection
  const SALE_QUERY = `
    query SaleCollection {
      collection(handle: "sale") {
        id
        title
        handle
        products(first: 10, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
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
              compareAtPriceRange {
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
    const shopifyData = await shopifyFetch({
      query: QUERY,
      context,
      language: locale, // Pass locale to get translated data
      country: detectedCountry // Pass detected country for pricing
    });

    console.log(`[Loader] Fetched ${shopifyData.collections?.edges.length || 0} collections`);
    console.log(`[Loader] Fetched ${shopifyData.featured.edges.length} featured products`);
    console.log(`[Loader] Fetched ${shopifyData.newArrivals.edges.length} new arrivals`);

    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩',
      'THB': '฿',
      'TWD': 'NT$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'CA$'
    };

    const formatProduct = (node: any) => {
      const currencyCode = node.priceRange.minVariantPrice.currencyCode;
      const amount = parseFloat(node.priceRange.minVariantPrice.amount);

      const symbol = currencySymbols[currencyCode] || currencyCode;

      // Formatting logic based on currency
      let formattedPrice = '';
      if (['JPY', 'KRW', 'TWD', 'THB', 'CNY'].includes(currencyCode)) {
        // Currencies that typically don't use decimals or have specific formatting
        formattedPrice = amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
      } else {
        formattedPrice = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      return {
        id: node.id,
        title: node.title, // Contains translated title from Shopify
        handle: node.handle,
        price: `${symbol}${formattedPrice}`,
        currencyCode,
        image: node.images.edges[0]?.node.url || "https://placehold.co/400x400?text=No+Image",
        rating: 5,
        variantId: node.variants?.edges[0]?.node.id,
        availableForSale: node.availableForSale,
        inventoryQuantity: node.variants?.edges[0]?.node.quantityAvailable,
      };
    };

    const formatCollection = (node: any) => {
      // 1. Try to use the collection's dedicated image
      let imageUrl = node.image?.url;

      // 2. If no dedicated image, use the first product's image as thumbnail
      if (!imageUrl && node.products?.edges?.length > 0) {
        const firstProduct = node.products.edges[0].node;
        if (firstProduct.images?.edges?.length > 0) {
          imageUrl = firstProduct.images.edges[0].node.url;
        }
      }

      // 3. Fallback to placeholder
      if (!imageUrl) {
        imageUrl = `https://placehold.co/400x600?text=${encodeURIComponent(node.title)}`;
      }

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        image: imageUrl
      };
    };

    // Fetch sale collection products
    let saleProducts: any[] = [];
    try {
      const saleData = await shopifyFetch({
        query: SALE_QUERY,
        context,
        language: locale,
        country: detectedCountry
      });
      if (saleData.collection?.products?.edges) {
        saleProducts = saleData.collection.products.edges.map((edge: any) => {
          const node = edge.node;
          const formatted = formatProduct(node);
          // Add compare-at price if available
          const compareAmount = node.compareAtPriceRange?.minVariantPrice?.amount;
          if (compareAmount && parseFloat(compareAmount) > 0) {
            const compCurrency = node.compareAtPriceRange.minVariantPrice.currencyCode;
            const compSymbol = currencySymbols[compCurrency] || compCurrency;
            const compFormatted = ['JPY', 'KRW', 'TWD', 'THB', 'CNY'].includes(compCurrency)
              ? parseFloat(compareAmount).toLocaleString('ja-JP', { maximumFractionDigits: 0 })
              : parseFloat(compareAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return { ...formatted, compareAtPrice: `${compSymbol}${compFormatted}` };
          }
          return { ...formatted, compareAtPrice: null };
        });
      }
    } catch (e) {
      console.error("Failed to fetch sale collection:", e);
    }

    // Filter out "Sale" collection from the collection slider
    const collections = (shopifyData.collections?.edges || [])
      .map((edge: any) => formatCollection(edge.node))
      .filter((c: any) => c.handle !== 'sale');
    const featuredProducts = shopifyData.featured.edges.map((edge: any) => formatProduct(edge.node));
    const newArrivals = shopifyData.newArrivals.edges.map((edge: any) => formatProduct(edge.node));

    return json({
      collections,
      featuredProducts,
      newArrivals,
      saleProducts,
      locale,
      detectedCountry,
      detectedCurrency
    });
  } catch (error) {
    console.error("Loader Error:", error);
    return json({
      collections: [],
      featuredProducts: [],
      newArrivals: [],
      saleProducts: [],
      locale,
      detectedCountry: "JP",
      detectedCurrency: "JPY"
    });
  }
}

import Header from "~/components/Header";
import Footer from "~/components/Footer";
import CollectionSlider from "~/components/CollectionSlider";
import SaleCountdown from "~/components/SaleCountdown";
import ProductCard from "~/components/ProductCard";

export default function Index() {
  const { collections, featuredProducts, newArrivals, saleProducts, detectedCurrency } = useLoaderData<typeof loader>();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Announcement Bar */}
      <div style={{ background: "var(--color-primary)", color: "white", textAlign: "center", padding: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
        {t("announcement_shipping")}
      </div>

      <Header currentCurrency={detectedCurrency} />

      <main style={{ flex: 1 }}>
        <Hero />
        <SaleCountdown />
        <CollectionSlider collections={collections} />

        {/* Special Sale Section */}
        {saleProducts && saleProducts.length > 0 && (
          <section style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            padding: "40px 0",
            margin: "20px 0",
          }}>
            <div className="container">
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <span style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                  color: "white",
                  padding: "4px 16px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "800",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}>
                  ✦ SPECIAL ✦
                </span>
                <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>
                  {t("special_sale_title", { defaultValue: "Special Sale" })}
                </h2>
                <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
                  {t("special_sale_subtitle", { defaultValue: "Limited items at special prices" })}
                </p>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}>
                {(saleProducts as any[]).map((product: any, i: number) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <a
                  href={`/${currentLang}/collections/sale`}
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                    color: "white",
                    padding: "12px 32px",
                    borderRadius: "30px",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 4px 15px rgba(230,57,70,0.4)",
                  }}
                >
                  {t("view_all_sale", { defaultValue: "View All Sale Items →" })}
                </a>
              </div>
            </div>
          </section>
        )}

        <NewArrivals products={newArrivals} />
        <TrustBadges />
        <ProductGrid products={featuredProducts} />
        <ShopIntro />
      </main>

      <Footer />
    </div >
  );
}
