import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import i18next from "~/i18n.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: `${data?.title} | Japan Anime Shoten` },
        { name: "description", content: data?.title },
    ];
};

export async function loader({ request, params, context }: LoaderFunctionArgs) {
    const { handle, lang } = params;
    const t = await i18next.getFixedT(request, "common");

    // Mapping handles to translation keys
    const policyKeys: Record<string, string> = {
        "refund-policy": "policies.refund",
        "shipping-policy": "policies.shipping",
        "privacy-policy": "policies.privacy",
        "terms-of-service": "policies.terms",
        "legal-notice": "policies.legal",
    };

    const key = policyKeys[handle || ""];

    if (!key) {
        throw new Response("Not Found", { status: 404 });
    }

    const title = t(`${key}.title`);

    // We pass the key to the component to render the full content via useTranslation
    // The meta function needs the title, so we fetch it server-side too.

    // Detect currency for Header
    const env = context.cloudflare.env as any;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = cookieHeader?.split(';').reduce((acc: Record<string, string>, cookie: string) => {
        const [k, v] = cookie.trim().split('=');
        acc[k] = v;
        return acc;
    }, {} as Record<string, string>) || {};

    const preferredCurrency = cookies['preferred_currency'];
    const countryToCurrency: Record<string, string> = {
        "JP": "JPY", "US": "USD", "TW": "TWD", "CN": "CNY", "KR": "KRW", "TH": "THB"
        // Add others as needed, simplified for now
    };

    let detectedCurrency = "JPY";
    if (preferredCurrency) {
        detectedCurrency = preferredCurrency;
    } else {
        const cf = (request as any).cf;
        const country = cf?.country || "JP";
        detectedCurrency = countryToCurrency[country] || "USD"; // Default to USD if outside JP/mapped
    }

    return json({ title, policyKey: key, detectedCurrency });
}

export default function PolicyPage() {
    const { policyKey, detectedCurrency } = useLoaderData<typeof loader>();
    const { t } = useTranslation();

    // Helper to render sections
    // We assume structure: 
    // policies.refund.sections = [ { title: "", content: ["p1", "p2"] } ]

    const sections = t(`${policyKey}.sections`, { returnObjects: true });

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header currentCurrency={detectedCurrency} />

            <main className="container" style={{ padding: "60px 20px", flex: 1, maxWidth: "800px" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "40px", textAlign: "center" }}>
                    {t(`${policyKey}.title`)}
                </h1>

                <div className="policy-content" style={{ lineHeight: "1.8", color: "#333" }}>
                    {Array.isArray(sections) && sections.map((section: any, index: number) => (
                        <div key={index} style={{ marginBottom: "40px" }}>
                            {section.title && (
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                                    {section.title}
                                </h2>
                            )}
                            {Array.isArray(section.content) ? (
                                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                                    {section.content.map((line: string, i: number) => (
                                        <li key={i} style={{ marginBottom: "10px" }}>{line}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{section.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
