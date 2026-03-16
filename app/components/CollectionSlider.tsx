import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

interface Collection {
    id: string;
    title: string;
    handle: string;
    image: string;
}

interface CollectionSliderProps {
    collections: Collection[];
}

// Mapping: Shopify collection handle → logo filename in /images/logos/
const logoMap: Record<string, string> = {
    "bleach": "Bleach.jpg",
    "dragon-ball": "Dragonball.jpg",
    "frieren-beyond-journeys-end": "Furieren.png",
    "frieren-beyond-journey-s-end": "Furieren.png",
    "mobile-suit-gundam": "Gundam.png",
    "gundam": "Gundam.png",
    "haikyuu": "Haikyuu.jpg",
    "hatsune-miku": "Hatsunemiku.png",
    "jujutsu-kaisen": "Jujutsukaisen.png",
    "demon-slayer-kimetsu-no-yaiba": "kimetsunoyaiba.jpg",
    "demon-slayer": "kimetsunoyaiba.jpg",
    "one-piece": "One piece.jpg",
    "pokemon": "Pokemon.png",
    "re-zero-starting-life-in-another-world": "ReZero.png",
    "re-zero": "ReZero.png",
};

export default function CollectionSlider({ collections }: CollectionSliderProps) {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "en";

    if (!collections || collections.length === 0) {
        return null;
    }

    return (
        <section className="container" style={{ padding: "var(--spacing-xl) 0" }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .anime-logo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 16px;
                }
                .anime-logo-card {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    border: 1px solid #e8e8e8;
                    border-radius: 12px;
                    padding: 24px 16px;
                    height: 120px;
                    transition: all 0.25s ease;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                }
                .anime-logo-card:hover {
                    border-color: #d32f2f;
                    box-shadow: 0 4px 20px rgba(211, 47, 47, 0.12);
                    transform: translateY(-2px);
                }
                .anime-logo-card img {
                    max-width: 80%;
                    max-height: 70px;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                    filter: grayscale(20%);
                }
                .anime-logo-card:hover img {
                    transform: scale(1.08);
                    filter: grayscale(0%);
                }
                
                /* Specific enlargements for logos with lots of whitespace */
                /* Bleach and Haikyuu need more enlargement because their source images are smaller */
                .anime-logo-card[data-handle="bleach"] img,
                .anime-logo-card[data-handle="haikyuu"] img {
                    max-width: 100%;
                    max-height: 100px;
                    transform: scale(1.30);
                }
                .anime-logo-card[data-handle="bleach"]:hover img,
                .anime-logo-card[data-handle="haikyuu"]:hover img {
                    transform: scale(1.40);
                    filter: grayscale(0%);
                }

                /* General enlargement for wide logos */
                .anime-logo-card[data-handle="pokemon"] img,
                .anime-logo-card[data-handle="hatsune-miku"] img,
                .anime-logo-card[data-handle="dragon-ball"] img,
                .anime-logo-card[data-handle="frieren-beyond-journeys-end"] img,
                .anime-logo-card[data-handle="frieren-beyond-journey-s-end"] img,
                .anime-logo-card[data-handle="one-piece"] img,
                .anime-logo-card[data-handle="jujutsu-kaisen"] img,
                .anime-logo-card[data-handle="re-zero-starting-life-in-another-world"] img,
                .anime-logo-card[data-handle="re-zero"] img {
                    max-width: 100%;
                    max-height: 90px;
                    transform: scale(1.15);
                }
                .anime-logo-card[data-handle="pokemon"]:hover img,
                .anime-logo-card[data-handle="hatsune-miku"]:hover img,
                .anime-logo-card[data-handle="dragon-ball"]:hover img,
                .anime-logo-card[data-handle="frieren-beyond-journeys-end"]:hover img,
                .anime-logo-card[data-handle="frieren-beyond-journey-s-end"]:hover img,
                .anime-logo-card[data-handle="one-piece"]:hover img,
                .anime-logo-card[data-handle="jujutsu-kaisen"]:hover img,
                .anime-logo-card[data-handle="re-zero-starting-life-in-another-world"]:hover img,
                .anime-logo-card[data-handle="re-zero"]:hover img {
                    transform: scale(1.25);
                    filter: grayscale(0%);
                }

                .anime-logo-card .card-title {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(211, 47, 47, 0.95);
                    color: white;
                    text-align: center;
                    padding: 6px 8px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    transform: translateY(100%);
                    transition: transform 0.25s ease;
                }
                .anime-logo-card:hover .card-title {
                    transform: translateY(0);
                }
                @media (max-width: 768px) {
                    .anime-logo-grid {
                        display: flex;
                        overflow-x: auto;
                        scroll-snap-type: x mandatory;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        padding-bottom: 12px;
                        gap: 12px;
                    }
                    .anime-logo-grid::-webkit-scrollbar {
                        display: none;
                    }
                    .anime-logo-card {
                        flex: 0 0 140px;
                        scroll-snap-align: start;
                        height: 90px;
                        padding: 12px 8px;
                    }
                    .anime-logo-card img {
                        max-height: 50px;
                    }
                    .anime-logo-card[data-handle="bleach"] img,
                    .anime-logo-card[data-handle="haikyuu"] img {
                        max-height: 75px;
                    }

                    .anime-logo-card[data-handle="pokemon"] img,
                    .anime-logo-card[data-handle="hatsune-miku"] img,
                    .anime-logo-card[data-handle="dragon-ball"] img,
                    .anime-logo-card[data-handle="frieren-beyond-journeys-end"] img,
                    .anime-logo-card[data-handle="frieren-beyond-journey-s-end"] img,
                    .anime-logo-card[data-handle="one-piece"] img,
                    .anime-logo-card[data-handle="jujutsu-kaisen"] img {
                        max-height: 65px;
                    }
                }
            `}} />

            <h2 className="title-main" style={{ marginBottom: "var(--spacing-lg)", textAlign: "center" }}>
                {t('shop_by_anime', { defaultValue: 'Shop by Anime' })}
            </h2>

            <div className="anime-logo-grid">
                {collections.map((collection) => {
                    const logoFile = logoMap[collection.handle];
                    const logoSrc = logoFile ? `/images/logos/${logoFile}` : collection.image;

                    return (
                        <Link
                            key={collection.id}
                            to={`/${currentLang}/collections/${collection.handle}`}
                            className="anime-logo-card"
                            data-handle={collection.handle}
                        >
                            <img
                                src={logoSrc}
                                alt={collection.title}
                                loading="lazy"
                            />
                            <span className="card-title">{collection.title}</span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
