import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ darkMode = false }) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Language"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "6px 12px",
          borderRadius: "8px",
          border: darkMode ? "1.5px solid rgba(255, 255, 255, 0.45)" : "1px solid #cbd5e1",
          backgroundColor: darkMode ? "rgba(255, 255, 255, 0.12)" : "#ffffff",
          color: darkMode ? "#ffffff" : "#0f172a",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: darkMode ? "0 1px 4px rgba(0, 0, 0, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}
        onMouseEnter={(e) => {
          if (darkMode) {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.borderColor = "#ffffff";
          } else {
            e.currentTarget.style.borderColor = "#94a3b8";
          }
        }}
        onMouseLeave={(e) => {
          if (darkMode) {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.45)";
          } else {
            e.currentTarget.style.borderColor = "#cbd5e1";
          }
        }}
      >
        <Globe size={14} style={{ color: darkMode ? "#4ade80" : "#16a34a", flexShrink: 0 }} />
        <span style={{ color: darkMode ? "#ffffff" : "#0f172a", fontWeight: 700 }}>
          {currentObj.name}
        </span>
        <ChevronDown size={12} style={{ color: darkMode ? "#ffffff" : "#64748b", opacity: 0.9, flexShrink: 0 }} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            right: 0,
            marginTop: "6px",
            width: "170px",
            backgroundColor: darkMode ? "#0b192c" : "#ffffff",
            border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
            borderRadius: "10px",
            padding: "5px",
            listStyle: "none",
            boxShadow: darkMode ? "0 12px 32px rgba(0, 0, 0, 0.6)" : "0 12px 28px rgba(0, 0, 0, 0.12)",
            zIndex: 9999,
            maxHeight: "260px",
            overflowY: "auto"
          }}
        >
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLanguage(lang.code);
                    try {
                      localStorage.setItem("jeevika_language", lang.code);
                      localStorage.setItem("jeevika_language_chosen", "true");
                    } catch (_) {}
                    setIsOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: isSelected ? 800 : 500,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? (darkMode ? "#1e3a8a" : "#e0f2fe")
                      : "transparent",
                    color: isSelected
                      ? (darkMode ? "#93c5fd" : "#00337a")
                      : (darkMode ? "#f1f5f9" : "#0f172a"),
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.12s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = darkMode ? "#1e293b" : "#f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span>{lang.name}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      opacity: isSelected ? 0.9 : 0.6,
                      fontFamily: "monospace",
                      fontWeight: 700
                    }}
                  >
                    {lang.code.toUpperCase()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
