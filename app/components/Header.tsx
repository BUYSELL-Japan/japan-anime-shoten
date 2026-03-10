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
                    <div className="sale-banner-container">
                        <div className="sale-banner-scroll">
                            <span style={{ padding: "0 40px" }}>
                                ✦ {bannerText} ✦ {bannerSub} ✦ ~3/15 ✦ {bannerText} ✦ {bannerSub} ✦ ~3/15 ✦
                            </span>
                        </div>
                    </div>
                </div>
            )}
            <header className="header-wrapper">
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Logo */}
                    <Link to={`/${currentLang}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <h1 className="header-logo">
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
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .header-wrapper {
                            padding: 20px 0;
                            border-bottom: 1px solid var(--color-border);
                            position: sticky;
                            top: 0;
                            background: rgba(255,255,255,0.95);
                            backdrop-filter: blur(5px);
                            z-index: 100;
                        }
                        .header-logo {
                            font-size: 1.5rem;
                            font-weight: 800;
                            letter-spacing: -0.5px;
                            margin: 0;
                            white-space: nowrap;
                        }
                        .header-actions {
                            display: flex;
                            gap: 16px;
                            align-items: center;
                        }
                        .header-select {
                            padding: 4px;
                            border-radius: 4px;
                            border: 1px solid #ddd;
                        }
                        .header-cart-btn {
                            padding: 8px 16px;
                            font-size: 0.9rem;
                            white-space: nowrap;
                        }
                        @media (max-width: 768px) {
                            .header-wrapper {
                                padding: 10px 0;
                            }
                            .header-logo {
                                font-size: 1.2rem;
                            }
                            .header-actions {
                                gap: 8px;
                            }
                            .header-select {
                                padding: 2px;
                                font-size: 0.8rem;
                            }
                            .header-cart-btn {
                                padding: 6px 10px;
                                font-size: 0.8rem;
                            }
                            .mobile-hide-text {
                                display: none !important;
                            }
                            .currency-btn {
                                padding: 4px 6px !important;
                                gap: 2px !important;
                                font-size: 0.8rem !important;
                            }
                        }
                        @media (max-width: 480px) {
                            .header-wrapper {
                                padding: 6px 0;
                            }
                            /* Override global .container padding for extremely narrow screens */
                            .header-wrapper .container {
                                padding-left: 8px;
                                padding-right: 8px;
                            }
                            .header-logo {
                                font-size: 0.85rem; /* Even smaller on tiny screens */
                                letter-spacing: -1px;
                            }
                            .header-actions {
                                gap: 2px;
                            }
                            .header-select {
                                width: 40px; /* Compress selectors on very small screens */
                                text-overflow: ellipsis;
                                font-size: 0.7rem;
                                padding: 2px 0px;
                            }
                            .header-cart-btn {
                                padding: 4px 6px;
                                font-size: 0.7rem;
                            }
                        }
                        `
                    }} />
                    <div className="header-actions">
                        {/* Language Selector */}
                        <select
                            name="lng"
                            value={currentLang}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="header-select"
                        >
                            <option value="en">English</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="ko">한국어</option>
                            <option value="th">ไทย</option>
                        </select>

                        {/* Currency Selector */}
                        <div className="header-select-wrapper">
                            <CurrencySelector currentCurrency={currentCurrency || 'JPY'} />
                        </div>

                        <SearchBar />
                        <button
                            className={`btn-primary header-cart-btn ${isAnimating ? "cart-added-animation" : ""}`}
                            onClick={openCart}
                            style={{ display: "flex", alignItems: "center", gap: "4px" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <span className="mobile-hide-text">{t("cart_button", { defaultValue: "Cart" })}</span>
                            <span style={{ fontWeight: "bold" }}>({cart?.totalQuantity || 0})</span>
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
