import fetch from 'node-fetch';

async function test() {
    const query = `
    {
      products(first: 1) {
        edges {
          node {
            title
            variants(first: 1) {
              edges {
                node {
                  quantityAvailable
                }
              }
            }
          }
        }
      }
    }
  `;
    try {
        const res = await fetch('https://japan-anime-shoten-3.myshopify.com/api/2024-01/graphql.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': '06003929cb41ce1f45bc5faf503b8514'
            },
            body: JSON.stringify({ query })
        });
        const json = await res.json();
        console.dir(json, { depth: null });
    } catch (e) {
        console.error(e);
    }
}
test();
