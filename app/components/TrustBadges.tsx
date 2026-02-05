export default function TrustBadges() {
    const badges = [
        { icon: "⛩️", title: "Global Shipping", desc: "Direct from Japan" },
        { icon: "💮", title: "100% Authentic", desc: "Guaranteed Genuine" },
        { icon: "🛡️", title: "Secure Payment", desc: "Safe Encrypted Checkout" },
        { icon: "🏯", title: "Fast Dispatch", desc: "Tracked Airmail" },
    ];

    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) 0" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--spacing-lg)",
                borderTop: "1px solid #333",
                borderBottom: "1px solid #333",
                padding: "var(--spacing-2xl) 0"
            }}>
                {badges.map((badge, idx) => (
                    <div key={idx} style={{ textAlign: "center", color: "var(--text-primary)" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-md)", color: "var(--color-gold)" }}>{badge.icon}</div>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: "'Cinzel', serif", color: "var(--color-gold)", marginBottom: "var(--spacing-xs)" }}>{badge.title}</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "'Noto Serif JP', serif" }}>{badge.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
