import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";
import { useTranslation } from "react-i18next";

export default function ProductGrid({ products }: { products: Product[] }) {
    const { t } = useTranslation();

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-lg)" }}>
                <h2 className="title-main" style={{ marginBottom: 0 }}>{t('featured_products')}</h2>
                <a href="#" style={{ fontWeight: "600", color: "var(--color-primary)", fontSize: "0.9rem" }}>{t('view_all_products')} &rarr;</a>
            </div>
            <div className="grid-products">
                {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                ))}
            </div>
        </section>
    );
}
