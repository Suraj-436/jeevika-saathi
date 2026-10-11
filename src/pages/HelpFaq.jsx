import React, { useState } from "react";
import { FAQS } from "../data/faq";
import { useLanguage } from "../context/LanguageContext";
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, ShieldCheck } from "lucide-react";

export default function HelpFaq({ onNavigateToVoice }) {
  const { language, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");

  const getFaqQuestion = (faq) => {
    if (language === "hi") return faq.questionHi || faq.questionEn;
    if (language === "te") return faq.questionTe || faq.questionEn;
    if (language === "kn") return faq.questionKn || faq.questionEn;
    if (language === "ta") return faq.questionTa || faq.questionEn;
    if (language === "mr") return faq.questionMr || faq.questionEn;
    return faq.questionEn;
  };

  const getFaqAnswer = (faq) => {
    if (language === "hi") return faq.answerHi || faq.answerEn;
    if (language === "te") return faq.answerTe || faq.answerEn;
    if (language === "kn") return faq.answerKn || faq.answerEn;
    if (language === "ta") return faq.answerTa || faq.answerEn;
    if (language === "mr") return faq.answerMr || faq.answerEn;
    return faq.answerEn;
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const q = getFaqQuestion(faq);
    const a = getFaqAnswer(faq);
    return q.toLowerCase().includes(filterQuery.toLowerCase()) || a.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* 1. Header Banner */}
      <div className="gov-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span className="gov-badge gov-badge-blue">Citizen Assistance</span>
              <span className="gov-badge gov-badge-green">Multilingual Support</span>
            </div>
            <h1 style={{ fontSize: "20px", color: "var(--gov-navy)", margin: 0, fontWeight: 800 }}>
              {language === "hi" ? "अक्सर पूछे जाने वाले प्रश्न एवं सहायता (Help & FAQ)" :
               language === "te" ? "తరచుగా అడిగే ప్రశ్నలు & సహాయం (Help & FAQ)" :
               language === "kn" ? "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಸಹಾಯ (Help & FAQ)" :
               language === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள் மற்றும் உதவி (Help & FAQ)" :
               language === "mr" ? "सतत विचारले जाणारे प्रश्न आणि मदत (Help & FAQ)" :
               "Frequently Asked Questions & Citizen Help"}
            </h1>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "3px 0 0" }}>
              Official answers to common questions regarding PM-AJAY schemes, NSQF courses, and stipends.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToVoice}
            className="gov-btn gov-btn-primary"
          >
            <span>Ask via Voice</span>
          </button>
        </div>
      </div>

      {/* 2. Search Filter */}
      <div className="gov-panel" style={{ padding: "12px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Search size={16} style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder={
              language === "hi" ? "प्रश्न खोजें (उदा. पात्रता, वज़ीफ़ा, सेंटर)..." :
              language === "te" ? "ప్రశ్నలను శోధించండి (ఉదా. అర్హత, స్టైపెండ్, కేంద్రాలు)..." :
              language === "kn" ? "ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಡುಕಿ (ಉದಾ. ಅರ್ಹತೆ, ಸ್ಟೈಪೆಂಡ್, ಕೇಂದ್ರಗಳು)..." :
              language === "ta" ? "கேள்விகளைத் தேடுங்கள் (எ.கா. தகுதி, உதவித்தொகை, மையங்கள்)..." :
              language === "mr" ? "प्रश्न शोधा (उदा. पात्रता, शिष्यवृत्ती, केंद्रे)..." :
              "Search questions (e.g. eligibility, stipend, centers)..."
            }
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "var(--text-primary)",
              backgroundColor: "transparent"
            }}
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              style={{ fontSize: "11px", color: "var(--text-muted)", cursor: "pointer" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. Accordion List */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <h2 className="gov-panel-title">
            <HelpCircle size={17} style={{ color: "var(--gov-navy)" }} />
            <span>Verified Citizen Information ({filteredFaqs.length} Entries)</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const question = getFaqQuestion(faq);
            const answer = getFaqAnswer(faq);

            return (
              <div
                key={faq.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xs)",
                  overflow: "hidden",
                  backgroundColor: isOpen ? "#fcfdfe" : "#ffffff"
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    textAlign: "left",
                    backgroundColor: isOpen ? "#f1f5f9" : "transparent",
                    color: "var(--gov-navy)",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--india-saffron-dark)", fontWeight: 800 }}>Q{idx + 1}.</span>
                    <span>{question}</span>
                  </span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-light)", fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}>{answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Citizen Assistance Helpline */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        <div className="gov-panel">
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--gov-navy)", marginBottom: "6px" }}>
            District Social Welfare Liaison
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
            Beneficiaries can also approach the District Social Welfare Officer (DSWO) or designated Block Development Officers for physical verification assistance.
          </p>
          <span className="gov-badge gov-badge-neutral">Agra District Helpline: Facilitation Camp</span>
        </div>

        <div className="gov-panel">
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--gov-navy)", marginBottom: "6px" }}>
            Interactive Saathi Chatbot
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
            Need instant answers? Click the "Ask Saathi" button at the bottom right of the screen to chat in Hindi or English about schemes and NSQF trades.
          </p>
          <span className="gov-badge gov-badge-green">24x7 Automated Citizen Help</span>
        </div>
      </div>
    </div>
  );
}
