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
}

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { t } = useTranslation();
    const { lang } = useParams();
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
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                    />
                </div>
                <div style={{ padding: "15px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px", height: "40px", overflow: "hidden", lineHeight: "1.4" }}>{product.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {/* Suppress hydration warning for price as it might differ between server (formatted) and client */}
                        <span suppressHydrationWarning style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-primary)" }}>
                            {product.price}
                        </span>
                        <div style={{ color: "#f5a623", fontSize: "0.9rem" }}>★ {product.rating}</div>
                    </div>
                </div>
            </Link>
            <div style={{ padding: "0 15px 15px" }}>
                <button className="btn-primary" style={{ width: "100%", padding: "8px", fontSize: "0.9rem" }}>
                    {t("add_to_cart", { defaultValue: "Add to Cart" })}
                </button>
            </div>
        </div>
    );
}
