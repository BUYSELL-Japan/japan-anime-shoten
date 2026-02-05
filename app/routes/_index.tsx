import type { MetaFunction } from "@remix-run/cloudflare";
import Hero from "~/components/Hero";
import ProductGrid from "~/components/ProductGrid";
import TrustBadges from "~/components/TrustBadges";
import ShopIntro from "~/components/ShopIntro";

export const meta: MetaFunction = () => {
    return [
        { title: "Japan Anime Shoten | Authentic Anime Goods" },
        {
            name: "description",
            content: "Authentic Anime Goods directly from Japan! We ship figures and merchandise worldwide.",
        },
    ];
};

export default function Index() {
    return (
        <div style={{ paddingBottom: "100px" }}>
            <header style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 100,
                padding: "var(--spacing-lg)",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
                borderBottom: "1px solid rgba(212, 175, 55, 0.2)"
            }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 className="title-serif text-gold" style={{ fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "2px" }}>JAPAN ANIME SHOTEN</h1>
                    <nav>
                        <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Cart (0)</button>
                    </nav>
                </div>
            </header>

            <main>
                <Hero />
                <TrustBadges />
                <ProductGrid />
                <ShopIntro />
            </main>

            <footer style={{
                borderTop: "1px solid #333",
                padding: "var(--spacing-2xl) 0",
                textAlign: "center",
                background: "#050505",
                color: "var(--text-muted)",
                marginTop: "var(--spacing-2xl)"
            }}>
                <div className="container">
                    <h2 className="title-serif text-gold" style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-md)" }}>JAPAN ANIME SHOTEN</h2>
                    <p>&copy; 2026 Japan Anime Shoten. All rights reserved.</p>
                    <p style={{ fontSize: "0.8rem", marginTop: "var(--spacing-sm)", fontFamily: "'Noto Serif JP', serif" }}>
                        Direct from Akihabara, Tokyo.
                    </p>
                </div>
            </footer>
        </div>
    );
}
