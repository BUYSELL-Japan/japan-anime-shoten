export default function TrustBadges() {
    const badges = [
        { icon: "✈️", title: "Worldwide Shipping", desc: "Tracked & Insured" },
        { icon: "💎", title: "100% Authentic", desc: "Guaranteed Genuine" },
        { icon: "🔒", title: "Secure Payment", desc: "256-bit SSL Encryption" },
        { icon: "💬", title: "Support 24/7", desc: "Dedicated Team" },
    ];

    return (
        <section style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", background: "#fafafa" }}>
            <div className="container" style={{ padding: "var(--spacing-xl) 0" }}>
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    gap: "var(--spacing-lg)"
                }}>
                    {badges.map((badge, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ fontSize: "2rem" }}>{badge.icon}</div>
                            <div>
                                <h4 style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--color-text)" }}>{badge.title}</h4>
                                <p style={{ fontSize: "0.85rem", color: "var(--color-text-light)" }}>{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
