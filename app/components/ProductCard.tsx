import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { isSaleActive, getSalePrice, SALE_CONFIG } from "~/utils/saleConfig";

export interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    rating: number;
    handle?: string;
    variantId?: string;
    availableForSale?: boolean;
    inventoryQuantity?: number;
}

interface ProductCardProps {
    product: Product;
    index?: number;
}

import { useCart } from "~/context/CartContext";

import { getShopifyImageUrl } from "~/utils/image";

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { t } = useTranslation();
    const { lang } = useParams();
    const { addToCart, isLoading } = useCart();
    const currentLang = lang || "en";

    // Scroll Animation Logic
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Run once
                }
            },
            {
                threshold: 0.1, // Trigger when 10% visible
                rootMargin: "50px" // Trigger slightly before it enters content area
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product page
        if (!product.availableForSale) return; // Guard clause
        if (product.variantId) {
            addToCart(product.variantId);
            // Optionally open cart here if not handled by context
        } else {
            // Fallback to navigation if no variant ID (shouldn't happen with updated query)
            // Navigate handled by parent Link if we bubble but we preventDefault.
            // Manually navigate?
            // Actually, if we prevent default, the Link won't trigger.
            // If no variant ID, maybe we SHOULD let it bubble?
        }
    };

    const isAvailable = product.availableForSale !== false;
    const isOnlyOneLeft = product.inventoryQuantity === 1;
    const [saleActive, setSaleActive] = useState(false);

    useEffect(() => {
        setSaleActive(isSaleActive());
    }, []);

    // Parse price number from formatted string
    const priceNum = parseFloat(product.price.replace(/[^0-9.]/g, ''));
    const salePrice = getSalePrice(priceNum);
    const currencyPrefix = product.price.replace(/[0-9.,\s]/g, '');

    return (
        <div
            ref={cardRef}
            className={`product-card ${isVisible ? "animate-entry" : ""}`}
            style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
                opacity: 0, // Start invisible
                animationDelay: isVisible ? `${(index % 4) * 100}ms` : "0ms" // Stagger based on column position approx
            }}
        >
            <Link to={`/${currentLang}/products/${product.handle || '#'}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="product-image-container" style={{ position: "relative", overflow: "hidden", background: "#f9f9f9", aspectRatio: "1/1" }}>
                    {/* Sale Badge */}
                    {saleActive && isAvailable && (
                        <div style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            zIndex: 3,
                            boxShadow: "0 2px 8px rgba(230,57,70,0.4)",
                            animation: "salePulse 2s ease-in-out infinite",
                            letterSpacing: "0.5px",
                        }}>
                            {SALE_CONFIG.discountPercent}% OFF
                        </div>
                    )}
                    <img
                        src={getShopifyImageUrl(product.image, { width: 400, height: 400, crop: 'center' })}
                        alt={product.title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                            opacity: isAvailable ? 1 : 0.5,
                            transition: "opacity 0.3s"
                        }}
                        loading="lazy"
                    />
                    {!isAvailable && (
                        <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            letterSpacing: "1px",
                            zIndex: 2,
                            textTransform: "uppercase"
                        }}>
                            Sold Out
                        </div>
                    )}
                </div>
                <div style={{ padding: "15px", position: "relative" }}>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .product-card-title {
                            font-size: 1rem;
                            font-weight: 600;
                            margin-bottom: 8px;
                            line-height: 1.4;
                            word-break: break-word;
                            overflow-wrap: anywhere;
                            /* Desktop default: 2 lines */
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            height: 2.8em; /* 1.4 * 2 lines */
                            transition: all 0.2s ease;
                            position: relative;
                            z-index: 10;
                            background: #fff;
                        }
                        
                        /* Desktop Hover Expansion */
                        @media (min-width: 769px) {
                            .product-card:hover .product-card-title {
                                -webkit-line-clamp: unset;
                                height: auto;
                                position: absolute;
                                top: 15px; /* Match the padding top */
                                left: 15px;
                                right: 15px;
                                padding-bottom: 8px;
                                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                                z-index: 20;
                            }
                            /* Add a placeholder element to keep layout from jumping when position becomes absolute */
                            .product-card-title-placeholder {
                                height: 2.8em;
                                margin-bottom: 8px;
                                display: none;
                            }
                            .product-card:hover .product-card-title-placeholder {
                                display: block;
                            }
                        }

                        /* Mobile override: 3 lines */
                        @media (max-width: 768px) {
                            .product-card-title {
                                -webkit-line-clamp: 3;
                                height: 4.2em; /* 1.4 * 3 lines */
                            }
                        }
                        `
                    }} />
                    <div className="product-card-title-placeholder"></div>
                    <h3 className="product-card-title" title={product.title}>{product.title}</h3>
                    {isOnlyOneLeft && isAvailable && (
                        <div style={{ color: "red", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Only 1 left!
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            {saleActive && isAvailable ? (
                                <>
                                    <span style={{ fontSize: "0.85rem", color: "#999", textDecoration: "line-through", marginRight: "6px" }}>
                                        {product.price}
                                    </span>
                                    <span suppressHydrationWarning style={{ fontSize: "1.1rem", fontWeight: "700", color: "#e63946" }}>
                                        {currencyPrefix}{salePrice.toLocaleString()}
                                    </span>
                                </>
                            ) : (
                                <span suppressHydrationWarning style={{ fontSize: "1.1rem", fontWeight: "700", color: isAvailable ? "var(--color-primary)" : "#999" }}>
                                    {product.price}
                                </span>
                            )}
                        </div>
                        <div style={{ color: "#f5a623", fontSize: "0.9rem" }}>★ {product.rating}</div>
                    </div>
                </div>
            </Link>
            <div style={{ padding: "0 15px 15px" }}>
                <button
                    className={isAvailable ? "btn-primary" : ""}
                    style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "0.9rem",
                        opacity: isLoading || !isAvailable ? 0.7 : 1,
                        cursor: isAvailable ? "pointer" : "not-allowed",
                        backgroundColor: isAvailable ? "" : "#ccc",
                        color: isAvailable ? "" : "#666",
                        border: isAvailable ? "" : "none",
                        borderRadius: "20px",
                        fontWeight: "600"
                    }}
                    onClick={handleAddToCart}
                    disabled={isLoading || !isAvailable}
                >
                    {!isAvailable ? "Sold Out" : t("add_to_cart", { defaultValue: "Add to Cart" })}
                </button>
            </div>
        </div>
    );
}
