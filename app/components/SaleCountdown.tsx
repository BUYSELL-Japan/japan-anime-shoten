import { useState, useEffect } from "react";
import { useParams } from "@remix-run/react";
import { SALE_CONFIG, isSaleActive, getTimeRemaining } from "~/utils/saleConfig";

export default function SaleCountdown() {
    const { lang } = useParams();
    const locale = lang || "en";
    const [time, setTime] = useState(getTimeRemaining());
    const [active, setActive] = useState(false);

    useEffect(() => {
        setActive(isSaleActive());
        if (!isSaleActive()) return;

        const timer = setInterval(() => {
            const remaining = getTimeRemaining();
            setTime(remaining);
            if (remaining.total <= 0) {
                setActive(false);
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!active) return null;

    const isUrgent = time.total > 0 && time.days === 0;

    const labels: Record<string, { d: string; h: string; m: string; s: string }> = {
        en: { d: "Days", h: "Hours", m: "Min", s: "Sec" },
        ja: { d: "日", h: "時間", m: "分", s: "秒" },
        ko: { d: "일", h: "시간", m: "분", s: "초" },
        th: { d: "วัน", h: "ชม.", m: "นาที", s: "วิ" },
        "zh-CN": { d: "天", h: "时", m: "分", s: "秒" },
        "zh-TW": { d: "天", h: "時", m: "分", s: "秒" },
    };

    const saleEndLabel: Record<string, string> = {
        en: "Sale Ends In",
        ja: "セール終了まで",
        ko: "세일 종료까지",
        th: "เซลสิ้นสุดใน",
        "zh-CN": "特卖倒计时",
        "zh-TW": "特賣倒計時",
    };

    const l = labels[locale] || labels.en;

    const pad = (n: number) => String(n).padStart(2, "0");

    const TimeBox = ({ value, label }: { value: string; label: string }) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
                style={{
                    background: isUrgent ? "#e63946" : "#1a1a2e",
                    color: "#fff",
                    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                    fontWeight: "900",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    minWidth: "52px",
                    textAlign: "center",
                    fontFamily: "'Courier New', monospace",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    animation: isUrgent ? "salePulse 1s ease-in-out infinite" : "none",
                }}
            >
                {value}
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: "600", marginTop: "4px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>
                {label}
            </span>
        </div>
    );

    const Separator = () => (
        <div style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: "900", color: "#e63946", alignSelf: "flex-start", paddingTop: "8px" }}>:</div>
    );

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)",
                border: "2px dashed #e63946",
                borderRadius: "12px",
                padding: "20px",
                margin: "20px auto",
                maxWidth: "500px",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#e63946", marginBottom: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>
                ⏰ {saleEndLabel[locale] || saleEndLabel.en}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", alignItems: "flex-start" }}>
                <TimeBox value={pad(time.days)} label={l.d} />
                <Separator />
                <TimeBox value={pad(time.hours)} label={l.h} />
                <Separator />
                <TimeBox value={pad(time.minutes)} label={l.m} />
                <Separator />
                <TimeBox value={pad(time.seconds)} label={l.s} />
            </div>
        </div>
    );
}
