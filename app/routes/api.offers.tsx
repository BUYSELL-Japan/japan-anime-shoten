import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

function generateId(): string {
    return crypto.randomUUID();
}

function generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'OFFER-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// POST: Submit a new offer
// GET: List offers (admin)
// PUT: Approve/Reject an offer
export async function action({ request, context }: ActionFunctionArgs) {
    const env = context.cloudflare.env as any;
    const db = env.DB;
    const method = request.method;

    if (method === "POST") {
        // Submit new offer
        const body = await request.json() as any;
        const { productId, productTitle, productHandle, originalPrice, offerPrice, currency, customerEmail, customerName } = body;

        if (!productId || !offerPrice || !customerEmail) {
            return json({ error: "Missing required fields" }, { status: 400 });
        }

        if (offerPrice <= 0 || offerPrice >= originalPrice) {
            return json({ error: "Offer price must be less than the original price" }, { status: 400 });
        }

        const id = generateId();

        try {
            await db.prepare(`
                INSERT INTO offers (id, product_id, product_title, product_handle, original_price, offer_price, currency, customer_email, customer_name, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            `).bind(id, productId, productTitle, productHandle, originalPrice, offerPrice, currency || 'JPY', customerEmail, customerName || '').run();

            // Send admin notification email via Resend
            const resendKey = env.RESEND_API_KEY;
            if (resendKey) {
                try {
                    const percentage = Math.round((offerPrice / originalPrice) * 100);
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            from: 'Japan Anime Shoten <offers@japan-anime-shoten.com>',
                            to: ['japan.anime.shoten@gmail.com'],
                            subject: `New Offer: ${productTitle} - ${currency || 'JPY'} ${offerPrice}`,
                            html: `
                                <h2>New Offer Received</h2>
                                <table style="border-collapse:collapse;width:100%;max-width:500px;">
                                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Product</td><td style="padding:8px;border:1px solid #ddd;">${productTitle}</td></tr>
                                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Original Price</td><td style="padding:8px;border:1px solid #ddd;">${currency || 'JPY'} ${originalPrice}</td></tr>
                                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Offer Price</td><td style="padding:8px;border:1px solid #ddd;">${currency || 'JPY'} ${offerPrice} (${percentage}%)</td></tr>
                                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Customer</td><td style="padding:8px;border:1px solid #ddd;">${customerName || 'N/A'} (${customerEmail})</td></tr>
                                </table>
                                <p style="margin-top:20px;">Manage this offer in your admin dashboard.</p>
                            `,
                        }),
                    });
                } catch (emailErr) {
                    console.error("Failed to send admin notification email:", emailErr);
                }
            }

            return json({ success: true, offerId: id });
        } catch (err) {
            console.error("Failed to create offer:", err);
            return json({ error: "Failed to submit offer" }, { status: 500 });
        }
    }

    if (method === "PUT") {
        // Approve or reject an offer
        const body = await request.json() as any;
        const { offerId, action: offerAction, adminNote } = body;

        if (!offerId || !offerAction) {
            return json({ error: "Missing offerId or action" }, { status: 400 });
        }

        try {
            // Get offer details
            const offer = await db.prepare("SELECT * FROM offers WHERE id = ?").bind(offerId).first();
            if (!offer) {
                return json({ error: "Offer not found" }, { status: 404 });
            }

            if (offerAction === "approve") {
                const discountCode = generateDiscountCode();
                const discountAmount = (offer as any).original_price - (offer as any).offer_price;
                const shopifyProductId = (offer as any).product_id;

                // Create Shopify discount code via Admin API
                let shopifySuccess = false;
                const adminToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
                const shopDomain = env.SHOPIFY_STORE_DOMAIN;

                if (adminToken && shopDomain) {
                    try {
                        const now = new Date().toISOString();
                        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

                        const discountMutation = `
                            mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
                                discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                                    codeDiscountNode { id }
                                    userErrors { field message }
                                }
                            }
                        `;

                        const discountVars = {
                            basicCodeDiscount: {
                                title: `Offer ${discountCode} - ${(offer as any).product_title}`,
                                code: discountCode,
                                startsAt: now,
                                endsAt: expiresAt,
                                usageLimit: 1,
                                customerSelection: { all: true },
                                customerGets: {
                                    value: {
                                        discountAmount: {
                                            amount: discountAmount.toString(),
                                            appliesOnEachItem: false
                                        }
                                    },
                                    items: { all: true }
                                }
                            }
                        };

                        const shopifyRes = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Shopify-Access-Token': adminToken,
                            },
                            body: JSON.stringify({ query: discountMutation, variables: discountVars }),
                        });

                        const shopifyData = await shopifyRes.json() as any;
                        if (shopifyData.data?.discountCodeBasicCreate?.codeDiscountNode?.id) {
                            shopifySuccess = true;
                        } else {
                            console.error("Shopify discount creation failed:", JSON.stringify(shopifyData));
                        }
                    } catch (shopifyErr) {
                        console.error("Shopify API error:", shopifyErr);
                    }
                }

                // Update offer in DB
                await db.prepare(`
                    UPDATE offers SET status = 'approved', discount_code = ?, admin_note = ?, updated_at = strftime('%s', 'now')
                    WHERE id = ?
                `).bind(discountCode, adminNote || '', offerId).run();

                // Send approval email to customer
                const resendKey = env.RESEND_API_KEY;
                if (resendKey) {
                    const productHandle = (offer as any).product_handle;
                    const checkoutUrl = `https://${shopDomain}/discount/${discountCode}`;

                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            from: 'Japan Anime Shoten <offers@japan-anime-shoten.com>',
                            to: [(offer as any).customer_email],
                            subject: `Your Offer Was Accepted! - ${(offer as any).product_title}`,
                            html: `
                                <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                                    <h2 style="color:#e63946;">🎉 Your Offer Was Accepted!</h2>
                                    <p>Great news! Your offer for <strong>${(offer as any).product_title}</strong> has been accepted.</p>
                                    <table style="border-collapse:collapse;width:100%;margin:20px 0;">
                                        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Original Price</td><td style="padding:8px;border:1px solid #ddd;">${(offer as any).currency} ${(offer as any).original_price}</td></tr>
                                        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Your Offer</td><td style="padding:8px;border:1px solid #ddd;color:#e63946;font-weight:bold;">${(offer as any).currency} ${(offer as any).offer_price}</td></tr>
                                        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Discount Code</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${discountCode}</td></tr>
                                    </table>
                                    <p>Click the button below to purchase at your offer price:</p>
                                    <a href="${checkoutUrl}" style="display:inline-block;background:#e63946;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Purchase Now →</a>
                                    <p style="margin-top:20px;font-size:14px;color:#666;">This discount code expires in 7 days and can only be used once.</p>
                                </div>
                            `,
                        }),
                    });
                }

                return json({ success: true, discountCode, shopifySuccess });

            } else if (offerAction === "reject") {
                await db.prepare(`
                    UPDATE offers SET status = 'rejected', admin_note = ?, updated_at = strftime('%s', 'now')
                    WHERE id = ?
                `).bind(adminNote || '', offerId).run();

                // Send rejection email to customer
                const resendKey = env.RESEND_API_KEY;
                if (resendKey) {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            from: 'Japan Anime Shoten <offers@japan-anime-shoten.com>',
                            to: [(offer as any).customer_email],
                            subject: `Offer Update - ${(offer as any).product_title}`,
                            html: `
                                <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
                                    <h2>Offer Update</h2>
                                    <p>Thank you for your interest in <strong>${(offer as any).product_title}</strong>.</p>
                                    <p>Unfortunately, we were unable to accept your offer of <strong>${(offer as any).currency} ${(offer as any).offer_price}</strong> at this time.</p>
                                    <p>The current price is <strong>${(offer as any).currency} ${(offer as any).original_price}</strong>.</p>
                                    <p>Feel free to submit a new offer or purchase at the listed price.</p>
                                    <a href="https://japan-anime-shoten.pages.dev/en/products/${(offer as any).product_handle}" style="display:inline-block;background:#e63946;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">View Product →</a>
                                </div>
                            `,
                        }),
                    });
                }

                return json({ success: true });
            }
        } catch (err) {
            console.error("Failed to process offer:", err);
            return json({ error: "Failed to process offer" }, { status: 500 });
        }
    }

    return json({ error: "Method not allowed" }, { status: 405 });
}

// GET: List offers (admin)
export async function loader({ request, context }: LoaderFunctionArgs) {
    const env = context.cloudflare.env as any;
    const db = env.DB;
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";

    try {
        let query = "SELECT * FROM offers";
        if (status !== "all") {
            query += ` WHERE status = '${status}'`;
        }
        query += " ORDER BY created_at DESC LIMIT 100";

        const result = await db.prepare(query).all();
        return json({ offers: result.results || [] });
    } catch (err) {
        console.error("Failed to fetch offers:", err);
        return json({ offers: [] });
    }
}
