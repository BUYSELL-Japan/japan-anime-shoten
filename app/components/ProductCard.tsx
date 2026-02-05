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
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            border: "1px solid #333",
            transition: "all 0.4s ease",
            position: "relative"
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
                e.currentTarget.style.borderColor = "var(--color-gold)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#333";
            }}
        >
            <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
                <img
                    src={product.image}
                    alt={product.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "var(--color-crimson)",
                    color: "white",
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    border: "1px solid var(--color-gold)"
                }}>
                    NEW
                </div>
            </div>
            <div style={{ padding: "var(--spacing-lg)", textAlign: "center" }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.5rem",
                    height: "3rem",
                    overflow: "hidden",
                    fontFamily: "'Cinzel', serif"
                }}>
                    {product.title}
                </h3>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "1rem",
                    gap: "1rem"
                }}>
                    <span className="text-gold" style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{product.price}</span>
                    <div style={{ color: "var(--color-gold)", fontSize: "0.9rem" }}>
                        {"★".repeat(product.rating)}{"☆".repeat(5 - product.rating)}
                    </div>
                </div>
                <button className="btn-secondary" style={{ width: "100%" }}>Add to Cart</button>
            </div>
        </div>
    );
}
