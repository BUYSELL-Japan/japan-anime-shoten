// import { motion } from "framer-motion"; // Removed for hydration stability
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function Hero() {
    const { t } = useTranslation();
    const [current, setCurrent] = useState(0);

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=2000&auto=format&fit=crop",
            titleKey: "hero_title_1",
            subtitleKey: "hero_subtitle_1"
        },
        {
            image: "https://images.unsplash.com/photo-1615653051968-69c27954d9b9?q=80&w=2000&auto=format&fit=crop",
            titleKey: "hero_title_2",
            subtitleKey: "hero_subtitle_2"
        },
    ];

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
                        zIndex: index === current ? 1 : 0
                    }}
                >
                    <div style={{ position: "absolute", inset: 0 }}>
                        <img
                            src={slide.image}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/1200x500?text=Hero+Image+" + (index + 1);
                            }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}></div>
                    </div>

                    <div className="container" style={{
                        position: "relative",
                        zIndex: 10,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        textAlign: "center",
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                    }}>
                        <div
                            style={{
                                opacity: index === current ? 1 : 0,
                                transform: index === current ? "translateY(0)" : "translateY(30px)",
                                transition: "opacity 0.8s ease, transform 0.8s ease",
                                fontSize: "3rem",
                                fontWeight: "800",
                                marginBottom: "1rem"
                            }}
                        >
                            {t(slide.titleKey)}
                        </div>
                        <div
                            style={{
                                opacity: index === current ? 1 : 0,
                                transform: index === current ? "translateY(0)" : "translateY(20px)",
                                transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
                                fontSize: "1.2rem",
                                maxWidth: "600px",
                                margin: "0 auto"
                            }}
                        >
                            {t(slide.subtitleKey)}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
