import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigation, Link } from "@remix-run/react";
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

  // Parse cookies
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader?.split(';').reduce((acc: Record<string, string>, cookie: string) => {
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
    "EUR": "DE",
    "GBP": "GB",
    "CAD": "CA",
    "JPY": "JP"
  };

  // Priority: Cookie > Cloudflare location > Default
  let detectedCountry = "JP";
  let detectedCurrency = "JPY";

  if (preferredCurrency && currencyToCountry[preferredCurrency]) {
    detectedCountry = currencyToCountry[preferredCurrency];
    detectedCurrency = preferredCurrency;
    console.log(`[ProductDetail] Using preferred currency from cookie: ${preferredCurrency} (${detectedCountry})`);
  } else {
    const cf = (request as any).cf;
    detectedCountry = cf?.country || "JP";
    detectedCurrency = countryToCurrency[detectedCountry] || "JPY";
    console.log(`[ProductDetail] Cloudflare detected country: ${detectedCountry}, Currency: ${detectedCurrency}`);
  }

  const QUERY = `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        descriptionHtml
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

  // Related products query
  const RECOMMENDATIONS_QUERY = `
    query productRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
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
        images(first: 1) {
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

  try {
    const { product } = await shopifyFetch({
      query: QUERY,
      variables,
      context,
      language: locale,
      country: detectedCountry
    });

    if (!product) {
      throw new Response("Not Found", { status: 404 });
    }

    // Fetch recommendations
    let recommendations: any[] = [];
    try {
      const recData = await shopifyFetch({
        query: RECOMMENDATIONS_QUERY,
        variables: { productId: product.id },
        context,
        language: locale,
        country: detectedCountry
      });
      recommendations = (recData.productRecommendations || []).slice(0, 8);
    } catch (e) {
      console.error("Failed to fetch recommendations:", e);
    }

    const currencyCode = product.priceRange.minVariantPrice.currencyCode;
    const amount = parseFloat(product.priceRange.minVariantPrice.amount);

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

    const currencySymbol = currencySymbols[currencyCode] || currencyCode;

    const formattedPrice = ['JPY', 'KRW', 'TWD', 'THB', 'CNY'].includes(currencyCode)
      ? amount.toLocaleString('ja-JP', { maximumFractionDigits: 0 })
      : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const inventoryQuantity = product.variants.edges[0]?.node?.quantityAvailable;

    // Format recommendation prices
    const formattedRecommendations = recommendations.map((rec: any) => {
      const recAmount = parseFloat(rec.priceRange.minVariantPrice.amount);
      const recCurrency = rec.priceRange.minVariantPrice.currencyCode;
      const recSymbol = currencySymbols[recCurrency] || recCurrency;
      const recFormatted = ['JPY', 'KRW', 'TWD', 'THB', 'CNY'].includes(recCurrency)
        ? recAmount.toLocaleString('ja-JP', { maximumFractionDigits: 0 })
        : recAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return { ...rec, formattedPrice: `${recSymbol}${recFormatted}` };
    });

    return json({
      product: { ...product, formattedPrice: `${currencySymbol}${formattedPrice}`, currencyCode, inventoryQuantity, rawPrice: amount, currencySymbol, handle },
      recommendations: formattedRecommendations,
      locale,
      detectedCountry,
      detectedCurrency
    });
  } catch (error) {
    console.error("Product Loader Error:", error);
    throw new Response("Not Found", { status: 404 });
  }
}

import { useState, useEffect } from "react";
import { useCart } from "~/context/CartContext";
import MakeOfferModal from "~/components/MakeOfferModal";
import { isSaleActive, getSalePrice, SALE_CONFIG } from "~/utils/saleConfig";

export default function ProductDetail() {
  const { product, detectedCurrency, locale, recommendations } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { addToCart, isLoading } = useCart();
  const isSubmitting = navigation.state === "submitting";
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [saleActive, setSaleActive] = useState(false);

  useEffect(() => {
    setSaleActive(isSaleActive());
  }, []);

  // State for the currently selected main image
  // Default to the first image or a placeholder
  const [mainImage, setMainImage] = useState(
    product.images.edges[0]?.node.url || "https://placehold.co/600x600?text=No+Image"
  );

  // Lightbox States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const price = product.formattedPrice;
  const variantId = product.variants.edges[0]?.node.id;
  const isAvailable = product.availableForSale !== false;
  const isOnlyOneLeft = product.inventoryQuantity === 1;

  const images = product.images.edges;

  // Keydown listener for lightbox navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, lightboxIndex, images.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header currentCurrency={detectedCurrency} />

      <main className="container" style={{ padding: "40px 20px", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
          {/* Images */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #eee",
                background: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "600px",
                width: "100%",
                cursor: "zoom-in",
                position: "relative"
              }}
              onClick={() => {
                const currentIndex = images.findIndex((edge: any) => edge.node.url === mainImage);
                openLightbox(currentIndex >= 0 ? currentIndex : 0);
              }}
            >
              <img
                src={mainImage}
                alt={product.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  opacity: isAvailable ? 1 : 0.5,
                  transition: "opacity 0.3s"
                }}
              />
              {!isAvailable && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  padding: "16px 32px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  letterSpacing: "2px",
                  zIndex: 2,
                  textTransform: "uppercase"
                }}>
                  Sold Out
                </div>
              )}
              {/* Zoom hint icon */}
              <div style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                pointerEvents: "none"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "10px" }}>
              {images.map((edge: any, i: number) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: mainImage === edge.node.url ? "2px solid var(--color-primary)" : "1px solid #eee",
                    cursor: "pointer",
                    opacity: mainImage === edge.node.url ? 1 : 0.4,
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
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
              {saleActive && isAvailable ? (
                <>
                  <div style={{ fontSize: "1.1rem", color: "#999", textDecoration: "line-through" }}>
                    {price}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#e63946" }}>
                    {product.currencySymbol}{getSalePrice(product.rawPrice).toLocaleString()}
                  </div>
                  <span style={{
                    background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontWeight: "800",
                    animation: "salePulse 2s ease-in-out infinite",
                  }}>
                    {SALE_CONFIG.discountPercent}% OFF
                  </span>
                </>
              ) : (
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: isAvailable ? "var(--color-primary)" : "#999" }}>
                  {price}
                </div>
              )}
              {!isAvailable && (
                <span style={{
                  background: "#666",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }}>
                  Sold Out
                </span>
              )}
            </div>

            {isOnlyOneLeft && isAvailable && (
              <div style={{
                color: "white",
                backgroundColor: "#e53e3e", // Red background
                padding: "8px 16px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                marginBottom: "20px",
                boxShadow: "0 2px 4px rgba(229, 62, 62, 0.3)"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Only 1 left!
              </div>
            )}

            <div style={{ marginBottom: "30px", lineHeight: "1.6", color: "#444" }} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "400px" }}>
              <button
                className={isAvailable ? "btn-primary" : ""}
                disabled={isSubmitting || isLoading || !isAvailable}
                onClick={() => {
                  if (isAvailable && variantId) addToCart(variantId);
                }}
                style={{
                  padding: "15px",
                  fontSize: "1.1rem",
                  width: "100%",
                  opacity: (isSubmitting || isLoading || !isAvailable) ? 0.7 : 1,
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  backgroundColor: isAvailable ? "" : "#ccc",
                  color: isAvailable ? "" : "#666",
                  border: isAvailable ? "" : "none",
                  fontWeight: "600"
                }}
              >
                {isLoading ? "Processing..." : (!isAvailable ? "Sold Out" : t("add_to_cart", { defaultValue: "Buy Now" }))}
              </button>
            </div>

            {/* Make an Offer */}
            {isAvailable && (
              <div style={{ marginTop: "15px", maxWidth: "400px" }}>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  style={{
                    padding: "14px",
                    fontSize: "1.05rem",
                    width: "100%",
                    background: "transparent",
                    color: "var(--color-primary, #e63946)",
                    border: "2px solid var(--color-primary, #e63946)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--color-primary, #e63946)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-primary, #e63946)";
                  }}
                >
                  {t("make_offer", { defaultValue: "Make an Offer" })}
                </button>
              </div>
            )}

            <MakeOfferModal
              isOpen={isOfferModalOpen}
              onClose={() => setIsOfferModalOpen(false)}
              productId={product.id.replace('gid://shopify/Product/', '')}
              productTitle={product.title}
              productHandle={product.handle || ''}
              originalPrice={product.rawPrice}
              currency={product.currencyCode}
              currencySymbol={product.currencySymbol}
              lang={locale}
            />

            <div style={{ marginTop: "30px", fontSize: "0.9rem", color: "#666" }}>
              <p>{t("text_free_shipping")}</p>
              <p>{t("text_auth_guarantee")}</p>
            </div>
          </div>
        </div>
        {/* Related Products */}
        {recommendations && recommendations.length > 0 && (
          <section style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "24px" }}>
              {t("related_products", { defaultValue: "You May Also Like" })}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "16px",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {(recommendations as any[]).map((rec: any) => (
                <a
                  key={rec.id}
                  href={`/${locale}/products/${rec.handle}`}
                  style={{
                    flexShrink: 0,
                    width: "160px",
                    textDecoration: "none",
                    color: "inherit",
                    scrollSnapAlign: "start",
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#f5f5f5",
                      marginBottom: "8px",
                    }}
                  >
                    <img
                      src={rec.images?.edges?.[0]?.node?.url || "/placeholder.png"}
                      alt={rec.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      lineHeight: "1.3",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {rec.title}
                  </p>
                  <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-primary, #e63946)" }}>
                    {rec.formattedPrice}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {isLightboxOpen && images.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={closeLightbox}
        >
          <div
            style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks on image area from closing modal
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >
              &times;
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  fontSize: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10000,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                &#10094;
              </button>
            )}

            {/* Main Image */}
            <img
              src={images[lightboxIndex]?.node.url || mainImage}
              alt={images[lightboxIndex]?.node.altText || product.title}
              style={{
                width: "90vw",
                height: "90vh",
                objectFit: "contain",
                userSelect: "none"
              }}
            />

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  fontSize: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10000,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              >
                &#10095;
              </button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div style={{
                position: "absolute",
                bottom: "20px",
                color: "#fff",
                background: "rgba(0,0,0,0.5)",
                padding: "5px 15px",
                borderRadius: "20px",
                fontSize: "14px",
                letterSpacing: "1px"
              }}>
                {lightboxIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
