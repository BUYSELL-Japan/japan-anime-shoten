/**
 * Shopify Image Optimization Utility
 * Automatically adds transformation parameters to Shopify CDN URLs
 */
export function getShopifyImageUrl(url: string | undefined, options: { width?: number; height?: number; crop?: 'center' | 'top' | 'bottom' | 'left' | 'right'; format?: 'webp' | 'jpg' | 'pjpg' } = {}) {
    if (!url) return "";

    // Check if it's a Shopify CDN URL
    if (!url.includes('cdn.shopify.com')) return url;

    try {
        const urlObj = new URL(url);

        if (options.width) urlObj.searchParams.set('width', options.width.toString());
        if (options.height) urlObj.searchParams.set('height', options.height.toString());
        if (options.crop) urlObj.searchParams.set('crop', options.crop);

        // Default to webp for better compression
        urlObj.searchParams.set('format', options.format || 'webp');

        return urlObj.toString();
    } catch (e) {
        return url;
    }
}
