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
      language: locale // Pass locale to get translated data from Shopify
    });

    const formatProduct = (node: any) => {
      return {
        id: node.id,
        title: node.title, // Now contains translated title from Shopify
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

      {/* Debug Info - Remove in production */}
      <div style={{ background: "#333", color: "#0f0", padding: "10px", fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>
        <strong>DEBUG MODE</strong><br />
        Route Params Lang: {useLoaderData<typeof loader>().locale}<br />
        Detected Locale: {useTranslation().i18n.language}<br />
        Server Translation Check (Search): {useTranslation().t("add_to_cart", { defaultValue: "FAILED" })}<br />
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
