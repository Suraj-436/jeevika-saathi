import React from "react";
import { PM_AJAY_KNOWLEDGE } from "../data/pmAjayKnowledge";
import { useLanguage } from "../context/LanguageContext";
import { ShieldCheck, Award, Building2, CheckCircle2, IndianRupee, FileText } from "lucide-react";

export default function AboutPmAjay({ onNavigateToVoice }) {
  const { language } = useLanguage();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* 1. Header Banner */}
      <div className="gov-panel">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span className="gov-badge gov-badge-blue">Central Sector Scheme</span>
              <span className="gov-badge gov-badge-green">100% GIA Grants</span>
            </div>
            <h1 style={{ fontSize: "22px", color: "var(--gov-navy)", margin: "0 0 6px 0", fontWeight: 800 }}>
              {language === "hi" 
                ? "प्रधानमंत्री अनुसूचित जाति अभ्युदय योजना (PM-AJAY)" 
                : PM_AJAY_KNOWLEDGE.schemeName}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, maxWidth: "780px" }}>
              {PM_AJAY_KNOWLEDGE.ministry} | {PM_AJAY_KNOWLEDGE.classification}
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToVoice}
            className="gov-btn gov-btn-primary"
          >
            <span>Start Voice Assessment</span>
          </button>
        </div>
      </div>

      {/* 2. Scheme Overview & Objective */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <h2 className="gov-panel-title">
            <ShieldCheck size={18} style={{ color: "var(--gov-navy)" }} />
            <span>Scheme Objective & Livelihood Mission</span>
          </h2>
        </div>

        <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-primary)", marginBottom: "var(--space-4)" }}>
          Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY) is a comprehensive umbrella scheme aimed at reducing poverty of the Scheduled Caste (SC) communities through generation of additional employment opportunities through skill development, income-generating schemes, and related socio-economic infrastructure development.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
          <div style={{ padding: "14px", backgroundColor: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--gov-navy)", marginBottom: "4px" }}>
              Target Beneficiaries
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
              {PM_AJAY_KNOWLEDGE.eligibilityCriteria.socialCategory}. Family income up to ₹2.50 Lakh per annum with priority to traditional artisan households.
            </p>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--gov-navy)", marginBottom: "4px" }}>
              Age Eligibility
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
              {PM_AJAY_KNOWLEDGE.eligibilityCriteria.ageRange}. Special relaxations for women and single-earner households.
            </p>
          </div>

          <div style={{ padding: "14px", backgroundColor: "var(--surface-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--gov-navy)", marginBottom: "4px" }}>
              Direct Financial Support (DBT)
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
              {PM_AJAY_KNOWLEDGE.skillingBenefits.monthlyStipend}. Zero fees for tuition or exams.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Three Core Scheme Components */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <h2 className="gov-panel-title">
            <Building2 size={18} style={{ color: "var(--gov-navy)" }} />
            <span>Three Core Components of PM-AJAY</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-4)" }}>
          {PM_AJAY_KNOWLEDGE.coreComponents.map((comp, idx) => (
            <div
              key={comp.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xs)",
                padding: "16px",
                backgroundColor: idx === 1 ? "#f0fdfa" : "#ffffff",
                borderColor: idx === 1 ? "#0d9488" : "var(--border)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="gov-badge gov-badge-neutral">Component {idx + 1}</span>
                {idx === 1 && <span className="gov-badge gov-badge-green">Portal Focus</span>}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", marginBottom: "6px" }}>
                {language === "hi" ? comp.nameHi : comp.name}
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                {comp.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Skilling & Livelihood Entitlements Table */}
      <div className="gov-panel">
        <div className="gov-panel-header">
          <h2 className="gov-panel-title">
            <Award size={18} style={{ color: "var(--gov-navy)" }} />
            <span>Entitlements under Grants-in-Aid (GIA) Component</span>
          </h2>
        </div>

        <table className="gov-table" aria-label="GIA Entitlements">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Entitlement / Benefit</th>
              <th style={{ width: "45%" }}>Provision Details</th>
              <th style={{ width: "25%" }}>Authority / Mode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Course Tuition & Assessment Fee</strong></td>
              <td>100% GIA Grant-in-Aid subsidy. Zero fee charged to beneficiary.</td>
              <td><span className="gov-badge gov-badge-green">100% Free</span></td>
            </tr>
            <tr>
              <td><strong>Monthly Stipend Allowance</strong></td>
              <td>₹3,000 to ₹4,500 per month during formal training period for boarding & transport.</td>
              <td><span className="gov-badge gov-badge-blue">Direct Benefit Transfer (DBT)</span></td>
            </tr>
            <tr>
              <td><strong>Vocational Toolkit Allowance</strong></td>
              <td>Free certified starter toolkits (valued up to ₹8,000–₹10,000) upon trade certification.</td>
              <td><span className="gov-badge gov-badge-neutral">Empanelled PMKK Hub</span></td>
            </tr>
            <tr>
              <td><strong>Post-Training Tracking & Placement</strong></td>
              <td>Mandatory 12-month post-training wage verification or Mudra micro-enterprise linkage.</td>
              <td><span className="gov-badge gov-badge-amber">State SC Development Corp</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Official Guidelines Notice */}
      <div style={{ padding: "12px 16px", backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-xs)", fontSize: "12px", color: "#92400e" }}>
        <strong>Notice: </strong>
        {PM_AJAY_KNOWLEDGE.disclaimer}
      </div>
    </div>
  );
}
