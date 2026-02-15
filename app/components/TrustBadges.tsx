import { useTranslation } from "react-i18next";

export default function TrustBadges() {
    const { t } = useTranslation();

    const badges = [
        { icon: "✈️", title: t("badge_shipping_title"), desc: t("badge_shipping_desc") },
        { icon: "💎", title: t("badge_authentic_title"), desc: t("badge_authentic_desc") },
        { icon: "🔒", title: t("badge_secure_title"), desc: t("badge_secure_desc") },
        { icon: "📦", title: t("badge_support_title"), desc: t("badge_support_desc") },
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
