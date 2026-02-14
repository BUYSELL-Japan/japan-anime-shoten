import { useTranslation } from "react-i18next";

export default function ShopIntro() {
    const { t } = useTranslation();

    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) 0", textAlign: "center" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h2 className="title-main" style={{ marginBottom: "var(--spacing-md)" }}>
                    {t("shop_intro_title_main")} <span className="text-red">{t("shop_intro_title_highlight")}</span>
                </h2>
                <p style={{
                    fontSize: "1.1rem",
                    color: "var(--color-text-light)",
                    marginBottom: "var(--spacing-lg)"
                }}>
                    {t("shop_intro_text")}
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button className="btn-primary">{t("btn_view_new_arrivals")}</button>
                    <button className="btn-secondary">{t("btn_about_us")}</button>
                </div>
            </div>
        </section>
    );
}
