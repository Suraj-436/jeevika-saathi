import React, { useState, useEffect, useRef } from "react";
import { Volume2, MapPin, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE DYNAMIC PAGE GUIDES (ENGLISH & HINDI)
// Matches exact user specifications for every page in the portal.
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_GUIDES = {
  "home": {
    label: { en: "Home Page", hi: "होम पेज (मुख्य पृष्ठ)" },
    text: {
      en: "Welcome to Jeevika Saathi. This is your home page, where you can access your voice assessment, profile, skill analysis, recommendations, nearby opportunities and livelihood roadmap.",
      hi: "जीविका साथी में आपका स्वागत है। यह आपका मुख्य पृष्ठ है, जहाँ से आप मौखिक मूल्यांकन, प्रोफाइल, कौशल विश्लेषण, सिफारिशें, निकटतम अवसर और आजीविका रोडमैप तक पहुँच सकते हैं।"
    }
  },
  "voice-assessment": {
    label: { en: "Voice Assessment", hi: "मौखिक कौशल मूल्यांकन" },
    text: {
      en: "You are on the Voice Assessment page. Here Saathi AI talks with you and collects information about your work, skills, interests, aspirations and training availability.",
      hi: "आप मौखिक कौशल मूल्यांकन पेज पर हैं। यहाँ साथी एआई आपसे बात करता है और आपके काम, कौशल, रुचियों, आकांक्षाओं और प्रशिक्षण उपलब्धता के बारे में जानकारी एकत्र करता है।"
    }
  },
  "livelihood-profile": {
    label: { en: "Livelihood Profile", hi: "आजीविका प्रोफाइल" },
    text: {
      en: "You are on your Profile page. Here you can review the personal, educational, skill and livelihood information collected during your assessment.",
      hi: "आप अपनी प्रोफाइल पेज पर हैं। यहाँ आप अपने मूल्यांकन के दौरान एकत्र की गई व्यक्तिगत, शैक्षिक, कौशल और आजीविका संबंधी जानकारी की समीक्षा कर सकते हैं।"
    }
  },
  "skill-analysis": {
    label: { en: "Skill & Analysis", hi: "कौशल अंतर विश्लेषण" },
    text: {
      en: "You are on the Skill and Analysis page. Here Jeevika Saathi analyzes your existing skills, identifies skill gaps and shows the pathway toward your target livelihood.",
      hi: "आप कौशल और विश्लेषण पेज पर हैं। यहाँ जीविका साथी आपके मौजूदा कौशल का विश्लेषण करता है, कौशल अंतर की पहचान करता है और आपके लक्षित आजीविका की ओर का मार्ग दिखाता है।"
    }
  },
  "recommendations": {
    label: { en: "Recommendations", hi: "सिफारिशें" },
    text: {
      en: "You are on the Recommendations page. Here you can explore livelihood and training pathways recommended based on your skills, interests, aspirations, availability and preferences.",
      hi: "आप सिफारिशें पेज पर हैं। यहाँ आप अपने कौशल, रुचियों, आकांक्षाओं, उपलब्धता और प्राथमिकताओं के आधार पर अनुशंसित आजीविका और प्रशिक्षण मार्गों का पता लगा सकते हैं।"
    }
  },
  "nearby-opportunities": {
    label: { en: "Nearby Opportunities", hi: "निकटतम अवसर एवं केंद्र" },
    text: {
      en: "You are on the Nearby Opportunities page. Here you can explore relevant training centers and livelihood opportunities based on your location and mobility preferences.",
      hi: "आप निकटतम अवसर पेज पर हैं। यहाँ आप अपने स्थान और गतिशीलता प्राथमिकताओं के आधार पर प्रासंगिक प्रशिक्षण केंद्र और आजीविका के अवसर खोज सकते हैं।"
    }
  },
  "roadmap": {
    label: { en: "Livelihood Roadmap", hi: "आजीविका रोडमैप" },
    text: {
      en: "You are on your Livelihood Roadmap page. This page shows your personalized journey from your current skills through training, assessment and certification, toward employment or self-employment.",
      hi: "आप अपनी आजीविका रोडमैप पेज पर हैं। यह पेज आपके वर्तमान कौशल से प्रशिक्षण, मूल्यांकन और प्रमाणन के माध्यम से रोजगार या स्वरोजगार तक की आपकी व्यक्तिगत यात्रा को दर्शाता है।"
    }
  },
  "about": {
    label: { en: "About PM-AJAY", hi: "पीएम-अजय योजना विवरण" },
    text: {
      en: "You are on the About PM-AJAY page. Here you can learn about the Pradhan Mantri Anusuchit Jaati Abhyuday Yojana scheme guidelines and benefits.",
      hi: "आप पीएम-अजय योजना विवरण पेज पर हैं। यहाँ आप प्रधानमंत्री अनुसूचित जाति अभ्युदय योजना के दिशा-निर्देशों और लाभों की जानकारी ले सकते हैं।"
    }
  },
  "help": {
    label: { en: "Help & FAQ", hi: "नागरिक सहायता" },
    text: {
      en: "You are on the Help and FAQ page. Here you can find answers to frequently asked questions about PM-AJAY schemes and services.",
      hi: "आप नागरिक सहायता पेज पर हैं। यहाँ आप पीएम-अजय योजनाओं और सेवाओं से जुड़े अक्सर पूछे जाने वाले प्रश्नों के उत्तर पा सकते हैं।"
    }
  },
  "monitoring": {
    label: { en: "Monitoring Dashboard", hi: "निगरानी डैशबोर्ड" },
    text: {
      en: "You are on the Monitoring and MIS Dashboard. This page displays administrative metrics, beneficiary enrollment, and progress tracking.",
      hi: "आप निगरानी डैशबोर्ड पर हैं। यहाँ प्रशासनिक स्तर पर जिलों की प्रगति और लाभार्थियों के प्रशिक्षण आंकड़ों की जानकारी उपलब्ध है।"
    }
  }
};

function getFallbackPathKey() {
  if (typeof window === "undefined") return "home";
  const p = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "home";
  return PAGE_GUIDES[p] ? p : "home";
}

export default function VoiceAssistant({ activeTab }) {
  const { language } = useLanguage();
  const [toastMessage, setToastMessage] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const toastTimerRef = useRef(null);

  const currentKey = (activeTab && PAGE_GUIDES[activeTab]) ? activeTab : getFallbackPathKey();
  const pageData = PAGE_GUIDES[currentKey] || PAGE_GUIDES["home"];

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Stop speech if user navigates to a different page
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setToastMessage(null);
  }, [activeTab]);

  const handleWhereAmI = () => {
    const textToSpeak = pageData.text[language === "hi" ? "hi" : "en"] || pageData.text.en;

    // Audio Speech Synthesis via Web Speech API
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
        utterance.rate = 0.94;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
      }
    }

    // Visual Toast Banner for accessibility & hearing impaired
    setToastMessage({
      title: pageData.label[language === "hi" ? "hi" : "en"] || pageData.label.en,
      text: textToSpeak
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 7000);
  };

  const handleCloseToast = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setToastMessage(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  return (
    <>
      {/* Inline styles for responsive layout and animations */}
      <style>{`
        @keyframes whereAmIPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fadeInWhereAmI {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .where-am-i-speaking-icon {
          animation: whereAmIPulse 1.2s infinite ease-in-out;
        }
        @media (max-width: 640px) {
          .where-am-i-btn {
            height: 46px !important;
            padding: 0 14px !important;
          }
          .where-am-i-subtitle {
            display: none !important;
          }
          .where-am-i-context {
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Visual Announcement Banner when user clicks "Where Am I?" */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "#0f382c",
            color: "#ffffff",
            padding: "14px 18px",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            border: "2px solid #ea580c",
            maxWidth: "380px",
            animation: "fadeInWhereAmI 0.25s ease-out",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px"
            }}
          >
            <Volume2 size={15} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, color: "#fed7aa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <MapPin size={12} color="#ea580c" />
              <span>{toastMessage.title}</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#f1f5f9", marginTop: "4px", lineHeight: 1.45 }}>
              {toastMessage.text}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseToast}
            aria-label="Close announcement"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "2px",
              marginTop: "1px"
            }}
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {/* FLOATING "WHERE AM I? • AUDIO GUIDE" PILL BUTTON */}
      <aside
        aria-label="Audio Guide Navigation Helper"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 995
        }}
      >
        <button
          type="button"
          onClick={handleWhereAmI}
          className="where-am-i-btn"
          title={language === "hi" ? "कहाँ हैं आप? सुनिए (Where Am I? • Audio Guide)" : "Where Am I? • Audio Guide"}
          aria-label="Where Am I audio guide"
          style={{
            height: "52px",
            padding: "0 20px",
            borderRadius: "9999px",
            backgroundColor: "#0f382c",
            color: "#ffffff",
            border: "2.5px solid #ffffff",
            boxShadow: isSpeaking
              ? "0 0 0 4px rgba(234, 88, 12, 0.85), 0 10px 28px rgba(15, 56, 44, 0.5)"
              : "0 0 0 3px rgba(234, 88, 12, 0.5), 0 8px 24px rgba(15, 56, 44, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            transition: "all 0.2s ease",
            userSelect: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.backgroundColor = "#0a2920";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
            e.currentTarget.style.backgroundColor = "#0f382c";
          }}
        >
          {/* Circular Orange Speaker Icon */}
          <div
            className={isSpeaking ? "where-am-i-speaking-icon" : ""}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(234, 88, 12, 0.4)"
            }}
          >
            <Volume2 size={16} />
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, lineHeight: 1.15, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Where Am I?</span>
              <span className="where-am-i-subtitle" style={{ fontSize: "11px", color: "#fed7aa", fontWeight: 700 }}>
                • Audio Guide
              </span>
            </div>
            <div className="where-am-i-context" style={{ fontSize: "11px", color: "#a7f3d0", fontWeight: 600, marginTop: "1px" }}>
              {pageData.label[language === "hi" ? "hi" : "en"] || pageData.label.en}
            </div>
          </div>
        </button>
      </aside>
    </>
  );
}
