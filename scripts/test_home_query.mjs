import fetch from 'node-fetch';

const domain = process.env.SHOPIFY_STORE_DOMAIN || "japan-anime-shoten-3.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "06003929cb41ce1f45bc5faf503b8514";
const endpoint = `https://${domain}/api/2024-01/graphql.json`;

const QUERY = `
    query HomePage @inContext(language: EN, country: JP) {
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

async function main() {
    console.log("Fetching from Shopify...");
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": token,
            },
            body: JSON.stringify({ query: QUERY }),
        });

        if (!res.ok) {
            console.error("HTTP Error:", res.status, res.statusText);
            const text = await res.text();
            console.error(text);
            return;
        }

        const json = await res.json();
        if (json.errors) {
            console.error("GraphQL Errors:", JSON.stringify(json.errors, null, 2));
        } else {
            console.log("Success! Data keys:", Object.keys(json.data));
            console.log("Collections:", json.data.collections.edges.length);
            console.log("Featured Products:", json.data.featured.edges.length);
            console.log("New Arrivals:", json.data.newArrivals.edges.length);
            console.log("Sale Collection:", json.data.saleCollection ? "Exists" : "Null");
            if (json.data.saleCollection) {
                console.log("Sale Products:", json.data.saleCollection.products.edges.length);
            }
        }
    } catch (err) {
        console.error("Catch Error:", err);
    }
}

main();
