import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, User, LogOut, Eye, Mic, Menu, X, 
  ShieldCheck, LogIn, Sparkles, Globe, BookOpen
} from "lucide-react";
import NationalEmblem from "./NationalEmblem";
import JeevikaLogo from "./JeevikaLogo";
import { useLanguage } from "../context/LanguageContext";
import { useSession } from "../context/SessionContext";

export default function Header({ 
  userProfile, 
  onLogout, 
  activePage, 
  onSelectPage,
  onToggleMobile
}) {
  const { language, setLanguage } = useLanguage();
  const { beneficiaryProfile } = useSession();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const profileRef = useRef(null);

  // Safely extract name and generate initials
  const combinedProfile = { ...userProfile, ...beneficiaryProfile };
  const fullName = combinedProfile.name || combinedProfile.full_name || "Beneficiary";
  
  let initials = "B";
  const parts = fullName.trim().split(" ");
  if (parts.length > 1) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (fullName.length > 0) {
    initials = fullName.substring(0, 2).toUpperCase();
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFontSize = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === "large") root.style.fontSize = "17px";
    else if (size === "largest") root.style.fontSize = "19px";
    else root.style.fontSize = "15px";
  };

  return (
    <>
      {/* Hide hamburger on desktop using an injected style to satisfy "desktop hamburger removal" while preserving mobile toggle */}
      <style>{`
        @media (min-width: 1025px) {
          .mobile-menu-toggle { display: none !important; }
        }
      `}</style>

      {/* TIER 1: National Tricolour Strip */}
      <div className="top-tricolor-strip" />

      {/* TIER 2: Government Identity & Accessibility Toolbar */}
      <div className="top-accessibility-bar">
        <div className="national-container">
          <div className="top-accessibility-inner">
            {/* Left: National Emblem & Department Title */}
            <div className="top-gov-identity">
              <NationalEmblem size={22} light={true} showMotto={false} />
              <div className="top-gov-text">
                <span className="top-gov-title">
                  भारत सरकार | GOVERNMENT OF INDIA
                </span>
                <span style={{ margin: "0 6px", opacity: 0.5 }}>•</span>
                <span className="top-gov-dept">
                  Ministry of Social Justice & Empowerment
                </span>
              </div>
            </div>

            {/* Right: Accessibility Toolbar ONLY */}
            <div className="top-tools">
              {/* Font Size A- A A+ */}
              <div className="font-size-group" title="Adjust Text Size">
                <button
                  type="button"
                  onClick={() => handleFontSize("normal")}
                  className={`font-btn ${fontSize === "normal" ? "active" : ""}`}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSize("large")}
                  className={`font-btn ${fontSize === "large" ? "active" : ""}`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSize("largest")}
                  className={`font-btn ${fontSize === "largest" ? "active" : ""}`}
                >
                  A+
                </button>
              </div>

              {/* Screen Reader Access */}
              <button
                type="button"
                className="tool-link-btn"
                title="Screen Reader Access"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    const utter = new SpeechSynthesisUtterance("Screen reader mode active. Welcome to Jeevika Saathi National Portal.");
                    window.speechSynthesis.speak(utter);
                  }
                }}
              >
                <Eye size={12} />
                <span>Screen Reader</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 3: Top Navigation Bar (White Bar) */}
      <header className="national-nav-header">
        <div className="national-container">
          <div className="national-nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            
            {/* Left: Brand / Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={onToggleMobile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#0f172a"
                }}
                className="mobile-menu-toggle"
                title="Toggle Vertical Navigation"
              >
                <Menu size={20} />
              </button>

              <div 
                className="portal-brand-link"
                onClick={() => onSelectPage("home")}
                title="Go to National Portal Home"
                style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
              >
                <NationalEmblem size={32} light={false} showMotto={false} />
                <JeevikaLogo size={36} style={{ marginLeft: "2px" }} />
                <div className="portal-brand-titles">
                  <div className="brand-portal-name">
                    <span>Jeevika Saathi</span>
                    <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#15803d", padding: "1px 6px", borderRadius: "4px", border: "1px solid #bbf7d0", fontWeight: 700 }}>
                      PM-AJAY GIA
                    </span>
                  </div>
                  <div className="brand-portal-sub">
                    National Livelihood & Skilling Portal
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Language and User Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              
              {/* Language Switcher */}
              <div style={{ display: "flex", gap: "1px" }}>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  style={{
                    background: language === "en" ? "#00337a" : "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    color: language === "en" ? "#ffffff" : "#475569",
                    padding: "4px 12px",
                    borderRadius: "6px 0 0 6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: language === "en" ? 700 : 600,
                    transition: "all 0.15s ease"
                  }}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  style={{
                    background: language === "hi" ? "#00337a" : "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    color: language === "hi" ? "#ffffff" : "#475569",
                    padding: "4px 12px",
                    borderRadius: "0 6px 6px 0",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: language === "hi" ? 700 : 600,
                    transition: "all 0.15s ease"
                  }}
                >
                  हिन्दी
                </button>
              </div>

              {/* Logged-in User Profile */}
              {userProfile && (
                <div ref={profileRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      color: "#0f172a",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: "#00337a",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {initials || "RK"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                       <span>{fullName}</span>
                       <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 500 }}>Beneficiary</span>
                    </div>
                    <ChevronDown size={14} style={{ color: "#64748b" }} />
                  </button>

                  {profileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.18)",
                        width: "230px",
                        zIndex: 200,
                        padding: "12px",
                        color: "#0f172a"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#1e3a8a",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700 }}>{fullName}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{userProfile.district || "Agra, UP"}</div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#16a34a", fontWeight: 600, marginTop: "2px" }}>
                            <ShieldCheck size={11} /> {userProfile.method || "Aadhaar Verified"}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: "8px 0" }}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPage("livelihood-profile");
                            setProfileOpen(false);
                          }}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            padding: "7px 10px",
                            textAlign: "left",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#334155",
                            cursor: "pointer",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <User size={13} /> View Livelihood Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectPage("login");
                            setProfileOpen(false);
                          }}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            padding: "7px 10px",
                            textAlign: "left",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#00337a",
                            cursor: "pointer",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <LogIn size={13} /> Switch Account
                        </button>
                      </div>

                      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            onLogout();
                          }}
                          style={{
                            width: "100%",
                            background: "transparent",
                            border: "none",
                            padding: "7px 10px",
                            textAlign: "left",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#dc2626",
                            cursor: "pointer",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <LogOut size={13} /> Exit / Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </header>
    </>
  );
}
