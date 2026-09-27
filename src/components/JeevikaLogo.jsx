import React from "react";
import officialLogo from "../assets/logo.jpeg";

/**
 * JeevikaLogo - Central Reusable Official Logo Component
 * Single source of truth for Jeevika Saathi brand logo across the entire portal.
 *
 * Supports:
 * - size: number | string (width/height in px, default: 36)
 * - className: custom CSS classes
 * - style: custom inline style overrides
 * - rounded: circular presentation (default: true)
 * - border: custom border color or boolean (default: true, #16a34a)
 * - alt: accessible image description
 * - compact: boolean for compact representation
 * - showText: optional accompanying brand text
 */
export default function JeevikaLogo({
  size = 36,
  className = "",
  style = {},
  rounded = true,
  border = true,
  alt = "Jeevika Saathi Official Logo",
  compact = false,
  showText = false,
  textClassName = "",
  ...props
}) {
  const dimension = typeof size === "number" ? `${size}px` : size;
  const borderColor = typeof border === "string" ? border : (border ? "#16a34a" : "transparent");

  const logoImg = (
    <img
      src={officialLogo}
      alt={alt}
      className={`jeevika-brand-logo ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: rounded ? "50%" : "8px",
        objectFit: "contain",
        backgroundColor: "#ffffff",
        border: border ? `1.5px solid ${borderColor}` : "none",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        flexShrink: 0,
        display: "inline-block",
        verticalAlign: "middle",
        ...style
      }}
      onError={(e) => {
        // Fallback to public path if bundler asset has any transient resolution issue
        if (e.target.src !== "/logo.jpeg") {
          e.target.src = "/logo.jpeg";
        }
      }}
      {...props}
    />
  );

  if (!showText) {
    return logoImg;
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }} className={className}>
      {logoImg}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          className={textClassName}
          style={{ fontSize: "16px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px", lineHeight: 1.2 }}
        >
          Jeevika Saathi
        </span>
        {!compact && (
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
            PM-AJAY National Portal
          </span>
        )}
      </div>
    </div>
  );
}
