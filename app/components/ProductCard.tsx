export interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    rating: number;
}

export default function ProductCard({ product, index = 0 }: { product: Product, index?: number }) {
    return (
        <div style={{
            background: "#fff",
            cursor: "pointer",
            animationDelay: `${index * 0.1}s` /* Stagger delay */
        }}
            className="group hover-lift animate-entry"
        >
            <div style={{ position: "relative", paddingBottom: "100%", overflow: "hidden", marginBottom: "12px", borderRadius: "var(--radius-md)", background: "#f0f0f0" }}>
                <img
                    src={product.image}
                    alt={product.title}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
                {/* Visual cue on hover could be added here */}
            </div>

            <div>
                <h3 style={{
                    fontSize: "1rem",
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: "var(--color-text)",
                    lineHeight: "1.4",
                    height: "2.8em",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                }}>
                    {product.title}
                </h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: "700", fontSize: "1.1rem" }}>{product.price}</span>
                    <span style={{ fontSize: "0.8rem", color: "#fbbf24" }}>{"★".repeat(product.rating)}</span>
                </div>
            </div>
        </div>
    );
}
