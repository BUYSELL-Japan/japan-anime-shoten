import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

interface SearchResult {
    id: string;
    title: string;
    handle: string;
    price: string;
    image: string;
    availableForSale: boolean;
}

export default function SearchBar() {
    const { t } = useTranslation();
    const { lang } = useParams();
    const navigate = useNavigate();
    const currentLang = lang || "en";

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                setQuery("");
                setResults([]);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`/${currentLang}/api/predictive-search?q=${encodeURIComponent(searchQuery)}`);
            const data: any = await res.json();
            setResults(data.products || []);
        } catch (err) {
            console.error("Search fetch error:", err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentLang]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/${currentLang}/search?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
            setResults([]);
        }
    };

    const handleResultClick = () => {
        setIsOpen(false);
        setQuery("");
        setResults([]);
    };

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {/* Search toggle button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        fontWeight: "600",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        fontSize: "0.9rem",
                    }}
                    aria-label="Search"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="mobile-hide-text">{t("search", { defaultValue: "Search" })}</span>
                </button>
            )}

            {/* Search input & dropdown */}
            {isOpen && (
                <div style={{
                    position: "absolute",
                    right: 0,
                    top: "-8px",
                    zIndex: 200,
                    width: "min(400px, 90vw)",
                }}>
                    <form onSubmit={handleSubmit} style={{ position: "relative" }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder={t("search_placeholder", { defaultValue: "Search products..." })}
                            style={{
                                width: "100%",
                                padding: "10px 40px 10px 16px",
                                fontSize: "0.95rem",
                                border: "2px solid var(--color-primary, #e63946)",
                                borderRadius: "24px",
                                outline: "none",
                                background: "#fff",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                boxSizing: "border-box",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => { setIsOpen(false); setQuery(""); setResults([]); }}
                            style={{
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.2rem",
                                color: "#999",
                                padding: "4px",
                            }}
                            aria-label="Close search"
                        >
                            ✕
                        </button>
                    </form>

                    {/* Dropdown results */}
                    {(results.length > 0 || isLoading) && (
                        <div style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            right: 0,
                            background: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                            border: "1px solid #eee",
                            overflow: "hidden",
                            maxHeight: "400px",
                            overflowY: "auto",
                        }}>
                            {isLoading && (
                                <div style={{ padding: "16px", textAlign: "center", color: "#999", fontSize: "0.9rem" }}>
                                    Loading...
                                </div>
                            )}
                            {!isLoading && results.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/${currentLang}/products/${product.handle}`}
                                    onClick={handleResultClick}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "10px 16px",
                                        textDecoration: "none",
                                        color: "inherit",
                                        borderBottom: "1px solid #f5f5f5",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f8f8")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                objectFit: "contain",
                                                borderRadius: "6px",
                                                background: "#f9f9f9",
                                                flexShrink: 0,
                                            }}
                                            loading="lazy"
                                        />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: "500",
                                            fontSize: "0.9rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}>
                                            {product.title}
                                        </div>
                                        <div style={{
                                            fontSize: "0.85rem",
                                            color: product.availableForSale ? "var(--color-primary, #e63946)" : "#999",
                                            fontWeight: "600",
                                        }}>
                                            {product.availableForSale ? product.price : "Sold Out"}
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* View all results link */}
                            {!isLoading && results.length > 0 && query.trim() && (
                                <Link
                                    to={`/${currentLang}/search?q=${encodeURIComponent(query.trim())}`}
                                    onClick={handleResultClick}
                                    style={{
                                        display: "block",
                                        padding: "12px 16px",
                                        textAlign: "center",
                                        textDecoration: "none",
                                        fontSize: "0.9rem",
                                        fontWeight: "600",
                                        color: "var(--color-primary, #e63946)",
                                        borderTop: "1px solid #eee",
                                        background: "#fafafa",
                                    }}
                                >
                                    {t("search_view_all", { defaultValue: "View all results" })} →
                                </Link>
                            )}
                        </div>
                    )}

                    {/* No results message */}
                    {!isLoading && query.length >= 2 && results.length === 0 && (
                        <div style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            right: 0,
                            background: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                            border: "1px solid #eee",
                            padding: "20px 16px",
                            textAlign: "center",
                            color: "#999",
                            fontSize: "0.9rem",
                        }}>
                            {t("search_no_results", { defaultValue: "No results found", query })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
