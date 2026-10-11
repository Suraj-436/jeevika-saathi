import React, { useState, useEffect } from "react";
import { 
  User, MapPin, BookOpen, Wrench, Briefcase, FileText, 
  CheckCircle2, ShieldCheck, Clock, Target, AlertCircle, Save, X 
} from "lucide-react";
import { normalizeBeneficiaryProfile } from "../utils/normalizeProfile";

// Reusable component for a read-only field block
const Field = ({ label, value, strong }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>{label}</span>
    <span style={{ fontSize: "14px", color: strong ? "var(--text-dark)" : "var(--text-body)", fontWeight: strong ? "600" : "400" }}>
      {value || <span style={{ color: "var(--text-light)", fontStyle: "italic" }}>Not provided</span>}
    </span>
  </div>
);

// Reusable component for an editable field block
const EditField = ({ label, value, onChange, placeholder, type = "text", required, hint }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
      {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        fontSize: "14px",
        color: "var(--text-dark)",
        backgroundColor: "#ffffff",
        outline: "none",
        width: "100%",
        boxSizing: "border-box"
      }}
    />
    {hint && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{hint}</span>}
  </div>
);

// Reusable component for an editable select block
const EditSelect = ({ label, value, onChange, options, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
      {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
    </label>
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        fontSize: "14px",
        color: "var(--text-dark)",
        backgroundColor: "#ffffff",
        outline: "none",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
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

export default function ProfileCard({ userProfile, isEditing = false, onSave, onCancel }) {
  const p = normalizeBeneficiaryProfile(userProfile);

  const [formData, setFormData] = useState({
    name: p.name !== "Beneficiary" ? p.name : "",
    age: p.age || "",
    dob: p.dob !== "Not provided" ? p.dob : "",
    gender: p.gender !== "Not provided" ? p.gender : "",
    category: p.category !== "Not provided" ? p.category : "Scheduled Caste (SC)",
    district: p.district !== "Not provided" ? p.district : "",
    state: p.state !== "Not provided" ? p.state : "",
    blockVillage: p.blockVillage !== "Not provided" ? p.blockVillage : "",
    phone: p.phone !== "Not provided" ? p.phone : "",
    language: p.language !== "Not provided" ? p.language : "Hindi",
    education: p.education !== "Not provided" ? p.education : "",
    literacy: p.literacy !== "Not provided" ? p.literacy : "",
    skillsStr: p.skills ? p.skills.join(", ") : "",
    tradOccupation: p.tradOccupation !== "Not provided" ? p.tradOccupation : "",
    currentLivelihood: p.currentLivelihood !== "Not provided" ? p.currentLivelihood : "",
    aspiration: p.aspiration !== "Not provided" ? p.aspiration : "",
    employmentPref: p.employmentPref !== "Not provided" ? p.employmentPref : "",
    targetWage: p.targetWage !== "Not provided" ? p.targetWage : "",
    mobility_limit_km: p.mobility_limit_km || "",
    trainingAvailabilityDuration: p.trainingAvailabilityDuration !== "Not provided" ? p.trainingAvailabilityDuration : "",
    trainingSchedule: p.trainingSchedule !== "Not provided" ? p.trainingSchedule : "",
    constraints: p.constraints !== "None" ? p.constraints : ""
  });

  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setFormData({
      name: p.name !== "Beneficiary" ? p.name : "",
      age: p.age || "",
      dob: p.dob !== "Not provided" ? p.dob : "",
      gender: p.gender !== "Not provided" ? p.gender : "",
      category: p.category !== "Not provided" ? p.category : "Scheduled Caste (SC)",
      district: p.district !== "Not provided" ? p.district : "",
      state: p.state !== "Not provided" ? p.state : "",
      blockVillage: p.blockVillage !== "Not provided" ? p.blockVillage : "",
      phone: p.phone !== "Not provided" ? p.phone : "",
      language: p.language !== "Not provided" ? p.language : "Hindi",
      education: p.education !== "Not provided" ? p.education : "",
      literacy: p.literacy !== "Not provided" ? p.literacy : "",
      skillsStr: p.skills ? p.skills.join(", ") : "",
      tradOccupation: p.tradOccupation !== "Not provided" ? p.tradOccupation : "",
      currentLivelihood: p.currentLivelihood !== "Not provided" ? p.currentLivelihood : "",
      aspiration: p.aspiration !== "Not provided" ? p.aspiration : "",
      employmentPref: p.employmentPref !== "Not provided" ? p.employmentPref : "",
      targetWage: p.targetWage !== "Not provided" ? p.targetWage : "",
      mobility_limit_km: p.mobility_limit_km || "",
      trainingAvailabilityDuration: p.trainingAvailabilityDuration !== "Not provided" ? p.trainingAvailabilityDuration : "",
      trainingSchedule: p.trainingSchedule !== "Not provided" ? p.trainingSchedule : "",
      constraints: p.constraints !== "None" ? p.constraints : ""
    });
    setValidationError(null);
  }, [userProfile]);

  const handleFieldChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (validationError) setValidationError(null);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    if (!formData.name || formData.name.trim().length < 2) {
      setValidationError("Please enter a valid full name (minimum 2 letters).");
      return;
    }

    if (formData.age) {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 14 || ageNum > 90) {
        setValidationError("Please enter a valid age between 14 and 90 years.");
        return;
      }
    }

    const skills = formData.skillsStr 
      ? formData.skillsStr.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const updates = {
      name: formData.name.trim(),
      full_name: formData.name.trim(),
      age: formData.age ? Number(formData.age) : null,
      dob: formData.dob ? formData.dob.trim() : (formData.age ? `${formData.age} Years` : null),
      gender: formData.gender,
      category: formData.category,
      district: formData.district.trim(),
      state: formData.state.trim(),
      districtState: formData.district && formData.state ? `${formData.district.trim()}, ${formData.state.trim()}` : formData.district.trim(),
      blockVillage: formData.blockVillage.trim(),
      phone: formData.phone.trim(),
      language: formData.language,
      education: formData.education,
      literacy: formData.literacy.trim(),
      skills,
      existing_skills: skills,
      tradOccupation: formData.tradOccupation.trim(),
      family_occupation: formData.tradOccupation.trim(),
      currentLivelihood: formData.currentLivelihood.trim(),
      current_occupation: formData.currentLivelihood.trim(),
      aspiration: formData.aspiration.trim(),
      career_aspiration: formData.aspiration.trim(),
      employmentPref: formData.employmentPref,
      employment_preference: formData.employmentPref,
      targetWage: formData.targetWage.trim(),
      mobility_limit_km: formData.mobility_limit_km ? Number(formData.mobility_limit_km) : null,
      trainingAvailabilityDuration: formData.trainingAvailabilityDuration,
      training_availability_duration: formData.trainingAvailabilityDuration,
      trainingSchedule: formData.trainingSchedule,
      training_schedule: formData.trainingSchedule,
      constraints: formData.constraints.trim() || "None"
    };

    if (onSave) onSave(updates);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 1. Personal Information & Location */}
      <SectionCard title="Personal Information & Location" icon={User}>
        {isEditing ? (
          <>
            <EditField 
              label="Full Name" 
              value={formData.name} 
              onChange={v => handleFieldChange("name", v)} 
              placeholder="e.g. Suresh Kumar"
              required 
            />
            <EditField 
              label="Age (Years)" 
              value={formData.age} 
              onChange={v => handleFieldChange("age", v)} 
              placeholder="e.g. 25"
              type="number"
            />
            <EditSelect 
              label="Gender (Voluntary)" 
              value={formData.gender} 
              onChange={v => handleFieldChange("gender", v)} 
              options={[
                { value: "", label: "Select Gender (Optional)" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
                { value: "Prefer not to say", label: "Prefer not to say" }
              ]}
            />
            <EditSelect 
              label="Social Category" 
              value={formData.category} 
              onChange={v => handleFieldChange("category", v)} 
              options={[
                { value: "Scheduled Caste (SC)", label: "Scheduled Caste (SC)" },
                { value: "SC - Artisan Community", label: "SC - Artisan Community" },
                { value: "SC - Agricultural Worker", label: "SC - Agricultural Worker" },
                { value: "Other Entitled Category", label: "Other Entitled Category" }
              ]}
            />
            <EditField 
              label="District" 
              value={formData.district} 
              onChange={v => handleFieldChange("district", v)} 
              placeholder="e.g. Agra, Varanasi, Patna" 
            />
            <EditField 
              label="State" 
              value={formData.state} 
              onChange={v => handleFieldChange("state", v)} 
              placeholder="e.g. Uttar Pradesh, Bihar" 
            />
            <EditField 
              label="Block / Village" 
              value={formData.blockVillage} 
              onChange={v => handleFieldChange("blockVillage", v)} 
              placeholder="e.g. Bichpuri Block, Bainpur Village" 
            />
            <EditSelect 
              label="Primary Language" 
              value={formData.language} 
              onChange={v => handleFieldChange("language", v)} 
              options={[
                { value: "Hindi", label: "Hindi (हिंदी)" },
                { value: "Bundeli", label: "Bundeli (बुंदेली)" },
                { value: "Bhojpuri", label: "Bhojpuri (भोजपुरी)" },
                { value: "English", label: "English" }
              ]}
            />
          </>
        ) : (
          <>
            <Field label="Full Name" value={p.name} strong />
            <Field label="Date of Birth / Age" value={p.dob} />
            <Field label="Gender" value={p.gender} />
            <Field label="Social Category" value={p.category} />
            <Field label="District & State" value={p.districtState} />
            <Field label="Block / Village" value={p.blockVillage} />
            <Field label="Mobile Number" value={p.phone} />
            <Field label="Primary Language" value={p.language} />
          </>
        )}
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
          {isEditing ? (
            <>
              <EditSelect 
                label="Formal Education" 
                value={formData.education} 
                onChange={v => handleFieldChange("education", v)} 
                options={[
                  { value: "", label: "Select Education Level" },
                  { value: "Below Primary / Non-Formal", label: "Below Primary / Non-Formal" },
                  { value: "Primary School (Class 5)", label: "Primary School (Class 5)" },
                  { value: "Middle School (Class 8 Pass)", label: "Middle School (Class 8 Pass)" },
                  { value: "Secondary (Class 10 Pass)", label: "Secondary (Class 10 Pass)" },
                  { value: "Higher Secondary (Class 12 Pass)", label: "Higher Secondary (Class 12 Pass)" },
                  { value: "ITI Certificate / Diploma", label: "ITI Certificate / Diploma" },
                  { value: "Graduate / Equivalent", label: "Graduate / Equivalent" }
                ]}
              />
              <EditField 
                label="Literacy / Medium" 
                value={formData.literacy} 
                onChange={v => handleFieldChange("literacy", v)} 
                placeholder="e.g. Hindi Reading & Spoken" 
              />
            </>
          ) : (
            <>
              <Field label="Formal Education" value={p.education} strong />
              <Field label="Literacy / Medium" value={p.literacy} />
            </>
          )}
        </div>

        <div style={{ height: "1px", background: "var(--border-light)" }}></div>

        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", display: "block", marginBottom: "8px" }}>Existing Skills & Verification</span>
          {isEditing ? (
            <EditField 
              label="Existing Skills (comma-separated)" 
              value={formData.skillsStr} 
              onChange={v => handleFieldChange("skillsStr", v)} 
              placeholder="e.g. Basic Wiring, Plumbing, Tailoring, Carpentry" 
              hint="Enter your existing hands-on skills separated by commas."
            />
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {p.skills.length > 0 ? p.skills.map((skill, idx) => {
                const isVerified = (p.verification_status === "VERIFIED" && p.verified_trade && skill.toLowerCase().includes(p.verified_trade.toLowerCase())) ||
                                   (userProfile?.verified_trade && skill.toLowerCase().includes(userProfile.verified_trade.toLowerCase()));
                return (
                  <span key={idx} style={{
                    background: isVerified ? "#ecfdf5" : "var(--surface-hover)",
                    color: isVerified ? "#065f46" : "var(--text-dark)",
                    padding: "6px 12px",
                    borderRadius: "16px",
                    fontSize: "13px",
                    fontWeight: "500",
                    border: isVerified ? "1px solid #a7f3d0" : "1px solid var(--border)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <span>{skill}</span>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: "8px",
                      backgroundColor: isVerified ? "#10b981" : "#e2e8f0",
                      color: isVerified ? "#ffffff" : "#64748b"
                    }}>
                      {isVerified ? "Skill Verified ✓" : "Not verified"}
                    </span>
                  </span>
                );
              }) : (
                <span style={{ color: "var(--text-light)", fontStyle: "italic", fontSize: "14px" }}>No skills listed yet</span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {isEditing ? (
            <>
              <EditField 
                label="Traditional Occupation" 
                value={formData.tradOccupation} 
                onChange={v => handleFieldChange("tradOccupation", v)} 
                placeholder="e.g. Agriculture, Leathercraft, Weaving" 
              />
              <EditField 
                label="Current Livelihood / Occupation" 
                value={formData.currentLivelihood} 
                onChange={v => handleFieldChange("currentLivelihood", v)} 
                placeholder="e.g. Daily Wage Worker, Farming Assistant" 
              />
            </>
          ) : (
            <>
              <Field label="Traditional Occupation" value={p.tradOccupation} />
              <Field label="Current Employment" value={p.currentEmp} />
              <Field label="Prior Learning (RPL)" value={p.rplStatus} />
            </>
          )}
        </div>
      </div>

      {/* 3. Interests & Employment Preferences */}
      <SectionCard title="Interests & Employment Preferences" icon={Target}>
        {isEditing ? (
          <>
            <EditField 
              label="Career Aspiration / Target Role" 
              value={formData.aspiration} 
              onChange={v => handleFieldChange("aspiration", v)} 
              placeholder="e.g. Certified Electrician, Solar Technician, Tailoring Unit Owner" 
            />
            <EditSelect 
              label="Employment Preference" 
              value={formData.employmentPref} 
              onChange={v => handleFieldChange("employmentPref", v)} 
              options={[
                { value: "", label: "Select Preference" },
                { value: "Wage Employment (Job)", label: "Wage Employment (Job)" },
                { value: "Self-Employment / Micro-Enterprise", label: "Self-Employment / Micro-Enterprise" },
                { value: "Local Apprenticeship", label: "Local Apprenticeship" },
                { value: "Flexible / Either", label: "Flexible / Either" }
              ]}
            />
            <EditField 
              label="Target Monthly Wage (₹)" 
              value={formData.targetWage} 
              onChange={v => handleFieldChange("targetWage", v)} 
              placeholder="e.g. ₹12,000 - ₹18,000" 
            />
            <EditField 
              label="Mobility Limit (Max km daily commute)" 
              value={formData.mobility_limit_km} 
              onChange={v => handleFieldChange("mobility_limit_km", v)} 
              placeholder="e.g. 15"
              type="number"
            />
            <EditSelect 
              label="Training Availability Duration" 
              value={formData.trainingAvailabilityDuration} 
              onChange={v => handleFieldChange("trainingAvailabilityDuration", v)} 
              options={[
                { value: "", label: "Select Training Duration" },
                { value: "1 month", label: "1 month" },
                { value: "2 months", label: "2 months" },
                { value: "3 months", label: "3 months" },
                { value: "6 months", label: "6 months" },
                { value: "Not decided", label: "Not decided" }
              ]}
            />
            <EditSelect 
              label="Training Schedule" 
              value={formData.trainingSchedule} 
              onChange={v => handleFieldChange("trainingSchedule", v)} 
              options={[
                { value: "", label: "Select Schedule" },
                { value: "Full-time Daytime", label: "Full-time Daytime" },
                { value: "Part-time Mornings", label: "Part-time Mornings" },
                { value: "Evenings / After 6 PM", label: "Evenings / After 6 PM" },
                { value: "Weekends Only", label: "Weekends Only" }
              ]}
            />
            <EditField 
              label="Work & Training Constraints" 
              value={formData.constraints} 
              onChange={v => handleFieldChange("constraints", v)} 
              placeholder="e.g. Childcare duties, local training only, None" 
            />
          </>
        ) : (
          <>
            <Field label="Interested Trade" value={p.trade} strong />
            <Field label="NSQF Target Level" value={p.nsqfLevel} />
            <Field label="Employment Preference" value={p.empPref} />
            <Field label="Target Monthly Wage" value={p.targetWage} />
            <Field label="Mobility Preference" value={p.mobility} />
            <Field label="Training Availability" value={p.trainingAvailability} strong />
            <Field label="Training Schedule" value={p.trainingSchedule} />
          </>
        )}
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
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>Skill Verification Status</span>
            <div>
              {p.verification_status === "VERIFIED" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--tricolour-green-light)", color: "var(--tricolour-green-dark)", padding: "4px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>
                  <CheckCircle2 size={14} /> {p.verified_trade || "Trade"} Verified
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--surface-hover)", color: "var(--text-secondary)", padding: "4px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "600" }}>
                  <Clock size={14} /> Not Verified (Training Recommended)
                </span>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Save / Cancel Action Bar in Edit Mode */}
      {isEditing && (
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "20px 24px",
          border: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          boxShadow: "var(--shadow-sm)"
        }}>
          {validationError ? (
            <div style={{ color: "#b91c1c", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={16} /> {validationError}
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Changes will be synchronized directly to your official PM-AJAY beneficiary profile.
            </div>
          )}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: "var(--govt-navy)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Save size={16} /> Save Profile Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
