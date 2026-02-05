export default function ShopIntro() {
    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) 0", textAlign: "center" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h2 className="title-main" style={{ marginBottom: "var(--spacing-md)" }}>
                    The Best Japanese Goods, <span className="text-red">Directly To You</span>
                </h2>
                <p style={{
                    fontSize: "1.1rem",
                    color: "var(--color-text-light)",
                    marginBottom: "var(--spacing-lg)"
                }}>
                    Japan Anime Shoten is your premier destination for authentic anime figures, trading cards, and exclusive merchandise.
                    Sourced directly from Tokyo, we ensure every item is 100% genuine and shipped with care.
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <button className="btn-primary">View New Arrivals</button>
                    <button className="btn-secondary">About Us</button>
                </div>
            </div>
        </section>
    );
}
