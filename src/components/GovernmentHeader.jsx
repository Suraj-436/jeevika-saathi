import React from "react";
import { Volume2, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function GovernmentHeader() {
  const { language, setLanguage, t } = useLanguage();

  const handleFontSize = (size) => {
    if (typeof document !== "undefined") {
      if (size === "small") {
        document.documentElement.style.fontSize = "13.5px";
      } else if (size === "normal") {
        document.documentElement.style.fontSize = "15px";
      } else if (size === "large") {
        document.documentElement.style.fontSize = "16.5px";
      }
    }
  };

  const handleScreenReader = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const message = language === "hi"
        ? "सामाजिक न्याय और अधिकारिता मंत्रालय, भारत सरकार। पीएम-अजय जीविका साथी पोर्टल। स्क्रीन रीडर सक्रिय है।"
        : "Ministry of Social Justice and Empowerment, Government of India. PM-AJAY Jeevika Saathi Portal. Screen reader access is active.";
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <a href="#main-content" className="gov-skip-link">
        {language === "hi" ? "मुख्य सामग्री पर जाएं" : "Skip to Main Content"}
      </a>

      <div className="gov-topbar" role="region" aria-label="National Utility Bar">
        {/* Left: Government Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
          <span>{language === "hi" ? "भारत सरकार" : "Government of India"}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ fontSize: "11px", opacity: 0.85 }}>
            {language === "hi" ? "सामाजिक न्याय और अधिकारिता मंत्रालय" : "Ministry of Social Justice & Empowerment"}
          </span>
        </div>

        {/* Right: Slim Accessibility & Language Tools */}
        <div className="gov-topbar-tools">
          <a
            href="#main-content"
            className="gov-topbar-tool-btn"
            style={{ textDecoration: "none" }}
          >
            {language === "hi" ? "मुख्य सामग्री" : "Skip to Content"}
          </a>

          <span style={{ opacity: 0.3 }}>|</span>

          <button
            type="button"
            onClick={handleScreenReader}
            className="gov-topbar-tool-btn"
            title="Screen Reader Access"
          >
            <Volume2 size={12} />
            <span>Screen Reader</span>
          </button>

          <span style={{ opacity: 0.3 }}>|</span>

          {/* Font Resize Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <button
              type="button"
              onClick={() => handleFontSize("small")}
              className="gov-topbar-tool-btn"
              title="Compact Font Size"
              style={{ fontWeight: 700 }}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => handleFontSize("normal")}
              className="gov-topbar-tool-btn"
              title="Standard Font Size"
              style={{ fontWeight: 700 }}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleFontSize("large")}
              className="gov-topbar-tool-btn"
              title="Enlarged Font Size"
              style={{ fontWeight: 700 }}
            >
              A+
            </button>
          </div>

          <span style={{ opacity: 0.3 }}>|</span>

          {/* Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Globe size={12} />
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className="gov-topbar-tool-btn"
              style={{
                fontWeight: language === "hi" ? 700 : 400,
                color: language === "hi" ? "#ffffff" : "#cbd5e1",
                textDecoration: language === "hi" ? "underline" : "none"
              }}
            >
              हिन्दी
            </button>
            <span style={{ opacity: 0.4 }}>/</span>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className="gov-topbar-tool-btn"
              style={{
                fontWeight: language === "en" ? 700 : 400,
                color: language === "en" ? "#ffffff" : "#cbd5e1",
                textDecoration: language === "en" ? "underline" : "none"
              }}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
