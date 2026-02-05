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
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export async function loader({ context }: LoaderFunctionArgs) {
    const { env } = context.cloudflare;
    const { results } = await env.DB.prepare("SELECT * FROM translations").all();

    // Convert array to object for easier access
    const translations = results.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr;
        return acc;
    }, {});

    return json({ translations });
}

export default function App() {
    const { translations } = useLoaderData<typeof loader>();

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <Outlet context={{ translations }} />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
