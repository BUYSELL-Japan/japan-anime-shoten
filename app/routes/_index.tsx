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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Announcement Bar */}
            <div style={{ background: "var(--color-primary)", color: "white", textAlign: "center", padding: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                Free Standard Shipping on Orders Over ¥20,000!
            </div>

            <header style={{ borderBottom: "1px solid var(--color-border)", padding: "20px 0", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(5px)", zIndex: 100 }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Logo */}
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
                        JAPAN ANIME <span className="text-red">SHOTEN</span>
                    </h1>

                    {/* Nav */}
                    <nav style={{ display: "none", md: { display: "flex" } }}>
                        <ul style={{ display: "flex", gap: "24px", listStyle: "none", fontWeight: "500" }}>
                            <li><a href="#">New Arrivals</a></li>
                            <li><a href="#">Figures</a></li>
                            <li><a href="#">Pokemon Cards</a></li>
                            <li><a href="#">Pre-orders</a></li>
                            <li><a href="#" style={{ color: "var(--color-primary)" }}>Sale</a></li>
                        </ul>
                    </nav>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <button style={{ fontWeight: "600" }}>Search</button>
                        <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>Cart (0)</button>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1 }}>
                <Hero />
                <TrustBadges />
                <ProductGrid />
                <ShopIntro />
            </main>

            <footer style={{ background: "#111", color: "#888", padding: "60px 0 20px" }}>
                <div className="container">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
                        <div>
                            <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>About Us</h3>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <li><a href="#">Our Story</a></li>
                                <li><a href="#">Authenticity Guarantee</a></li>
                                <li><a href="#">Wholesale</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>Customer Care</h3>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <li><a href="#">Shipping Policy</a></li>
                                <li><a href="#">Return Policy</a></li>
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">Contact Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>Newsletter</h3>
                            <p style={{ marginBottom: "16px", fontSize: "0.9rem" }}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "white" }} />
                                <button className="btn-primary">Join</button>
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: "1px solid #333", paddingTop: "20px", textAlign: "center", fontSize: "0.8rem" }}>
                        &copy; 2026 Japan Anime Shoten. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
