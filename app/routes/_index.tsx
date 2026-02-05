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
                padding: "var(--spacing-md)",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)"
            }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h1 className="neon-text-pink" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>JAPAN ANIME SHOTEN</h1>
                    <nav>
                        <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>Cart (0)</button>
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
                padding: "var(--spacing-xl) 0",
                textAlign: "center",
                color: "var(--text-muted)",
                marginTop: "var(--spacing-2xl)"
            }}>
                <div className="container">
                    <p>&copy; 2026 Japan Anime Shoten. All rights reserved.</p>
                    <p style={{ fontSize: "0.8rem", marginTop: "var(--spacing-sm)" }}>Direct from Akihabara, Tokyo.</p>
                </div>
            </footer>
        </div>
    );
}
