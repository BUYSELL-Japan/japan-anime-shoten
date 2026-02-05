export interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    rating: number;
}

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid #333",
            transition: "transform 0.3s ease",
        }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 0 15px var(--neon-purple)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
        >
            <div style={{ height: "250px", overflow: "hidden" }}>
                <img
                    src={product.image}
                    alt={product.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
            </div>
            <div style={{ padding: "var(--spacing-md)" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", height: "3rem", overflow: "hidden" }}>{product.title}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span className="neon-text-cyan" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{product.price}</span>
                    <div style={{ color: "var(--neon-yellow)" }}>
                        {"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}
                    </div>
                </div>
                <button className="btn-secondary" style={{ width: "100%" }}>Add to Cart</button>
            </div>
        </div>
    );
}
