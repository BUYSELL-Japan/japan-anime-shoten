import { Form, Link, useLocation, useParams, useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import CurrencySelector from "./CurrencySelector";
import SearchBar from "./SearchBar";
import { isSaleActive, SALE_CONFIG } from "~/utils/saleConfig";

import { useCart } from "~/context/CartContext";

export default function Header({ currentCurrency }: { currentCurrency?: string }) {
    const { t } = useTranslation();
    const { lang } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { openCart, cart } = useCart();
    const [isAnimating, setIsAnimating] = useState(false);
    const [prevQuantity, setPrevQuantity] = useState(cart?.totalQuantity || 0);
    const [saleActive, setSaleActive] = useState(false);

    const currentLang = lang || "en";

    useEffect(() => {
        setSaleActive(isSaleActive());
    }, []);

    useEffect(() => {
        if (cart?.totalQuantity && cart.totalQuantity > prevQuantity) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 500);
            setPrevQuantity(cart.totalQuantity);
            return () => clearTimeout(timer);
        } else if (cart?.totalQuantity !== prevQuantity) {
            setPrevQuantity(cart?.totalQuantity || 0);
        }
    }, [cart?.totalQuantity, prevQuantity]);

    const changeLanguage = (newLang: string) => {
        let newPath = location.pathname;
        document.cookie = `preferred_language=${newLang}; path=/; max-age=31536000`;
        if (lang) {
            newPath = newPath.replace(`/${lang}`, `/${newLang}`);
        } else {
            if (newPath === "/") {
                newPath = `/${newLang}`;
            } else {
                newPath = `/${newLang}${newPath}`;
            }
        }
        newPath = newPath.replace('//', '/');
        if (location.search) {
            newPath += location.search;
        }
        window.location.href = newPath;
    };

    const getLink = (path: string) => {
        return `/${currentLang}${path}`;
    };

    const bannerText = SALE_CONFIG.title[currentLang] || SALE_CONFIG.title.en;
    const bannerSub = SALE_CONFIG.subtitle[currentLang] || SALE_CONFIG.subtitle.en;

    return (
        <>
            {/* Sale Banner */}
            {saleActive && (
                <div
                    style={{
                        background: "linear-gradient(90deg, #e63946, #ff6b6b, #e63946)",
                        color: "#fff",
                        padding: "8px 0",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                        zIndex: 101,
                        letterSpacing: "1px",
                    }}
                >
                    <div className="sale-banner-scroll">
                        <span style={{ padding: "0 40px" }}>
                            ✦ {bannerText} ✦ {bannerSub} ✦ ~3/15 ✦ {bannerText} ✦ {bannerSub} ✦ ~3/15 ✦
                        </span>
                    </div>
                </div>
            )}
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

                        <SearchBar />
                        <button
                            className={`btn-primary ${isAnimating ? "cart-added-animation" : ""}`}
                            style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                            onClick={openCart}
                        >
                            Cart ({cart?.totalQuantity || 0})
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
