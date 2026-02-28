import { useState } from "react";
import { useTranslation } from "react-i18next";

interface MakeOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productTitle: string;
    productHandle: string;
    originalPrice: number;
    currency: string;
    currencySymbol: string;
    lang: string;
}

export default function MakeOfferModal({
    isOpen,
    onClose,
    productId,
    productTitle,
    productHandle,
    originalPrice,
    currency,
    currencySymbol,
    lang,
}: MakeOfferModalProps) {
    const { t } = useTranslation();
    const [offerPrice, setOfferPrice] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMsg("");

        const priceNum = parseFloat(offerPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            setErrorMsg(t("offer_error_invalid_price", { defaultValue: "Please enter a valid price." }));
            setStatus("error");
            return;
        }

        if (priceNum >= originalPrice) {
            setErrorMsg(t("offer_error_too_high", { defaultValue: "Offer must be lower than the current price." }));
            setStatus("error");
            return;
        }

        if (!email || !email.includes("@")) {
            setErrorMsg(t("offer_error_invalid_email", { defaultValue: "Please enter a valid email address." }));
            setStatus("error");
            return;
        }

        try {
            const res = await fetch(`/api/offers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    productTitle,
                    productHandle,
                    originalPrice,
                    offerPrice: priceNum,
                    currency,
                    customerEmail: email,
                    customerName: name,
                }),
            });

            if (res.ok) {
                setStatus("success");
            } else {
                const data = await res.json() as any;
                setErrorMsg(data.error || "Failed to submit offer");
                setStatus("error");
            }
        } catch (err) {
            setErrorMsg("Network error. Please try again.");
            setStatus("error");
        }
    };

    const handleClose = () => {
        setStatus("idle");
        setOfferPrice("");
        setEmail("");
        setName("");
        setErrorMsg("");
        onClose();
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 9998,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
            onClick={handleClose}
        >
            <div
                style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "32px",
                    maxWidth: "450px",
                    width: "100%",
                    position: "relative",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        color: "#666",
                        lineHeight: 1,
                    }}
                >
                    &times;
                </button>

                {status === "success" ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "12px" }}>
                            {t("offer_submitted_title", { defaultValue: "Offer Submitted!" })}
                        </h3>
                        <p style={{ color: "#666", lineHeight: "1.6" }}>
                            {t("offer_submitted_message", { defaultValue: "We'll review your offer and get back to you via email." })}
                        </p>
                        <button
                            onClick={handleClose}
                            style={{
                                marginTop: "20px",
                                padding: "12px 32px",
                                background: "var(--color-primary, #e63946)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "1rem",
                            }}
                        >
                            {t("close", { defaultValue: "Close" })}
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "4px" }}>
                            {t("make_offer", { defaultValue: "Make an Offer" })}
                        </h3>
                        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>
                            {productTitle}
                        </p>

                        <div
                            style={{
                                background: "#f8f8f8",
                                borderRadius: "8px",
                                padding: "12px 16px",
                                marginBottom: "20px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ fontSize: "0.85rem", color: "#666" }}>
                                {t("current_price", { defaultValue: "Current Price" })}
                            </span>
                            <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--color-primary, #e63946)" }}>
                                {currencySymbol}{originalPrice.toLocaleString()}
                            </span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    htmlFor="offer-price"
                                    style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}
                                >
                                    {t("offer_your_price", { defaultValue: "Your Offer Price" })} ({currency})
                                </label>
                                <div style={{ position: "relative" }}>
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: "12px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#666",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {currencySymbol}
                                    </span>
                                    <input
                                        id="offer-price"
                                        type="number"
                                        step="any"
                                        min="1"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        required
                                        placeholder="0"
                                        style={{
                                            width: "100%",
                                            padding: "12px 12px 12px 32px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "1.1rem",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    htmlFor="offer-email"
                                    style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}
                                >
                                    {t("offer_email", { defaultValue: "Email Address" })} *
                                </label>
                                <input
                                    id="offer-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "1rem",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label
                                    htmlFor="offer-name"
                                    style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}
                                >
                                    {t("offer_name", { defaultValue: "Name" })} ({t("optional", { defaultValue: "optional" })})
                                </label>
                                <input
                                    id="offer-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "1rem",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            {errorMsg && (
                                <div
                                    style={{
                                        background: "#fff0f0",
                                        color: "#e63946",
                                        padding: "10px 14px",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                        marginBottom: "16px",
                                    }}
                                >
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    background: status === "submitting" ? "#ccc" : "var(--color-primary, #e63946)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "1.05rem",
                                    fontWeight: "700",
                                    cursor: status === "submitting" ? "not-allowed" : "pointer",
                                    transition: "background 0.2s",
                                }}
                            >
                                {status === "submitting"
                                    ? t("submitting", { defaultValue: "Submitting..." })
                                    : t("submit_offer", { defaultValue: "Submit Offer" })}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
