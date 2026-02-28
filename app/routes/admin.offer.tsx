import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";

// Simple admin secret for basic security
const ADMIN_SECRET = "jas-admin-2026";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const offerId = url.searchParams.get("id");
    const secret = url.searchParams.get("key");
    const action = url.searchParams.get("action"); // approve or reject

    if (secret !== ADMIN_SECRET) {
        return json({ error: "Unauthorized", offer: null, action: null });
    }

    if (!offerId) {
        return json({ error: "No offer ID", offer: null, action: null });
    }

    const env = context.cloudflare.env as any;
    const db = env.DB;

    const offer = await db.prepare("SELECT * FROM offers WHERE id = ?").bind(offerId).first();

    if (!offer) {
        return json({ error: "Offer not found", offer: null, action: null });
    }

    return json({ error: null, offer, action });
}

export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const offerId = formData.get("offerId") as string;
    const offerAction = formData.get("action") as string;
    const secret = formData.get("secret") as string;

    if (secret !== ADMIN_SECRET) {
        return json({ error: "Unauthorized", success: false });
    }

    const env = context.cloudflare.env as any;
    const db = env.DB;

    const offer = await db.prepare("SELECT * FROM offers WHERE id = ?").bind(offerId).first() as any;

    if (!offer) {
        return json({ error: "Offer not found", success: false });
    }

    if (offer.status !== "pending") {
        return json({ error: `Offer already ${offer.status}`, success: false });
    }

    if (offerAction === "approve") {
        // Generate discount code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let discountCode = 'OFFER-';
        for (let i = 0; i < 8; i++) discountCode += chars.charAt(Math.floor(Math.random() * chars.length));

        const discountAmount = offer.original_price - offer.offer_price;

        // Create Shopify discount
        const adminToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
        const shopDomain = env.SHOPIFY_STORE_DOMAIN;

        if (adminToken && shopDomain) {
            try {
                const now = new Date().toISOString();
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

                const mutation = `
                    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
                        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                            codeDiscountNode { id }
                            userErrors { field message }
                        }
                    }
                `;

                await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': adminToken,
                    },
                    body: JSON.stringify({
                        query: mutation,
                        variables: {
                            basicCodeDiscount: {
                                title: `Offer ${discountCode} - ${offer.product_title}`,
                                code: discountCode,
                                startsAt: now,
                                endsAt: expiresAt,
                                usageLimit: 1,
                                customerSelection: { all: true },
                                customerGets: {
                                    value: { discountAmount: { amount: discountAmount.toString(), appliesOnEachItem: false } },
                                    items: { all: true }
                                }
                            }
                        }
                    }),
                });
            } catch (e) {
                console.error("Shopify discount error:", e);
            }
        }

        // Update DB
        await db.prepare(`UPDATE offers SET status = 'approved', discount_code = ?, updated_at = strftime('%s', 'now') WHERE id = ?`)
            .bind(discountCode, offerId).run();

        // Email customer
        const resendKey = env.RESEND_API_KEY;
        if (resendKey) {
            const checkoutUrl = `https://${shopDomain}/discount/${discountCode}`;
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'Japan Anime Shoten <offers@japan-anime-shoten.com>',
                    to: [offer.customer_email],
                    subject: `Your Offer Was Accepted! - ${offer.product_title}`,
                    html: `
                        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                            <h2 style="color:#e63946;">🎉 Your Offer Was Accepted!</h2>
                            <p>Great news! Your offer for <strong>${offer.product_title}</strong> has been accepted.</p>
                            <table style="border-collapse:collapse;width:100%;margin:20px 0;">
                                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Original Price</td><td style="padding:8px;border:1px solid #ddd;">${offer.currency} ${offer.original_price}</td></tr>
                                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Your Price</td><td style="padding:8px;border:1px solid #ddd;color:#e63946;font-weight:bold;">${offer.currency} ${offer.offer_price}</td></tr>
                            </table>
                            <a href="${checkoutUrl}" style="display:inline-block;background:#e63946;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Purchase Now →</a>
                            <p style="margin-top:20px;font-size:14px;color:#666;">This discount expires in 7 days and can only be used once.</p>
                        </div>
                    `,
                }),
            });
        }

        return json({ success: true, action: "approved", discountCode });

    } else if (offerAction === "reject") {
        await db.prepare(`UPDATE offers SET status = 'rejected', updated_at = strftime('%s', 'now') WHERE id = ?`)
            .bind(offerId).run();

        // Email customer
        const resendKey = env.RESEND_API_KEY;
        const shopDomain = env.SHOPIFY_STORE_DOMAIN;
        if (resendKey) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'Japan Anime Shoten <offers@japan-anime-shoten.com>',
                    to: [offer.customer_email],
                    subject: `Offer Update - ${offer.product_title}`,
                    html: `
                        <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                            <h2>Offer Update</h2>
                            <p>Thank you for your interest in <strong>${offer.product_title}</strong>.</p>
                            <p>Unfortunately, we were unable to accept your offer of <strong>${offer.currency} ${offer.offer_price}</strong> at this time.</p>
                            <p>The current price is <strong>${offer.currency} ${offer.original_price}</strong>.</p>
                            <a href="https://japan-anime-shoten.pages.dev/en/products/${offer.product_handle}" style="display:inline-block;background:#e63946;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">View Product →</a>
                        </div>
                    `,
                }),
            });
        }

        return json({ success: true, action: "rejected" });
    }

    return json({ error: "Invalid action", success: false });
}

