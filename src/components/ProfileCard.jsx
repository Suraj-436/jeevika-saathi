import React from "react";
import { User, MapPin, BookOpen, Wrench, Briefcase, FileText, CheckCircle2, ShieldCheck, Clock, Target } from "lucide-react";
import { normalizeBeneficiaryProfile } from "../utils/normalizeProfile";

// Reusable component for a field block
const Field = ({ label, value, strong }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>{label}</span>
    <span style={{ fontSize: "14px", color: strong ? "var(--text-dark)" : "var(--text-body)", fontWeight: strong ? "600" : "400" }}>
      {value || <span style={{ color: "var(--text-light)", fontStyle: "italic" }}>Not provided</span>}
    </span>
  </div>
);

// Reusable component for a section card
const SectionCard = ({ title, icon: Icon, children }) => (
  <div style={{
    background: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid var(--border-light)",
    boxShadow: "var(--shadow-xs)",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
      <div style={{ background: "var(--surface-hover)", padding: "8px", borderRadius: "8px", color: "var(--govt-blue)" }}>
        <Icon size={18} />
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--govt-navy)", margin: 0 }}>{title}</h3>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
      {children}
    </div>
  </div>
);

export default function ProfileCard({ userProfile }) {
  const p = normalizeBeneficiaryProfile(userProfile);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 1. Personal Information & Location */}
      <SectionCard title="Personal Information & Location" icon={User}>
        <Field label="Full Name" value={p.name} strong />
        <Field label="Date of Birth / Age" value={p.dob} />
        <Field label="Gender" value={p.gender} />
        <Field label="Social Category" value={p.category} />
        <Field label="District & State" value={p.districtState} />
        <Field label="Block / Village" value={p.blockVillage} />
        <Field label="Mobile Number" value={p.phone} />
        <Field label="Primary Language" value={p.language} />
      </SectionCard>

      {/* 2. Education & Vocational Competencies */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-xs)",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
          <div style={{ background: "var(--surface-hover)", padding: "8px", borderRadius: "8px", color: "var(--govt-blue)" }}>
            <BookOpen size={18} />
          </div>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--govt-navy)", margin: 0 }}>Education & Vocational Competencies</h3>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <Field label="Formal Education" value={p.education} strong />
          <Field label="Literacy / Medium" value={p.literacy} />
        </div>

        <div style={{ height: "1px", background: "var(--border-light)" }}></div>

        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", display: "block", marginBottom: "8px" }}>Existing Informal Skills</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {p.skills.length > 0 ? p.skills.map((skill, idx) => (
              <span key={idx} style={{
                background: "var(--surface-hover)",
                color: "var(--text-dark)",
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: "500",
                border: "1px solid var(--border)"
              }}>
                {skill}
              </span>
            )) : (
              <span style={{ color: "var(--text-light)", fontStyle: "italic", fontSize: "14px" }}>No skills listed</span>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <Field label="Traditional Occupation" value={p.tradOccupation} />
          <Field label="Current Employment" value={p.currentEmp} />
          <Field label="Prior Learning (RPL)" value={p.rplStatus} />
        </div>
      </div>

      {/* 3. Interests & Employment Preferences */}
      <SectionCard title="Interests & Employment Preferences" icon={Target}>
        <Field label="Interested Trade" value={p.trade} strong />
        <Field label="NSQF Target Level" value={p.nsqfLevel} />
        <Field label="Employment Preference" value={p.empPref} />
        <Field label="Target Monthly Wage" value={p.targetWage} />
        <Field label="Mobility Preference" value={p.mobility} />
        <Field label="Training Availability" value={p.trainingAvailability} strong />
        <Field label="Training Schedule" value={p.trainingSchedule} />
      </SectionCard>

      {/* 4. Assessment & Scheme Status */}
      <div style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-xs)",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
          <div style={{ background: "var(--surface-hover)", padding: "8px", borderRadius: "8px", color: "var(--govt-blue)" }}>
            <ShieldCheck size={18} />
          </div>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--govt-navy)", margin: 0 }}>Assessment & Scheme Status</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Voice Profiling Status</span>
            <div>
              {p.voiceStatus === "Completed" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--tricolour-green-light)", color: "var(--tricolour-green-dark)", padding: "4px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>
                  <CheckCircle2 size={14} /> Completed
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--surface-hover)", color: "var(--text-secondary)", padding: "4px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>
                  <Clock size={14} /> Pending
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>GIA Training Allotment</span>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--govt-sky)", color: "var(--govt-blue)", padding: "4px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>
                {p.giaAllotment}
              </span>
            </div>
          </div>

          <Field label="DBT Bank Account" value={p.dbtAccount} />
          <Field label="Monthly Stipend" value={<span style={{ color: "var(--tricolour-green)", fontWeight: "700" }}>{p.stipend}</span>} />
          
        </div>
      </div>

    </div>
  );
}
