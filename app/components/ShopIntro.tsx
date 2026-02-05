export default function ShopIntro() {
    return (
        <section className="container" style={{ padding: "var(--spacing-3xl) var(--spacing-md)", textAlign: "center" }}>
            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "var(--spacing-2xl)",
                border: "1px solid var(--color-gold)",
                position: "relative"
            }}>
                {/* Decorative corners */}
                <div style={{ position: "absolute", top: "-5px", left: "-5px", width: "30px", height: "30px", borderTop: "3px solid var(--color-gold)", borderLeft: "3px solid var(--color-gold)" }} />
                <div style={{ position: "absolute", top: "-5px", right: "-5px", width: "30px", height: "30px", borderTop: "3px solid var(--color-gold)", borderRight: "3px solid var(--color-gold)" }} />
                <div style={{ position: "absolute", bottom: "-5px", left: "-5px", width: "30px", height: "30px", borderBottom: "3px solid var(--color-gold)", borderLeft: "3px solid var(--color-gold)" }} />
                <div style={{ position: "absolute", bottom: "-5px", right: "-5px", width: "30px", height: "30px", borderBottom: "3px solid var(--color-gold)", borderRight: "3px solid var(--color-gold)" }} />

                <h2 className="title-serif text-gold" style={{ fontSize: "2rem", marginBottom: "var(--spacing-lg)" }}>
                    From Akihabara to the World
                </h2>
                <p style={{
                    fontSize: "1.1rem",
                    color: "var(--text-primary)",
                    lineHeight: "2",
                    marginBottom: "var(--spacing-xl)",
                    fontFamily: "'Noto Serif JP', serif"
                }}>
                    We are dedicated to delivering rare and authentic anime figures directly from the heart of Tokyo.
                    Curated with the spirit of "Omotenashi" (Japanese Hospitality).
                    When you shop with <strong className="text-gold">Japan Anime Shoten</strong>, you are securing a piece of authentic otaku culture.
                </p>
                <button className="btn-secondary">Read Our Story</button>
            </div>
        </section>
    );
}
