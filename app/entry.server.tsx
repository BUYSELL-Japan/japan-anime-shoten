import type { AppLoadContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/react"; // Fix EntryContext import
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { createInstance } from "i18next";
import i18next from "./i18n.server";
import { I18nextProvider, initReactI18next } from "react-i18next";
// Import translation files directly to avoid network requests during SSR
import enCommon from "../public/locales/en/common.json";
import jaCommon from "../public/locales/ja/common.json";
import zhCNCommon from "../public/locales/zh-CN/common.json";
import zhTWCommon from "../public/locales/zh-TW/common.json";
import koCommon from "../public/locales/ko/common.json";
import thCommon from "../public/locales/th/common.json";
import i18n from "./i18n"; // your i18n configuration file

export default async function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext,
    loadContext: AppLoadContext
) {
    let instance = createInstance();
    let lng = await i18next.getLocale(request);
    let ns = i18next.getRouteNamespaces(remixContext);

    await instance
        .use(initReactI18next)
        .init({
            ...i18n,
            lng,
            ns,
            resources: {
                en: { common: enCommon },
                ja: { common: jaCommon },
                "zh-CN": { common: zhCNCommon },
                "zh-TW": { common: zhTWCommon },
                ko: { common: koCommon },
                th: { common: thCommon },
            },
        });

    const body = await renderToReadableStream(
        <I18nextProvider i18n={instance}>
            <RemixServer context={remixContext} url={request.url} />
        </I18nextProvider>,
        {
            signal: request.signal,
            onError(error: unknown) {
                console.error(error);
                responseStatusCode = 500;
            },
        }
    );

    if (isbot(request.headers.get("user-agent") || "")) {
        await body.allReady;
    }

    responseHeaders.set("Content-Type", "text/html");
    return new Response(body, {
        headers: responseHeaders,
        status: responseStatusCode,
    });
}
