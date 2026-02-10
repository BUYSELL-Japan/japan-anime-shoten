import { Link } from "@remix-run/react";

export default function Footer() {
    return (
        <footer style={{ background: "#111", color: "#888", padding: "60px 0 20px" }}>
            <div className="container">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
                    <div>
                        <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>About Us</h3>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                            <li><Link to="/about" style={{ color: "#888" }}>Our Story</Link></li>
                            <li><Link to="/authenticity" style={{ color: "#888" }}>Authenticity Guarantee</Link></li>
                            <li><Link to="/wholesale" style={{ color: "#888" }}>Wholesale</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>Customer Care</h3>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                            <li><Link to="/shipping" style={{ color: "#888" }}>Shipping Policy</Link></li>
                            <li><Link to="/returns" style={{ color: "#888" }}>Return Policy</Link></li>
                            <li><Link to="/faq" style={{ color: "#888" }}>FAQ</Link></li>
                            <li><Link to="/contact" style={{ color: "#888" }}>Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 style={{ color: "white", marginBottom: "20px", fontWeight: "700" }}>Newsletter</h3>
                        <p style={{ marginBottom: "16px", fontSize: "0.9rem" }}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #333", background: "#222", color: "white" }} />
                            <button className="btn-primary">Join</button>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: "20px", textAlign: "center", fontSize: "0.8rem" }}>
                    &copy; 2026 Japan Anime Shoten. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
