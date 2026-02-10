import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    rating?: number;
}

interface ProductCardProps {
    product: Product;
    index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            className="product-card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
                background: "#fff",
                cursor: "pointer",
                position: "relative"
            }}
        >
            <div className="product-image-container" style={{ position: "relative", overflow: "hidden", borderRadius: "8px", background: "#f0f0f0", aspectRatio: "1/1" }}>
                <img
                    src={product.image}
                    alt={product.title}
                    className="product-image transition-transform duration-500 group-hover:scale-105"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                />
                <div className="product-overlay absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="add-to-cart-btn bg-white text-black px-4 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        {t("add_to_cart")}
                    </button>
                </div>
            </div>
            <div className="product-info mt-3">
                <h3 className="product-title font-medium text-lg leading-tight line-clamp-2">{product.title}</h3>
                <p className="product-price text-primary font-bold mt-1 text-xl">{t("price_yen", { price: product.price })}</p>
            </div>
        </motion.div>
    );
}
