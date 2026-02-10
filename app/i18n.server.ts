import { RemixI18Next } from "remix-i18next/server";
import i18n from "./i18n"; // your i18n configuration file

const i18next = new RemixI18Next({
    detection: {
        supportedLanguages: i18n.supportedLngs,
        fallbackLanguage: i18n.fallbackLng,
    },
    // This is the configuration for i18next used
    // when translating messages server-side only
    i18next: {
        ...i18n,
    },
    // The i18next plugins you want RemixI18next to use for
    // i18n.getFixedT and i18n.getLocale
    plugins: [],
});

export default i18next;
