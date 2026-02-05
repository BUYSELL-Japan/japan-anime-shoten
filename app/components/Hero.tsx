import { useState, useEffect } from "react";

const slides = [
    {
        image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=2000", // Tokyo/Japan vibe
        title: "Japan Directly To You",
        subtitle: "Authentic Anime Goods"
    },
    {
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=2000", // Japanese traditional/modern fusion
        title: "New Arrivals",
        subtitle: "Limited Edition Figures"
    }
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section style={{ position: "relative", height: "80vh", minHeight: "600px", overflow: "hidden", borderBottom: "3px solid var(--color-gold)" }}>
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
                        transition: "opacity 1.5s ease-in-out",
                        background: `url(${slide.image}) center/cover no-repeat`,
                    }}
                >
                    {/* Dark Overlay with Gradient */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(15,15,16,0.9) 100%)"
                    }} />

                    <div className="container" style={{
                        position: "relative",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10,
                        textAlign: "center"
                    }}>
                        <div style={{
                            border: "1px solid var(--color-gold)",
                            padding: "var(--spacing-xl)",
                            background: "rgba(15, 15, 16, 0.7)",
                            backdropFilter: "blur(5px)",
                            maxWidth: "800px"
                        }}>
                            <h1 className="title-serif text-gold" style={{
                                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                                marginBottom: "var(--spacing-md)",
                                textShadow: "0 2px 10px rgba(0,0,0,0.8)"
                            }}>
                                {slide.title}
                            </h1>
                            <p style={{
                                fontSize: "1.5rem",
                                marginBottom: "var(--spacing-xl)",
                                fontFamily: "'Noto Serif JP', serif",
                                letterSpacing: "0.2em"
                            }}>
                                {slide.subtitle}
                            </p>
                            <button className="btn-primary">
                                View Collection
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
