import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector({ darkMode }) {
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
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "8px",
          border: `1px solid ${darkMode ? "var(--border)" : "var(--border)"}`,
          backgroundColor: darkMode ? "var(--surface)" : "var(--surface)",
          color: "var(--text-primary)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "border-color 0.15s ease"
        }}
      >
        <Globe size={14} style={{ color: "var(--secondary-green)" }} />
        <span>{currentObj.name}</span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            right: 0,
            marginTop: "6px",
            width: "160px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "4px",
            listStyle: "none",
            boxShadow: "var(--shadow-lg)",
            zIndex: 100,
            maxHeight: "260px",
            overflowY: "auto"
          }}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={language === lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: language === lang.code ? 700 : 500,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: language === lang.code ? "var(--primary-green-light)" : "transparent",
                  color: language === lang.code ? "var(--secondary-green)" : "var(--text-primary)",
                  cursor: "pointer"
                }}
              >
                <span>{lang.name}</span>
                <span style={{ fontSize: "11px", opacity: 0.6, fontFamily: "monospace" }}>
                  {lang.code.toUpperCase()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
