export default function ShopIntro() {
    return (
        <section className="container" style={{ padding: "var(--spacing-2xl) var(--spacing-md)", textAlign: "center" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h2 className="neon-text-pink" style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-md)" }}>
                    From Akihabara to the World
                </h2>
                <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: "1.8", marginBottom: "var(--spacing-xl)" }}>
                    We are a team dedicated to delivering rare and authentic anime figures directly from the heart of Tokyo.
                    No middleman, just pure passion. Our curators scour the streets of Akihabara to find the items you can't get anywhere else.
                    When you shop with <strong>Japan Anime Shoten</strong>, you are buying a piece of Japanese otaku culture.
                </p>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "var(--spacing-md)",
                    flexWrap: "wrap"
                }}>
                    {["Akihabara HQ", "Expert Curators", "Official Partners"].map((tag, i) => (
                        <span key={i} style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid var(--neon-purple)",
                            borderRadius: "50px",
                            color: "var(--neon-purple)",
                            fontSize: "0.9rem",
                            fontWeight: "bold"
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
