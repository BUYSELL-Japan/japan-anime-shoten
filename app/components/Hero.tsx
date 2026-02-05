import { useState, useEffect } from "react";

const slides = [
    {
        image: "https://placehold.co/1920x600/ff00ff/ffffff?text=Direct+From+Akihabara",
        title: "Japan Directly To You",
        subtitle: "Authentic Anime Goods"
    },
    {
        image: "https://placehold.co/1920x600/00ffff/000000?text=New+Figures+Arrival",
        title: "New Arrivals",
        subtitle: "Limited Edition Figures"
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
        <section style={{ position: "relative", height: "600px", overflow: "hidden" }}>
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
                        transition: "opacity 1s ease-in-out",
                        background: `url(${slide.image}) center/cover no-repeat`,
                    }}
                >
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg-dark))"
                    }} />
                    <div className="container" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 10 }}>
                        <h1 className="neon-text-pink" style={{ fontSize: "4rem", marginBottom: "1rem" }}>{slide.title}</h1>
                        <p className="neon-text-cyan" style={{ fontSize: "2rem", marginBottom: "2rem" }}>{slide.subtitle}</p>
                        <button className="btn-primary animate-pulse">Shop Now</button>
                    </div>
                </div>
            ))}
        </section>
    );
}
