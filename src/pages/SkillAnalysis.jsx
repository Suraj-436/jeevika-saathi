import React, { useMemo, useState, useCallback } from "react";
import {
  CheckCircle2, AlertTriangle, Zap, Download,
  Loader2, Mic, Info, ArrowRight, Target, Shield, ChevronRight, Award
} from "lucide-react";
import { useSession } from "../context/SessionContext";

function getInitials(name) {
  if (!name || name === "Beneficiary") return "B";
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function hasEnoughData(bp) {
  if (!bp) return false;
  return (Array.isArray(bp.existing_skills) && bp.existing_skills.length > 0)
    || !!bp.current_occupation
    || !!bp.career_aspiration
    || (Array.isArray(bp.interests) && bp.interests.length > 0);
}

function generateAnalysis(bp, loginProfile) {
  const name = bp.full_name || (loginProfile && loginProfile.name) || "Beneficiary";
  const district = (loginProfile && loginProfile.district) || bp.location || "Not provided";
  const skills = Array.isArray(bp.existing_skills) ? bp.existing_skills : [];
  const interests = Array.isArray(bp.interests) ? bp.interests : [];
  const trad = bp.family_occupation || null;
  const occupation = bp.current_occupation || null;
  const aspiration = bp.career_aspiration || null;
  const empPref = bp.employment_preference || null;
  const mobilityKm = bp.mobility_limit_km || null;
  const training = bp.training_availability || null;
  const education = bp.education || null;
  const experience = bp.years_of_experience || null;

  const allText = [aspiration, occupation, trad].concat(skills).concat(interests)
    .filter(Boolean).join(" ").toLowerCase();

  const isCarpentry   = /carpent|wood|furniture|joiner|cabinet/.test(allText);
  const isSolar       = /solar|photovoltaic|pv panel/.test(allText);
  const isElectric    = /electric|wiring|circuit|wire/.test(allText) && !isSolar;
  const isLeather     = /leather|shoe|footwear|cobbler|chamar/.test(allText);
  const isTailoring   = /tailor|sewing|stitch|apparel|garment|cloth/.test(allText);
  const isAgriculture = /farm|agri|crop|harvest|irrigation|kisan|field/.test(allText);
  const isConstruct   = /mason|brick|construction|plumber|plumbing|cement|tile/.test(allText);

  const expYears  = parseInt(experience) || 0;
  const expBoost  = Math.min(30, expYears * 5);
  const hasTrad   = !!trad;
  const tradBoost = hasTrad ? 10 : 0;
  const hasInfExp = expYears >= 1 || hasTrad || skills.length >= 2;

  const rplBase = hasInfExp
    ? "Potential RPL candidate — your " + (expYears > 0 ? expYears + "-year" : "informal") + " hands-on experience may qualify for Recognition of Prior Learning. Recommended: formal RPL assessment at a PMKK center."
    : "RPL status not yet assessed — insufficient prior experience data. Please complete the Voice Assessment for a full evaluation.";

  if (isCarpentry) {
    const b = 40 + expBoost + tradBoost;
    const t = aspiration || "Professional Carpenter / Furniture Maker";
    const selfEmp = empPref && empPref.toLowerCase().includes("self");
    return {
      name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
      domain: "Carpentry & Woodworking", targetLivelihood: t,
      currentSkillsSummary: (skills.length > 0 ? skills.join(", ") : "Basic carpentry skills") + " — " + (expYears > 0 ? expYears + " yrs" : "informal") + " experience" + (hasTrad ? " (family: " + trad + ")" : "") + ".",
      topGap: "Advanced joinery, power-tool operation and finishing techniques",
      trainingSummary: "Advanced Carpentry & Furniture Making",
      duration: expYears >= 3 ? "45-60 Days (RPL Fast-Track)" : "3 Months",
      expectedLivelihood: selfEmp ? "Furniture workshop owner" : "Skilled Furniture Craftsman",
      incomeNote: "Indicative pathway — income depends on location and employer.",
      nsqfNote: "Carpentry/Woodworking — NSQF alignment to be validated at a PMKK center.",
      rplStatus: rplBase,
      transferable: ["Material estimation", "Measurement & marking", "Hand-tool handling", "Repair & refurbishment"],
      competencies: [
        { title: "Wood Cutting & Measurement", category: "Practical Competency", current: Math.min(90, b+20), target: 90, gap: skills.some(function(s){return /cut|measur|mark/.test(s.toLowerCase());}) ? "Strong base — focus on precision to professional standards." : "Limited exposure to systematic precision cuts for furniture.", training: "Precision Measurement & Cutting (20 hrs)", priority: "Standard Bridge" },
        { title: "Joinery & Furniture Assembly", category: "Technical Competency", current: Math.min(80, b-10), target: 88, gap: "Advanced joints (dovetail, mortise & tenon) require formal training beyond basic repair.", training: "Advanced Joinery Techniques (60 hrs) — AI Recommendation", priority: "Core Gap" },
        { title: "Power Tool Operation & Safety", category: "Safety & Efficiency", current: Math.min(60, b-25), target: 85, gap: "Power tools (electric saw, router, drill press) have safety protocols not acquired informally.", training: "Power Tool Safety & Operation (40 hrs) — AI Recommendation", priority: "Priority" },
        { title: "Wood Finishing & Polishing", category: "Aesthetic Competency", current: Math.min(65, b-15), target: 88, gap: skills.some(function(s){return /finish|polish|varnish/.test(s.toLowerCase());}) ? "Some finishing experience — needs training on modern lacquers." : "Little exposure to professional wood finishing and surface treatment.", training: "Modern Wood Finishing (30 hrs) — AI Recommendation", priority: skills.some(function(s){return /finish|polish/.test(s.toLowerCase());}) ? "Standard Bridge" : "Priority" }
      ].concat(selfEmp ? [{ title: "Workshop Management & Costing", category: "Micro-Enterprise", current: Math.min(40, b-30), target: 75, gap: "Running a furniture workshop requires costing, procurement and customer management skills.", training: "Micro-Enterprise for Craftsmen (20 hrs) — AI Recommendation", priority: "Standard Bridge" }] : [])
    };
  }

  if (isSolar || isElectric) {
    const b = 30 + expBoost + tradBoost;
    const t = aspiration || (isSolar ? "Solar PV Technician" : "Domestic Electrician");
    const selfEmp = empPref && empPref.toLowerCase().includes("self");
    return {
      name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
      domain: isSolar ? "Solar & Renewable Energy" : "Electrical & Wiring", targetLivelihood: t,
      currentSkillsSummary: (skills.length > 0 ? skills.join(", ") : "Basic electrical awareness") + " — " + (expYears > 0 ? expYears + " yrs" : "informal") + " experience.",
      topGap: isSolar ? "Solar PV installation, inverter wiring and DC circuit theory" : "Formal circuit theory, MCB installation and safety compliance",
      trainingSummary: isSolar ? "Solar PV Installation & Maintenance" : "Domestic Electrical Installation",
      duration: "90 Days",
      expectedLivelihood: isSolar ? "Solar Technician / Installer" : "Licensed Domestic Electrician",
      incomeNote: "Indicative livelihood pathway — not a guaranteed income figure.",
      nsqfNote: isSolar ? "Solar Domestic Technician — NSQF alignment to be validated. Related: ELE/Q3104 job role." : "Domestic Electrician — NSQF alignment to be validated at a PMKK center.",
      rplStatus: rplBase,
      transferable: ["Basic circuit awareness", "Electrical safety habits", "Tool handling", "Fault identification"],
      competencies: [
        { title: isSolar ? "Solar PV & Inverter Systems" : "AC/DC Circuit Theory", category: "Technical Competency", current: Math.min(70, b), target: 85, gap: isSolar ? "Charge controller, string inverter wiring and PV panel specs require formal hands-on training." : "Formal circuit analysis, load calculation and MCB sizing not acquired through informal exposure.", training: isSolar ? "Solar PV Installation Module (60 hrs) — AI Recommendation" : "Domestic Circuit Theory (40 hrs) — AI Recommendation", priority: "Core Gap" },
        { title: "Electrical Safety & Standards", category: "Safety Competency", current: Math.min(65, b+10), target: 90, gap: "Formal electrical safety standards (IE Rules, BIS) are mandatory and not typically learned informally.", training: "Electrical Safety & Standards (15 hrs) — AI Recommendation", priority: "Priority" },
        { title: "Tools & Test Instrument Use", category: "Practical Competency", current: Math.min(70, b+15), target: 85, gap: "Multimeter, clamp meter and continuity tester use for diagnostic work requires structured practice.", training: "Test Instruments & Diagnostics (20 hrs) — AI Recommendation", priority: "Standard Bridge" }
      ].concat(selfEmp ? [{ title: "Digital Billing & Customer Management", category: "Micro-Enterprise", current: Math.min(45, b-10), target: 70, gap: "Issuing digital bills and managing service records requires digital literacy.", training: "Digital Literacy for Artisans (15 hrs) — AI Recommendation", priority: "Standard Bridge" }] : [])
    };
  }

  if (isLeather) {
    const b = 55 + expBoost + tradBoost;
    const t = aspiration || "Footwear Artisan / Leather Craftsperson";
    const strongRpl = hasTrad || expYears >= 2;
    return {
      name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
      domain: "Leather Craft & Footwear", targetLivelihood: t,
      currentSkillsSummary: (skills.length > 0 ? skills.join(", ") : "Traditional leather/footwear craft") + " — " + (hasTrad ? "family tradition: " + trad : expYears > 0 ? expYears + " yrs experience" : "informal experience") + ".",
      topGap: "Modern pattern grading, industrial machine operation and quality finishing",
      trainingSummary: "Footwear Manufacturing & Finishing",
      duration: hasInfExp ? "45 Days (RPL Track)" : "3 Months",
      expectedLivelihood: "Footwear Artisan / Leather Goods Maker",
      incomeNote: "Indicative pathway — income depends on production capacity and market.",
      nsqfNote: "Footwear Artisan (L3) — NSQF alignment to be validated. RPL track may be available.",
      rplStatus: strongRpl ? "Strong RPL candidate — your " + (hasTrad ? "family tradition in " + trad : expYears + "-year experience") + " may directly qualify for NSQF L3 Footwear Artisan certification via RPL. Recommended: assessment at a PMKK center." : rplBase,
      transferable: ["Hand stitching", "Material cutting", "Repair skills", "Pattern work"],
      competencies: [
        { title: "Traditional Stitching & Craft", category: "Core Competency", current: Math.min(92, b+15), target: 90, gap: hasTrad ? "High proficiency in traditional craft. Minor gap: modern synthetic materials and thread types." : "Good foundation, needs exposure to modern stitching standards and materials.", training: hasTrad ? "RPL Direct Exam Track — AI Recommendation" : "Stitching Standards (20 hrs) — AI Recommendation", priority: hasTrad ? "Exempted (RPL)" : "Standard Bridge" },
        { title: "Pattern Grading & Sizing", category: "Technical Competency", current: Math.min(50, b-20), target: 80, gap: "Industrial pattern scaling across sizes requires structured training beyond artisan knowledge.", training: "Pattern Grading for Footwear (40 hrs) — AI Recommendation", priority: "Core Gap" },
        { title: "Industrial Machine Operations", category: "Practical Competency", current: Math.min(45, b-30), target: 82, gap: "Motorized clicking presses and industrial stitching machines differ from manual tools.", training: "Industrial Machine Ops (50 hrs) — AI Recommendation", priority: "Priority" },
        { title: "Quality Control & Finishing", category: "Quality Assurance", current: Math.min(55, b-15), target: 80, gap: "Commercial quality standards (defect inspection, sole bonding QC) require formal exposure.", training: "Quality Finishing for Footwear (25 hrs) — AI Recommendation", priority: "Standard Bridge" }
      ]
    };
  }

  if (isTailoring) {
    const b = 40 + expBoost + tradBoost;
    const t = aspiration || "Sewing Machine Operator / Tailor";
    const selfEmp = empPref && empPref.toLowerCase().includes("self");
    return {
      name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
      domain: "Apparel & Tailoring", targetLivelihood: t,
      currentSkillsSummary: (skills.length > 0 ? skills.join(", ") : "Basic stitching and tailoring") + " — " + (expYears > 0 ? expYears + " yrs" : "some") + " hands-on experience.",
      topGap: "Industrial sewing machine operation, measurement standardization and quality finishing",
      trainingSummary: "Apparel & Industrial Tailoring",
      duration: "60 Days",
      expectedLivelihood: selfEmp ? "Tailor / Boutique Owner" : "Apparel Worker / Sewing Machine Operator",
      incomeNote: "Indicative livelihood pathway — not a guaranteed income.",
      nsqfNote: "Sewing Machine Operator — NSQF alignment to be validated at a PMKK center.",
      rplStatus: rplBase,
      transferable: ["Hand stitching", "Basic measurement", "Fabric handling", "Alteration skills"],
      competencies: [
        { title: "Measurement & Cutting", category: "Practical Competency", current: Math.min(75, b+15), target: 90, gap: "Standardised measurement for different body types and fabric cutting precision need structured practice.", training: "Precision Measurement & Cutting (20 hrs) — AI Recommendation", priority: "Core Gap" },
        { title: "Industrial Sewing Machine Operation", category: "Technical Competency", current: Math.min(35, b-20), target: 85, gap: "High-speed industrial machines have different mechanisms and maintenance requirements than domestic machines.", training: "Industrial Machine Operations (40 hrs) — AI Recommendation", priority: "Priority" },
        { title: "Garment Assembly & Finishing", category: "Quality Assurance", current: Math.min(50, b), target: 82, gap: "Attachment of collars, sleeves and button-hole finishing to professional standards requires structured practice.", training: "Garment Assembly & Quality Finishing (30 hrs) — AI Recommendation", priority: "Standard Bridge" }
      ].concat(selfEmp ? [{ title: "Boutique Management & Customer Relations", category: "Micro-Enterprise", current: Math.min(40, b-10), target: 70, gap: "Running a tailoring business requires order management, pricing and customer service skills.", training: "Tailoring Micro-Enterprise (15 hrs) — AI Recommendation", priority: "Standard Bridge" }] : [])
    };
  }

  if (isAgriculture) {
    const b = 50 + expBoost + tradBoost;
    const t = aspiration || "Skilled Agriculture / Allied Activities";
    const strongRpl = hasTrad || expYears >= 2;
    return {
      name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
      domain: "Agriculture & Allied Activities", targetLivelihood: t,
      currentSkillsSummary: (skills.length > 0 ? skills.join(", ") : "Farm work and crop management") + " — " + (expYears > 0 ? expYears + " yrs of" : "practical") + " farming experience.",
      topGap: "Modern agronomic practices, micro-irrigation and agri-business management",
      trainingSummary: "Modern Agriculture & Agri-Business",
      duration: "45-60 Days",
      expectedLivelihood: "Skilled Farmer / Agriculture Entrepreneur",
      incomeNote: "Indicative pathway — income depends on crop type, market linkage and season.",
      nsqfNote: "Agriculture — NSQF-aligned courses available under ARYA/ATMA schemes. Alignment to be validated.",
      rplStatus: strongRpl ? "RPL may be relevant — your farming background (" + (expYears > 0 ? expYears + " years" : "family tradition") + ") may qualify under NSQF agriculture job roles." : rplBase,
      transferable: ["Seasonal planning", "Physical stamina", "Equipment handling", "Crop knowledge"],
      competencies: [
        { title: "Modern Agronomic Practices", category: "Technical Competency", current: Math.min(80, b+10), target: 88, gap: "Traditional farming may not reflect modern soil testing, balanced fertilization and pest management.", training: "Modern Agronomy (30 hrs) — AI Recommendation", priority: "Standard Bridge" },
        { title: "Micro-Irrigation & Water Management", category: "Resource Efficiency", current: Math.min(50, b-20), target: 82, gap: "Drip and sprinkler irrigation improve yield and water efficiency — often not used in traditional farming.", training: "Micro-Irrigation Systems (25 hrs) — AI Recommendation", priority: "Core Gap" },
        { title: "Post-Harvest & Market Linkage", category: "Business Competency", current: Math.min(35, b-30), target: 75, gap: "Post-harvest storage, grading and market linkage (APMC, FPO, e-NAM) are critical for improving income.", training: "Post-Harvest Management & Agri-Marketing (20 hrs) — AI Recommendation", priority: "Priority" }
      ]
    };
  }

  if (isConstruct) {
    const b = 40 + expBoost + tradBoost;
    const t = aspiration || "Construction / Mason / Plumber";
    return {
      name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
      domain: "Construction & Building Trades", targetLivelihood: t,
      currentSkillsSummary: (skills.length > 0 ? skills.join(", ") : "Basic construction and masonry work") + " — " + (expYears > 0 ? expYears + " yrs" : "informal") + " on-site experience.",
      topGap: "Formal safety standards, precision measurement and trade-specific technical skills",
      trainingSummary: "Construction Trades — Masonry / Plumbing",
      duration: "90 Days",
      expectedLivelihood: "Skilled Construction Worker / Trade Contractor",
      incomeNote: "Indicative pathway — income varies by region and contractor.",
      nsqfNote: "Construction — NSQF-aligned trades available (Mason L3, Plumber L4). Alignment to be validated.",
      rplStatus: rplBase,
      transferable: ["Physical labour", "Site safety awareness", "Material handling", "Tool use"],
      competencies: [
        { title: "Technical Trade Skills", category: "Core Competency", current: Math.min(70, b+15), target: 88, gap: "Informal construction work builds practical skills but may lack standardized techniques for certified work.", training: "Trade Skills Certification Training (60 hrs) — AI Recommendation", priority: "Core Gap" },
        { title: "Construction Safety & Standards", category: "Safety Competency", current: Math.min(40, b-15), target: 85, gap: "BIS/OSHA-aligned safety practices on construction sites are mandatory for formal project employment.", training: "Construction Safety (20 hrs) — AI Recommendation", priority: "Priority" },
        { title: "Drawing Reading & Estimation", category: "Technical Competency", current: Math.min(25, b-30), target: 70, gap: "Reading construction drawings and preparing material estimates is needed for supervisory or independent roles.", training: "Basic Construction Drawing & Estimation (30 hrs) — AI Recommendation", priority: "Standard Bridge" }
      ]
    };
  }

  // Generic fallback
  const t = aspiration || (interests.length > 0 ? interests[0] : "Livelihood Skill Training");
  const b = 25 + expBoost + tradBoost;
  const ps = skills[0] || "foundational skills";
  const selfEmp = empPref && empPref.toLowerCase().includes("self");
  return {
    name, district, skills, occupation, aspiration: t, empPref, mobilityKm, training, education,
    domain: occupation || (interests.length > 0 ? interests[0] : "General Livelihood"),
    targetLivelihood: t,
    currentSkillsSummary: skills.length > 0
      ? skills.join(", ") + " — " + (expYears > 0 ? expYears + " yrs of" : "informal") + " experience" + (hasTrad ? " in " + trad : "") + "."
      : (occupation || "General work") + " — " + (expYears > 0 ? expYears + " yrs experience" : "informal experience") + (hasTrad ? " with family background in " + trad : "") + ".",
    topGap: "Formal training in " + t + " domain — specific gaps to be identified after detailed assessment",
    trainingSummary: "Domain Training in " + t,
    duration: "To be determined after full assessment",
    expectedLivelihood: selfEmp ? "Self-employed " + t : "Employed " + t,
    incomeNote: "Indicative livelihood pathway — income depends on trade, location and employer.",
    nsqfNote: "NSQF alignment for " + t + " to be validated at a PMKK center against the relevant job role.",
    rplStatus: rplBase,
    transferable: skills.slice(0, 4).length > 0 ? skills.slice(0, 4) : ["Practical work experience", "Tool/equipment familiarity"],
    competencies: [
      { title: t + " — Domain Foundation", category: "Core Competency", current: Math.min(70, b), target: 82, gap: "You have " + (skills.length > 0 ? "experience in " + ps : "a background in " + (occupation || "general work")) + ". Structured training in " + t + " will bridge the gap to professional-level competency.", training: t + " Foundation Module (40 hrs) — AI Recommendation", priority: "Core Gap" },
      { title: "Practical Application", category: "Practical Competency", current: Math.min(60, b+10), target: 85, gap: "Hands-on practice in standardized procedures for " + t + " is needed beyond informal experience.", training: "Practical Training Lab (60 hrs) — AI Recommendation", priority: "Priority" }
    ].concat(selfEmp ? [{ title: "Micro-Enterprise Basics", category: "Business Competency", current: Math.min(30, b-10), target: 70, gap: "Starting a small business requires costing, customer management and basic accounting.", training: "Micro-Enterprise for Artisans (15 hrs) — AI Recommendation", priority: "Standard Bridge" }] : [])
  };
}

function attachDurationAnalysis(res, userDuration, userSchedule) {
  if (!res) return res;
  res.userDuration = userDuration || null;
  res.userSchedule = userSchedule || null;

  if (!userDuration || userDuration.toLowerCase().includes("not decide") || userDuration.toLowerCase().includes("not sure")) {
    res.durationNotice = "Training duration preference has not been decided yet. Flexible modular and weekend options can be chosen at your local PMKK center.";
    res.durationStatus = "undecided";
    return res;
  }

  const uLower = userDuration.toLowerCase();
  let userMonths = 3;
  if (uLower.includes("less than 1") || uLower.includes("< 1") || uLower.includes("few weeks")) userMonths = 0.75;
  else if (uLower.includes("1 month")) userMonths = 1;
  else if (uLower.includes("2 month")) userMonths = 2;
  else if (uLower.includes("3 month")) userMonths = 3;
  else if (uLower.includes("4") || uLower.includes("5") || uLower.includes("6")) userMonths = 5;
  else if (uLower.includes("more than 6")) userMonths = 7;

  const rLower = (res.duration || "").toLowerCase();
  let recMonths = 3;
  if (rLower.includes("30 day") || rLower.includes("1 month") || rLower.includes("4 week")) recMonths = 1;
  else if (rLower.includes("45") || rLower.includes("60 day") || rLower.includes("2 month")) recMonths = 2;
  else if (rLower.includes("90 day") || rLower.includes("3 month") || rLower.includes("12 week")) recMonths = 3;
  else if (rLower.includes("6 month") || rLower.includes("180 day")) recMonths = 6;

  if (recMonths > userMonths + 0.3) {
    res.durationNotice = `This pathway normally requires ${res.duration}, which may require more training time than your current availability (${userDuration}). Consider modular RPL fast-track certification or a shorter bridge course.`;
    res.durationStatus = "longer_required";
  } else {
    res.durationNotice = `Course duration (${res.duration}) is compatible with your available training commitment of ${userDuration}${userSchedule ? " (" + userSchedule + ")" : ""}.`;
    res.durationStatus = "compatible";
  }
  return res;
}

function CompetencyBar({ skill }) {
  const gap = skill.target - skill.current;
  const ps = ({ "Core Gap": { bg: "#ffedd5", color: "#c2410c" }, "Priority": { bg: "#fee2e2", color: "#b91c1c" }, "Standard Bridge": { bg: "#f1f5f9", color: "#475569" }, "Exempted (RPL)": { bg: "#dcfce7", color: "#15803d" } })[skill.priority] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <div style={{ display: "grid", gap: "16px", padding: "20px", gridTemplateColumns: "1fr" }} className="md-grid-skill">
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)" }}>{skill.title}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{skill.category}</div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>AI-estimated current: <span style={{ color: "var(--gov-navy)" }}>{skill.current}%</span></span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Pathway target: <span style={{ color: "var(--gov-navy)" }}>{skill.target}%</span></span>
        </div>
        <div style={{ position: "relative", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: skill.target + "%", backgroundColor: "#cbd5e1" }} />
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: skill.current + "%", backgroundColor: "var(--gov-navy)", borderRadius: "4px" }} />
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontStyle: "italic" }}>{gap > 0 ? "Gap: " + gap + "% — indicative AI estimate" : "On target or exceeds pathway requirement"}</div>
      </div>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Why this gap?</div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{skill.gap}</div>
      </div>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Bridge Module</div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--gov-navy)" }}>{skill.training}</div>
        <div style={{ marginTop: "6px" }}><span style={{ display: "inline-flex", alignItems: "center", backgroundColor: ps.bg, color: ps.color, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>{skill.priority}</span></div>
      </div>
    </div>
  );
}

