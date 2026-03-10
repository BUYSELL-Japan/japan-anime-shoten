import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { shopifyFetch } from "~/utils/shopify.server";
import i18nConfig from "~/i18n";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Use supported languages from i18n config
    const languages = i18nConfig.supportedLngs || ["en", "zh-TW", "zh-CN", "ko", "th"];

    const QUERY = `
    query SitemapData {
      products(first: 250) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
      collections(first: 250) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }
  `;

    let shopifyData;
    try {
        shopifyData = await shopifyFetch({
            query: QUERY,
            context,
            language: "en",
            country: "JP"
        });
    } catch (error) {
        console.error("Sitemap fetch error:", error);
        // Return empty sitemap on error (but structure remains valid)
        return new Response(generateXml(baseUrl, languages, [], []), {
            headers: {
                "Content-Type": "application/xml",
                "xml-version": "1.0",
                "encoding": "UTF-8"
            }
        });
    }

    const products = shopifyData.products?.edges || [];
    const collections = shopifyData.collections?.edges || [];

    const xml = generateXml(baseUrl, languages, products, collections);

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
            "xml-version": "1.0",
            "encoding": "UTF-8",
            "Cache-Control": "public, max-age=3600" // Cache for 1 hour
        }
    });
}

function generateXml(baseUrl: string, languages: string[], products: any[], collections: any[]) {
    // Basic static pages that exist for every locale
    const staticRoutes = [""];

    let urlNodes = "";

    // Generate URLs for each language
    for (const lang of languages) {
        // Static Routes (like Homepage)
        for (const route of staticRoutes) {
            urlNodes += `
  <url>
    <loc>${baseUrl}/${lang}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`;
        }

        // All Products Page
        urlNodes += `
  <url>
    <loc>${baseUrl}/${lang}/collections/all</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

        // Collection Routes
        for (const edge of collections) {
            urlNodes += `
  <url>
    <loc>${baseUrl}/${lang}/collections/${edge.node.handle}</loc>
    <lastmod>${edge.node.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }

        // Product Routes
        for (const edge of products) {
            urlNodes += `
  <url>
    <loc>${baseUrl}/${lang}/products/${edge.node.handle}</loc>
    <lastmod>${edge.node.updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`;
}
