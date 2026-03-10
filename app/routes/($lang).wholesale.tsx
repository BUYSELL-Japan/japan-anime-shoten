import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
    return [
        { title: "Wholesale | Japan Anime Shoten" },
        { name: "description", content: "Wholesale anime goods from Japan. Bulk pricing for shops, online stores, and event vendors." },
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

export default function WholesalePage() {
    const { detectedCurrency } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    const features = t("wholesale.features", { returnObjects: true }) as Array<{ title: string; desc: string }>;

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header currentCurrency={detectedCurrency} />

            <main style={{ flex: 1, padding: "var(--spacing-2xl) 0" }} className="container">
                <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 16px" }}>
                    <h1 className="title-main" style={{ textAlign: "center", marginBottom: "12px" }}>
                        {t("wholesale.title")}
                    </h1>
                    <p style={{ textAlign: "center", color: "#666", fontSize: "1.1rem", marginBottom: "40px", fontStyle: "italic" }}>
                        {t("wholesale.tagline")}
                    </p>

                    <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#444", marginBottom: "32px" }}>
                        {t("wholesale.intro")}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px" }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                background: "#f9f9f9",
                                borderRadius: "12px",
                                padding: "24px",
                                borderLeft: "4px solid var(--color-primary)",
                            }}>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "8px", color: "#222" }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#555", margin: 0 }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#444" }}>
                        {t("wholesale.closing")}
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
