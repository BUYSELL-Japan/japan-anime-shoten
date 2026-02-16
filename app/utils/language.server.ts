import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

/**
 * Language detection middleware
 * Detects user's preferred language based on:
 * 1. URL parameter (if already set)
 * 2. Cookie preference
 * 3. Cloudflare location (country)
 * 4. Browser Accept-Language header
 */
export async function detectLanguage(request: Request): Promise<string | null> {
    // Check if language is already in URL
    const url = new URL(request.url);
    const pathLang = url.pathname.split('/')[1];
    const supportedLangs = ['en', 'ja', 'zh-TW', 'zh-CN', 'ko', 'th'];

    if (supportedLangs.includes(pathLang)) {
        // Language already in URL, no redirect needed
        return null;
    }

    // Parse cookies
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader?.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>) || {};

    const preferredLang = cookies['preferred_language'];
    if (preferredLang && supportedLangs.includes(preferredLang)) {
        return preferredLang;
    }

    // Get country from Cloudflare
    const cf = (request as any).cf;
    const country = cf?.country;

    // Map country to language
    const countryToLang: Record<string, string> = {
        'TW': 'zh-TW',
        'HK': 'zh-TW',
        'CN': 'zh-CN',
        'KR': 'ko',
        'TH': 'th',
        'US': 'en',
        'GB': 'en',
        'CA': 'en',
        'AU': 'en',
        'NZ': 'en',
        'SG': 'en',
        'MY': 'en',
        'PH': 'en',
        'IN': 'en',
        'JP': 'ja',
    };

    if (country && countryToLang[country]) {
        return countryToLang[country];
    }

    // Fallback to Accept-Language header
    const acceptLang = request.headers.get('Accept-Language');
    if (acceptLang) {
        const langs = acceptLang.split(',').map(l => l.split(';')[0].trim());

        for (const lang of langs) {
            if (lang.startsWith('zh-TW') || lang.startsWith('zh-Hant')) return 'zh-TW';
            if (lang.startsWith('zh-CN') || lang.startsWith('zh-Hans') || lang.startsWith('zh')) return 'zh-CN';
            if (lang.startsWith('ko')) return 'ko';
            if (lang.startsWith('th')) return 'th';
            if (lang.startsWith('ja')) return 'ja';
            if (lang.startsWith('en')) return 'en';
        }
    }

    // Default to English
    return 'en';
}

/**
 * Root loader that handles language detection and redirection
 */
export async function handleLanguageRedirect(request: Request): Promise<Response | null> {
    const detectedLang = await detectLanguage(request);

    if (detectedLang) {
        const url = new URL(request.url);
        const newPath = `/${detectedLang}${url.pathname}${url.search}`;

        console.log(`[LanguageDetection] Redirecting to: ${newPath}`);
        return redirect(newPath, 302);
    }

    return null;
}
