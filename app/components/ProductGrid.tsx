import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

// Mock Data
const MOCK_PRODUCTS: Product[] = [
    { id: "1", title: "Bandai Spirits S.H.Figuarts Naruto Uzumaki", price: "¥6,050", image: "https://placehold.co/400x400/f5f5f5/333?text=Naruto", rating: 5 },
    { id: "2", title: "Pokemon TCG: Scarlet & Violet Booster Box", price: "¥5,400", image: "https://placehold.co/400x400/f5f5f5/333?text=Pokemon+Cards", rating: 5 },
    { id: "3", title: "Demon Slayer: Kimetsu no Yaiba Figure Vol. 15", price: "¥2,200", image: "https://placehold.co/400x400/f5f5f5/333?text=Demon+Slayer", rating: 4 },
    { id: "4", title: "One Piece DXF The Grandline Men Wano Country", price: "¥2,500", image: "https://placehold.co/400x400/f5f5f5/333?text=One+Piece", rating: 5 },
    { id: "5", title: "Nintendo Switch OLED Model - White", price: "¥37,980", image: "https://placehold.co/400x400/f5f5f5/333?text=Switch+OLED", rating: 5 },
    { id: "6", title: "Hatsune Miku Wonderland Figure Rapunzel", price: "¥2,800", image: "https://placehold.co/400x400/f5f5f5/333?text=Miku", rating: 4 },
    { id: "7", title: "Jujutsu Kaisen Satoru Gojo Noodle Stopper", price: "¥1,800", image: "https://placehold.co/400x400/f5f5f5/333?text=Gojo", rating: 5 },
    { id: "8", title: "Gundam HG 1/144 Aerial Rebuild", price: "¥1,760", image: "https://placehold.co/400x400/f5f5f5/333?text=Gundam", rating: 5 },
];

export default function ProductGrid() {
    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-lg)" }}>
                <h2 className="title-main" style={{ marginBottom: 0 }}>Featured Products</h2>
                <a href="#" style={{ fontWeight: "600", color: "var(--color-primary)", fontSize: "0.9rem" }}>View All Products &rarr;</a>
            </div>
            <div className="grid-products">
                {MOCK_PRODUCTS.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                ))}
            </div>
        </section>
    );
}
