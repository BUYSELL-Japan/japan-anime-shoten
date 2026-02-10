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
    return json({ featuredProducts: [], newArrivals: [] });
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

    if (env.DB && shopifyIds.length > 0) {
      const placeholders = shopifyIds.map(() => '?').join(',');
      const stmt = env.DB.prepare(`
                SELECT p.shopify_product_id, t.title 
                FROM products p 
                JOIN product_translations t ON p.id = t.product_id 
                WHERE p.shopify_product_id IN (${placeholders}) 
                AND t.language_code = ?
            `);

      const results = await stmt.bind(...shopifyIds, locale).all();

      if (results.results) {
        results.results.forEach((row: any) => {
          translationsMap[row.shopify_product_id] = { title: row.title };
        });
      }
    }

    const formatProduct = (node: any) => {
      const translation = translationsMap[node.id];
      return {
        id: node.id,
        title: translation?.title || node.title, // Use translation if available
        price: parseFloat(node.priceRange.minVariantPrice.amount).toLocaleString(),
        image: node.images.edges[0]?.node.url || "https://placehold.co/400x400?text=No+Image",
        rating: 5,
      };
    };

    const featuredProducts = shopifyData.featured.edges.map((edge: any) => formatProduct(edge.node));
    const newArrivals = shopifyData.newArrivals.edges.map((edge: any) => formatProduct(edge.node));

    return json({ featuredProducts, newArrivals });
  } catch (error) {
    console.error("Loader Error:", error);
    return json({ featuredProducts: [], newArrivals: [] });
  }
}

export default function Index() {
  const { featuredProducts, newArrivals } = useLoaderData<typeof loader>();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Announcement Bar */}
      <div style={{ background: "var(--color-primary)", color: "white", textAlign: "center", padding: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
        Free Standard Shipping on Orders Over ¥20,000!
      </div>

      <header style={{ borderBottom: "1px solid var(--color-border)", padding: "20px 0", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(5px)", zIndex: 100 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
            JAPAN ANIME <span className="text-red">SHOTEN</span>
          </h1>

          {/* Nav */}
          <nav style={{ display: "none", "@media (min-width: 768px)": { display: "flex" } } as any}>
            <ul style={{ display: "flex", gap: "24px", listStyle: "none", fontWeight: "500" }}>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Figures</a></li>
              <li><a href="#">Pokemon Cards</a></li>
              <li><a href="#">Pre-orders</a></li>
              <li><a href="#" style={{ color: "var(--color-primary)" }}>Sale</a></li>
            </ul>
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button style={{ fontWeight: "600" }}>Search</button>
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>Cart (0)</button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Hero />
        <NewArrivals products={newArrivals} />
        <TrustBadges />
        <ProductGrid products={featuredProducts} />
        <ShopIntro />
      </main>

      <footer style={{ background: "#111", color: "#888", padding: "60px 0 20px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            <div>
              <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>About Us</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                <li><a href="#">Our Story</a></li>
                <li><a href="#">Authenticity Guarantee</a></li>
                <li><a href="#">Wholesale</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>Customer Care</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                <li><a href="#">Shipping Policy</a></li>
                <li><a href="#">Return Policy</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>Newsletter</h3>
              <p style={{ marginBottom: "16px", fontSize: "0.9rem" }}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "white" }} />
                <button className="btn-primary">Join</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #333", paddingTop: "20px", textAlign: "center", fontSize: "0.8rem" }}>
            &copy; 2026 Japan Anime Shoten. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
