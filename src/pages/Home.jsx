import React, { useState } from "react";
import { 
  Mic, MessageSquare, Volume2, Search, ArrowRight, ShieldCheck, 
  Award, MapPin, Compass, BarChart3, UserCheck, CheckCircle2, 
  Sparkles, ExternalLink, BookOpen, Layers, PhoneCall, HelpCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import NationalEmblem from "../components/NationalEmblem";
import JeevikaLogo from "../components/JeevikaLogo";

export default function Home({ onStartVoice, onNavigate }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const handleTestPhrase = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("मुझे सोलर पंप की ट्रेनिंग लेनी है, बाराबंकी में क्या मिलेगा?");
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
    if (onStartVoice) {
      onStartVoice();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (onStartVoice) onStartVoice();
      return;
    }
    const query = searchQuery.toLowerCase();
    if (query.includes("voice") || query.includes("test") || query.includes("बोल") || query.includes("आवाज")) {
      onStartVoice();
    } else if (query.includes("center") || query.includes("केंद्र") || query.includes("near") || query.includes("opportunity")) {
      onNavigate("nearby-opportunities");
    } else if (query.includes("profile") || query.includes("प्रोफाइल")) {
      onNavigate("livelihood-profile");
    } else if (query.includes("trade") || query.includes("skill") || query.includes("nsqf") || query.includes("solar") || query.includes("electric")) {
      onNavigate("recommendations");
    } else {
      onStartVoice();
    }
  };

  const trendingSearches = [
    { label: "🎙️ Voice Assessment", action: () => onStartVoice() },
    { label: "Solar Pump Technician", action: () => onNavigate("recommendations") },
    { label: "Tailoring & Apparel", action: () => onNavigate("recommendations") },
    { label: "Electrician Training", action: () => onNavigate("recommendations") },
    { label: "Leather Crafting", action: () => onNavigate("recommendations") },
    { label: "PM-AJAY GIA Grant", action: () => onNavigate("about") },
    { label: "District Training Centers", action: () => onNavigate("nearby-opportunities") }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>

      {/* ======================================================================
          1. MONUMENTAL HERO SECTION (INDIA.GOV.IN MONUMENTAL ARCHITECTURAL HERO)
          ====================================================================== */}
      <section className="monumental-hero">
        <div className="national-container">
          <div className="monumental-hero-inner animate-fade-in-up">
            {/* Centered Ashoka Lion Capital Emblem */}
            <div className="hero-emblem-badge">
              <NationalEmblem size={52} light={true} showMotto={true} />
            </div>

            {/* Flagship Brand & Titles */}
            <h1 className="hero-national-portal-brand">
              india.<span>gov.in</span>
            </h1>
            <div className="hero-national-tagline" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <JeevikaLogo size={28} />
              <span>National Portal of India | Jeevika Saathi</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#fef3c7", marginBottom: "8px" }}>
              राष्ट्रीय आजीविका एवं कौशल पोर्टल — PM-AJAY
            </div>
            <p className="hero-national-subtext">
              Where Government Information & Opportunity Converges. AI-Driven Livelihood Mapping & NSQF-Aligned Skilling for Scheduled Caste Communities under the Ministry of Social Justice & Empowerment.
            </p>

            {/* ── Centerpiece Voice Assessment Action Button (Red with Gold Outerline) ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "22px 0 24px", gap: "8px" }}>
              <button
                type="button"
                onClick={onStartVoice}
                style={{
                  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  color: "#ffffff",
                  border: "2.5px solid #f59e0b",
                  outline: "2.5px solid #fbbf24",
                  outlineOffset: "3px",
                  borderRadius: "9999px",
                  padding: "13px 32px",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 0 24px rgba(245, 158, 11, 0.65), 0 8px 22px rgba(220, 38, 38, 0.45)",
                  letterSpacing: "0.2px",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                className="btn-center-voice-pulse"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 0 32px rgba(245, 158, 11, 0.85), 0 10px 28px rgba(220, 38, 38, 0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(245, 158, 11, 0.65), 0 8px 22px rgba(220, 38, 38, 0.45)";
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#fef3c7",
                    color: "#b91c1c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #f59e0b",
                    flexShrink: 0
                  }}
                >
                  <Mic size={20} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
                    {language === "hi" ? "मौखिक मूल्यांकन शुरू करें (Voice Assessment)" : "Start Voice Assessment"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#fef3c7", fontWeight: 600, marginTop: "2px" }}>
                    {language === "hi" ? "बोलकर अपनी योग्यता और योजनाएं खोजें • 7 भाषाएँ" : "Speak naturally to find livelihood trades & schemes • 7 Languages"}
                  </div>
                </div>
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#991b1b",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: "9999px",
                    border: "1px solid #f59e0b",
                    marginLeft: "6px"
                  }}
                >
                  LIVE
                </span>
              </button>
            </div>

            {/* Grand National Search Bar */}
            <form className="grand-search-box" onSubmit={handleSearchSubmit}>
              <Search size={20} color="#64748b" />
              <input
                type="text"
                className="grand-search-input"
                placeholder={language === "hi" ? "आजीविका योजनाएं, NSQF ट्रेड्स, प्रशिक्षण केंद्र या मौखिक मूल्यांकन खोजें..." : "Search for Livelihood Schemes, NSQF Trades, District Training Centers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="grand-search-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="voice">Voice Assessment</option>
                <option value="schemes">Government Schemes</option>
                <option value="trades">NSQF Trades</option>
                <option value="centers">Training Centers</option>
              </select>
              <button type="submit" className="grand-search-btn">
                <span>{language === "hi" ? "खोजें" : "Search"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Trending Searches Row */}
            <div className="trending-searches-bar">
              <span className="trending-label">Trending Searches:</span>
              {trendingSearches.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  className="trending-pill"
                >
                  {item.label}
                </button>
              ))}
            </div>


          </div>
        </div>
      </section>

      {/* ======================================================================
          2. LIVE NATIONAL STAT COUNTERS STRIP (REFERENCE IMAGE 2 METRIC STRIP)
          ====================================================================== */}
      <section className="national-stat-strip">
        <div className="national-container">
          <div className="stat-grid-6">
            <div className="stat-metric-card">
              <div className="stat-metric-value">14,821+</div>
              <div className="stat-metric-label">Beneficiaries Profiled</div>
            </div>
            <div className="stat-metric-card">
              <div className="stat-metric-value">5,731+</div>
              <div className="stat-metric-label">Accredited Centers</div>
            </div>
            <div className="stat-metric-card">
              <div className="stat-metric-value">2,329+</div>
              <div className="stat-metric-label">Gram Panchayats</div>
            </div>
            <div className="stat-metric-card">
              <div className="stat-metric-value">3,990+</div>
              <div className="stat-metric-label">Placed in 90 Days</div>
            </div>
            <div className="stat-metric-card">
              <div className="stat-metric-value">1,287+</div>
              <div className="stat-metric-label">Active NSQF Batches</div>
            </div>
            <div className="stat-metric-card">
              <div className="stat-metric-value">18+</div>
              <div className="stat-metric-label">Skilling Sectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          3. "ONLINE SERVICES" SECTION WITH SIGNATURE CRIMSON RED HEADER (IMAGE 2)
          ====================================================================== */}
      <section className="online-services-section">
        <div className="national-container">
          
          {/* Iconic Crimson Header Bar */}
          <div className="online-services-header-bar">
            <div className="online-services-title-wrap">
              <Sparkles size={20} />
              <h2 className="online-services-heading">Online Services</h2>
              <span className="online-services-subtext">
                नागरिक डिजिटल सेवा केंद्र | Certified Government Skilling & Assessment
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("recommendations")}
              className="online-services-explore-link"
            >
              <span>Explore All 50+ Services</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Hub Body with Primary Voice Card & Service Grid */}
          <div className="online-services-hub-body">

            {/* Primary Action Card: Empathetic AI Voice Assessment */}
            <div className="voice-hero-action-card">
              <div className="voice-hero-left">
                <div className="voice-hero-badge">
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF9933", display: "inline-block" }} />
                  PM-AJAY GIA Component • Flagship Service
                </div>
                <h3 className="voice-hero-title">
                  {language === "hi" ? "एआई मौखिक कौशल मूल्यांकन एवं आजीविका मैपिंग" : "AI-Powered Multilingual Voice Livelihood Assessment"}
                </h3>
                <p className="voice-hero-desc">
                  Connect rural and peri-urban SC citizens directly with accredited NSQF skill programs, training stipends (₹1,500/month), and guaranteed placement support — simply by speaking naturally in 8 Indian languages.
                </p>

                <div className="voice-hero-buttons">
                  <button
                    type="button"
                    onClick={onStartVoice}
                    className="btn-primary-voice animate-pulse-mic"
                    title="Start Voice Assessment"
                  >
                    <Mic size={20} />
                    <div style={{ textAlign: "left" }}>
                      <div>Start Voice Assessment</div>
                      <div style={{ fontSize: "11px", fontWeight: 400, opacity: 0.9 }}>
                        मौखिक कौशल मूल्यांकन शुरू करें
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={onStartVoice}
                    className="btn-secondary-guide"
                    title="Talk to Saathi Guide"
                  >
                    <MessageSquare size={18} />
                    <div style={{ textAlign: "left" }}>
                      <div>Talk to Saathi Guide</div>
                      <div style={{ fontSize: "11px", opacity: 0.85 }}>
                        साथी से बात करें
                      </div>
                    </div>
                  </button>
                </div>

                {/* Try Saying Strip with Audio Demo */}
                <div 
                  className="try-saying-strip"
                  onClick={handleTestPhrase}
                  title="Click to hear demo voice interaction"
                >
                  <Volume2 size={16} color="var(--tricolour-saffron)" />
                  <span style={{ fontWeight: 600 }}>Try saying:</span>
                  <span style={{ fontStyle: "italic" }}>
                    "मुझे सोलर पंप की ट्रेनिंग लेनी है, बाराबंकी में क्या मिलेगा?"
                  </span>
                </div>
              </div>

              {/* Right Side Info Box */}
              <div
                style={{
                  flex: "0 1 280px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(6px)"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "#fef3c7" }}>
                  Assessment Highlights
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12.5px", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#4ade80" /> 100% Free Government Grant
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#4ade80" /> ₹1,500/Month Stipend Support
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#4ade80" /> NSQF Level 3-5 Certification
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={16} color="#4ade80" /> Zero Smartphone/Typing Needed
                  </div>
                </div>
              </div>
            </div>

            {/* Service Action Grid (All Function Buttons Maintained) */}
            <div className="services-action-grid">
              
              {/* 1. Livelihood Profile */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("livelihood-profile")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-blue">
                    <UserCheck size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "2px 8px", borderRadius: "4px" }}>
                    Beneficiary
                  </span>
                </div>
                <div className="service-card-title">Livelihood Profile</div>
                <div className="service-card-hindi">जीविका प्रोफाइल व सत्यापन</div>
                <p className="service-card-desc">
                  View and manage verified citizen bio-data, education qualifications, and family traditional trade linkages.
                </p>
                <div className="service-card-cta">
                  <span>View Profile</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 2. Skill & Livelihood Analysis */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("skill-analysis")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-green">
                    <BarChart3 size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>
                    Analytics
                  </span>
                </div>
                <div className="service-card-title">Skill & Gap Analysis</div>
                <div className="service-card-hindi">कौशल क्षमता व कमी विश्लेषण</div>
                <p className="service-card-desc">
                  Comprehensive 6-factor AI readiness report evaluating market demand, wage potential, and gap remediation.
                </p>
                <div className="service-card-cta">
                  <span>Analyze Skills</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 3. AI Recommendations */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("recommendations")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-saffron">
                    <Award size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#c2410c", background: "#ffedd5", padding: "2px 8px", borderRadius: "4px" }}>
                    Top Matches
                  </span>
                </div>
                <div className="service-card-title">AI Recommendations</div>
                <div className="service-card-hindi">NSQF अनुरूप ट्रेड्स सिफारिश</div>
                <p className="service-card-desc">
                  Personalized top 3 NSQF-aligned job roles matched to your physical capability, district demand, and income goals.
                </p>
                <div className="service-card-cta">
                  <span>Explore Trades</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 4. Nearby Training Opportunities */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("nearby-opportunities")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-purple">
                    <MapPin size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#7e22ce", background: "#f3e8ff", padding: "2px 8px", borderRadius: "4px" }}>
                    District Hub
                  </span>
                </div>
                <div className="service-card-title">Nearby Centers</div>
                <div className="service-card-hindi">नजदीकी प्रशिक्षण केंद्र व बैच</div>
                <p className="service-card-desc">
                  Find accredited PMKK, NSDC, and State Corporation training institutes within your preferred commute radius.
                </p>
                <div className="service-card-cta">
                  <span>Find Centers</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 5. Livelihood Roadmap */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("roadmap")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-blue">
                    <Compass size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "2px 8px", borderRadius: "4px" }}>
                    Milestones
                  </span>
                </div>
                <div className="service-card-title">Career Roadmap</div>
                <div className="service-card-hindi">चरणबद्ध आजीविका मार्ग</div>
                <p className="service-card-desc">
                  Step-by-step skilling trajectory from onboarding to training stipend, certification, and post-placement support.
                </p>
                <div className="service-card-cta">
                  <span>View Roadmap</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 6. Monitoring MIS Dashboard */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("monitoring")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-red">
                    <Layers size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#e11d48", background: "#ffe4e6", padding: "2px 8px", borderRadius: "4px" }}>
                    MIS Portal
                  </span>
                </div>
                <div className="service-card-title">Monitoring Dashboard</div>
                <div className="service-card-hindi">प्रशासनिक निगरानी एवं आँकड़े</div>
                <p className="service-card-desc">
                  Real-time ministry KPIs, district enrollment funnel, dropout risk indicators, and placement analytics.
                </p>
                <div className="service-card-cta">
                  <span>Open MIS</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 7. About PM-AJAY Scheme */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("about")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-green">
                    <BookOpen size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>
                    Guidelines
                  </span>
                </div>
                <div className="service-card-title">About PM-AJAY</div>
                <div className="service-card-hindi">प्रधानमंत्री अनुसूचीत जाति अभ्युदय</div>
                <p className="service-card-desc">
                  Official operational guidelines, Grant-in-Aid (GIA) funding provisions, and ministry welfare mandates.
                </p>
                <div className="service-card-cta">
                  <span>Read Guidelines</span> <ArrowRight size={14} />
                </div>
              </div>

              {/* 8. Citizen Help & FAQ */}
              <div 
                className="service-card-item"
                onClick={() => onNavigate("help")}
              >
                <div className="service-card-top">
                  <div className="service-icon-box service-icon-saffron">
                    <HelpCircle size={22} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#c2410c", background: "#ffedd5", padding: "2px 8px", borderRadius: "4px" }}>
                    Support
                  </span>
                </div>
                <div className="service-card-title">Help & Grievance</div>
                <div className="service-card-hindi">सहायता व अक्सर पूछे जाने वाले प्रश्न</div>
                <p className="service-card-desc">
                  Toll-free IVR helpline (1800-11-7654), Common Service Center locator, and grievance redressal process.
                </p>
                <div className="service-card-cta">
                  <span>Get Help</span> <ArrowRight size={14} />
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ======================================================================
          4. FLAGSHIP SPOTLIGHT BANNER: SMILE & PM-AJAY (IMAGE 2 MIDDLE BANNER)
          ====================================================================== */}
      <section className="national-container">
        <div className="smile-spotlight-banner">
          <div className="smile-left-content">
            <div className="smile-badge">
              Ministry of Social Justice & Empowerment • Government of India
            </div>
            <h3 className="smile-title">
              SUPPORT FOR MARGINALISED INDIVIDUALS FOR LIVELIHOOD AND ENTERPRISE (SMILE)
            </h3>
            <p className="smile-desc">
              Comprehensive rehabilitation, skill entrepreneurship development, and economic empowerment under PM-AJAY. Bridging the divide with institutional credit linkage, NSQF skilling, and direct welfare disbursement.
            </p>

            <div className="smile-features-list">
              <div className="smile-feature-tag">
                <CheckCircle2 size={16} /> 100% Central Sector Grant
              </div>
              <div className="smile-feature-tag">
                <CheckCircle2 size={16} /> Up to ₹50,000 Toolkit Subsidy
              </div>
              <div className="smile-feature-tag">
                <CheckCircle2 size={16} /> Direct Benefit Transfer (DBT)
              </div>
              <div className="smile-feature-tag">
                <CheckCircle2 size={16} /> Micro-Enterprise Mentorship
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={onStartVoice}
                className="btn-primary-voice"
                style={{ padding: "10px 22px", fontSize: "13px" }}
              >
                <Mic size={16} />
                <span>Check Eligibility via Voice</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("about")}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Scheme Details
              </button>
            </div>
          </div>

          <div
            style={{
              flex: "0 1 240px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}
          >
            <NationalEmblem size={56} light={false} showMotto={true} />
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#00337a", marginTop: "12px", textAlign: "center" }}>
              PM-AJAY GIA
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", textAlign: "center", marginTop: "4px" }}>
              Empowering India's Marginalized
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          5. DEEP ROYAL NAVY "GOVERNMENT SCHEMES & TRADES FINDER" (IMAGE 2 BLUE BAND)
          ====================================================================== */}
      <section className="schemes-finder-band">
        <div className="national-container">
          <h2 className="schemes-finder-title">
            Government Schemes & NSQF Trades Finder
          </h2>
          <p className="schemes-finder-sub">
            Find tailored skill training packages, subsidies, and employment avenues aligned to your qualification and home district.
          </p>

          <div className="schemes-input-box">
            <input
              type="text"
              className="schemes-search-field"
              placeholder="Enter trade interest (e.g. Electrician, Tailoring, Leather, Solar, Masonry)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => onNavigate("recommendations")}
              className="schemes-action-btn"
            >
              <Award size={18} />
              <span>Find Personalized Schemes & Trades</span>
            </button>
            <button
              type="button"
              onClick={onStartVoice}
              className="schemes-action-btn"
              style={{ background: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.4)" }}
            >
              <Mic size={18} />
              <span>Speak to Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================================
          6. "HOW IT WORKS" — 4 STEP INTERACTIVE JOURNEY
          ====================================================================== */}
      <section className="how-it-works-section">
        <div className="national-container">
          <div className="section-heading-wrap">
            <div className="section-eyebrow">Seamless Citizen Experience</div>
            <h2 className="section-title">How Jeevika Saathi Works</h2>
          </div>

          <div className="steps-flow-grid">
            <div className="step-card">
              <div className="step-number-circle">1</div>
              <h4 className="step-card-heading">Natural Voice Dialogue</h4>
              <p className="step-card-text">
                Speak freely in your regional mother tongue — Hindi, Tamil, Telugu, Marathi, Odia, Kannada, Bengali or Punjabi. No typing or smartphone apps required.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-circle">2</div>
              <h4 className="step-card-heading">AI Livelihood Profiling</h4>
              <p className="step-card-text">
                Our empathetic AI understands your traditional family craft, prior experience, physical constraints, and wage aspirations in minutes.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-circle">3</div>
              <h4 className="step-card-heading">NSQF Certified Matching</h4>
              <p className="step-card-text">
                Receive the top 3 government-recognized National Skills Qualification Framework (NSQF) courses with nearest training center mapping.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-circle">4</div>
              <h4 className="step-card-heading">Stipend & Dignified Jobs</h4>
              <p className="step-card-text">
                Enroll with direct DBT stipend support of ₹1,500/month, toolkit subsidies, certified assessment, and 90-day post-placement tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          7. NEWS, GAZETTE & MINISTRY SPOTLIGHT (BOTTOM OF REFERENCE IMAGE 2)
          ====================================================================== */}
      <section style={{ padding: "20px 0 48px" }}>
        <div className="national-container">
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "20px 24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontWeight: 800,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                News / Circular
              </div>
              <div style={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}>
                Ministry of Social Justice & Empowerment notifies new NSQF 2026 Batch for SC Youth with DBT Stipend.
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("about")}
              style={{
                background: "transparent",
                border: "1px solid #cbd5e1",
                color: "#00337a",
                fontSize: "12px",
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>View Gazette Circulars</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
