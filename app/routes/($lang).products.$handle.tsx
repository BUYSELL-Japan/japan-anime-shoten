import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { shopifyFetch } from "~/utils/shopify.server";
import i18next from "~/i18n.server";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.product?.title ? `${data.product.title} | Japan Anime Shoten` : "Product Details" },
    { name: "description", content: data?.product?.description?.substring(0, 160) || "Product Details" },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const variantId = formData.get("variantId");

  if (!variantId) return json({ error: "No variant selected" }, { status: 400 });

  const MUTATION = `
    mutation cartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart {
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const { cartCreate } = await shopifyFetch({
      query: MUTATION,
      variables: {
        lines: [{ merchandiseId: variantId, quantity: 1 }]
      },
      context
    });

    if (cartCreate?.cart?.checkoutUrl) {
      return redirect(cartCreate.cart.checkoutUrl);
    } else {
      console.error("Cart Create Errors:", cartCreate?.userErrors);
      return json({ error: "Failed to create checkout" }, { status: 500 });
    }
  } catch (e) {
    console.error("Cart Create System Error:", e);
    return json({ error: "System Error" }, { status: 500 });
  }
}

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { handle, lang } = params;
  const env = context.cloudflare.env as any;
  const locale = lang || "en";

  const QUERY = `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        descriptionHtml
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
              price {
                amount
                currencyCode
              }
            }
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const variables = { handle };

  try {
    const { product } = await shopifyFetch({
      query: QUERY,
      variables,
      context,
      language: locale // Pass locale to get translated data from Shopify
    });

    if (!product) {
      throw new Response("Not Found", { status: 404 });
    }

    const currencyCode = product.priceRange.minVariantPrice.currencyCode;
    const amount = parseFloat(product.priceRange.minVariantPrice.amount);

    // Format price with currency symbol
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩',
      'THB': '฿',
      'TWD': 'NT$'
    };

    const symbol = currencySymbols[currencyCode] || currencyCode;

    // Formatting logic based on currency
    let formattedPrice = '';
    if (['JPY', 'KRW', 'TWD', 'THB', 'CNY'].includes(currencyCode)) {
      formattedPrice = amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    } else {
      formattedPrice = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const displayPrice = `${symbol}${formattedPrice}`;

    return json({
      product, // Contains translated title and description from Shopify
      locale,
      displayPrice // Pass pre-formatted price string
    });

  } catch (error) {
    console.error("Product Loader Error:", error);
    throw new Response("Not Found", { status: 404 });
  }
}

import { useState } from "react";

export default function ProductDetail() {
  const { product, displayPrice } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // State for the currently selected main image
  // Default to the first image or a placeholder
  const [mainImage, setMainImage] = useState(
    product.images.edges[0]?.node.url || "https://placehold.co/600x600?text=No+Image"
  );

  const price = displayPrice;
  const variantId = product.variants.edges[0]?.node.id;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <main className="container" style={{ padding: "40px 20px", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
          {/* Images */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #eee", background: "#fff", display: "flex", justifyContent: "center", alignItems: "center", maxHeight: "500px" }}>
              <img
                src={mainImage}
                alt={product.title}
                style={{ maxWidth: "100%", maxHeight: "500px", width: "auto", height: "auto", objectFit: "contain", display: "block" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "10px" }}>
              {product.images.edges.map((edge: any, i: number) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: mainImage === edge.node.url ? "2px solid var(--color-primary)" : "1px solid #eee",
                    cursor: "pointer",
                    opacity: mainImage === edge.node.url ? 1 : 0.7,
                    aspectRatio: "1/1"
                  }}
                  onClick={() => setMainImage(edge.node.url)}
                >
                  <img
                    src={edge.node.url}
                    alt={`Product thumbnail ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "10px" }}>{product.title}</h1>
            <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--color-primary)", marginBottom: "20px" }}>
              {price}
            </div>

            <div style={{ marginBottom: "30px", lineHeight: "1.6", color: "#444" }} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "400px" }}>
              <Form method="post">
                <input type="hidden" name="variantId" value={variantId} />
                <button
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ padding: "15px", fontSize: "1.1rem", width: "100%", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Processing..." : t("add_to_cart", { defaultValue: "Buy Now" })}
                </button>
              </Form>
            </div>

            <div style={{ marginTop: "30px", fontSize: "0.9rem", color: "#666" }}>
              <p>Free shipping on orders over ¥20,000</p>
              <p>100% Authentic Guarantee</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
