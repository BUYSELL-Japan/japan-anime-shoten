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

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as any;
  const locale = await i18next.getLocale(request);

  // Fallback if no credentials (e.g. initial dev)
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.warn("Shopify credentials missing. Using empty data.");
    return json({ featuredProducts: [], newArrivals: [], locale });
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
    const shopifyData = await shopifyFetch({ query: QUERY, context });

    // Extract all Shopify IDs
    const allEdges = [...shopifyData.featured.edges, ...shopifyData.newArrivals.edges];
    const shopifyIds = allEdges.map((e: any) => e.node.id); // e.g., "gid://shopify/Product/..."

    // Fetch Translations from D1
    let translationsMap: Record<string, { title: string }> = {};

    // Normalize locale for D1 (e.g., zh-CN -> zh_cn)
    const d1Locale = locale.toLowerCase().replace('-', '_');
    console.log(`[Loader] Fetching translations for locale: ${d1Locale} (Original: ${locale})`);
    console.log(`[Loader] Shopify IDs to query (first 3):`, shopifyIds.slice(0, 3));

    if (env.DB && shopifyIds.length > 0) {
      const placeholders = shopifyIds.map(() => '?').join(',');
      const stmt = env.DB.prepare(`
                SELECT p.shopify_product_id, t.title, t.language_code 
                FROM products p 
                JOIN product_translations t ON p.id = t.product_id 
                WHERE p.shopify_product_id IN (${placeholders}) 
                AND t.language_code = ?
            `);

      const results = await stmt.bind(...shopifyIds, d1Locale).all();

      console.log(`[Loader] Query executed. Row count: ${results.results?.length}`);
      if (results.results && results.results.length > 0) {
        console.log(`[Loader] First result:`, results.results[0]);
        results.results.forEach((row: any) => {
          translationsMap[row.shopify_product_id] = { title: row.title };
        });
      } else {
        // Debug: Try querying without language code to see if ANY translations exist for these IDs
        const debugStmt = env.DB.prepare(`
             SELECT p.shopify_product_id, t.language_code, t.title
             FROM products p
             JOIN product_translations t ON p.id = t.product_id
             WHERE p.shopify_product_id IN (${placeholders})
             LIMIT 5
         `);
        const debugResults = await debugStmt.bind(...shopifyIds).all();
        console.log(`[Loader DEBUG] Any translations for these products?`, debugResults.results);
      }
    }

    const formatProduct = (node: any) => {
      const translation = translationsMap[node.id];
      return {
        id: node.id,
        title: translation?.title || node.title, // Use translation if available
        handle: node.handle,
        price: parseFloat(node.priceRange.minVariantPrice.amount).toLocaleString(),
        image: node.images.edges[0]?.node.url || "https://placehold.co/400x400?text=No+Image",
        rating: 5,
      };
    };

    const featuredProducts = shopifyData.featured.edges.map((edge: any) => formatProduct(edge.node));
    const newArrivals = shopifyData.newArrivals.edges.map((edge: any) => formatProduct(edge.node));

    return json({ featuredProducts, newArrivals, locale });
  } catch (error) {
    console.error("Loader Error:", error);
    return json({ featuredProducts: [], newArrivals: [], locale });
  }
}

import Header from "~/components/Header";
import Footer from "~/components/Footer";

export default function Index() {
  const { featuredProducts, newArrivals } = useLoaderData<typeof loader>();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Announcement Bar */}
      <div style={{ background: "var(--color-primary)", color: "white", textAlign: "center", padding: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
        Free Standard Shipping on Orders Over ¥20,000!
      </div>

      <Header />

      <main style={{ flex: 1 }}>
        <Hero />
        <NewArrivals products={newArrivals} />
        <TrustBadges />
        <ProductGrid products={featuredProducts} />
        <ShopIntro />
      </main>

      <Footer />
    </div>
  );
}
