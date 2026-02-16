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
      featured: products(first: 8, sortKey: BEST_SELLING) {
        edges {
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
    }
  `;

  try {
    const shopifyData = await shopifyFetch({
      query: QUERY,
      context,
      language: locale, // Pass locale to get translated data
      country: detectedCountry // Pass detected country for pricing
    });

    console.log(`[Loader] Raw Shopify Data:`, JSON.stringify(shopifyData, null, 2));

    console.log(`[Loader] Fetched ${shopifyData.featured.edges.length} featured products`);
    console.log(`[Loader] Fetched ${shopifyData.newArrivals.edges.length} new arrivals`);

    if (shopifyData.newArrivals.edges.length > 0) {
      console.log(`[Loader] First new arrival:`, JSON.stringify(shopifyData.newArrivals.edges[0].node, null, 2));
    }

    const formatProduct = (node: any) => {
      const currencyCode = node.priceRange.minVariantPrice.currencyCode;
      const amount = parseFloat(node.priceRange.minVariantPrice.amount);

      // Format price with currency symbol
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
      };
    };

    const featuredProducts = shopifyData.featured.edges.map((edge: any) => formatProduct(edge.node));
    const newArrivals = shopifyData.newArrivals.edges.map((edge: any) => formatProduct(edge.node));

    return json({
      featuredProducts,
      newArrivals,
      locale,
      detectedCountry,
      detectedCurrency
    });
  } catch (error) {
    console.error("Loader Error:", error);
    return json({
      featuredProducts: [],
      newArrivals: [],
      locale,
      detectedCountry: "JP",
      detectedCurrency: "JPY"
    });
  }
}

import Header from "~/components/Header";
import Footer from "~/components/Footer";

export default function Index() {
  const { featuredProducts, newArrivals, detectedCurrency } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Announcement Bar */}
      <div style={{ background: "var(--color-primary)", color: "white", textAlign: "center", padding: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
        {t("announcement_shipping")}
      </div>

      <Header currentCurrency={detectedCurrency} />

      <main style={{ flex: 1 }}>
        <Hero />
        <NewArrivals products={newArrivals} />
        <TrustBadges />
        <ProductGrid products={featuredProducts} />
        <ShopIntro />
      </main>

      <Footer />
    </div >
  );
}
