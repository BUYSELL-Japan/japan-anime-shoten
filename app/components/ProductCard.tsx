import { Link, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

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

    const isAvailable = product.availableForSale !== false; // Default to true if undefined
    const isOnlyOneLeft = product.inventoryQuantity === 1;

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
                    <img
                        src={product.image}
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
                <div style={{ padding: "15px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px", height: "40px", overflow: "hidden", lineHeight: "1.4" }}>{product.title}</h3>
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
                        {/* Suppress hydration warning for price as it might differ between server (formatted) and client */}
                        <span suppressHydrationWarning style={{ fontSize: "1.1rem", fontWeight: "700", color: isAvailable ? "var(--color-primary)" : "#999" }}>
                            {product.price}
                        </span>
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
