// Sale Configuration — Change this file to start/stop sales
// To start a new sale: set isActive to true and update endDate
// To end a sale: set isActive to false

export let SALE_CONFIG = {
    isActive: true,
    discountPercent: 10,
    endDate: "2026-03-22T23:59:59+09:00", // JST
    title: {
        en: "🔥 SPRING SALE 🔥",
        ja: "🔥 スプリングセール 🔥",
        ko: "🔥 봄 세일 🔥",
        th: "🔥 เซลฤดูใบไม้ผลิ 🔥",
        "zh-CN": "🔥 春季特卖 🔥",
        "zh-TW": "🔥 春季特賣 🔥",
    } as Record<string, string>,
    subtitle: {
        en: "10% OFF Everything!",
        ja: "全商品10%OFF!",
        ko: "전 상품 10% 할인!",
        th: "ลด 10% ทุกชิ้น!",
        "zh-CN": "全场9折!",
        "zh-TW": "全場9折!",
    } as Record<string, string>,
};

let isInitialized = false;

/**
 * Dynamically update the sale configuration (e.g., from Shopify metafields)
 */
export function setDynamicSaleConfig(config: any) {
    if (!config || isInitialized) return;

    SALE_CONFIG = {
        ...SALE_CONFIG,
        ...config,
        // Ensure nested objects are merged correctly if they exist in the config
        title: { ...SALE_CONFIG.title, ...(config.title || {}) },
        subtitle: { ...SALE_CONFIG.subtitle, ...(config.subtitle || {}) },
    };
    isInitialized = true;
    console.log("[SaleConfig] Dynamic config applied:", SALE_CONFIG.endDate);
}

export function isSaleActive(): boolean {
    if (!SALE_CONFIG.isActive) return false;
    return new Date() < new Date(SALE_CONFIG.endDate);
}

export function getSalePrice(price: number): number {
    if (!isSaleActive()) return price;
    return Math.round(price * (1 - SALE_CONFIG.discountPercent / 100) * 100) / 100;
}

export function getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number; total: number } {
    const total = new Date(SALE_CONFIG.endDate).getTime() - Date.now();
    if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / (1000 * 60)) % 60),
        seconds: Math.floor((total / 1000) % 60),
        total,
    };
}
