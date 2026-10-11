import React, { useState, useRef, useEffect } from "react";
import { 
  Home, Info, Mic, User, Compass, Sparkles, 
  MapPin, Workflow, HelpCircle, BarChart3, ChevronDown, Menu 
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar({ 
  activePage, 
  onSelectPage,
  onToggleSidebar 
}) {
  const { t, language } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primaryItems = [
    { id: "home", label: t("home") || "Home" },
    { id: "about", label: t("about") || "About PM-AJAY" },
    { id: "voice-assessment", label: t("voiceAssessment") || "Voice Assessment" },
    { id: "livelihood-profile", label: t("livelihoodProfile") || "My Profile" },
    { id: "skill-analysis", label: t("skillAnalysis") || "Skill Analysis" },
    { id: "recommendations", label: t("recommendations") || "Recommendations" },
    { id: "nearby-opportunities", label: t("nearbyOpportunities") || "Opportunities" },
    { id: "roadmap", label: t("roadmap") || "Roadmap" },
    { id: "help", label: t("help") || "Help" },
  ];

  const moreItems = [
    { id: "monitoring", label: t("monitoring") || "Monitoring MIS" }
  ];

  return (
    <nav className="gov-navbar" role="navigation" aria-label="Primary Navigation">
      <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
        {/* Navigation Items (Max 9 calm items) */}
        <ul className="gov-nav-list">
          {primaryItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <li key={item.id} style={{ display: "flex" }}>
                <button
                  type="button"
                  onClick={() => onSelectPage(item.id)}
                  className={`gov-nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </button>
              </li>
            );
          })}

          {/* More Dropdown for secondary MIS / Tools */}
          <li style={{ position: "relative", display: "flex" }} ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className={`gov-nav-item ${activePage === "monitoring" ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span>{language === "hi" ? "अधिक" : "More"}</span>
              <ChevronDown size={13} style={{ transform: moreOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
            </button>

            {moreOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  backgroundColor: "#063B5C",
                  border: "1px solid #084c75",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  zIndex: 100,
                  minWidth: "160px",
                  borderRadius: "0 0 4px 4px"
                }}
              >
                {moreItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectPage(item.id);
                      setMoreOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      color: activePage === item.id ? "#F28C28" : "#ffffff",
                      fontSize: "13px",
                      fontWeight: activePage === item.id ? 700 : 500,
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#084c75"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <BarChart3 size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Mobile menu drawer toggle button */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Drawer"
            style={{
              display: "none",
              color: "#ffffff",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600
            }}
          >
            <Menu size={16} />
            <span>Menu</span>
          </button>
        )}
      </div>
    </nav>
  );
}
