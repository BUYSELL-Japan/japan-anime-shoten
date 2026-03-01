import { useState, useEffect } from "react";
import { useParams } from "@remix-run/react";
import { SALE_CONFIG, isSaleActive } from "~/utils/saleConfig";

export default function SalePopup() {
    const { lang } = useParams();
    const locale = lang || "en";
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!isSaleActive()) return;
        // Only show once per session
        if (sessionStorage.getItem("sale_popup_shown")) return;

        const timer = setTimeout(() => {
            setShow(true);
            sessionStorage.setItem("sale_popup_shown", "1");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    const title = SALE_CONFIG.title[locale] || SALE_CONFIG.title.en;
    const subtitle = SALE_CONFIG.subtitle[locale] || SALE_CONFIG.subtitle.en;

    const shopNow: Record<string, string> = {
        en: "Shop Now →",
        ja: "今すぐ購入 →",
        ko: "지금 쇼핑 →",
        th: "ซื้อเลย →",
        "zh-CN": "立即选购 →",
        "zh-TW": "立即選購 →",
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "fadeIn 0.3s ease",
                padding: "20px",
            }}
            onClick={() => setShow(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    borderRadius: "16px",
                    padding: "40px 32px",
                    maxWidth: "400px",
                    width: "100%",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    border: "2px solid rgba(230,57,70,0.5)",
                    animation: "slideUp 0.4s ease",
                }}
            >
                {/* Close button */}
                <button
                    onClick={() => setShow(false)}
                    style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "rgba(255,255,255,0.1)",
                        border: "none",
                        color: "#fff",
                        fontSize: "20px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ×
                </button>

                {/* Decorative stars */}
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✨</div>

                {/* Title */}
                <h2 style={{
                    color: "#e63946",
                    fontSize: "clamp(1.5rem, 5vw, 2rem)",
                    fontWeight: "900",
                    marginBottom: "8px",
                    textShadow: "0 0 20px rgba(230,57,70,0.3)",
                    letterSpacing: "2px",
                }}>
                    {title}
                </h2>

                {/* Discount badge */}
                <div style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                    color: "white",
                    fontSize: "clamp(2rem, 8vw, 3rem)",
                    fontWeight: "900",
                    padding: "12px 32px",
                    borderRadius: "12px",
                    margin: "16px 0",
                    boxShadow: "0 4px 20px rgba(230,57,70,0.4)",
                    animation: "salePulse 2s ease-in-out infinite",
                }}>
                    {SALE_CONFIG.discountPercent}% OFF
                </div>

                {/* Subtitle */}
                <p style={{
                    color: "#ddd",
                    fontSize: "1rem",
                    marginBottom: "24px",
                }}>
                    {subtitle}
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => setShow(false)}
                    style={{
                        background: "linear-gradient(135deg, #e63946, #ff6b6b)",
                        color: "white",
                        border: "none",
                        padding: "14px 40px",
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        borderRadius: "30px",
                        cursor: "pointer",
                        width: "100%",
                        maxWidth: "280px",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 4px 15px rgba(230,57,70,0.4)",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                    {shopNow[locale] || shopNow.en}
                </button>
            </div>
        </div>
    );
}
