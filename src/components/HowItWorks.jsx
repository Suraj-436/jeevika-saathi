import React from "react";
import { CheckCircle2, Mic, BrainCircuit, Award, Workflow } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function HowItWorks({ onBegin }) {
  const { t } = useLanguage();

  const steps = [
    { num: 1, title: "Speak naturally in your language", desc: "Native voice recognition across 6+ regional dialects without complex written forms." },
    { num: 2, title: "Saathi understands your skills & goals", desc: "Recognizes traditional artisan heritage, education level, and income requirements." },
    { num: 3, title: "Get personalised NSQF recommendations", desc: "Matched with 100% GIA-sponsored certification courses and monthly DBT stipends." },
    { num: 4, title: "Follow your livelihood roadmap", desc: "Direct connection with local accredited district centers and enterprise toolkits." },
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-xs)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
            How it works
          </h3>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              backgroundColor: "var(--primary-green-light)",
              color: "var(--secondary-green)",
              padding: "2px 8px",
              borderRadius: "4px",
              textTransform: "uppercase"
            }}
          >
            4 Simple Steps
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          {steps.map((s) => (
            <div key={s.num} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--secondary-green)",
                  fontWeight: 700,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}
              >
                {s.num}
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.25 }}>
                  {s.title}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onBegin}
        className="gov-btn gov-btn-primary"
        style={{ width: "100%", justifyContent: "center", fontSize: "13px" }}
      >
        <span>Begin Now</span>
      </button>
    </div>
  );
}
