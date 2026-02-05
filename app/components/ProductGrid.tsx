import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

// Mock Data
const MOCK_PRODUCTS: Product[] = [
    { id: "1", title: "Scale Figure: Cyber Ninja", price: "¥18,000", image: "https://placehold.co/400x400/111/d4af37?text=Figure+1", rating: 5 },
    { id: "2", title: "Limited Edition Keychain", price: "¥1,200", image: "https://placehold.co/400x400/111/d4af37?text=Item+2", rating: 4 },
    { id: "3", title: "Anime Poster Set A", price: "¥3,500", image: "https://placehold.co/400x400/111/d4af37?text=Item+3", rating: 5 },
    { id: "4", title: "Plushie Mascot", price: "¥4,000", image: "https://placehold.co/400x400/111/d4af37?text=Item+4", rating: 4 },
];

export default function ProductGrid() {
    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) var(--spacing-md)" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
                <h2 className="title-serif text-gold" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    Curated Collection
                </h2>
                <div style={{ width: "60px", height: "3px", background: "var(--color-crimson)", margin: "0 auto" }}></div>
            </div>
            <div className="grid-products">
                {MOCK_PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
