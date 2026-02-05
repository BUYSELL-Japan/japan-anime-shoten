import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

const NEW_ARRIVALS: Product[] = [
    { id: "new-1", title: "Scale Figure: Miku Hatsune 15th Anniversary", price: "¥22,000", image: "https://placehold.co/400x500/f5f5f5/333?text=Miku+15th", rating: 5 },
    { id: "new-2", title: "One Piece TCG: OP-06 Wings of Captain", price: "¥7,500", image: "https://placehold.co/400x500/f5f5f5/333?text=OP-06", rating: 5 },
    { id: "new-3", title: "Nendoroid: Spy x Family Anya Forger", price: "¥6,500", image: "https://placehold.co/400x500/f5f5f5/333?text=Anya", rating: 5 },
    { id: "new-4", title: "Gundam MGEX 1/100 Strike Freedom", price: "¥15,400", image: "https://placehold.co/400x500/f5f5f5/333?text=MGEX+SF", rating: 5 },
    { id: "new-5", title: "Final Fantasy VII Rebirth: Cloud Strife", price: "¥18,800", image: "https://placehold.co/400x500/f5f5f5/333?text=Cloud", rating: 4 },
];

export default function NewArrivals() {
    return (
        <section style={{ background: "#f9f9f9", padding: "var(--spacing-2xl) 0" }}>
            <div className="container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-lg)" }}>
                    <h2 className="title-main" style={{ marginBottom: 0 }}>
                        <span style={{ borderBottom: "3px solid var(--color-primary)" }}>New Arrivals</span>
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
                    {NEW_ARRIVALS.map((product, idx) => (
                        <div key={product.id} style={{ minWidth: "280px", scrollSnapAlign: "start" }}>
                            <ProductCard product={product} index={idx} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
