import React, { useState, useMemo } from "react";
import { 
  MapPin, Search, CheckCircle2, Navigation, Compass, 
  Map, AlertCircle, Building2, BookOpen, ShieldCheck, Lock, Mic, ShieldAlert, Award
} from "lucide-react";
import { normalizeBeneficiaryProfile } from "../utils/normalizeProfile";
import { useSession } from "../context/SessionContext";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function Opportunities({ userProfile, onStartVoice }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    beneficiaryProfile, 
    isVoiceAssessmentCompleted, 
    voiceAssessmentStatus, 
    skillVerificationStatus, 
    verifiedTrade 
  } = useSession();

  const isUnlocked = isVoiceAssessmentCompleted || voiceAssessmentStatus === "COMPLETED";
  const isVerified = (skillVerificationStatus === "VERIFIED") || (beneficiaryProfile?.verification_status === "VERIFIED") || (userProfile?.verification_status === "VERIFIED");
  const activeTrade = verifiedTrade || beneficiaryProfile?.verified_trade || (beneficiaryProfile?.interests?.[0]) || beneficiaryProfile?.career_aspiration || "Plumbing & Technical Trades";

  const norm = normalizeBeneficiaryProfile({ ...userProfile, ...beneficiaryProfile });
  
  const [districtFilter, setDistrictFilter] = useState("Agra");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reservedCenters, setReservedCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState("center-01");

  const mapLocations = {
    "center-01": {
      name: "Sanjay Place Commercial & Skilling Hub",
      address: "Sanjay Place, Civil Lines, Agra, Uttar Pradesh 282002",
      query: "Sanjay+Place+Agra+Uttar+Pradesh",
      distance: "4.8 km from Bichpuri",
      commute: "18 mins via E-Rickshaw",
      type: "PMKK Center",
      trade: "Solar Electrician"
    },
    "center-02": {
      name: "Nunhai Industrial Leather & Footwear Complex",
      address: "Nunhai Industrial Area, Agra, Uttar Pradesh 282006",
      query: "Nunhai+Industrial+Area+Agra",
      distance: "8.2 km from Bichpuri",
      commute: "28 mins via Bus Route",
      type: "Industrial Cluster",
      trade: "Footwear Artisan"
    },
    "center-03": {
      name: "Fatehabad Road Rural Skilling Institute",
      address: "Fatehabad Road, Near Sub-Divisional Hospital, Agra 283111",
      query: "Fatehabad+Road+Agra",
      distance: "12.5 km from Bichpuri",
      commute: "35 mins via Rural Transport",
      type: "Rural Institute",
      trade: "Domestic Electrician"
    },
    "center-04": {
      name: "District Social Welfare Rural Skilling Annex",
      address: "Bichpuri Block HQ, Agra 283105",
      query: "Bichpuri+Block+Agra",
      distance: "2.1 km from Bichpuri",
      commute: "8 mins via Walk",
      type: "Block Welfare Centre",
      trade: "Basic Wiring"
    }
  };

  const centersList = [
    {
      id: "center-01",
      name: "Pradhan Mantri Kaushal Kendra (PMKK) - Agra Central",
      location: "Sanjay Place, Civil Lines, Agra",
      distance: "4.8 km",
      type: "Accredited Training Center",
      trades: ["Solar Domestic Electrician", "Retail Tech"],
      seats: "18 Seats Available",
      contact: "+91 562 252 0192",
      matchScore: 98,
      recommended: true
    },
    {
      id: "center-02",
      name: "Central Footwear Training Institute (CFTI) Cluster",
      location: "Nunhai Industrial Area, Agra",
      distance: "8.2 km",
      type: "National Industry Cluster",
      trades: ["Footwear & Leather Artisan RPL L3/L4"],
      seats: "24 Seats Available",
      contact: "+91 562 228 0145",
      matchScore: 94,
      recommended: false
    },
    {
      id: "center-03",
      name: "Government Industrial Training Institute (ITI) - Agra Rural",
      location: "Fatehabad Road, Agra",
      distance: "12.5 km",
      type: "State ITI Institute",
      trades: ["General Electrician", "Sanitary Plumbing"],
      seats: "12 Seats Available",
      contact: "+91 562 239 8810",
      matchScore: 91,
      recommended: false
    },
    {
      id: "center-04",
      name: "District Social Welfare Rural Skilling Annex",
      location: "Bichpuri Block HQ, Agra",
      distance: "2.1 km",
      type: "Block Welfare Centre",
      trades: ["Aptitude Testing", "Basic Wiring"],
      seats: "30 Seats Available",
      contact: "+91 562 248 1120",
      matchScore: 88,
      recommended: false
    }
  ];

  // Filtering logic
  const filteredCenters = centersList.filter(center => {
    const matchesSearch = 
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      center.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.trades.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const currentLoc = mapLocations[selectedCenterId] || mapLocations["center-01"];

  const handleReserve = async (centerId) => {
    if (!reservedCenters.includes(centerId)) {
      const center = centersList.find(c => c.id === centerId) || mapLocations[centerId] || { name: "Accredited Training Center" };
      try {
        const res = await fetch("/api/opportunities/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: norm.id || (typeof sessionStorage !== "undefined" && sessionStorage.getItem("user_phone") ? `ben_${sessionStorage.getItem("user_phone")}` : "beneficiary_guest"),
            centerId: centerId,
            centerName: center.name,
            trade: activeTrade || (center.trades ? center.trades[0] : "Vocational Skilling"),
            phone: norm.phone
          })
        });
        const data = await res.json();
        setReservedCenters([...reservedCenters, centerId]);
        if (data.message) {
          alert(data.message);
        } else {
          alert(`Seat reservation registered for ${center.name} (Demonstration Record).`);
        }
      } catch (err) {
        setReservedCenters([...reservedCenters, centerId]);
        alert(`Seat reservation request recorded for ${center.name} (Demonstration Record).`);
      }
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 1. Header Area */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Nearby Opportunities <MapPin size={24} style={{ color: "var(--india-saffron)" }} />
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>
            Find training centers, employment opportunities and apprenticeships that match your livelihood pathway.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: isUnlocked ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> {isUnlocked ? "Based on your profile" : "Profile pending"}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: isUnlocked ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> Location available
            </span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: isUnlocked ? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> {isUnlocked ? "Voice assessment completed" : "Voice assessment required"}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: isVerified ? "#16a34a" : "#d97706", display: "flex", alignItems: "center", gap: "4px" }}>
              {isVerified ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
              {isVerified ? "Skill Verified for Direct Matching" : "Skill Verification Required for Customer Booking"}
            </span>
          </div>
        </div>
        
        {/* District Admissions / Verification Status Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          backgroundColor: isVerified ? "#ecfdf5" : "#fef3c7",
          color: isVerified ? "#047857" : "#92400e",
          border: isVerified ? "1px solid #a7f3d0" : "1px solid #fde68a",
          padding: "6px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: 700
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isVerified ? "#10b981" : "#f59e0b" }}></span>
          {isVerified ? "Verified Trade Booking Active" : "Showing Training & Development Centers"}
        </div>
      </div>

      {/* Voice Assessment Incomplete - Locked Banner */}
      {!isUnlocked && (
        <div style={{
          backgroundColor: "#fff7ed",
          border: "1.5px solid #fed7aa",
          borderRadius: "12px",
          padding: "36px 24px",
          textAlign: "center",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#ffedd5",
            color: "#ea580c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#9a3412", margin: "0 0 8px" }}>
            {language === "hi"
              ? "आपको उपयुक्त अवसर देखने के लिए अपना वॉइस असेसमेंट पूरा करें।"
              : language === "te"
              ? "మీకు సరిపోయే అవకాశాలను చూడటానికి మీ వాయిస్ అసెస్‌మెంట్‌ను పూర్తి చేయండి."
              : "Complete your Voice Assessment to see opportunities matched to you."}
          </h2>
          <p style={{ fontSize: "14.5px", color: "#7c2d12", maxWidth: "540px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            {language === "hi"
              ? "साथी एआई आपके स्थान, रुचियों और कौशल के आधार पर निकटतम प्रशिक्षण केंद्रों और आजीविका अवसरों का मिलान करता है।"
              : language === "te"
              ? "సాథి ఏఐ మీ స్థానం, ఆసక్తులు మరియు నైపుణ్యాల ఆధారంగా శిక్షణా కేంద్రాలు మరియు ఉపాధి అవకాశాలను జత చేస్తుంది."
              : "Saathi AI matches training centers, skill development programs, and employment opportunities to your location, interests, and verified competencies."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (onStartVoice) onStartVoice();
              else navigate("/voice-assessment");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: "8px",
              border: "none",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)"
            }}
          >
            <Mic size={18} /> {language === "hi" ? "वॉइस असेसमेंट शुरू करें" : language === "te" ? "వాయిస్ అసెస్‌మెంట్ ప్రారంభించండి" : "Start Voice Assessment"}
          </button>
        </div>
      )}

      {/* Personalized Content - Unlocked when Voice Assessment is COMPLETED */}
      {isUnlocked && (
        <>
          {/* 2. Personalized Context Strip */}
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)", textTransform: "uppercase" }}>
              Your Opportunity Search
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Current Livelihood</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>{norm.currentLivelihood}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Target Pathway</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>{norm.aspiration}</div>
              </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Location</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>{norm.districtState}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Travel Radius</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>{norm.mobility}</div>
          </div>
        </div>
      </div>

      {/* 3. Filters Toolbar */}
      <div style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", 
        backgroundColor: "#ffffff", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-dark)", outline: "none", backgroundColor: "#f8fafc" }}
          >
            <option value="Agra">Agra District</option>
            <option value="Mathura">Mathura District</option>
            <option value="Firozabad">Firozabad District</option>
            <option value="Aligarh">Aligarh District</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--text-dark)", outline: "none", backgroundColor: "#f8fafc" }}
          >
            <option value="all">All Centers</option>
            <option value="pmkk">PMKK Hubs</option>
            <option value="iti">Government ITIs</option>
            <option value="industry">Industrial Clusters</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", backgroundColor: "#f8fafc", width: "100%", maxWidth: "320px" }}>
          <Search size={16} style={{ color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search center, village or opportunity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", outline: "none", padding: "0 0 0 8px", fontSize: "13px", width: "100%", backgroundColor: "transparent" }}
          />
        </div>
      </div>

          {/* Employment Safety Gate Notice */}
          <div style={{
            backgroundColor: isVerified ? "#ecfdf5" : "#fffbeb",
            border: isVerified ? "1px solid #a7f3d0" : "1px solid #fde68a",
            borderRadius: "10px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isVerified ? (
                <ShieldCheck size={20} color="#059669" />
              ) : (
                <ShieldAlert size={20} color="#d97706" />
              )}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: isVerified ? "#065f46" : "#92400e" }}>
                  {isVerified 
                    ? `Verified Competency Active: ${activeTrade}` 
                    : `Skill Verification Required for Direct Customer Matching (${activeTrade})`}
                </div>
                <div style={{ fontSize: "12px", color: isVerified ? "#047857" : "#b45309", marginTop: "2px" }}>
                  {isVerified 
                    ? "You are verified for commercial and institutional service assignments." 
                    : "Voice assessment detected your interest/background. To be dispatched to customers, pass the Skill Assessment."}
                </div>
              </div>
            </div>
            {!isVerified && (
              <button
                type="button"
                onClick={() => navigate("/skill-assessment")}
                style={{
                  backgroundColor: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Award size={14} /> Start Skill Assessment
              </button>
            )}
          </div>

          <div className="opportunities-grid" style={{ display: "grid", gap: "24px" }}>
            {/* Left: Opportunity Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>Nearby Opportunities</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  Showing {filteredCenters.length} verified opportunities within your travel range.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredCenters.map((c) => {
                  const isSelected = selectedCenterId === c.id;
                  const isReserved = reservedCenters.includes(c.id);

                  return (
                    <div 
                      key={c.id} 
                      style={{
                        backgroundColor: "#ffffff",
                        border: isSelected ? "2px solid var(--gov-navy)" : "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "16px",
                        boxShadow: isSelected ? "0 4px 12px rgba(11, 56, 34, 0.1)" : "var(--shadow-sm)",
                        position: "relative",
                        transition: "all 0.2s"
                      }}
                    >
                      {/* Recommended Badge */}
                      {c.recommended && (
                        <div style={{
                          position: "absolute", top: "-10px", right: "16px",
                          backgroundColor: "var(--india-saffron)", color: "#ffffff",
                          padding: "2px 10px", borderRadius: "12px", fontSize: "10px", fontWeight: 800,
                          display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                          Recommended for You
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }} className="opt-card-grid">
                        
                        {/* Info */}
                        <div style={{ flex: "1" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--gov-navy)", margin: "0 0 6px 0" }}>
                            {c.name}
                          </h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Building2 size={12} /> {c.type}
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <MapPin size={12} style={{ color: "var(--india-saffron-dark)" }} /> {c.location} <strong>({c.distance})</strong>
                            </span>
                          </div>
                          
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "12px", display: "grid", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                              <span style={{ fontWeight: 700, color: "#64748b", minWidth: "60px" }}>Trades</span>
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {c.trades.map((t, i) => (
                                  <span key={i} style={{ backgroundColor: "#f0fdf4", color: "#065f46", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{t}</span>
                                ))}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                              <span style={{ fontWeight: 700, color: "#64748b", minWidth: "60px" }}>Availability</span>
                              <span style={{ fontWeight: 700, color: "var(--gov-navy)" }}>{c.seats}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Match & Actions */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", minWidth: "140px" }}>
                          
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Skill Match</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--secondary-green)" }}>{c.matchScore}%</div>
                              <div style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${c.matchScore}%`, height: "100%", backgroundColor: "var(--secondary-green)" }}></div>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedCenterId(c.id)}
                              style={{
                                padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                                backgroundColor: isSelected ? "#f1f5f9" : "#ffffff", border: "1px solid #cbd5e1", color: "var(--gov-navy)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%"
                              }}
                            >
                              <Map size={14} /> View on Map
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReserve(c.id)}
                              style={{
                                padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                                backgroundColor: isReserved ? "#10b981" : "var(--gov-navy)", border: "none", color: "#ffffff",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%"
                              }}
                            >
                              <CheckCircle2 size={14} /> {isReserved ? "Reserved" : "Reserve Training Seat"}
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredCenters.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gov-navy)" }}>No nearby opportunities found</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>Try increasing your travel radius or changing your search filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Map Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>Opportunities Around You</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  Explore available training and livelihood opportunities within your travel range.
                </p>
              </div>

              <div style={{ 
                backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", 
                overflow: "hidden", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", position: "sticky", top: "24px" 
              }}>
                <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Navigation size={16} /> {currentLoc.name}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                    {currentLoc.distance} • {currentLoc.commute}
                  </p>
                </div>
                
                {/* Real Google Map Integration */}
                <div style={{ height: "350px", width: "100%", backgroundColor: "#e2e8f0", position: "relative" }}>
                  {/* Prototype Label */}
                  <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, zIndex: 10 }}>
                    Demo Location Data
                  </div>
                  <iframe
                    title="Official Center GIS Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${currentLoc.query}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>

                <div style={{ padding: "16px", backgroundColor: "#ffffff" }}>
                  <div style={{ fontSize: "13px", color: "var(--text-dark)", lineHeight: 1.5 }}>
                    <strong>Address:</strong> <br/> {currentLoc.address}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReserve(selectedCenterId)}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                      backgroundColor: reservedCenters.includes(selectedCenterId) ? "#10b981" : "var(--india-saffron)", 
                      border: "none", color: "#ffffff", marginTop: "16px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                    }}
                  >
                    {reservedCenters.includes(selectedCenterId) ? "Seat Reserved" : "Reserve Seat at this Location"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .opportunities-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .opportunities-grid {
            grid-template-columns: 1.3fr 1fr;
          }
        }
        
        .opt-card-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 600px) {
          .opt-card-grid {
            grid-template-columns: 1fr auto;
          }
        }
      `}</style>
    </div>
  );
}
