import React, { useState } from "react";

export default function NationalEmblem({ size = 56, light = false, showMotto = true }) {
  const [imgError, setImgError] = useState(false);
  const color = light ? "#ffffff" : "#0e2a47";
  const goldColor = light ? "#fde047" : "#b45309";

  const [srcIndex, setSrcIndex] = useState(0);
  const sources = ["/emblem-of-india.svg", "/national-emblem.png"];

  if (!imgError && srcIndex < sources.length) {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
        <img
          src={sources[srcIndex]}
          alt="State Emblem of India - सत्यमेव जयते"
          style={{
            width: `${size}px`,
            height: `${size * 1.25}px`,
            objectFit: "contain",
            filter: light ? "brightness(0) invert(1)" : "none",
            display: "block"
          }}
          onError={() => {
            if (srcIndex + 1 < sources.length) {
              setSrcIndex(srcIndex + 1);
            } else {
              setImgError(true);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", userSelect: "none" }}>
      {/* 3D Gold / White stylized Ashoka Lion Capital SVG Fallback */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="State Emblem of India"
      >
        <path
          d="M50 8C43 8 38 12 36 17C33 16 30 17 29 20C27 24 28 29 31 32C28 35 27 40 29 44C32 49 37 51 42 51C43 51 44 50 45 49C46 51 48 52 50 52C52 52 54 51 55 49C56 50 57 51 58 51C63 51 68 49 71 44C73 40 72 35 69 32C72 29 73 24 71 20C70 17 67 16 64 17C62 12 57 8 50 8Z"
          fill={color}
          opacity="0.95"
        />
        <circle cx="50" cy="24" r="5" fill={goldColor} opacity="0.9" />
        <circle cx="41" cy="23" r="3" fill={goldColor} opacity="0.9" />
        <circle cx="59" cy="23" r="3" fill={goldColor} opacity="0.9" />
        <ellipse cx="47" cy="22" rx="1.5" ry="1" fill="#ffffff" />
        <ellipse cx="53" cy="22" rx="1.5" ry="1" fill="#ffffff" />
        <polygon points="50,25 48.5,28 51.5,28" fill="#ffffff" />
        <circle cx="35" cy="26" r="2.5" fill="#ffffff" opacity="0.8" />
        <circle cx="65" cy="26" r="2.5" fill="#ffffff" opacity="0.8" />
        <rect x="24" y="52" width="52" height="6" rx="2" fill={color} />
        <circle cx="50" cy="65" r="7" stroke={color} strokeWidth="2" fill={goldColor} opacity="0.2" />
        <circle cx="50" cy="65" r="2" fill={color} />
        <line x1="50" y1="58" x2="50" y2="72" stroke={color} strokeWidth="1" />
        <line x1="43" y1="65" x2="57" y2="65" stroke={color} strokeWidth="1" />
        <ellipse cx="33" cy="65" rx="5" ry="3" fill={color} opacity="0.75" />
        <ellipse cx="67" cy="65" rx="5" ry="3" fill={color} opacity="0.75" />
        <path
          d="M26 73C26 73 35 77 50 77C65 77 74 73 74 73C74 77 68 83 50 83C32 83 26 77 26 73Z"
          fill={color}
          opacity="0.9"
        />
      </svg>
      {showMotto && (
        <span
          style={{
            fontFamily: "'Noto Sans Devanagari', 'Mukta', 'Segoe UI', serif",
            fontSize: "10px",
            fontWeight: 700,
            color: color,
            letterSpacing: "0.08em",
            marginTop: "1px",
            textTransform: "uppercase"
          }}
        >
          सत्यमेव जयते
        </span>
      )}
    </div>
  );
}
