import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

interface Collection {
    id: string;
    title: string;
    handle: string;
    image: string;
}

interface CollectionSliderProps {
    collections: Collection[];
}

export default function CollectionSlider({ collections }: CollectionSliderProps) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "en";
    const sliderRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    if (!collections || collections.length === 0) {
        return null; // Do not render if there are no collections
    }

    return (
        <section className="container" style={{ padding: "var(--spacing-xl) 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--spacing-lg)" }}>
                <h2 className="title-main" style={{ marginBottom: 0 }}>
                    {t('shop_by_anime', { defaultValue: 'Shop by Anime' })}
                </h2>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={scrollLeft}
                        style={{
                            width: "40px", height: "40px", borderRadius: "50%",
                            background: "var(--color-bg)", border: "1px solid var(--color-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s ease",
                            boxShadow: "var(--shadow-sm)"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--color-primary)"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
                    >
                        &larr;
                    </button>
                    <button
                        onClick={scrollRight}
                        style={{
                            width: "40px", height: "40px", borderRadius: "50%",
                            background: "var(--color-bg)", border: "1px solid var(--color-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s ease",
                            boxShadow: "var(--shadow-sm)"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--color-primary)"}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
                    >
                        &rarr;
                    </button>
                </div>
            </div>

            <div
                ref={sliderRef}
                style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "var(--spacing-md)",
                    paddingBottom: "var(--spacing-md)",
                    scrollbarWidth: "none", /* Firefox */
                    msOverflowStyle: "none",  /* IE and Edge */
                    scrollSnapType: "x mandatory"
                }}
            >
                {/* Hide scrollbar for Chrome, Safari and Opera */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    div::-webkit-scrollbar { display: none; }
                `}} />

                {collections.map((collection) => (
                    <Link
                        key={collection.id}
                        to={`/${currentLang}/collections/${collection.handle}`}
                        style={{
                            flex: "0 0 auto",
                            width: "280px",
                            height: "380px",
                            borderRadius: "var(--radius-md)",
                            overflow: "hidden",
                            position: "relative",
                            display: "block",
                            scrollSnapAlign: "start",
                            boxShadow: "var(--shadow-sm)",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease"
                        }}
                        className="collection-card"
                    >
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .collection-card:hover {
                                transform: translateY(-8px);
                                box-shadow: var(--shadow-md);
                            }
                            .collection-card:hover img {
                                transform: scale(1.05);
                            }
                        `}} />
                        <img
                            src={collection.image}
                            alt={collection.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.5s ease"
                            }}
                            loading="lazy"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div style={{
                            position: "absolute",
                            inset: "0",
                            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
                            pointerEvents: "none"
                        }}></div>

                        <div style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "20px",
                            right: "20px",
                            color: "white",
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                        }}>
                            <h3 style={{
                                fontSize: "1.5rem",
                                fontWeight: "800",
                                margin: 0,
                                lineHeight: "1.2"
                            }}>
                                {collection.title}
                            </h3>
                            <div style={{
                                marginTop: "8px",
                                display: "inline-block",
                                padding: "4px 12px",
                                background: "var(--color-primary)",
                                color: "white",
                                borderRadius: "20px",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "1px"
                            }}>
                                {t('shop_now', { defaultValue: 'Shop Now' })}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
