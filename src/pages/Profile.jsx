import React from "react";
import ProfileCard from "../components/ProfileCard";
import { useLanguage } from "../context/LanguageContext";
import { useSession } from "../context/SessionContext";
import { User, Download, Mic, Briefcase, Target, MapPin, CheckCircle } from "lucide-react";
import { normalizeBeneficiaryProfile } from "../utils/normalizeProfile";

export default function Profile({ userProfile, onStartVoice }) {
  const { t } = useLanguage();
  const { beneficiaryProfile } = useSession();
  
  const combinedProfile = { ...userProfile, ...beneficiaryProfile };
  const profile = normalizeBeneficiaryProfile(combinedProfile);

  return (
    <div style={{ 
      maxWidth: "1440px", 
      margin: "0 auto", 
      padding: "24px",
      display: "flex", 
      flexDirection: "column", 
      gap: "24px",
      paddingBottom: "120px" // For floating controls
    }}>
      
      {/* 1. Premium Identity Header */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "24px",
        border: "1px solid var(--border-light)"
      }}>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "var(--govt-navy)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "700",
            boxShadow: "var(--shadow-sm)"
          }}>
            {profile.initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Livelihood Profile
              </span>
              {profile.verified && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "var(--tricolour-green-light)", color: "var(--tricolour-green-dark)", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700" }}>
                  <CheckCircle size={10} /> {profile.method}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-dark)", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>
              {profile.name}
            </h1>
            <div style={{ fontSize: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} /> {profile.district}
              </span>
              <span>ID: <strong style={{color:"var(--text-dark)"}}>{profile.id}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
          <button 
            onClick={onStartVoice}
            style={{
              background: "var(--govt-blue-accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.2s"
            }}
          >
            <Mic size={18} /> Update via Voice
          </button>
          <button 
            onClick={() => alert("Downloading Official PM-AJAY Beneficiary Dossier (PDF)...")}
            style={{
              background: "transparent",
              color: "var(--text-body)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px 24px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            <Download size={14} /> Download Dossier (PDF)
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        
        {/* Profile Completion Card */}
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-xs)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.5px" }}>PROFILE COMPLETION</span>
            <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--govt-blue)" }}>{profile.completion}%</span>
          </div>
          <div style={{ height: "8px", background: "var(--surface-hover)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ height: "100%", width: `${profile.completion}%`, background: "linear-gradient(90deg, var(--govt-blue), var(--govt-blue-accent))", borderRadius: "4px" }}></div>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
            Complete a few more details to improve your livelihood analysis.
          </p>
        </div>

        {/* Status Card */}
        <div style={{ background: "linear-gradient(135deg, var(--govt-navy), var(--govt-blue))", borderRadius: "12px", padding: "24px", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          <div style={{ position: "absolute", right: "-20px", top: "-20px", opacity: 0.1 }}>
            <CheckCircle size={120} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px", marginBottom: "8px" }}>GIA STATUS</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "50%" }}>
              <CheckCircle size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800", lineHeight: "1.2" }}>{profile.status}</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>{profile.statusPercentage} Entitled</div>
            </div>
          </div>
        </div>

        {/* Current Livelihood Highlight */}
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-xs)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
             <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Current Livelihood</div>
             <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
               <Briefcase size={16} color="var(--govt-blue-accent)" /> {profile.currentLivelihood}
             </div>
          </div>
          <div style={{ height: "1px", background: "var(--border-light)" }}></div>
          <div>
             <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px", letterSpacing: "0.5px" }}>Aspiration</div>
             <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
               <Target size={16} color="var(--tricolour-saffron)" /> {profile.aspiration}
             </div>
          </div>
        </div>

      </div>

      {/* Main Details Grid */}
      <ProfileCard userProfile={combinedProfile} />
      
    </div>
  );
}
