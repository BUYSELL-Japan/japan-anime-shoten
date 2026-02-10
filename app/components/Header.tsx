import { Form, Link, useLocation } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export default function Header() {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    // Determine current locale from i18n instance or URL
    // i18next-browser-languagedetector might sync i18n.language
    const locale = i18n.language;

    const changeLanguage = (lng: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set("lng", lng);
        window.location.href = url.toString();
    };

    return (
        <header style={{ borderBottom: "1px solid var(--color-border)", padding: "20px 0", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(5px)", zIndex: 100 }}>
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px", margin: 0 }}>
                        JAPAN ANIME <span className="text-red">SHOTEN</span>
                    </h1>
                </Link>

                {/* Nav */}
                <nav style={{ display: "none", "@media (min-width: 768px)": { display: "flex" } } as any}>
                    <ul style={{ display: "flex", gap: "24px", listStyle: "none", fontWeight: "500", margin: 0, padding: 0 }}>
                        <li><Link to="/">{t("new_arrivals", { defaultValue: "New Arrivals" })}</Link></li>
                        <li><Link to="/collections/figures">Figures</Link></li>
                        <li><Link to="/collections/cards">Pokemon Cards</Link></li>
                    </ul>
                </nav>

                {/* Actions */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <select
                        name="lng"
                        value={locale} // Controlled by i18n.language
                        onChange={(e) => changeLanguage(e.target.value)}
                        style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                        <option value="zh-TW">繁體中文</option>
                        <option value="zh-CN">简体中文</option>
                        <option value="ko">한국어</option>
                        <option value="th">ไทย</option>
                    </select>
                    <button style={{ fontWeight: "600", border: "none", background: "none", cursor: "pointer" }}>Search</button>
                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>Cart (0)</button>
                </div>
            </div>
        </header>
    );
}