export default function AdminOfferAction() {
    const data = useLoaderData<typeof loader>();

    if (data.error) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f5f5f5" }}>
                <div style={{ background: "white", padding: "40px", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                    <h2 style={{ color: "#e63946" }}>Error</h2>
                    <p>{data.error}</p>
                </div>
            </div>
        );
    }

    const offer = data.offer as any;
    const action = data.action;

    if (offer.status !== "pending") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f5f5f5" }}>
                <div style={{ background: "white", padding: "40px", borderRadius: "12px", textAlign: "center", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>{offer.status === "approved" ? "✅" : "❌"}</div>
                    <h2>Already {offer.status === "approved" ? "Approved" : "Rejected"}</h2>
                    <p style={{ color: "#666" }}>This offer has already been processed.</p>
                    {offer.discount_code && <p><strong>Discount Code:</strong> {offer.discount_code}</p>}
                </div>
            </div>
        );
    }

    const percentage = Math.round((offer.offer_price / offer.original_price) * 100);

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f5f5f5", padding: "20px" }}>
            <div style={{ background: "white", padding: "32px", borderRadius: "12px", maxWidth: "450px", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <h2 style={{ marginBottom: "20px", fontSize: "1.3rem" }}>📋 Offer Review</h2>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
                    <tbody>
                        <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "bold", fontSize: "0.9rem" }}>Product</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{offer.product_title}</td></tr>
                        <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "bold", fontSize: "0.9rem" }}>Original Price</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{offer.currency} {offer.original_price}</td></tr>
                        <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "bold", fontSize: "0.9rem" }}>Offer</td><td style={{ padding: "10px", borderBottom: "1px solid #eee", color: "#e63946", fontWeight: "bold" }}>{offer.currency} {offer.offer_price} ({percentage}%)</td></tr>
                        <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee", fontWeight: "bold", fontSize: "0.9rem" }}>Customer</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{offer.customer_name || "N/A"}<br /><span style={{ fontSize: "0.85rem", color: "#666" }}>{offer.customer_email}</span></td></tr>
                    </tbody>
                </table>

                <div style={{ display: "flex", gap: "12px" }}>
                    <Form method="post" style={{ flex: 1 }}>
                        <input type="hidden" name="offerId" value={offer.id} />
                        <input type="hidden" name="action" value="approve" />
                        <input type="hidden" name="secret" value={ADMIN_SECRET} />
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: "#22c55e",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "1.05rem",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                        >
                            ✅ Approve
                        </button>
                    </Form>
                    <Form method="post" style={{ flex: 1 }}>
                        <input type="hidden" name="offerId" value={offer.id} />
                        <input type="hidden" name="action" value="reject" />
                        <input type="hidden" name="secret" value={ADMIN_SECRET} />
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "1.05rem",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                        >
                            ❌ Reject
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
