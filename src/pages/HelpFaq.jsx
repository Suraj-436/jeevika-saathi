import React, { useState } from "react";
import { FAQS } from "../data/faq";
import { useLanguage } from "../context/LanguageContext";
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, ShieldCheck } from "lucide-react";

export default function HelpFaq({ onNavigateToVoice }) {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");

  const filteredFaqs = FAQS.filter((faq) => {
    const q = language === "hi" ? faq.questionHi : faq.questionEn;
    const a = language === "hi" ? faq.answerHi : faq.answerEn;
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
              <span className="gov-badge gov-badge-green">Bilingual Support</span>
            </div>
            <h1 style={{ fontSize: "20px", color: "var(--gov-navy)", margin: 0, fontWeight: 800 }}>
              {language === "hi" ? "अक्सर पूछे जाने वाले प्रश्न एवं सहायता (Help & FAQ)" : "Frequently Asked Questions & Citizen Help"}
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
            placeholder={language === "hi" ? "प्रश्न खोजें (उदा. पात्रता, वज़ीफ़ा, सेंटर)..." : "Search questions (e.g. eligibility, stipend, centers)..."}
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
            const question = language === "hi" ? faq.questionHi : faq.questionEn;
            const answer = language === "hi" ? faq.answerHi : faq.answerEn;

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
