import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    locale: string;
}

export default function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
    const { t } = useTranslation();

    return (
        <nav aria-label="Breadcrumb" style={{ marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <li style={{ display: "flex", alignItems: "center" }}>
                    <Link to={`/${locale}`} style={{ color: "inherit" }}>{t("home", { defaultValue: "Home" })}</Link>
                    <span style={{ marginLeft: "8px" }}>/</span>
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} style={{ display: "flex", alignItems: "center" }}>
                            {isLast || !item.to ? (
                                <span style={{ fontWeight: isLast ? "600" : "normal", color: isLast ? "#333" : "inherit" }}>
                                    {item.label}
                                </span>
                            ) : (
                                <>
                                    <Link to={item.to} style={{ color: "inherit" }}>{item.label}</Link>
                                    <span style={{ marginLeft: "8px" }}>/</span>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
