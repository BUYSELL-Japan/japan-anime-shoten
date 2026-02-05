export default function TrustBadges() {
    const badges = [
        { icon: "📦", title: "Global Shipping", desc: "Direct from Japan" },
        { icon: "💯", title: "100% Authentic", desc: "Guaranteed Genuine" },
        { icon: "🔒", title: "Secure Payment", desc: "Safe Encrypted Checkout" },
        { icon: "🏎️", title: "Fast Dispatch", desc: "Tracked Airmail" },
    ];

    return (
        <section className="container" style={{ padding: "var(--spacing-xl) 0" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--spacing-lg)",
                background: "rgba(255,255,255,0.05)",
                padding: "var(--spacing-xl)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #333"
            }}>
                {badges.map((badge, idx) => (
                    <div key={idx} style={{ textAlign: "center", color: "white" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-sm)" }}>{badge.icon}</div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--neon-cyan)" }}>{badge.title}</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{badge.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
