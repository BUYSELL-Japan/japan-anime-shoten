import { Link } from "@remix-run/react";

import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer style={{ background: "#111", color: "#888", padding: "60px 0 20px" }}>
            <div className="container">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
                    <div>
                        <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>{t('footer_about_us')}</h3>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                            <li><Link to="/about" style={{ color: "#888" }}>{t('footer_our_story')}</Link></li>
                            <li><Link to="/authenticity" style={{ color: "#888" }}>{t('footer_authenticity')}</Link></li>
                            <li><Link to="/wholesale" style={{ color: "#888" }}>{t('footer_wholesale')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>{t('footer_customer_care')}</h3>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                            <li><Link to="/policies/shipping-policy" style={{ color: "#888" }}>{t('footer_shipping_policy')}</Link></li>
                            <li><Link to="/policies/refund-policy" style={{ color: "#888" }}>{t('footer_return_policy')}</Link></li>
                            <li><Link to="/policies/privacy-policy" style={{ color: "#888" }}>{t('policies.privacy.title')}</Link></li>
                            <li><Link to="/policies/terms-of-service" style={{ color: "#888" }}>{t('policies.terms.title')}</Link></li>
                            <li><Link to="/policies/legal-notice" style={{ color: "#888" }}>{t('policies.legal.title')}</Link></li>
                            {/* <li><Link to="/contact" style={{ color: "#888" }}>{t('footer_contact_us')}</Link></li> */}
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>{t('footer_newsletter')}</h3>
                        <p style={{ marginBottom: "16px", fontSize: "0.9rem" }}>{t('footer_subscribe_text')}</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input type="email" placeholder={t('footer_email_placeholder')} style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "white" }} />
                            <button className="btn-primary">{t('footer_join')}</button>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "20px", textAlign: "center", fontSize: "0.8rem" }}>
                    {t('footer_copyright')}
                </div>
            </div>
        </footer>
    );
}
