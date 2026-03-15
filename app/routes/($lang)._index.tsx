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
      collections(first: 12, sortKey: UPDATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            image {
              url
            }
            # thumbnail image product
            imageProducts: products(first: 1) {
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
            # featured cheapest product
            cheapestProducts: products(first: 1, sortKey: PRICE, reverse: false) {
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
      saleCollection: collection(handle: "sale") {
        id
        title
        handle
        products(first: 10, sortKey: CREATED, reverse: true) {
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

    console.log(`[Loader] shopifyData keys:`, Object.keys(shopifyData || {}));
    console.log(`[Loader] Fetched ${shopifyData.collections?.edges.length || 0} collections`);
    console.log(`[Loader] Fetched ${shopifyData.newArrivals?.edges?.length || 0} new arrivals`);
    console.log(`[Loader] Fetched ${shopifyData.saleCollection?.products?.edges?.length || 0} sale products`);

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
      if (!imageUrl && node.imageProducts?.edges?.length > 0) {
        const firstProduct = node.imageProducts.edges[0].node;
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

    // Get sale collection products from main query
    let saleProducts: any[] = [];
    if (shopifyData.saleCollection?.products?.edges) {
      saleProducts = shopifyData.saleCollection.products.edges.map((edge: any) => {
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

    // Filter out "Sale" collection from the collection slider
    const collections = (shopifyData.collections?.edges || [])
      .map((edge: any) => formatCollection(edge.node))
      .filter((c: any) => c.handle !== 'sale' && c.handle !== 'solo-leveling');

    // Extract cheapest product from each collection to form featuredProducts
    const featuredProducts = (shopifyData.collections?.edges || [])
      .map((edge: any) => edge.node.cheapestProducts?.edges[0]?.node)
      .filter((product: any) => product !== undefined)
      .map((node: any) => formatProduct(node))
      // Distinct products only
      .filter((product: any, index: number, self: any[]) =>
        index === self.findIndex((p: any) => p.id === product.id)
      )
      .slice(0, 8); // Limit to 8 featured products

    const newArrivals = (shopifyData.newArrivals?.edges || []).map((edge: any) => formatProduct(edge.node));

    console.log(`[Loader] Processed ${collections.length} collections for slider`);
    console.log(`[Loader] Processed ${featuredProducts.length} featured products`);
    console.log(`[Loader] Processed ${saleProducts.length} sale products`);
    console.log(`[Loader] Processed ${newArrivals.length} new arrivals`);

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
            padding: "16px 0",
            margin: "0",
          }}>
            <div className="container">
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <span style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                  color: "white",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "0.65rem",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}>
                  ✦ SPECIAL ✦
                </span>
                <h2 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: "800", marginBottom: "4px" }}>
                  {t("special_sale_title", { defaultValue: "Special Sale" })}
                </h2>
                <p style={{ color: "#aaa", fontSize: "0.8rem", margin: 0 }}>
                  {t("special_sale_subtitle", { defaultValue: "Limited items at special prices" })}
                </p>
              </div>
              <div className="sale-products-wrapper" style={{ position: "relative" }}>
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .sale-products-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 12px;
                  }
                  .scroll-indicator {
                    display: none;
                  }
                  @media (max-width: 768px) {
                    .sale-products-container {
                      display: flex;
                      overflow-x: auto;
                      scroll-snap-type: x mandatory;
                      scrollbar-width: none; /* Firefox */
                      -ms-overflow-style: none; /* IE/Edge */
                      padding-bottom: 12px;
                    }
                    .sale-products-container::-webkit-scrollbar {
                      display: none;
                    }
                    .sale-product-item {
                      flex: 0 0 160px; /* Fixed width on mobile so next item peeks */
                      scroll-snap-align: start;
                    }
                    .scroll-indicator {
                      display: flex;
                      align-items: center;
                      justify-content: flex-end;
                      font-size: 0.75rem;
                      color: #aaa;
                      margin-bottom: 8px;
                      padding-right: 4px;
                      animation: pulseScroll 2s infinite;
                    }
                    @keyframes pulseScroll {
                      0%, 100% { transform: translateX(0); opacity: 0.7; }
                      50% { transform: translateX(5px); opacity: 1; }
                    }
                  }
                `}} />

                <div className="scroll-indicator">
                  <span>Swipe to see more &rarr;</span>
                </div>

                <div className="sale-products-container">
                  {(saleProducts as any[]).map((product: any, i: number) => (
                    <div key={product.id} className="sale-product-item" style={{ transform: "scale(0.9)", transformOrigin: "top left" }}>
                      <ProductCard product={product} index={i} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <a
                  href={`/${currentLang}/collections/sale`}
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                    color: "white",
                    padding: "8px 20px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: "0 2px 10px rgba(230,57,70,0.3)",
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
