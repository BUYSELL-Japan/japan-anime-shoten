import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { createInstance } from "i18next";
import i18next from "./i18n.server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
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

    const url = new URL(request.url);
    const origin = url.origin;

    await instance
        .use(initReactI18next)
        .use(Backend)
        .init({
            ...i18n,
            lng,
            ns,
            backend: {
                loadPath: `${origin}/locales/{{lng}}/{{ns}}.json`
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
