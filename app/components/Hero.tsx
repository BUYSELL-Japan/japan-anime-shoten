import { useState, useEffect } from "react";

const slides = [
    {
        image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&q=80&w=2000", // Clean minimal anime/figure vibe
        title: "New Arrivals",
        subtitle: "Check out the latest authentic figures from Japan.",
        cta: "Shop Now"
    },
    {
        image: "https://images.unsplash.com/photo-1607604276583-eef5f0b7ac1d?auto=format&fit=crop&q=80&w=2000", // Collecting vibe
        title: "Best Sellers",
        subtitle: "The most popular items this month.",
        cta: "View Top 10"
    }
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section style={{ position: "relative", height: "500px", overflow: "hidden", background: "#f4f4f4" }}>
            {slides.map((slide, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: index === current ? 1 : 0,
                        transition: "opacity 0.8s ease-in-out",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {/* Background Image with slight overlay for text readability if needed, but keeping it clean */}
                    <div style={{ position: "absolute", inset: 0 }}>
                        <img src={slide.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)" }}></div>
                    </div>

                    <div className="container" style={{ position: "relative", zIndex: 10, width: "100%", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                        <div style={{ maxWidth: "500px" }}>
                            <h2 style={{ fontSize: "3.5rem", fontWeight: "700", marginBottom: "1rem", lineHeight: 1.1 }}>
                                {slide.title}
                            </h2>
                            <p style={{ fontSize: "1.2rem", marginBottom: "2rem", fontWeight: "500" }}>
                                {slide.subtitle}
                            </p>
                            <button className="btn-primary" style={{ border: "2px solid white", background: "transparent" }}>
                                {slide.cta}
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots */}
            <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", zIndex: 20 }}>
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: idx === current ? "#fff" : "rgba(255,255,255,0.5)",
                            border: "none",
                            cursor: "pointer"
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
