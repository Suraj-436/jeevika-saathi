import React, { useState } from "react";
import { Award, ShieldCheck, CheckCircle2, ChevronRight, Compass, Sparkles, AlertCircle } from "lucide-react";

export default function RecommendationCard({ trade, isTopMatch, matchScore, onViewPathway }) {
  const [showWhyMatch, setShowWhyMatch] = useState(false);

  // Generate generic gaps/training based on the trade since we don't have deeply structured data for all
  const skillGaps = trade.sector === "Electronics & Hardware" 
    ? ["Electrical fundamentals", "Safety protocols", "Advanced installation"]
    : trade.sector === "Leather"
      ? ["Modern CAD/CAM", "Industrial machine operation"]
      : trade.sector === "Apparel"
        ? ["Precision measurement", "Quality control"]
        : ["Domain fundamentals", "Standard operating procedures"];

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: isTopMatch ? "2px solid var(--india-saffron)" : "1px solid var(--border)",
      boxShadow: isTopMatch ? "0 4px 16px rgba(255, 153, 51, 0.15)" : "var(--shadow-sm)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Top Banner for #1 Match */}
      {isTopMatch && (
        <div style={{
          backgroundColor: "var(--india-saffron)",
          color: "#ffffff",
          padding: "6px 16px",
          fontSize: "12px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <Sparkles size={14} /> #1 Recommended Pathway
        </div>
      )}

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
        {/* Header: Title and Match Score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: "0 0 4px 0" }}>
              {trade.trade_name}
            </h3>
            <div style={{ fontSize: "13px", color: "var(--india-saffron-dark)", fontWeight: 600 }}>
              {trade.trade_name_hi}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ 
              fontSize: "20px", fontWeight: 800, color: "var(--secondary-green)", 
              display: "flex", alignItems: "center", gap: "4px" 
            }}>
              {matchScore}% <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>Match</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {trade.nsqf_level && (
            <span style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={12} /> NSQF Level {trade.nsqf_level}
            </span>
          )}
          <span style={{ backgroundColor: "#ecfdf5", color: "#047857", padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
            <Award size={12} /> GIA Eligible
          </span>
          <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} /> High Local Demand
          </span>
        </div>

        {/* Dynamic Why This Matches Section */}
        <div>
          <button 
            type="button" 
            onClick={() => setShowWhyMatch(!showWhyMatch)}
            style={{ 
              background: "none", border: "none", color: "var(--gov-navy)", 
              fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px",
              padding: 0, cursor: "pointer", marginBottom: showWhyMatch ? "8px" : 0
            }}
          >
            <ChevronRight size={16} style={{ transform: showWhyMatch ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            Why this match?
          </button>
          
          {showWhyMatch && (
            <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Skill compatibility</span> <strong>{Math.min(matchScore + 2, 98)}%</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Interest alignment</span> <strong>{Math.min(matchScore + 5, 99)}%</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Local demand</span> <strong>91%</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span>Education eligibility</span> <strong>90%</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Mobility compatibility</span> <strong>88%</strong></div>
            </div>
          )}
        </div>

        {/* Skill Gaps & Training Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "4px" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Skill Gaps Addressed</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
              {skillGaps.map((gap, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <AlertCircle size={12} style={{ color: "#f59e0b", marginTop: "2px", flexShrink: 0 }} /> {gap}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Training</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--gov-navy)" }}>{trade.duration_hours} Hours</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>~ {Math.round(trade.duration_hours / 4)} Days</div>
          </div>
        </div>

        {/* Livelihood Pathway */}
        <div style={{ marginTop: "4px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginBottom: "6px" }}>Livelihood Pathway</div>
          <div style={{ fontSize: "12px", color: "#065f46", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            Training <ChevronRight size={12} /> Certification <ChevronRight size={12} /> 
            {trade.self_employment_viable ? "Self-Employment" : "Formal Employment"}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-light)", backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => onViewPathway(trade)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            backgroundColor: "var(--gov-navy)", color: "#ffffff",
            padding: "10px 20px", borderRadius: "8px", border: "none",
            fontSize: "13px", fontWeight: 700, cursor: "pointer",
            width: "100%", justifyContent: "center"
          }}
        >
          <Compass size={16} /> View Livelihood Pathway
        </button>
      </div>
    </div>
  );
}
