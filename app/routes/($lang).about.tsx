import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
    return [
        { title: "Our Story | Japan Anime Shoten" },
        { name: "description", content: "Learn about Japan Anime Shoten – delivering authentic anime goods from Osaka to the world." },
    ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
    const locale = params.lang || "en";

    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader?.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>) || {};

    const preferredCurrency = cookies['preferred_currency'] || "JPY";

    return json({ locale, detectedCurrency: preferredCurrency });
}

export default function AboutPage() {
    const { detectedCurrency } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header currentCurrency={detectedCurrency} />

            <main style={{ flex: 1, padding: "var(--spacing-2xl) 0" }} className="container">
                <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 16px" }}>
                    <h1 className="title-main" style={{ textAlign: "center", marginBottom: "12px" }}>
                        {t("about.title")}
                    </h1>
                    <p style={{ textAlign: "center", color: "#666", fontSize: "1.1rem", marginBottom: "40px", fontStyle: "italic" }}>
                        {t("about.tagline")}
                    </p>

                    {(t("about.paragraphs", { returnObjects: true }) as string[]).map((p: string, i: number) => (
                        <p key={i} style={{ fontSize: "1rem", lineHeight: "1.8", color: "#444", marginBottom: "20px" }}>
                            {p}
                        </p>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
