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
    const { handle } = params;
    const env = context.cloudflare.env as any;
    const locale = await i18next.getLocale(request);

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
        const { product } = await shopifyFetch({ query: QUERY, variables, context });

        if (!product) {
            throw new Response("Not Found", { status: 404 });
        }

        // Fetch Translation from D1
        let translation = null;

        // Normalize locale for D1 (e.g., zh-CN -> zh_cn)
        const d1Locale = locale.toLowerCase().replace('-', '_');
        console.log(`[ProductLoader] Fetching translation for ${product.id} in ${d1Locale}`);

        if (env.DB) {
            const stmt = env.DB.prepare(`
                SELECT t.title, t.body_html
                FROM products p
                JOIN product_translations t ON p.id = t.product_id
                WHERE p.shopify_product_id = ? AND t.language_code = ?
            `);
            const result = await stmt.bind(product.id, d1Locale).first();
            if (result) {
                console.log(`[ProductLoader] Translation found: ${result.title}`);
                translation = result;
            } else {
                console.log(`[ProductLoader] No translation found.`);
            }
        }

        return json({
            product: {
                ...product,
                title: translation?.title || product.title,
                descriptionHtml: translation?.body_html || product.descriptionHtml
            },
            locale
        });

    } catch (error) {
        console.error("Product Loader Error:", error);
        throw new Response("Not Found", { status: 404 });
    }
}

export default function ProductDetail() {
    const { product } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const price = parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString();
    const currency = product.priceRange.minVariantPrice.currencyCode;
    const variantId = product.variants.edges[0]?.node.id;

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />

            <main className="container" style={{ padding: "40px 20px", flex: 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
                    {/* Images */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #eee" }}>
                            <img
                                src={product.images.edges[0]?.node.url || "https://placehold.co/600x600?text=No+Image"}
                                alt={product.title}
                                style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                            />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                            {product.images.edges.slice(1).map((edge: any, i: number) => (
                                <img
                                    key={i}
                                    src={edge.node.url}
                                    alt="Product thumbnail"
                                    style={{ width: "100%", borderRadius: "4px", border: "1px solid #eee", cursor: "pointer" }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "10px" }}>{product.title}</h1>
                        <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--color-primary)", marginBottom: "20px" }}>
                            ¥{price} <span style={{ fontSize: "1rem", color: "#666", fontWeight: "400" }}>({currency})</span>
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
