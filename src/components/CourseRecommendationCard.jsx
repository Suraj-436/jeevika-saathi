// src/components/CourseRecommendationCard.jsx
// Accessible, responsive Course Recommendation Card strictly bound to verified NIELIT NSQF dataset.
// Displays Course Name, Sector, Skill Cluster, Expected Skills, NSQF Level,
// Notional Hours, Estimated Duration, Course Type, Entry Profile (with inferred label),
// Verification Status (current vs historical), Official Source Link, and Fee Note.

import React, { useState } from "react";
import { 
  Award, Clock, BookOpen, ExternalLink, CheckCircle2, 
  AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, 
  GraduationCap, Info, HelpCircle, Layers, Sparkles
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CourseRecommendationCard({ course, isTop, onSelectCourse }) {
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(isTop);

  if (!course) return null;

  const isVerified = course.is_verified || course.verification_status === "CURRENT_VERIFIED";
  const isHistorical = course.is_historical || !isVerified;

  // Localized UI strings for accessibility and simplicity
  const labels = {
    en: {
      verified: "Current Verified Course",
      historical: "Historical Record (Unverified)",
      nsqf: `NSQF Level ${course.nsqf_level}`,
      hours: `${course.notional_hours} Notional Hours`,
      duration: course.est_duration_weeks ? `~${course.est_duration_weeks} Weeks` : "Flexible Duration",
      type: course.course_type || (course.is_modular ? "Modular NOS" : "Full Qualification"),
      entryProfile: "Entry Requirement",
      inferredBadge: "Inferred from NSQF norms",
      expectedSkills: "Skills You Will Develop",
      matchingReasons: "Why This Course Is Recommended",
      officialSource: "View Official Source",
      feeNote: "Fee Information",
      sourceDisclaimer: "Official reference only; check local centre for current batch schedule.",
      noGuaranteeNotice: "Completion certifies NSQF competency; does not guarantee job placement or automatic admission.",
      whyRecommended: "Why this course?",
      hideDetails: "Hide details",
      showDetails: "View details & skills",
      advisory: "Eligibility Advisory"
    },
    hi: {
      verified: "वर्तमान सत्यापित पाठ्यक्रम",
      historical: "ऐतिहासिक रिकॉर्ड (असत्यापित)",
      nsqf: `NSQF स्तर ${course.nsqf_level}`,
      hours: `${course.notional_hours} घंटे प्रशिक्षण`,
      duration: course.est_duration_weeks ? `लगभग ${course.est_duration_weeks} सप्ताह` : "लचीली अवधि",
      type: course.course_type || (course.is_modular ? "मॉड्यूलर कोर्स" : "पूर्ण योग्यता"),
      entryProfile: "प्रवेश आवश्यकता",
      inferredBadge: "NSQF मानकों से अनुमानित",
      expectedSkills: "सीखे जाने वाले कौशल",
      matchingReasons: "सिफारिश का कारण",
      officialSource: "आधिकारिक स्रोत देखें",
      feeNote: "शुल्क जानकारी",
      sourceDisclaimer: "केवल संदर्भ लिंक; वर्तमान प्रवेश के लिए स्थानीय केंद्र से संपर्क करें।",
      noGuaranteeNotice: "प्रमाणपत्र दक्षता प्रमाणित करता है; नौकरी या प्रवेश की गारंटी नहीं देता।",
      whyRecommended: "यह कोर्स क्यों?",
      hideDetails: "कम देखें",
      showDetails: "कौशल व विवरण देखें",
      advisory: "पात्रता सलाह"
    },
    te: {
      verified: "ప్రస్తుత ధృవీకరించబడిన కోర్సు",
      historical: "చారిత్రక రికార్డు (ధృవీకరించబడలేదు)",
      nsqf: `NSQF స్థాయి ${course.nsqf_level}`,
      hours: `${course.notional_hours} గంటల శిక్షణ`,
      duration: course.est_duration_weeks ? `సుమారు ${course.est_duration_weeks} వారాలు` : "సౌకర్యవంతమైన కాలపరిమితి",
      type: course.course_type || (course.is_modular ? "మాడ్యులర్ కోర్సు" : "పూర్తి అర్హత"),
      entryProfile: "ప్రవేశ అర్హత",
      inferredBadge: "NSQF నిబంధనల నుండి తీసుకోబడింది",
      expectedSkills: "మీరు నేర్చుకునే నైపుణ్యాలు",
      matchingReasons: "సిఫార్సు కారణాలు",
      officialSource: "అధికారిక మూలం చూడండి",
      feeNote: "ఫీజు సమాచారం",
      sourceDisclaimer: "సూచన కొరకు మాత్రమే; ప్రవేశాల కోసం స్థానిక కేంద్రాన్ని సంప్రదించండి.",
      noGuaranteeNotice: "సర్టిఫికెట్ నైపుణ్యాన్ని ధృవీకరిస్తుంది; ఉద్యోగానికి ఎటువంటి హామీ ఇవ్వదు.",
      whyRecommended: "ఈ కోర్సు ఎందుకు?",
      hideDetails: "తక్కువ సమాచారం",
      showDetails: "పూర్తి వివరాలు చూడండి",
      advisory: "అర్హత సలహా"
    }
  };

  const ui = labels[language] || labels.en;

  return (
    <div 
      style={{
        backgroundColor: "#ffffff",
        border: isTop ? "2px solid #059669" : "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "20px",
        boxShadow: isTop ? "0 6px 20px rgba(5, 150, 105, 0.12)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
    >
      {/* Top Banner Tag */}
      {isTop && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          backgroundColor: "#059669",
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: 800,
          padding: "4px 14px",
          borderRadius: "0 12px 0 8px",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          <Sparkles size={12} /> BEST MATCH
        </div>
      )}

      {/* Verification Status Pill & Match Score */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap", marginTop: isTop ? "6px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {isVerified ? (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
              borderRadius: "20px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 700
            }}>
              <CheckCircle2 size={13} /> {ui.verified}
            </span>
          ) : (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "20px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 700
            }}>
              <AlertTriangle size={13} /> {ui.historical}
            </span>
          )}

          <span style={{
            backgroundColor: "#f1f5f9",
            color: "#334155",
            borderRadius: "6px",
            padding: "3px 8px",
            fontSize: "11px",
            fontWeight: 700
          }}>
            {course.sector}
          </span>
        </div>

        {course.match_score !== undefined && (
          <div style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            borderRadius: "16px",
            padding: "2px 10px",
            fontSize: "13px",
            fontWeight: 800
          }}>
            {course.match_score}% Match
          </div>
        )}
      </div>

      {/* Course Title */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: "0 0 6px 0", lineHeight: 1.3 }}>
          {course.course_name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "12px", fontWeight: 600 }}>
          <Layers size={14} style={{ color: "#d97706" }} />
          <span>Skill Cluster: <strong style={{ color: "#1e293b" }}>{course.skill_cluster}</strong></span>
        </div>
      </div>

      {/* Key Metadata Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "10px",
        backgroundColor: "#f8fafc",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0"
      }}>
        <div>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Qualification</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Award size={14} style={{ color: "#059669" }} /> {ui.nsqf}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Duration & Hours</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={14} style={{ color: "#2563eb" }} /> {ui.duration} ({course.notional_hours}h)
          </div>
        </div>

        <div>
          <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Course Type</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
            {ui.type}
          </div>
        </div>
      </div>

      {/* Entry Profile (Clearly Marked as Inferred) */}
      <div style={{
        backgroundColor: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: "8px",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#92400e", display: "flex", alignItems: "center", gap: "4px" }}>
            <GraduationCap size={14} /> {ui.entryProfile}:
          </span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#b45309", backgroundColor: "#fef3c7", padding: "1px 6px", borderRadius: "4px", border: "1px solid #fcd34d" }}>
            {ui.inferredBadge}
          </span>
        </div>
        <div style={{ fontSize: "12.5px", color: "#78350f", fontWeight: 600 }}>
          {course.entry_profile?.raw || course.typical_entry_profile_inferred || "Class 10th pass or equivalent"}
        </div>
      </div>

      {/* Eligibility Advisory if user education check flagged it */}
      {course.eligibility && course.eligibility.status === "REQUIRES_PREREQUISITE_CHECK" && (
        <div style={{
          backgroundColor: "#fff7ed",
          border: "1px solid #fed7aa",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "#9a3412",
          display: "flex",
          alignItems: "flex-start",
          gap: "8px"
        }}>
          <AlertTriangle size={15} style={{ color: "#ea580c", flexShrink: 0, marginTop: "1px" }} />
          <div>
            <strong>{ui.advisory}:</strong> {course.eligibility.note}
          </div>
        </div>
      )}

      {/* Expandable Section: Expected Skills, Matching Reasons, Fees */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            color: "var(--gov-navy)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            padding: "4px 0"
          }}
        >
          {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {showDetails ? ui.hideDetails : ui.showDetails}
        </button>

        {showDetails && (
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
            
            {/* Skills Learner Can Expect to Develop */}
            {course.expected_skills && course.expected_skills.length > 0 && (
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                  {ui.expectedSkills}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {course.expected_skills.map((skill, i) => (
                    <span 
                      key={i}
                      style={{
                        fontSize: "12px",
                        backgroundColor: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: 600
                      }}
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deterministic Matching Reasons */}
            {course.matching_reasons && course.matching_reasons.length > 0 && (
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  {ui.matchingReasons}
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#334155", display: "flex", flexDirection: "column", gap: "3px" }}>
                  {course.matching_reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fee Note */}
            {course.fee_info && (
              <div style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "11.5px",
                color: "#14532d"
              }}>
                <strong>{ui.feeNote}:</strong> {course.fee_info}
              </div>
            )}

            {/* Disclaimer on No Employment / Admission Guarantee */}
            <div style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "8px 10px",
              fontSize: "11px",
              color: "#64748b",
              lineHeight: 1.4
            }}>
              <Info size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              {ui.noGuaranteeNotice} {ui.sourceDisclaimer}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginTop: "auto", paddingTop: "8px" }}>
        {course.source_url ? (
          <a
            href={course.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#0369a1",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: "6px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd"
            }}
          >
            <ExternalLink size={14} /> {ui.officialSource}
          </a>
        ) : (
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Source: NIELIT / NSQF Catalog</div>
        )}

        {onSelectCourse && (
          <button
            type="button"
            onClick={() => onSelectCourse(course)}
            style={{
              backgroundColor: "var(--gov-navy)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Select Course Track
          </button>
        )}
      </div>
    </div>
  );
}
