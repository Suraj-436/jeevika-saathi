import React from "react";
import {
  CheckCircle2, AlertCircle, Clock, Download, Printer,
  ChevronRight, Building2, Briefcase, ShieldCheck,
  AlertTriangle, Lock, Mic, Map, Info
} from "lucide-react";
import { useSession } from "../context/SessionContext";

// ─────────────────────────────────────────────────────────────────────────────
// ASSESSMENT COMPLETION CHECK
// A beneficiary is considered "assessed" when these core fields are all present.
// ─────────────────────────────────────────────────────────────────────────────
function isAssessmentComplete(bp) {
  if (!bp) return false;
  const hasOccupation = !!bp.current_occupation;
  const hasSkills = Array.isArray(bp.existing_skills) && bp.existing_skills.length > 0;
  const hasAspiration = !!bp.career_aspiration;
  const hasEmploymentPref = !!bp.employment_preference;
  // At least 3 of 4 core fields must be present
  const filled = [hasOccupation, hasSkills, hasAspiration, hasEmploymentPref].filter(Boolean).length;
  return filled >= 3;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE USER MONTHS from duration string
// ─────────────────────────────────────────────────────────────────────────────
function parseUserMonths(durationStr) {
  if (!durationStr) return null;
  const s = durationStr.toLowerCase();
  if (s.includes("not decide") || s.includes("not sure") || s.includes("undecided")) return null;
  if (s.includes("less than 1") || s.includes("< 1") || s.includes("few weeks")) return 0.75;
  if (s.includes("1 month")) return 1;
  if (s.includes("2 month")) return 2;
  if (s.includes("3 month")) return 3;
  if (s.match(/[456]/)) return 5;
  if (s.includes("more than 6")) return 7;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD STAGES from selected recommendation + user availability
// ─────────────────────────────────────────────────────────────────────────────
function buildStages(rec, userMonths) {
  // If we know the pathway steps from the recommendation, use them as stage names
  const pathwaySteps = rec?.pathway?.steps || [];
  const title = rec?.title || "Vocational Training";

  // If user availability is known and very short (≤ 1 month) → fast-track stages
  if (userMonths !== null && userMonths <= 1) {
    return [
      {
        stageNum: 1,
        name: "Voice Assessment & Skill Diagnostic",
        status: "Completed",
        statusColor: "#10b981",
        statusBg: "#ecfdf5",
        timeframe: "Completed",
        desc: "Voice-based livelihood assessment and prior skill diagnostic completed."
      },
      {
        stageNum: 2,
        name: "Skill Gap Analysis",
        status: "Completed",
        statusColor: "#10b981",
        statusBg: "#ecfdf5",
        timeframe: "Completed",
        desc: `Skill gaps identified for "${title}" pathway.`
      },
      {
        stageNum: 3,
        name: "Intensive Skill Bridge Training",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "Approx. 3–4 Weeks",
        desc: `Fast-track intensive skilling in "${title}". Verify exact duration and schedule at your nearest PMKK centre.`
      },
      {
        stageNum: 4,
        name: "Assessment & Certification",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "After Training",
        desc: "Practical competency evaluation and skill certification. Certification body to be confirmed at PMKK."
      },
      {
        stageNum: 5,
        name: pathwaySteps[pathwaySteps.length - 1] || "Livelihood / Employment",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "Post-Certification",
        desc: "Transition to your target livelihood. Options include employment, self-employment or entrepreneurship based on your assessed preference."
      }
    ];
  }

  // 2-month pathway
  if (userMonths !== null && userMonths <= 2) {
    return [
      {
        stageNum: 1,
        name: "Voice Assessment & Skill Diagnostic",
        status: "Completed",
        statusColor: "#10b981",
        statusBg: "#ecfdf5",
        timeframe: "Completed",
        desc: "Voice-based livelihood assessment and prior skill diagnostic completed."
      },
      {
        stageNum: 2,
        name: "Skill Gap Analysis",
        status: "Completed",
        statusColor: "#10b981",
        statusBg: "#ecfdf5",
        timeframe: "Completed",
        desc: `Skill gaps identified for "${title}" pathway.`
      },
      {
        stageNum: 3,
        name: "Foundation & Core Skill Training",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "Approx. Weeks 1–5",
        desc: `Core vocational training in "${title}". Training duration and provider to be confirmed at PMKK.`
      },
      {
        stageNum: 4,
        name: "Advanced Practical Application",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "Approx. Weeks 6–7",
        desc: "Hands-on applied practice and project work to consolidate skills."
      },
      {
        stageNum: 5,
        name: "Assessment & Certification",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "Approx. Week 8",
        desc: "Competency assessment and skill certificate issuance. Certifying body to be confirmed at PMKK."
      },
      {
        stageNum: 6,
        name: pathwaySteps[pathwaySteps.length - 1] || "Livelihood / Employment",
        status: "Upcoming",
        statusColor: "#64748b",
        statusBg: "#f1f5f9",
        timeframe: "Post-Certification",
        desc: "Transition to your target livelihood based on your employment or self-employment preference."
      }
    ];
  }

  // Default (3 months / undecided / longer) — standard 6-stage pathway
  return [
    {
      stageNum: 1,
      name: "Voice Assessment & Skill Diagnostic",
      status: "Completed",
      statusColor: "#10b981",
      statusBg: "#ecfdf5",
      timeframe: "Completed",
      desc: "Voice-based livelihood assessment and prior skill diagnostic completed via Saathi AI."
    },
    {
      stageNum: 2,
      name: "Skill Gap Analysis",
      status: "Completed",
      statusColor: "#10b981",
      statusBg: "#ecfdf5",
      timeframe: "Completed",
      desc: `Skill gaps analysed for "${title}" pathway and training pathway recommended.`
    },
    {
      stageNum: 3,
      name: "Foundation Training",
      status: "Upcoming",
      statusColor: "#64748b",
      statusBg: "#f1f5f9",
      timeframe: "Approx. Weeks 1–4",
      desc: `Core theory, fundamentals and safety training for "${title}". Training provider to be confirmed at PMKK.`
    },
    {
      stageNum: 4,
      name: "Core & Advanced Practical Training",
      status: "Upcoming",
      statusColor: "#64748b",
      statusBg: "#f1f5f9",
      timeframe: "Approx. Weeks 5–10",
      desc: "Hands-on skill development, advanced techniques and applied project work at the vocational training centre."
    },
    {
      stageNum: 5,
      name: "Assessment & Certification",
      status: "Upcoming",
      statusColor: "#64748b",
      statusBg: "#f1f5f9",
      timeframe: "Approx. Week 11–12",
      desc: "Practical competency assessment and skill certificate. Certifying body and NSQF level to be verified at PMKK."
    },
    {
      stageNum: 6,
      name: pathwaySteps[pathwaySteps.length - 1] || "Livelihood / Employment",
      status: "Upcoming",
      statusColor: "#64748b",
      statusBg: "#f1f5f9",
      timeframe: "Post-Certification",
      desc: "Transition to your target livelihood. Employment, self-employment or entrepreneurship based on your stated preference."
    }
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTED LABEL helper
// ─────────────────────────────────────────────────────────────────────────────
function MutedValue({ children }) {
  return (
    <span style={{ color: "#94a3b8", fontStyle: "italic", fontWeight: 500 }}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE 1 — BLUEPRINT / BEFORE ASSESSMENT
// ─────────────────────────────────────────────────────────────────────────────
function BlueprintState({ onStartVoice }) {
  const blueprintStages = [
    { icon: "○", label: "Voice Assessment & Skill Diagnostic" },
    { icon: "○", label: "Skill Gap Analysis" },
    { icon: "○", label: "Recommended Training Program" },
    { icon: "○", label: "Practical Training & Application" },
    { icon: "○", label: "Assessment & Certification" },
    { icon: "○", label: "Employment / Self-Employment" },
  ];

  return (
    <div style={{ maxWidth: "100%", padding: "0 32px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
          Your Livelihood Roadmap
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>
          A personalized step-by-step pathway from your current skills to training, certification and livelihood.
        </p>
      </div>

      {/* Assessment Required Banner */}
      <div style={{
        backgroundColor: "#fff7ed",
        border: "1.5px solid #fed7aa",
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <Lock size={24} color="#ea580c" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#9a3412", marginBottom: "6px" }}>
            Assessment Required
          </div>
          <div style={{ fontSize: "13px", color: "#7c2d12", lineHeight: 1.6, marginBottom: "16px" }}>
            Your personalized roadmap will be generated once you complete the Voice Assessment. 
            Saathi AI will analyse your skills, aspiration, training availability, and location to 
            create a step-by-step livelihood pathway tailored to you.
          </div>
          <button
            type="button"
            onClick={onStartVoice}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#ea580c", color: "#ffffff",
              padding: "10px 20px", borderRadius: "8px", border: "none",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.35)"
            }}
          >
            <Mic size={16} /> Start Voice Assessment →
          </button>
        </div>
      </div>

      {/* Blueprint Timeline */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--gov-navy)", margin: 0 }}>
            Roadmap Preview
          </h3>
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px",
            backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0"
          }}>
            PREVIEW — Personalized after assessment
          </span>
        </div>

        <div style={{ position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: "24px", bottom: "24px", left: "24px",
            width: "2px", backgroundColor: "#e2e8f0", zIndex: 0
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}>
            {blueprintStages.map((stage, idx) => (
              <div key={idx} style={{ display: "flex", gap: "16px", opacity: 0.5 }}>
                {/* Node */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  backgroundColor: "#f8fafc", border: "2px dashed #cbd5e1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: "#94a3b8", fontSize: "20px"
                }}>
                  <Lock size={18} color="#94a3b8" />
                </div>
                {/* Card */}
                <div style={{
                  flex: 1, backgroundColor: "#f8fafc", border: "1px dashed #cbd5e1",
                  borderRadius: "10px", padding: "14px 16px"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "2px" }}>
                    STAGE {idx + 1}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>
                    {stage.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pathway Summary — placeholder */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "12px", padding: "16px"
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)", textTransform: "uppercase", marginBottom: "12px" }}>
          Pathway Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", fontSize: "13px" }}>
          {[
            { label: "Current Livelihood", value: "Will be assessed" },
            { label: "Target Role", value: "Will be recommended" },
            { label: "Training Duration", value: "Will be determined" },
            { label: "Your Availability", value: "To be collected" },
            { label: "Expected Outcome", value: "To be determined" },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{item.label}</div>
              <div style={{ marginTop: "2px" }}><MutedValue>{item.value}</MutedValue></div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Grid — placeholder */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Training Details */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={17} style={{ color: "#ea580c" }} /> Training Details
          </h3>
          <div style={{ display: "grid", gap: "10px", fontSize: "13px" }}>
            {[
              { label: "Training Program", value: "Will be recommended after assessment" },
              { label: "Provider", value: "Will be identified after assessment" },
              { label: "Your Availability", value: "To be collected during assessment" },
              { label: "Course Duration", value: "Will be shown when training is confirmed" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{r.label}</span>
                <MutedValue>{r.value}</MutedValue>
              </div>
            ))}
          </div>
        </div>

        {/* Government Support */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={17} style={{ color: "#10b981" }} /> Government Support
          </h3>
          <div style={{ display: "grid", gap: "10px", fontSize: "13px" }}>
            {[
              { label: "Training Support", value: "To be verified" },
              { label: "DBT Stipend", value: "To be verified" },
              { label: "Certification", value: "To be verified" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{r.label}</span>
                <MutedValue>{r.value}</MutedValue>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>
            <Info size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Government support details (GIA subsidy, DBT stipend, certification) will be confirmed only after your PMKK counselling appointment.
          </div>
        </div>

        {/* Expected Outcome */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Briefcase size={17} style={{ color: "#3b82f6" }} /> Expected Outcome
          </h3>
          <div style={{ display: "grid", gap: "10px", fontSize: "13px" }}>
            {[
              { label: "Primary Outcome", value: "To be determined from assessment" },
              { label: "Target Role", value: "Will be recommended" },
              { label: "Placement", value: "To be facilitated post-certification" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{r.label}</span>
                <MutedValue>{r.value}</MutedValue>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE 2 — DYNAMIC ROADMAP AFTER ASSESSMENT
// ─────────────────────────────────────────────────────────────────────────────
function AssessedRoadmap({ beneficiaryProfile, selectedRecommendation, onStartVoice }) {
  // ── Resolved values from beneficiaryProfile ──────────────────────────────
  const name =
    beneficiaryProfile?.fullName ||
    beneficiaryProfile?.full_name ||
    beneficiaryProfile?.name ||
    null;

  const userAvailability =
    beneficiaryProfile?.trainingAvailabilityDuration ||
    beneficiaryProfile?.training_availability_duration ||
    null;

  const userSchedule =
    beneficiaryProfile?.trainingSchedule ||
    beneficiaryProfile?.training_schedule ||
    null;

  const currentOccupation =
    beneficiaryProfile?.current_occupation || null;

  const aspiration =
    beneficiaryProfile?.career_aspiration || null;

  const employmentPref =
    beneficiaryProfile?.employment_preference || null;

  const mobilityKm =
    beneficiaryProfile?.mobility_limit_km || null;

  // ── Selected recommendation ───────────────────────────────────────────────
  const rec = selectedRecommendation || null;
  const targetRole = rec?.title || aspiration || "Recommended Livelihood Role";
  const trainingTitle = rec?.training?.title || null;
  const trainingDuration = rec?.training?.duration || null;

  // ── Parse user months ─────────────────────────────────────────────────────
  const userMonths = parseUserMonths(userAvailability);
  const isUndecided = !userAvailability || userAvailability.toLowerCase().includes("not decide") || userAvailability.toLowerCase().includes("not sure");

  // ── Duration compatibility notice ─────────────────────────────────────────
  const durationNotice = (() => {
    if (!rec || !trainingDuration) return null;
    if (isUndecided || userMonths === null) {
      return {
        type: "undecided",
        title: "Training Duration Preference Not Decided",
        message: "Your training duration preference was not recorded. The standard pathway is shown below. Please speak to a PMKK counsellor to confirm actual duration and schedule."
      };
    }
    // Parse training months from rec
    const tLower = trainingDuration.toLowerCase();
    let trainMonths = 3;
    if (tLower.includes("20 day") || tLower.includes("30 day") || tLower.includes("1 month") || tLower.includes("4 week")) trainMonths = 1;
    else if (tLower.includes("40 day") || tLower.includes("45 day") || tLower.includes("60 day") || tLower.includes("2 month")) trainMonths = 2;
    else if (tLower.includes("90 day") || tLower.includes("3 month") || tLower.includes("300 hr") || tLower.includes("240 hr") || tLower.includes("200 hr")) trainMonths = 3;
    else if (tLower.includes("6 month") || tLower.includes("180 day")) trainMonths = 6;

    if (trainMonths > userMonths + 0.3) {
      return {
        type: "shorter",
        title: "Training Duration Notice",
        message: `Your available training period is ${userAvailability}, while the recommended "${trainingTitle || targetRole}" program may require approximately ${trainingDuration}. Discuss modular, RPL or part-time options with a PMKK counsellor.`
      };
    }
    return {
      type: "compatible",
      title: "Training Duration Compatible",
      message: `Your available training period (${userAvailability}${userSchedule ? ", " + userSchedule : ""}) is compatible with the recommended training duration (${trainingDuration}).`
    };
  })();

  // ── Build dynamic stages ──────────────────────────────────────────────────
  const stages = buildStages(rec, userMonths);
  const completedCount = stages.filter(s => s.status === "Completed").length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  // ── Expected outcome from employment preference ───────────────────────────
  const outcomeLabel = (() => {
    if (!employmentPref) return "To be confirmed";
    const ep = employmentPref.toLowerCase();
    if (ep.includes("self")) return "Self-Employment";
    if (ep.includes("wage") || ep.includes("employ")) return "Formal Employment";
    return employmentPref;
  })();

  return (
    <div style={{ maxWidth: "100%", padding: "0 32px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* 1. Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
            Your Livelihood Roadmap
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>
            A personalized step-by-step pathway from your current skills to training, certification and livelihood.
          </p>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
            {name && (
              <>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Beneficiary</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--gov-navy)" }}>{name}</span>
                </div>
                <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-light)" }} />
              </>
            )}
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Target Role</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#c2410c" }}>{targetRole}</span>
            </div>
            <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-light)" }} />
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>Your Availability</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: userAvailability && !isUndecided ? "#0f766e" : "#64748b" }}>
                {userAvailability && !isUndecided
                  ? `${userAvailability}${userSchedule ? ` (${userSchedule})` : ""}`
                  : <MutedValue>Not collected</MutedValue>
                }
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                backgroundColor: "#ffffff", color: "var(--text-secondary)",
                padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)",
                fontSize: "12px", fontWeight: 600, cursor: "pointer"
              }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              onClick={() => alert("PDF download coming soon. Your roadmap will be available once your PMKK counselling is complete.")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                backgroundColor: "#ffffff", color: "var(--gov-navy)",
                padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1",
                fontSize: "12px", fontWeight: 600, cursor: "pointer"
              }}
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          <div style={{ marginTop: "4px", textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)", marginBottom: "4px" }}>
              Progress: {completedCount} of {stages.length} stages completed
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "140px", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "#10b981" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#10b981" }}>{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. No selected rec — nudge user */}
      {!rec && (
        <div style={{
          backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "12px",
          padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "14px"
        }}>
          <Info size={20} color="#1d4ed8" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a8a", marginBottom: "3px" }}>
              Select a Recommendation to Personalise Your Roadmap
            </div>
            <div style={{ fontSize: "13px", color: "#1e40af", lineHeight: 1.5 }}>
              Go to the <strong>AI Recommendations</strong> page and click <strong>"View Livelihood Pathway"</strong> on your preferred recommendation. 
              The roadmap stages and training details below will update automatically.
            </div>
          </div>
        </div>
      )}

      {/* 3. Duration compatibility banner — only if rec selected */}
      {durationNotice && (
        <div style={{
          backgroundColor: durationNotice.type === "shorter" ? "#fffbeb" : durationNotice.type === "compatible" ? "#f0fdf4" : "#f8fafc",
          border: `1.5px solid ${durationNotice.type === "shorter" ? "#fde68a" : durationNotice.type === "compatible" ? "#bbf7d0" : "#e2e8f0"}`,
          borderRadius: "12px", padding: "16px 20px",
          display: "flex", alignItems: "flex-start", gap: "14px",
          boxShadow: "var(--shadow-sm)"
        }}>
          {durationNotice.type === "shorter" ? (
            <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
          ) : durationNotice.type === "compatible" ? (
            <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
          ) : (
            <AlertCircle size={22} color="#0284c7" style={{ flexShrink: 0, marginTop: "2px" }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "14px", fontWeight: 800, marginBottom: "3px",
              color: durationNotice.type === "shorter" ? "#92400e" : durationNotice.type === "compatible" ? "#166534" : "#0369a1"
            }}>
              {durationNotice.title}
            </div>
            <div style={{
              fontSize: "13px", lineHeight: 1.5,
              color: durationNotice.type === "shorter" ? "#78350f" : durationNotice.type === "compatible" ? "#14532d" : "#334155"
            }}>
              {durationNotice.message}
            </div>
          </div>
        </div>
      )}

      {/* 4. Pathway Summary Strip */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "12px", padding: "16px"
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)", textTransform: "uppercase", marginBottom: "12px" }}>
          Pathway Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", fontSize: "13px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>Current Livelihood</div>
            <div style={{ marginTop: "2px", fontWeight: 700, color: "var(--text-dark)" }}>
              {currentOccupation || <MutedValue>Not provided</MutedValue>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>Target Role</div>
            <div style={{ marginTop: "2px", fontWeight: 700, color: "var(--text-dark)" }}>{targetRole}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>Your Availability</div>
            <div style={{ marginTop: "2px", fontWeight: 700, color: userAvailability && !isUndecided ? "#0f766e" : "#94a3b8" }}>
              {userAvailability && !isUndecided ? userAvailability : <MutedValue>Not decided</MutedValue>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>Training Duration</div>
            <div style={{ marginTop: "2px", fontWeight: 700, color: "var(--text-dark)" }}>
              {trainingDuration || <MutedValue>To be confirmed</MutedValue>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>Expected Outcome</div>
            <div style={{ marginTop: "2px", fontWeight: 700, color: "var(--text-dark)" }}>
              {employmentPref ? outcomeLabel : <MutedValue>To be determined</MutedValue>}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Visual Timeline */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
            Your Livelihood Journey
          </h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Timeline: <strong style={{ color: "var(--gov-navy)" }}>
              {userAvailability && !isUndecided ? userAvailability : "Standard Pathway"}
            </strong>
          </span>
        </div>

        <div style={{ position: "relative" }}>
          {/* Connector Line */}
          <div style={{
            position: "absolute", top: "24px", bottom: "24px", left: "24px",
            width: "2px", backgroundColor: "#e2e8f0", zIndex: 0
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
            {stages.map((st) => (
              <div
                key={st.stageNum}
                style={{ display: "flex", gap: "16px", opacity: st.status === "Upcoming" ? 0.75 : 1 }}
              >
                {/* Node */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  backgroundColor: st.statusBg,
                  border: `2px solid ${st.statusColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  {st.status === "Completed" ? (
                    <CheckCircle2 size={24} style={{ color: st.statusColor }} />
                  ) : (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: st.statusColor }}>{st.stageNum}</span>
                  )}
                </div>

                {/* Card */}
                <div style={{
                  flex: 1, backgroundColor: "#ffffff",
                  border: `1px solid ${st.status === "Completed" ? "#bbf7d0" : "var(--border)"}`,
                  borderRadius: "12px", padding: "16px",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "2px" }}>STAGE {st.stageNum}</div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--gov-navy)", margin: 0 }}>{st.name}</h4>
                    </div>
                    <div style={{
                      backgroundColor: st.statusBg, color: st.statusColor,
                      padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, flexShrink: 0
                    }}>
                      {st.status === "Completed" ? `✓ ${st.status}` : st.status}
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                    {st.desc}
                  </p>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> {st.timeframe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "16px" }}>

        {/* Training Details */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={17} style={{ color: "#ea580c" }} /> Training Details
          </h3>
          <div style={{ display: "grid", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Training Program</span>
              <span style={{ fontWeight: 700, color: "var(--text-dark)", textAlign: "right" }}>
                {trainingTitle || <MutedValue>Will be recommended at PMKK</MutedValue>}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Provider</span>
              <MutedValue>To be identified — verify at PMKK</MutedValue>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Your Availability</span>
              <span style={{ color: userAvailability && !isUndecided ? "#0f766e" : "#94a3b8", fontWeight: 700, textAlign: "right" }}>
                {userAvailability && !isUndecided
                  ? `${userAvailability}${userSchedule ? ` · ${userSchedule}` : ""}`
                  : <MutedValue>Not decided</MutedValue>
                }
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Recommended Duration</span>
              <span style={{ fontWeight: 700, color: "var(--text-dark)", textAlign: "right" }}>
                {trainingDuration || <MutedValue>To be confirmed</MutedValue>}
              </span>
            </div>
            {mobilityKm && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Mobility Preference</span>
                <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>Within {mobilityKm} km</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "#f8fafc", borderRadius: "6px", fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>
            <Info size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Training provider, batch dates and centre location will be confirmed at your PMKK counselling appointment.
          </div>
        </div>

        {/* Government Support */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={17} style={{ color: "#10b981" }} /> Government Support
          </h3>
          <div style={{ display: "grid", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Training Support</span>
              <MutedValue>To be verified at PMKK</MutedValue>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>DBT Stipend</span>
              <MutedValue>Eligibility to be verified</MutedValue>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Certification Body</span>
              <MutedValue>To be confirmed at PMKK</MutedValue>
            </div>
          </div>
          <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "#f0fdf4", borderRadius: "6px", fontSize: "11px", color: "#166534", lineHeight: 1.5, border: "1px solid #bbf7d0" }}>
            <ShieldCheck size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Government schemes (GIA, DBT stipend, NSQF certification) are subject to eligibility verification at your counselling session. No benefits are pre-approved until verified.
          </div>
        </div>

        {/* Expected Outcome */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Briefcase size={17} style={{ color: "#3b82f6" }} /> Expected Outcome
          </h3>
          <div style={{ display: "grid", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Primary Outcome</span>
              <span style={{ fontWeight: 700, color: "var(--text-dark)", textAlign: "right" }}>
                {employmentPref ? outcomeLabel : <MutedValue>To be determined</MutedValue>}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Target Role</span>
              <span style={{ fontWeight: 700, color: "var(--text-dark)", textAlign: "right" }}>{targetRole}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Placement Support</span>
              <MutedValue>To be facilitated post-certification</MutedValue>
            </div>
          </div>
          {rec?.pathway?.steps && rec.pathway.steps.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Pathway Steps
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
                {rec.pathway.steps.map((step, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "var(--gov-navy)" }}>
                      {step}
                    </span>
                    {i < rec.pathway.steps.length - 1 && <ChevronRight size={10} style={{ color: "#94a3b8" }} />}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 7. Next Action CTA */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0",
        borderRadius: "12px", padding: "20px 24px",
        display: "flex", alignItems: "flex-start", gap: "16px"
      }}>
        <Map size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}>
            Your Next Step
          </div>
          <div style={{ fontSize: "13px", color: "#14532d", lineHeight: 1.6 }}>
            Visit your nearest <strong>PMKK (Pradhan Mantri Kaushal Kendra)</strong> centre with this roadmap and your Aadhaar card 
            to confirm enrollment, verify government support eligibility, and receive your official training schedule.
          </div>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function Roadmap({ userProfile, onStartVoice }) {
  const { beneficiaryProfile, selectedRecommendation } = useSession();

  const assessed = isAssessmentComplete(beneficiaryProfile);

  if (!assessed) {
    return <BlueprintState onStartVoice={onStartVoice} />;
  }

  return (
    <AssessedRoadmap
      beneficiaryProfile={beneficiaryProfile}
      selectedRecommendation={selectedRecommendation}
      onStartVoice={onStartVoice}
    />
  );
}
