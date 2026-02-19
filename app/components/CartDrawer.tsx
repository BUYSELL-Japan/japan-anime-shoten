import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useCart } from "~/context/CartContext";
import { useEffect } from "react";

export default function CartDrawer() {
    const { cart, isOpen, closeCart, removeFromCart, updateLine, isLoading } = useCart();
    const { t } = useTranslation();

    // Prevent scrolling when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
            {/* Backdrop */}
            <div
                style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div style={{
                position: "relative",
                width: "100%",
                maxWidth: "400px",
                background: "#fff",
                height: "100%",
                boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                animation: "slideIn 0.3s ease-out"
            }}>
                <style>{`
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>

                {/* Header */}
                <div style={{ padding: "20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>Shopping Cart ({cart?.totalQuantity || 0})</h2>
                    <button onClick={closeCart} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", padding: "0 10px" }}>×</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                    {!cart || cart.lines.edges.length === 0 ? (
                        <div style={{ textAlign: "center", marginTop: "40px", color: "#666" }}>
                            <p>Your cart is empty.</p>
                            <button onClick={closeCart} className="btn-primary" style={{ marginTop: "20px" }}>Continue Shopping</button>
                        </div>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
                            {cart.lines.edges.map(({ node: line }) => (
                                <li key={line.id} style={{ display: "flex", gap: "15px" }}>
                                    <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
                                        {line.merchandise.image && (
                                            <img
                                                src={line.merchandise.image.url}
                                                alt={line.merchandise.image.altText || line.merchandise.title}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0 0 4px" }}>{line.merchandise.product.title}</h3>
                                            <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>{line.merchandise.title !== "Default Title" ? line.merchandise.title : ""}</p>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px" }}>
                                                <button
                                                    onClick={() => updateLine(line.id, line.quantity - 1)}
                                                    disabled={isLoading || line.quantity <= 1}
                                                    style={{ border: "none", background: "none", padding: "4px 8px", cursor: "pointer" }}
                                                >
                                                    -
                                                </button>
                                                <span style={{ padding: "0 8px", fontSize: "0.9rem" }}>{line.quantity}</span>
                                                <button
                                                    onClick={() => updateLine(line.id, line.quantity + 1)}
                                                    disabled={isLoading}
                                                    style={{ border: "none", background: "none", padding: "4px 8px", cursor: "pointer" }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(line.id)}
                                                style={{ border: "none", background: "none", color: "#999", fontSize: "0.8rem", textDecoration: "underline", cursor: "pointer" }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                                        {/* Ideally format this based on currency code */}
                                        {line.merchandise.price.currencyCode === 'JPY' ? '¥' : '$'}
                                        {Number(line.merchandise.price.amount).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {cart && cart.lines.edges.length > 0 && (
                    <div style={{ padding: "20px", borderTop: "1px solid #eee", background: "#f9f9f9" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", fontWeight: "700", fontSize: "1.1rem" }}>
                            <span>Total</span>
                            <span>
                                {cart.estimatedCost.totalAmount.currencyCode === 'JPY' ? '¥' : '$'}
                                {Number(cart.estimatedCost.totalAmount.amount).toLocaleString()}
                            </span>
                        </div>
                        <a
                            href={cart.checkoutUrl}
                            className="btn-primary"
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "15px",
                                textAlign: "center",
                                textDecoration: "none",
                                opacity: isLoading ? 0.7 : 1,
                                pointerEvents: isLoading ? "none" : "auto"
                            }}
                        >
                            {isLoading ? "Updating..." : "Checkout"}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
