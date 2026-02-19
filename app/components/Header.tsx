import { Form, Link, useLocation, useParams, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import CurrencySelector from "./CurrencySelector";

import { useCart } from "~/context/CartContext";

export default function Header({ currentCurrency }: { currentCurrency?: string }) {
    const { t } = useTranslation();
    const { lang } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { openCart, cart } = useCart();

    const currentLang = lang || "en";

    const changeLanguage = (newLang: string) => {
        let newPath = location.pathname;

        // Save language preference to cookie
        document.cookie = `preferred_language=${newLang}; path=/; max-age=31536000`;

        // Simple logic: if path starts with /currentLang, replace it. 
        // If not (e.g. root /), check if it starts with any supported lang? 
        // Or just assume if lang param is present, it's in the URL.

        if (lang) {
            newPath = newPath.replace(`/${lang}`, `/${newLang}`);
        } else {
            // We are at root or a path without lang prefix (default en)
            // e.g. / or /products/abc
            if (newPath === "/") {
                newPath = `/${newLang}`;
            } else {
                newPath = `/${newLang}${newPath}`;
            }
        }

        // If switching to default language (en), we could optionally remove the prefix, 
        // but for consistency/SEO, keeping /en is arguably better or strictly canonical.
        // User asked for /en etc. 

        // Fix double slashes just in case
        newPath = newPath.replace('//', '/');

        // Preserve query params
        if (location.search) {
            newPath += location.search;
        }

        window.location.href = newPath;
    };

    const getLink = (path: string) => {
        // Warning: path should start with /
        // If currentLang is present, prepend it.
        // But if currentLang is "en" and we are at root, maybe we want /en/path?
        // Let's use /en/path style always for explicit routing as requested.
        return `/${currentLang}${path}`;
    };

    return (
        <header style={{ borderBottom: "1px solid var(--color-border)", padding: "20px 0", position: "sticky", top: 0, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(5px)", zIndex: 100 }}>
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Logo */}
                <Link to={`/${currentLang}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px", margin: 0 }}>
                        JAPAN ANIME <span className="text-red">SHOTEN</span>
                    </h1>
                </Link>

                {/* Nav */}
                <nav style={{ display: "none", "@media (min-width: 768px)": { display: "flex" } } as any}>
                    <ul style={{ display: "flex", gap: "24px", listStyle: "none", fontWeight: "500", margin: 0, padding: 0 }}>
                        <li><Link to={getLink("/")}>{t("new_arrivals", { defaultValue: "New Arrivals" })}</Link></li>
                        <li><Link to={getLink("/collections/figures")}>Figures</Link></li>
                        <li><Link to={getLink("/collections/cards")}>Pokemon Cards</Link></li>
                    </ul>
                </nav>

                {/* Actions */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    {/* Language Selector */}
                    <select
                        name="lng"
                        value={currentLang}
                        onChange={(e) => changeLanguage(e.target.value)}
                        style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }}
                    >
                        <option value="en">English</option>
                        <option value="zh-TW">繁體中文</option>
                        <option value="zh-CN">简体中文</option>
                        <option value="ko">한국어</option>
                        <option value="th">ไทย</option>
                    </select>

                    {/* Currency Selector */}
                    <CurrencySelector currentCurrency={currentCurrency || 'JPY'} />

                    <button style={{ fontWeight: "600", border: "none", background: "none", cursor: "pointer" }}>{t('search')}</button>
                    <button
                        className="btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                        onClick={openCart}
                    >
                        Cart ({cart?.totalQuantity || 0})
                    </button>
                </div>
            </div>
        </header>
    );
}
