import { useRef } from 'react';
// import { motion, useScroll, useTransform } from 'framer-motion'; // Removed for hydration stability
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";

interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    rating: number; // Added missing property
}

interface NewArrivalsProps {
    products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);
    // const { scrollXProgress } = useScroll({ container: scrollRef }); // Removed

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section style={{ background: "#f9f9f9", padding: "var(--spacing-2xl) 0" }}>
            <div className="container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-lg)" }}>
                    <h2 className="title-main" style={{ marginBottom: 0 }}>
                        <span style={{ borderBottom: "3px solid var(--color-primary)" }}>{t("new_arrivals")}</span>
                    </h2>
                    <a href="#" className="text-red" style={{ fontWeight: "700", fontSize: "0.9rem" }}>View All New Items &rarr;</a>
                </div>

                {/* Horizontal Scroll Layout for New Arrivals */}
                <div style={{
                    display: "flex",
                    gap: "20px",
                    overflowX: "auto",
                    paddingBottom: "20px",
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch"
                }}>
                    {products.map((product, idx) => (
                        <div key={product.id} style={{ minWidth: "280px", scrollSnapAlign: "start" }}>
                            <ProductCard product={product} index={idx} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
