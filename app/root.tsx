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

export async function loader({ request, params }: LoaderFunctionArgs) {
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

    return json({ locale });
}

export let handle = {
    // In the handle export, we can add a i18n key with namespaces our route
    // will need to load. This key can be a single string or an array of strings.
    // TIP: In most cases, you should set this to your defaultNS from your i18n config
    // or if you did not set one, set it to the i18next default namespace "translation"
    i18n: "common",
};

export default function App() {
    let { locale } = useLoaderData<typeof loader>();
    let { i18n } = useTranslation();

    // This hook will change the i18n instance language to the current locale
    // detected by the loader, this way, when we do some client-side
    // transitions, the data from the loader will trigger the change of
    // language.
    useChangeLanguage(locale);

    return (
        <html lang={locale} dir={i18n.dir()}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
