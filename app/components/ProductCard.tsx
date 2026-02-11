import { Link, useParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

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

    return (
        <motion.div
            className="product-card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative"
            }}
            whileHover={{ y: -5 }}
        >
            <Link to={`/${currentLang}/products/${product.handle || '#'}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div className="product-image-container" style={{ position: "relative", overflow: "hidden", background: "#f9f9f9", aspectRatio: "1/1" }}>
                    <img
                        src={product.image}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                    />
                </div>
                <div style={{ padding: "15px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px", height: "40px", overflow: "hidden", lineHeight: "1.4" }}>{product.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--color-primary)" }}>
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
        </motion.div>
    );
}
