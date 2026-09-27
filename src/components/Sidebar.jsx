import React from "react";
import { 
  Home, Mic, User, Compass, Sparkles, Navigation, 
  Workflow, HelpCircle, BarChart3, ShieldCheck, LogOut, 
  LogIn, X, BookOpen
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useSession } from "../context/SessionContext";
import JeevikaLogo from "./JeevikaLogo";

export default function Sidebar({ 
  userProfile,
  activePage, 
  activeTab,
  onSelectPage, 
  setActiveTab,
  onLogout,
  mobileOpen,
  setMobileOpen
}) {
  const { language } = useLanguage();
  const { beneficiaryProfile } = useSession();
  const rawActive = activePage || activeTab || "home";
  const normalizeTab = (tab) => {
    if (tab === "voice" || tab === "voice-assessment") return "voice-assessment";
    if (tab === "profile" || tab === "livelihood-profile") return "livelihood-profile";
    if (tab === "analysis" || tab === "skill-analysis") return "skill-analysis";
    if (tab === "opportunities" || tab === "nearby-opportunities") return "nearby-opportunities";
    return tab;
  };
  const currentActive = normalizeTab(rawActive);

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

  const handleSelect = (id) => {
    if (onSelectPage) onSelectPage(id);
    if (setActiveTab) setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const menuItems = [
    { 
      id: "home", 
      label: "Home", 
      icon: Home,
      color: "#1b4332",
      activeBg: "#1b4332"
    },
    { 
      id: "voice-assessment", 
      label: "Voice Assessment", 
      icon: Mic, 
      isVoiceLive: true,
      badgeText: "Live",
      color: "#e76f00",
      activeBg: "#c62828"
    },
    { 
      id: "livelihood-profile", 
      label: "Profile", 
      icon: User,
      color: "#0369a1",
      activeBg: "#0369a1"
    },
    { 
      id: "skill-analysis", 
      label: "Skill & Analysis", 
      icon: Compass,
      color: "#15803d",
      activeBg: "#15803d"
    },
    { 
      id: "recommendations", 
      label: "Recommendations", 
      icon: Sparkles,
      color: "#d97706",
      activeBg: "#b45309"
    },
    { 
      id: "nearby-opportunities", 
      label: "Nearby Opportunities", 
      icon: Navigation,
      color: "#7e22ce",
      activeBg: "#6b21a8"
    },
    { 
      id: "roadmap", 
      label: "Roadmap", 
      icon: Workflow,
      color: "#0284c7",
      activeBg: "#0284c7"
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
            transition: "opacity 0.25s ease"
          }}
        />
      )}

      {/* Vertical Navigation Sidebar matching media_1789492815602.png */}
      <aside
        className={`portal-vertical-sidebar ${mobileOpen ? "open" : ""}`}
        style={{
          width: "260px",
          backgroundColor: "#faf8f5",
          borderRight: "1px solid #e9e4dc",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          overflow: "hidden",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.04)"
        }}
        aria-label="Portal Vertical Navigation"
      >
        {/* Scrollable area */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
          {/* Top: Jeevika Saathi Logo & Branding */}
          <div
            style={{
              padding: "20px 18px",
              borderBottom: "1px solid #eee8df",
              background: "#ffffff"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Official Jeevika Saathi Website Logo */}
              <JeevikaLogo size={42} />

              <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
                  Jeevika Saathi
                </span>
              </div>
            </div>
          </div>

          {/* Vertical Menu Tabs */}
          <nav
            role="navigation"
            aria-label="Vertical Tab Navigation"
            style={{ padding: "12px 12px", display: "flex", flexDirection: "column", gap: "5px" }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActive === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`vertical-tab-btn ${isActive ? "active" : ""}`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 700 : 500,
                    textAlign: "left",
                    backgroundColor: isActive ? item.activeBg : "transparent",
                    color: isActive ? "#ffffff" : "#374151",
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: isActive ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#ede8df";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        color: isActive ? "#ffffff" : item.color
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {/* Badges: Live, Aadhaar, etc. */}
                  {item.isVoiceLive && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: isActive ? "rgba(255, 255, 255, 0.25)" : "#ffedd5",
                        color: isActive ? "#ffffff" : "#c2410c",
                        border: isActive ? "1px solid rgba(255, 255, 255, 0.4)" : "1px solid #fed7aa",
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        letterSpacing: "0.2px"
                      }}
                      className="badge-live-pulse"
                    >
                      Live
                    </span>
                  )}

                  {!item.isVoiceLive && item.badgeText && (
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 700,
                        backgroundColor: isActive 
                          ? "rgba(255, 255, 255, 0.25)" 
                          : (item.id === "login" ? "#eff6ff" : "#e0e7ff"),
                        color: isActive 
                          ? "#ffffff" 
                          : (item.id === "login" ? "#1d4ed8" : "#4338ca"),
                        border: isActive 
                          ? "1px solid rgba(255,255,255,0.4)" 
                          : (item.id === "login" ? "1px solid #bfdbfe" : "none"),
                        padding: "2px 7px",
                        borderRadius: "5px",
                        letterSpacing: "0.2px"
                      }}
                    >
                      {item.badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Section (Bottom) */}
        <div 
          style={{
            padding: "14px 16px",
            borderTop: "1px solid #e9e4dc",
            backgroundColor: "#ffffff",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              {/* Profile Circle */}
              <div 
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#047857",
                  fontWeight: 700,
                  fontSize: "14px",
                  flexShrink: 0
                }}
              >
                {initials}
              </div>
              
              {/* User Name */}
              <div style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", display: "block", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {fullName}
                </span>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  Beneficiary Account
                </span>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Logout"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  color: "#6b7280",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  transition: "all 0.2s ease",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
