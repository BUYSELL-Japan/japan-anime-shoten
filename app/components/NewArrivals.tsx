import { useRef } from 'react';
import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";
import { useTranslation } from "react-i18next";

interface NewArrivalsProps {
    products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    <a href="#" className="text-red" style={{ fontWeight: "700", fontSize: "0.9rem" }}>{t("view_details", { defaultValue: "View All New Items" })} &rarr;</a>
                </div>

                <div className="grid-products">
                    {products.map((product, idx) => (
                        <ProductCard key={product.id} product={product} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
}
