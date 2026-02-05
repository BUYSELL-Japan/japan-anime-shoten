import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

// Mock Data
const MOCK_PRODUCTS: Product[] = [
    { id: "1", title: "Scale Figure: Cyber Ninja", price: "¥18,000", image: "https://placehold.co/400x400/222/c0c?text=Figure+1", rating: 5 },
    { id: "2", title: "Limited Edition Keychain", price: "¥1,200", image: "https://placehold.co/400x400/222/0cc?text=Item+2", rating: 4 },
    { id: "3", title: "Anime Poster Set A", price: "¥3,500", image: "https://placehold.co/400x400/222/f0f?text=Item+3", rating: 5 },
    { id: "4", title: "Plushie Mascot", price: "¥4,000", image: "https://placehold.co/400x400/222/ff0?text=Item+4", rating: 4 },
];

export default function ProductGrid() {
    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) var(--spacing-md)" }}>
            <h2 className="neon-text-pink" style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-xl)", textAlign: "center", textTransform: "uppercase", letterSpacing: "2px" }}>
                Featured Collection
            </h2>
            <div className="grid-products">
                {MOCK_PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
