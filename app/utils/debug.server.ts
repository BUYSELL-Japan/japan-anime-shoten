
import { AppLoadContext } from "@remix-run/cloudflare";
import { shopifyFetch } from "c:/Users/buyse/OneDrive/デスクトップ/Antigravity/Japan Anime Shoten/app/utils/shopify.server";

export async function getAllCollections(context: AppLoadContext) {
    const QUERY = `
    query GetAllCollections {
      collections(first: 100) {
        edges {
          node {
            title
            handle
          }
        }
      }
    }
  `;
    try {
        const data = await shopifyFetch({
            query: QUERY,
            context,
        });
        return data.collections.edges.map((e: any) => e.node);
    } catch (e) {
        console.error("Error fetching collections:", e);
        return [];
    }
}
