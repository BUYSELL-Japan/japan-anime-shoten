import {
    json,
    type LinksFunction,
    type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "@remix-run/react";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";
import i18next from "./i18n.server";
import i18n from "./i18n"; // Add this import for supportedLngs
import { getSaleConfigFromShopify } from "./utils/shopify.server";

import styles from "./styles/global.css?url";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: styles },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&display=swap",
    },
];

export async function loader({ request, params, context }: LoaderFunctionArgs) {
    // Attempt to get locale from params (if available) or URL path
    let locale = params.lang;

    if (!locale) {
        const url = new URL(request.url);
        const firstSegment = url.pathname.split('/').filter(Boolean)[0];
        if (i18n.supportedLngs.includes(firstSegment)) {
            locale = firstSegment;
        }
    }

    if (!locale) {
        locale = await i18next.getLocale(request);
    }

    const saleConfig = await getSaleConfigFromShopify(context);

    return json({ locale, saleConfig });
}

export let handle = {
    // In the handle export, we can add a i18n key with namespaces our route
    // will need to load. This key can be a single string or an array of strings.
    // TIP: In most cases, you should set this to your defaultNS from your i18n config
    // or if you did not set one, set it to the i18next default namespace "translation"
    i18n: "common",
};

import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import SalePopup from "./components/SalePopup";
import { useEffect } from "react";
import { setDynamicSaleConfig } from "./utils/saleConfig";

export default function App() {
    let { locale, saleConfig } = useLoaderData<typeof loader>();
    let { i18n } = useTranslation();

    // Initialize dynamic sale config
    if (saleConfig) {
        setDynamicSaleConfig(saleConfig);
    }

    // This hook will change the i18n instance language to the current locale
    // detected by the loader, this way, when we do some client-side
    // transitions, the data from the loader will trigger the change of
    // language.
    useChangeLanguage(locale);

    useEffect(() => {
        // Initialize Crisp Chat
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = "26ac3e40-b532-461a-b902-543b858d1fe3";

        const d = document;
        const s = d.createElement("script");
        s.src = "https://client.crisp.chat/l.js";
        s.async = true;

        // Append to head only if not already added
        if (!document.querySelector('script[src="https://client.crisp.chat/l.js"]')) {
            d.getElementsByTagName("head")[0].appendChild(s);
        }
    }, []);

    return (
        <html lang={locale} dir={i18n.dir()} suppressHydrationWarning>
            <head>
                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-EJNLPB6YG0"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());

                            gtag('config', 'G-EJNLPB6YG0');
                        `,
                    }}
                />

                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="google-site-verification" content="uhVyFz8gxRZ70zYu7xldgnJBNE89v5cASmrKSlzs05o" />
                <Meta />
                <Links />
            </head>
            <body>
                <CartProvider>
                    <Outlet />
                    <CartDrawer />
                    <SalePopup />
                </CartProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