export default function SkillAnalysis({ userProfile, onStartVoice, onNavigateToRecommendations }) {
  const { beneficiaryProfile } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);

  const combinedProfile = useMemo(() => Object.assign({}, userProfile, beneficiaryProfile, {
    name: beneficiaryProfile.full_name || (userProfile && userProfile.name) || "Beneficiary"
  }), [userProfile, beneficiaryProfile]);

  const hasData = useMemo(() => hasEnoughData(beneficiaryProfile), [beneficiaryProfile]);
  const analysis = useMemo(() => {
    if (!hasData) return null;
    const res = generateAnalysis(beneficiaryProfile, userProfile);
    const uDur = beneficiaryProfile.trainingAvailabilityDuration || beneficiaryProfile.training_availability_duration;
    const uSched = beneficiaryProfile.trainingSchedule || beneficiaryProfile.training_schedule;
    return attachDurationAnalysis(res, uDur, uSched);
  }, [beneficiaryProfile, userProfile, hasData]);

  const displayName = combinedProfile.name;
  const displayInitials = getInitials(displayName);
  const displayDistrict = combinedProfile.district || beneficiaryProfile.location || "Not provided";

  const handleDownload = useCallback(() => {
    if (!analysis) return;
    setIsDownloading(true);
    const selfEmp = analysis.empPref && analysis.empPref.toLowerCase().includes("self");
    const lines = [
      "====================================================",
      "  JEEVIKA SAATHI - SKILL & LIVELIHOOD ANALYSIS",
      "  PM-AJAY National Livelihood & Skilling Portal",
      "====================================================",
      "",
      "Beneficiary Name : " + analysis.name,
      "Location         : " + analysis.district,
      "Current Livelihood: " + (analysis.occupation || "Not provided"),
      "Existing Skills  : " + (analysis.skills.length > 0 ? analysis.skills.join(", ") : "Not provided"),
      "Career Aspiration: " + (analysis.aspiration || "Not provided"),
      "Employment Pref  : " + (analysis.empPref || "Not provided"),
      "Education        : " + (analysis.education || "Not provided"),
      "Mobility         : " + (analysis.mobilityKm ? "Within " + analysis.mobilityKm + " km" : "Not provided"),
      "Training Avail.  : " + (analysis.training || "Not provided"),
      "",
      "----------------------------------------------------",
      "  AI SKILL ANALYSIS",
      "----------------------------------------------------",
      "Target Trade     : " + analysis.targetLivelihood,
      "Domain           : " + analysis.domain,
      "Training Rec.    : " + analysis.trainingSummary,
      "Duration         : " + analysis.duration,
      "Expected Liveli. : " + analysis.expectedLivelihood,
      "",
      "Top Gap: " + analysis.topGap,
      "",
      "Transferable Skills:"
    ].concat(analysis.transferable.map(function(s) { return "  - " + s; })).concat([
      "",
      "COMPETENCY ANALYSIS (AI-Estimated - Indicative):"
    ]).concat(analysis.competencies.reduce(function(acc, c) {
      return acc.concat([c.title + " (" + c.category + ")", "  Current: " + c.current + "%  Target: " + c.target + "%", "  Gap: " + c.gap, "  Bridge: " + c.training, "  Priority: " + c.priority, ""]);
    }, [])).concat([
      "PRIOR LEARNING / RPL:",
      analysis.rplStatus,
      "",
      "NSQF PATHWAY:",
      analysis.nsqfNote,
      "  " + analysis.targetLivelihood + " -> Training -> Assessment -> Certification -> " + (selfEmp ? "Self-Employment" : "Employment"),
      "",
      "DISCLAIMER:",
      "Competency % are AI-estimated indicators NOT official NSQF scores.",
      "Training recommendations are AI-generated - validate against PMKK courses.",
      "Income figures are indicative only. Visit nearest PMKK center for official assessment.",
      "",
      "Report: " + new Date().toLocaleString("en-IN"),
      "Jeevika Saathi | PM-AJAY GIA | Ministry of Social Justice & Empowerment"
    ]);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SkillAnalysis_" + (analysis.name || "Beneficiary").replace(/\s+/g, "_") + "_" + new Date().toISOString().split("T")[0] + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsDownloading(false), 800);
  }, [analysis]);

  if (!hasData) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>Skill & Livelihood Analysis</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Your personalized assessment of existing skills, transferable capabilities, skill gaps and the pathway ahead.</p>
        </div>
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "40px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><AlertTriangle size={32} /></div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#9a3412", margin: "0 0 8px" }}>Voice Assessment Required</h2>
          <p style={{ fontSize: "15px", color: "#7c2d12", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.6 }}>Complete your Voice Assessment to generate your personalized Skill & Livelihood Analysis. Saathi AI will ask about your skills, experience, and aspirations to build your profile.</p>
          <button type="button" onClick={onStartVoice} style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ea580c", color: "#ffffff", padding: "12px 28px", borderRadius: "8px", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}><Mic size={18} /> Start Voice Assessment</button>
          <div style={{ marginTop: "16px", fontSize: "13px", color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Info size={14} /> Saathi AI will guide you through the assessment — just speak naturally.</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", opacity: 0.5, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e2e8f0", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}>{displayInitials}</div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#94a3b8", margin: 0 }}>Assessment Report — {displayName}</h2>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>{displayDistrict}</div>
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}><Loader2 size={14} /> Analysis Pending</div>
          </div>
          <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "14px" }}>Complete Voice Assessment to unlock your personalized analysis</div>
        </div>
      </div>
    );
  }

  const pathwaySteps = ["Current Skills", "Skill Bridging", "Training", "Assessment", "Certification",
    analysis.empPref && analysis.empPref.toLowerCase().includes("self") ? "Self-Employment" : "Employment"];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0, lineHeight: 1.2 }}>Skill & Livelihood Analysis</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>Your personalized assessment of existing skills, transferable capabilities, skill gaps and the pathway ahead.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button type="button" onClick={handleDownload} disabled={isDownloading} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", backgroundColor: "transparent", color: "var(--gov-navy)", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: isDownloading ? 0.7 : 1 }}>
            {isDownloading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
            {isDownloading ? "Generating..." : "Download Report"}
          </button>
          <button type="button" onClick={onStartVoice} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "var(--gov-navy)", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            <Zap size={14} /> Retake Voice Diagnostic
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--gov-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}>{displayInitials}</div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gov-navy)", margin: 0 }}>Assessment Report — {displayName}</h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{combinedProfile.id ? "ID: " + combinedProfile.id + " • " : ""}{displayDistrict}</div>
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}><CheckCircle2 size={14} /> Analysis Ready</div>
        </div>
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div><div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Current Livelihood</div><div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginTop: "2px" }}>{analysis.occupation || "Not provided"}</div></div>
          <div><div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Existing Skills</div><div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginTop: "2px" }}>{analysis.skills.length > 0 ? analysis.skills.join(" • ") : "None stated"}</div></div>
          <div><div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Aspiration</div><div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginTop: "2px" }}>{analysis.aspiration || "Not provided"}</div></div>
          <div><div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Preference</div><div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-dark)", marginTop: "2px" }}>{analysis.empPref || "Not provided"}</div></div>
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "12px", fontStyle: "italic" }}>* Analysis generated from your Voice Assessment and Livelihood Profile. Competency estimates are AI-generated indicators, not official assessment scores.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Skills</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "4px 0" }}>{analysis.domain}</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{analysis.skills.length > 0 ? analysis.skills.slice(0, 3).join(", ") : "To be detailed in assessment"}</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Identified Gaps</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "4px 0" }}>{analysis.competencies[0] ? analysis.competencies[0].title : "To be assessed"}</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{analysis.topGap.length > 60 ? analysis.topGap.substring(0, 60) + "..." : analysis.topGap}</div>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recommended Training</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "4px 0" }}>{analysis.trainingSummary}</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{analysis.duration} — AI Recommendation</div>
        </div>
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expected Livelihood</div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#065f46", margin: "4px 0" }}>{analysis.expectedLivelihood}</div>
          <div style={{ fontSize: "12px", color: "#065f46", lineHeight: 1.4, fontStyle: "italic" }}>{analysis.incomeNote}</div>
        </div>
      </div>

      {analysis.durationNotice && (
        <div style={{
          backgroundColor: analysis.durationStatus === "longer_required" ? "#fffbeb" : analysis.durationStatus === "compatible" ? "#f0fdf4" : "#f8fafc",
          border: `1.5px solid ${analysis.durationStatus === "longer_required" ? "#fde68a" : analysis.durationStatus === "compatible" ? "#bbf7d0" : "#e2e8f0"}`,
          borderRadius: "10px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          boxShadow: "var(--shadow-sm)"
        }}>
          {analysis.durationStatus === "longer_required" ? (
            <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
          ) : analysis.durationStatus === "compatible" ? (
            <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
          ) : (
            <Info size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: "2px" }} />
          )}
          <div>
            <div style={{
              fontSize: "13.5px",
              fontWeight: 700,
              color: analysis.durationStatus === "longer_required" ? "#92400e" : analysis.durationStatus === "compatible" ? "#166534" : "#1e293b",
              marginBottom: "2px"
            }}>
              {analysis.durationStatus === "longer_required" ? "Training Duration Compatibility Notice" : analysis.durationStatus === "compatible" ? "Duration Compatibility Verified" : "Training Availability Preference"}
            </div>
            <div style={{
              fontSize: "13px",
              color: analysis.durationStatus === "longer_required" ? "#78350f" : analysis.durationStatus === "compatible" ? "#14532d" : "#475569",
              lineHeight: 1.5
            }}>
              {analysis.durationNotice}
            </div>
          </div>
        </div>
      )}

      {analysis.transferable.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 8px" }}>Transferable Skills</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 12px" }}>Skills from your current experience that transfer into <strong>{analysis.targetLivelihood}</strong>:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {analysis.transferable.map((s, i) => (
              <span key={i} style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 12px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}><ArrowRight size={12} /> {s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--gov-navy)", margin: 0 }}>Detailed Skill Gap Diagnostic</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>Visual breakdown of current competencies vs. targets required for <strong>{analysis.targetLivelihood}</strong>. <span style={{ color: "#94a3b8", fontStyle: "italic" }}>AI-estimated — indicative only.</span></p>
        </div>
        <div>
          {analysis.competencies.map((skill, index) => (
            <div key={index} style={{ borderBottom: index < analysis.competencies.length - 1 ? "1px solid #e2e8f0" : "none" }}>
              <CompetencyBar skill={skill} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Award size={20} /></div>
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 4px 0" }}>Prior Learning / RPL</h4>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{analysis.rplStatus}</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px", fontStyle: "italic" }}>RPL eligibility must be formally assessed at a PMKK centre — this is an AI indicator only.</div>
          </div>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Target size={20} /></div>
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--gov-navy)", margin: "0 0 4px 0" }}>NSQF-Aligned Pathway</h4>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--gov-navy)", marginBottom: "6px" }}>{analysis.targetLivelihood}</div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px", fontSize: "12px", color: "#475569" }}>
              {pathwaySteps.map((step, i) => (
                <React.Fragment key={i}>
                  <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontWeight: i === 0 ? 700 : 500 }}>{step}</span>
                  {i < pathwaySteps.length - 1 && <ChevronRight size={12} style={{ color: "#94a3b8" }} />}
                </React.Fragment>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px", fontStyle: "italic" }}>{analysis.nsqfNote}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <Shield size={16} style={{ color: "#64748b", flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
          <strong>Important:</strong> Competency percentages are AI-estimated indicators based on your stated profile — NOT official NSQF assessment scores, government certifications or employer guarantees. Training and income figures are indicative recommendations only. For official assessment and enrolment, visit your nearest PMKK (Pradhan Mantri Kaushal Kendra) centre.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button type="button" onClick={onNavigateToRecommendations} style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "var(--tricolour-saffron)", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 153, 51, 0.3)" }}>
          View Recommendations <ChevronRight size={18} />
        </button>
      </div>

      <style>{".md-grid-skill{grid-template-columns:1fr}@media(min-width:860px){.md-grid-skill{grid-template-columns:1.2fr 1fr 1.5fr 1fr}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
