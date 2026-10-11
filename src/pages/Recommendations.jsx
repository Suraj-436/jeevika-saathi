import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Search, CheckCircle2, ChevronDown, MapPin, Mic, AlertTriangle, 
  ChevronRight, Award, Target, Info, Lock, BookOpen, Filter, RotateCcw, 
  Layers, SlidersHorizontal, ArrowRight, Check, Compass, Loader2
} from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useLanguage } from "../context/LanguageContext";
import { 
  fetchPersonalizedRecommendations, 
  saveSelectedPathway,
  fetchSkillInterests,
  fetchDatasetSkillRecommendations
} from "../services/matchingService";
import CourseRecommendationCard from "../components/CourseRecommendationCard";
import { getLocaleForLanguage } from "../utils/voiceSelector";

function getInitials(name) {
  if (!name || name === "Beneficiary") return "B";
  const parts = name.trim().split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO FALLBACK DATA (used only when no real assessment exists)
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_RECS = [
  {
    id: "demo-1", title: "Customer Service Executive", localTitle: "ग्राहक सेवा कार्यकारी",
    sector: "IT & Digital Services", sector_tag: "IT & Digital Services",
    matchScore: null, // null = demo, show "Complete assessment"
    whyMatch: "Demo recommendation — complete your Voice Assessment to receive personalized pathways.",
    skillGaps: ["Digital communication", "CRM tool usage", "Professional English"],
    training: { title: "Customer Service & BPO Skills", duration: "300 Hrs", hours: "NSQF Level 4 — Verified" },
    nsqfLevel: "NSQF Level 4", giaStatus: "GIA Eligible (PM-AJAY)", localDemand: "High National Demand",
    pathway: { steps: ["Training (300 hrs)", "Certification", "Employment"], isFlagship: true },
    badge: "HIGH PLACEMENT", isDemo: true
  },
  {
    id: "demo-2", title: "Solar & Domestic Electrician", localTitle: "सोलर एवं घरेलू इलेक्ट्रीशियन",
    sector: "Electronics & Solar", sector_tag: "Electronics & Solar",
    matchScore: null,
    whyMatch: "Demo recommendation — complete your Voice Assessment for personalized matching.",
    skillGaps: ["Solar PV installation", "DC/AC circuit wiring", "Safety compliance"],
    training: { title: "Solar PV & Electrical Installation", duration: "200 Hrs", hours: "NSQF Level 3 — Verified" },
    nsqfLevel: "NSQF Level 3", giaStatus: "GIA Eligible (PM-AJAY)", localDemand: "High Local Demand",
    pathway: { steps: ["Training (200 hrs)", "Certification", "Employment / Self-Employment"], isFlagship: false },
    badge: "SOLAR ROOFTOP READY", isDemo: true
  },
  {
    id: "demo-3", title: "Footwear & Leather Artisan", localTitle: "जूता शिल्पकार एवं लेदर आर्टिसन",
    sector: "Leather & Footwear", sector_tag: "Leather & Footwear",
    matchScore: null,
    whyMatch: "Demo recommendation — complete your Voice Assessment for personalized matching.",
    skillGaps: ["Pattern grading & sizing", "Industrial machine operation", "Quality finishing"],
    training: { title: "Footwear Manufacturing & Finishing", duration: "240 Hrs", hours: "NSQF Level 3 — Verified" },
    nsqfLevel: "NSQF Level 3", giaStatus: "GIA Eligible (PM-AJAY)", localDemand: "High Local Demand",
    pathway: { steps: ["Training (240 hrs)", "Certification", "Employment / Self-Employment"], isFlagship: false },
    badge: "SC COMMUNITY AFFINITY", isDemo: true
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION ENGINE (real data)
// ─────────────────────────────────────────────────────────────────────────────
function hasEnoughData(bp) {
  if (!bp) return false;
  return (Array.isArray(bp.existing_skills) && bp.existing_skills.length > 0)
    || !!bp.current_occupation || !!bp.career_aspiration
    || (Array.isArray(bp.interests) && bp.interests.length > 0);
}

function calcScore(bp, w, trainingDuration) {
  const exp = Math.min(100, 30 + (parseInt(bp.years_of_experience) || 0) * 10);
  let score = Math.round(w.skill * 0.25 + w.interest * 0.20 + w.aspiration * 0.20 + exp * 0.15 + w.emp * 0.10 + w.mob * 0.10);
  
  // Consider training availability as a recommendation factor without rejecting
  const userDuration = bp.trainingAvailabilityDuration || bp.training_availability_duration;
  if (userDuration && !userDuration.toLowerCase().includes("not decide") && trainingDuration) {
    const uLower = userDuration.toLowerCase();
    const tLower = trainingDuration.toLowerCase();
    const userShort = uLower.includes("1 month") || uLower.includes("less than");
    const courseLong = tLower.includes("3 month") || tLower.includes("6 month") || tLower.includes("90 day");
    if (!userShort || !courseLong) {
      score = Math.min(99, score + 2);
    }
  }
  return Math.min(99, score);
}

function getRawRecommendations(bp, loginProfile) {
  const skills = Array.isArray(bp.existing_skills) ? bp.existing_skills : [];
  const interests = Array.isArray(bp.interests) ? bp.interests : [];
  const trad = bp.family_occupation || null;
  const occ = bp.current_occupation || null;
  const asp = bp.career_aspiration || null;
  const empPref = bp.employment_preference || null;
  const expYears = parseInt(bp.years_of_experience) || 0;
  const hasTrad = !!trad;

  const allText = [asp, occ, trad, ...skills, ...interests].filter(Boolean).join(" ").toLowerCase();
  const isSelf = empPref && empPref.toLowerCase().includes("self");
  const isWage = empPref && (empPref.toLowerCase().includes("wage") || empPref.toLowerCase().includes("employ"));
  const outcome = isSelf ? "Self-Employment" : isWage ? "Formal Employment" : "Employment / Self-Employment";

  const isCarpentry   = /carpent|wood|furniture|joiner|cabinet/.test(allText);
  const isSolar       = /solar|photovoltaic|pv panel/.test(allText);
  const isElectric    = /electric|wiring|circuit|wire/.test(allText) && !isSolar;
  const isLeather     = /leather|shoe|footwear|cobbler|chamar/.test(allText);
  const isTailoring   = /tailor|sewing|stitch|apparel|garment|cloth/.test(allText);
  const isAgriculture = /farm|agri|crop|harvest|kisan|field/.test(allText);
  const isFood        = /food|cook|catering|bakery|processing|preserv/.test(allText);
  const isConstruct   = /mason|brick|construction|plumber|cement|tile/.test(allText);
  const isIT          = /computer|digital|software|data entry|it|coding/.test(allText);

  const skillStr = skills.length > 0 ? skills.slice(0, 2).join(" and ") : null;
  const expStr = expYears > 0 ? expYears + "-year" : "informal";

  if (isCarpentry) {
    const s1 = calcScore(bp, { skill: 90, interest: 92, aspiration: 95, emp: 85, mob: 80 });
    const s2 = calcScore(bp, { skill: 75, interest: 80, aspiration: 78, emp: 70, mob: 75 });
    const s3 = calcScore(bp, { skill: 65, interest: 70, aspiration: 60, emp: 80, mob: 70 });
    return [
      { id: "r1", title: "Advanced Furniture Maker", localTitle: "उन्नत फर्नीचर निर्माता", sector_tag: "Construction & Wood Crafts",
        matchScore: s1, isDemo: false, badge: expYears >= 3 ? "RPL Eligible" : null,
        whyMatch: `Your ${expStr} carpentry experience${skillStr ? " and skills in " + skillStr : ""} align strongly with this pathway.${asp ? ' Your goal — "' + asp + '" — directly maps to this trade.' : ""}${isSelf ? " The self-employment route supports your goal of independent work." : ""}`,
        skillGaps: ["Advanced joinery (dovetail, mortise & tenon)", "Professional wood finishing & polishing", "Power-tool operation & safety", "Commercial quality standards"],
        training: { title: "Advanced Carpentry & Furniture Making", duration: expYears >= 3 ? "45-60 Days (RPL Track)" : "3 Months", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (Carpenter)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Skill Bridging", "Training", "Certification", outcome], isFlagship: true } },
      { id: "r2", title: "Woodworking Workshop Operator", localTitle: "लकड़ी कार्यशाला संचालक", sector_tag: "Construction & Wood Crafts",
        matchScore: s2, isDemo: false, badge: null,
        whyMatch: `With your ${skillStr ? skillStr + " skills" : "carpentry background"}, you can progress into running a workshop. Suits your preference for ${isSelf ? "self-employment and independence" : "stable livelihood work"}.`,
        skillGaps: ["Workshop production planning", "Power machinery operation", "Material costing & procurement", "Customer order management"],
        training: { title: "Woodworking & Workshop Operations", duration: "60 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Practical Lab", "Certification", outcome], isFlagship: false } },
      { id: "r3", title: "Interior Wood Finishing Specialist", localTitle: "इंटीरियर वुड फिनिशिंग विशेषज्ञ", sector_tag: "Construction & Wood Crafts",
        matchScore: s3, isDemo: false, badge: null,
        whyMatch: `Your repair and measurement skills from ${occ || "your current work"} transfer into interior woodwork. Finishing is a growing market supporting ${isSelf ? "contract self-employment" : "employment with construction firms"}.`,
        skillGaps: ["Surface preparation & priming", "Modern lacquer & varnish application", "Interior measurement & fit-out"],
        training: { title: "Wood Finishing & Interior Carpentry", duration: "45 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: false } }
    ];
  }

  if (isSolar) {
    const s1 = calcScore(bp, { skill: 85, interest: 90, aspiration: 92, emp: 80, mob: 85 });
    const s2 = calcScore(bp, { skill: 70, interest: 75, aspiration: 78, emp: 75, mob: 80 });
    return [
      { id: "r1", title: "Solar PV Technician / Installer", localTitle: "सोलर पीवी तकनीशियन", sector_tag: "Electronics & Solar",
        matchScore: s1, isDemo: false, badge: "High National Demand",
        whyMatch: `Your interest in solar work${skillStr ? " and skills in " + skillStr : ""} align directly with this pathway.${asp ? ' Aspiration: "' + asp + '" maps to this job role.' : ""}`,
        skillGaps: ["Solar PV panel wiring & string inverters", "DC circuit theory & meter reading", "Rooftop safety & mounting", "Net-metering configuration"],
        training: { title: "Solar PV Installation & Maintenance", duration: "90 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (ELE/Q3104)", giaStatus: "GIA status — to be verified", localDemand: "National demand: High (Surya Ghar)",
        pathway: { steps: ["Training", "Safety Certification", "Assessment", outcome], isFlagship: true } },
      { id: "r2", title: "Solar Maintenance Technician", localTitle: "सोलर रखरखाव तकनीशियन", sector_tag: "Electronics & Solar",
        matchScore: s2, isDemo: false, badge: null,
        whyMatch: `Maintenance of installed solar systems is a high-frequency job role well suited for ${isSelf ? "independent service contractors" : "employment with solar companies"}.`,
        skillGaps: ["Panel fault diagnosis", "Battery health monitoring", "Inverter troubleshooting", "Service record management"],
        training: { title: "Solar O&M (Operation & Maintenance)", duration: "45 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: false } }
    ];
  }

  if (isElectric) {
    const s1 = calcScore(bp, { skill: 80, interest: 85, aspiration: 88, emp: 75, mob: 80 });
    return [
      { id: "r1", title: "Domestic Electrician", localTitle: "घरेलू इलेक्ट्रीशियन", sector_tag: "Electronics & Solar",
        matchScore: s1, isDemo: false, badge: null,
        whyMatch: `Your interest in electrical work${skillStr ? " and skills in " + skillStr : ""} align with this essential trade.${asp ? ' Aspiration: "' + asp + '" supports this pathway.' : ""}`,
        skillGaps: ["AC/DC circuit theory & load calculation", "MCB/RCCB installation & panel wiring", "Formal electrical safety (IE Rules)", "Test instrument use"],
        training: { title: "Domestic Electrical Installation", duration: "90 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (Domestic Electrician)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Safety Certification", "Assessment", outcome], isFlagship: true } }
    ];
  }

  if (isLeather) {
    const strongRpl = hasTrad || expYears >= 2;
    const s1 = calcScore(bp, { skill: strongRpl ? 92 : 75, interest: 88, aspiration: 85, emp: 80, mob: 75 });
    const s2 = calcScore(bp, { skill: 65, interest: 70, aspiration: 65, emp: 75, mob: 70 });
    return [
      { id: "r1", title: "Footwear Artisan & Manufacturer", localTitle: "जूता शिल्पकार एवं निर्माता", sector_tag: "Leather & Footwear",
        matchScore: s1, isDemo: false, badge: strongRpl ? "RPL Candidate" : null,
        whyMatch: `${hasTrad ? "Your family tradition in leather/footwear craft gives you a strong foundation." : "Your existing skills align with this pathway."} ${expYears > 0 ? expYears + " years of experience may qualify for RPL." : ""} Suits your ${isSelf ? "goal of self-employment" : "livelihood aspirations"}.`,
        skillGaps: ["Modern pattern grading & sizing", "Industrial stitching machine operation", "Commercial quality control", "Synthetic material handling"],
        training: { title: "Footwear Manufacturing & Finishing", duration: strongRpl ? "45 Days (RPL Track)" : "3 Months", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: strongRpl ? "L3 via RPL — to be verified at PMKK" : "NSQF — to be verified (Footwear Artisan)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: strongRpl ? ["RPL Assessment", "Certification", outcome] : ["Training", "Assessment", "Certification", outcome], isFlagship: true } },
      { id: "r2", title: "Leather Goods Maker", localTitle: "चमड़ा उत्पाद निर्माता", sector_tag: "Leather & Footwear",
        matchScore: s2, isDemo: false, badge: null,
        whyMatch: `Skills in cutting and stitching transfer into leather goods production (bags, belts, accessories). Offers ${isSelf ? "self-employment through direct market sales" : "employment with leather goods manufacturers"}.`,
        skillGaps: ["Leather goods pattern work", "Edge finishing & burnishing", "Hardware attachment (buckles, zippers)", "Product costing"],
        training: { title: "Leather Goods Production", duration: "60 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: false } }
    ];
  }

  if (isTailoring) {
    const s1 = calcScore(bp, { skill: 80, interest: 85, aspiration: 88, emp: 80, mob: 75 });
    const s2 = calcScore(bp, { skill: 65, interest: 70, aspiration: 65, emp: 75, mob: 70 });
    return [
      { id: "r1", title: "Sewing Machine Operator / Tailor", localTitle: "सिलाई मशीन ऑपरेटर / दर्जी", sector_tag: "Apparel & Tailoring",
        matchScore: s1, isDemo: false, badge: null,
        whyMatch: `Your interest in tailoring${skillStr ? " and skills in " + skillStr : ""} align with this trade.${asp ? ' "' + asp + '" directly maps to this pathway.' : ""} ${isSelf ? "The self-employment route supports your goal." : ""}`,
        skillGaps: ["Industrial sewing machine operation", "Precision measurement & cutting", "Garment assembly & finishing", "Quality control standards"],
        training: { title: "Apparel & Industrial Tailoring", duration: "60 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (Sewing Machine Operator)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Assessment", "Certification", outcome], isFlagship: true } },
      { id: "r2", title: isSelf ? "Boutique / Tailoring Business" : "Apparel Quality Inspector", localTitle: isSelf ? "बुटीक / दर्जी व्यापार" : "वस्त्र गुणवत्ता निरीक्षक", sector_tag: "Apparel & Tailoring",
        matchScore: s2, isDemo: false, badge: null,
        whyMatch: isSelf ? "With training, your tailoring skills can support running a boutique or alterations business — low capital, high local demand." : "Quality inspection in garment factories is a stable employment role that draws on measurement and finishing skills.",
        skillGaps: isSelf ? ["Business costing & pricing", "Customer management", "Fashion trends & fabric selection"] : ["Defect identification & grading", "Measurement standardization", "Rejection reporting"],
        training: { title: isSelf ? "Tailoring Micro-Enterprise" : "Apparel Quality Control", duration: "30 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: false } }
    ];
  }

  if (isAgriculture || isFood) {
    const s1 = calcScore(bp, { skill: 80, interest: 85, aspiration: 88, emp: 75, mob: 80 });
    const s2 = calcScore(bp, { skill: 65, interest: 72, aspiration: 70, emp: 70, mob: 75 });
    return [
      { id: "r1", title: isFood ? "Food Processing Entrepreneur" : "Skilled Farmer / Agri-Entrepreneur", localTitle: isFood ? "खाद्य प्रसंस्करण उद्यमी" : "कुशल किसान / कृषि उद्यमी", sector_tag: "Agri & Food Processing",
        matchScore: s1, isDemo: false, badge: null,
        whyMatch: `Your background in ${occ || "agriculture/food work"}${skillStr ? " and skills in " + skillStr : ""} form a strong base.${asp ? ' "' + asp + '" aligns with this trade.' : ""} ${isSelf ? "Supports your goal of self-employment." : ""}`,
        skillGaps: isFood ? ["Food safety & hygiene (FSSAI basics)", "Preservation & packaging techniques", "Labelling & market linkage", "Small enterprise management"] : ["Modern agronomic practices", "Micro-irrigation & water management", "Post-harvest storage & grading", "Agri-market linkage (e-NAM, FPO)"],
        training: { title: isFood ? "Food Processing & Preservation" : "Modern Agriculture & Agri-Business", duration: "45-60 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (Agri/Food Processing)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: true } },
      { id: "r2", title: "Agri Service Provider / Micro-Entrepreneur", localTitle: "कृषि सेवा प्रदाता", sector_tag: "Agri & Food Processing",
        matchScore: s2, isDemo: false, badge: null,
        whyMatch: "Providing agricultural services (irrigation, soil testing, input supply) to other farmers is a growing self-employment pathway leveraging your agricultural knowledge.",
        skillGaps: ["Soil health & testing basics", "Input supply & costing", "Farmer linkage & service delivery", "Record keeping & digital tools"],
        training: { title: "Agri Service Entrepreneur Training", duration: "30 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: false } }
    ];
  }

  if (isConstruct) {
    const s1 = calcScore(bp, { skill: 80, interest: 82, aspiration: 85, emp: 70, mob: 75 });
    return [
      { id: "r1", title: asp || "Skilled Construction Tradesperson", localTitle: "कुशल निर्माण कारीगर", sector_tag: "Construction & Wood Crafts",
        matchScore: s1, isDemo: false, badge: null,
        whyMatch: `Your background in ${occ || "construction work"}${skillStr ? " and skills in " + skillStr : ""} align with this pathway.${asp ? ' "' + asp + '" matches this trade.' : ""} Formal certification can significantly improve earnings.`,
        skillGaps: ["Standardized construction techniques", "BIS/safety compliance on site", "Drawing reading & estimation", "Modern material handling"],
        training: { title: "Construction Trade Certification", duration: "90 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (Mason L3 / Plumber L4)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Skill Bridging", "Training", "Certification", outcome], isFlagship: true } }
    ];
  }

  if (isIT) {
    const s1 = calcScore(bp, { skill: 70, interest: 88, aspiration: 85, emp: 75, mob: 70 });
    return [
      { id: "r1", title: "Digital Services & Data Entry Operator", localTitle: "डिजिटल सेवा / डेटा एंट्री ऑपरेटर", sector_tag: "IT & Digital Services",
        matchScore: s1, isDemo: false, badge: null,
        whyMatch: `Your interest in digital/IT work and aspiration "${asp || "digital services"}" align with this pathway. ${isWage ? "Employment in BPO, government data centers and digital service centers is available." : "Self-employment via CSC (Common Service Centre) is a viable route."}`,
        skillGaps: ["MS Office & spreadsheet proficiency", "Typing speed & data accuracy", "Basic internet & email operations", "Customer-facing digital service delivery"],
        training: { title: "Digital Literacy & Data Entry Operations", duration: "60 Days", hours: "AI Recommendation — verify at PMKK" },
        nsqfLevel: "NSQF — to be verified (IT-ITES)", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
        pathway: { steps: ["Training", "Certification", outcome], isFlagship: true } }
    ];
  }

  // Generic fallback
  const t = asp || (interests.length > 0 ? interests[0] : occ || "Livelihood Skill Training");
  const s1 = calcScore(bp, { skill: 70, interest: 75, aspiration: 80, emp: 70, mob: 70 });
  return [
    { id: "r1", title: t, localTitle: "", sector_tag: "General Livelihood",
      matchScore: s1, isDemo: false, badge: null,
      whyMatch: `Based on your profile${occ ? " — current livelihood: " + occ : ""}${skillStr ? ", skills: " + skillStr : ""}${asp ? ' and aspiration: "' + asp + '"' : ""} — this pathway has been identified. Complete a more detailed Voice Assessment for refined recommendations.`,
      skillGaps: skills.length > 0 ? ["Advanced skills in " + t, "Formal certification", "Applied training"] : ["Domain foundation training", "Practical application skills", "Formal certification"],
      training: { title: "Skill Training in " + t, duration: "To be determined", hours: "Duration to be verified at PMKK center" },
      nsqfLevel: "NSQF — to be verified at PMKK", giaStatus: "GIA status — to be verified", localDemand: "Local demand — to be verified",
      pathway: { steps: ["Training", "Assessment", "Certification", outcome], isFlagship: true } }
  ];
}

function attachRecDuration(rec, bp) {
  if (!rec) return rec;
  const userDuration = bp.trainingAvailabilityDuration || bp.training_availability_duration || null;
  const userSchedule = bp.trainingSchedule || bp.training_schedule || null;

  if (!userDuration || userDuration.toLowerCase().includes("not decide") || userDuration.toLowerCase().includes("not sure")) {
    rec.durationNotice = "Training duration preference has not been decided yet. Modular and weekend options available.";
    rec.durationStatus = "undecided";
    return rec;
  }

  const uLower = userDuration.toLowerCase();
  let userMonths = 3;
  if (uLower.includes("less than 1") || uLower.includes("< 1") || uLower.includes("few weeks")) userMonths = 0.75;
  else if (uLower.includes("1 month")) userMonths = 1;
  else if (uLower.includes("2 month")) userMonths = 2;
  else if (uLower.includes("3 month")) userMonths = 3;
  else if (uLower.includes("4") || uLower.includes("5") || uLower.includes("6")) userMonths = 5;
  else if (uLower.includes("more than 6")) userMonths = 7;

  const tLower = (rec.training?.duration || "").toLowerCase();
  let trainMonths = 3;
  if (tLower.includes("20 day") || tLower.includes("30 day") || tLower.includes("1 month") || tLower.includes("4 week")) trainMonths = 1;
  else if (tLower.includes("40 day") || tLower.includes("45 day") || tLower.includes("60 day") || tLower.includes("2 month")) trainMonths = 2;
  else if (tLower.includes("90 day") || tLower.includes("3 month") || tLower.includes("300 hr") || tLower.includes("240 hr") || tLower.includes("200 hr")) trainMonths = 3;
  else if (tLower.includes("6 month") || tLower.includes("180 day")) trainMonths = 6;

  if (trainMonths > userMonths + 0.3) {
    rec.durationNotice = `Requires more training time than your current availability (${userDuration} available vs ${rec.training.duration} course). Modular or RPL options may accelerate completion.`;
    rec.durationStatus = "longer_required";
  } else {
    rec.durationNotice = `Duration fits within your ${userDuration} availability${userSchedule ? " (" + userSchedule + ")" : ""}.`;
    rec.durationStatus = "fits";
  }
  return rec;
}

function generateRecommendations(bp, loginProfile) {
  const list = getRawRecommendations(bp, loginProfile);
  return list.map(r => attachRecDuration(r, bp));
}

function formatDatasetPathwayToRec(pathway, bp) {
  const isElectronics = (pathway.sector || "").toLowerCase().includes("elec");
  const sectorTag = isElectronics ? "Electronics & Solar" : "IT & Digital Services";
  const primaryCourse = pathway.recommended_primary_course || {};
  const modularBridge = pathway.recommended_modular_bridge || null;
  const durationWeeks = primaryCourse.duration_weeks || 12;
  const notionalHours = primaryCourse.notional_hours || (durationWeeks * 25);
  const durationStr = `${durationWeeks} Weeks (${notionalHours} Hrs)`;

  const skillGaps = [];
  if (modularBridge) {
    skillGaps.push(`Bridge Specialization: ${modularBridge.course_name}`);
  }
  skillGaps.push(`Hands-on practicals: ${primaryCourse.course_name || pathway.occupation_title}`);
  skillGaps.push("NCVET/NIELIT Examination & Certification Standards");

  const rec = {
    id: pathway.pathway_id || `pathway-${pathway.occupation_id}`,
    title: pathway.occupation_title,
    localTitle: pathway.target_employment || "NCVET Aligned Livelihood Track",
    sector: pathway.sector,
    sector_tag: sectorTag,
    matchScore: pathway.match_percentage || 80,
    isDemo: false,
    badge: pathway.rank === 1 ? "HIGH PLACEMENT" : (pathway.target_employment?.includes("Self") ? "SC COMMUNITY AFFINITY" : "SOLAR ROOFTOP READY"),
    whyMatch: `${pathway.description} ${pathway.matched_skills && pathway.matched_skills.length > 0 ? "Matched profile skills: " + pathway.matched_skills.join(", ") + "." : ""}`,
    skillGaps: skillGaps,
    training: {
      title: primaryCourse.course_name || "NIELIT NSQF Qualification",
      duration: durationStr,
      hours: `NSQF Level ${pathway.nsqf_level} — ${primaryCourse.fee_waiver || '100% Free under PM-AJAY GIA for SC'}`
    },
    nsqfLevel: `NSQF Level ${pathway.nsqf_level}`,
    giaStatus: "GIA Eligible (PM-AJAY)",
    localDemand: "High PM-AJAY Alignment",
    pathway: {
      steps: [
        "PM-AJAY Enrolment",
        primaryCourse.course_name ? (primaryCourse.course_name.length > 20 ? primaryCourse.course_name.slice(0, 18) + "..." : primaryCourse.course_name) : "Skill Training",
        "NCVET Certification",
        pathway.target_employment || "Employment"
      ],
      isFlagship: pathway.rank === 1
    },
    rawPathway: pathway
  };

  return attachRecDuration(rec, bp);
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION CARD
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  "RPL Eligible": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "RPL Candidate": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "High National Demand": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "SC COMMUNITY AFFINITY": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "SOLAR ROOFTOP READY": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "HIGH PLACEMENT": { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

function RecCard({ rec, isTop, onViewPathway, onFindTraining }) {
  const [expanded, setExpanded] = useState(isTop);
  const bc = rec.badge ? (BADGE_COLORS[rec.badge] || { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" }) : null;

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: isTop ? "2px solid var(--gov-navy)" : "1px solid var(--border)",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: isTop ? "0 4px 16px rgba(0,39,24,0.12)" : "var(--shadow-sm)",
      display: "flex", flexDirection: "column", gap: "16px",
      position: "relative", overflow: "hidden"
    }}>
      {isTop && (
        <div style={{ position: "absolute", top: 0, right: 0, backgroundColor: "var(--gov-navy)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "4px 12px", borderRadius: "0 10px 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {rec.isDemo ? "Sample Pathway" : "Recommended Pathway"}
        </div>
      )}

      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", paddingTop: isTop ? "8px" : "0" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: 0, lineHeight: 1.2 }}>{rec.title}</h3>
          {rec.localTitle && <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{rec.localTitle}</div>}
        </div>
        {rec.matchScore !== null ? (
          <div style={{ flexShrink: 0, backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "20px", padding: "4px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", lineHeight: 1 }}>{rec.matchScore}%</div>
            <div style={{ fontSize: "9px", color: "#047857", fontWeight: 700, textTransform: "uppercase" }}>AI Match</div>
          </div>
        ) : (
          <div style={{ flexShrink: 0, backgroundColor: "#f1f5f9", borderRadius: "20px", padding: "4px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Complete<br/>Assessment</div>
          </div>
        )}
      </div>

      {/* Badges row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {rec.nsqfLevel && (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
            {rec.nsqfLevel}
          </span>
        )}
        {rec.giaStatus && !rec.giaStatus.includes("to be verified") && (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
            {rec.giaStatus}
          </span>
        )}
        {rec.giaStatus && rec.giaStatus.includes("to be verified") && (
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0", fontStyle: "italic" }}>
            {rec.giaStatus}
          </span>
        )}
        {rec.localDemand && !rec.localDemand.includes("to be verified") && !rec.localDemand.includes("—") && (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
            {rec.localDemand}
          </span>
        )}
        {rec.badge && bc && (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: bc.bg, color: bc.color, border: "1px solid " + bc.border }}>
            {rec.badge}
          </span>
        )}
        {rec.durationStatus === "longer_required" && (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
            ⏳ Requires more time ({rec.training.duration})
          </span>
        )}
        {rec.durationStatus === "fits" && (
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
            ✓ Fits your availability
          </span>
        )}
      </div>

      {/* Expandable details */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: "var(--gov-navy)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <ChevronRight size={14} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
          Why this match?
        </button>

        {expanded && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{rec.whyMatch}</p>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Skill Gaps Addressed</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                {rec.skillGaps.map((g, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={13} style={{ color: "#16a34a", flexShrink: 0, marginTop: "1px" }} />
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Training & Duration Compatibility</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gov-navy)" }}>{rec.training.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Duration: {rec.training.duration}</div>
              {rec.durationNotice && (
                <div style={{
                  fontSize: "12px",
                  marginTop: "6px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  backgroundColor: rec.durationStatus === "longer_required" ? "#fffbeb" : rec.durationStatus === "fits" ? "#f0fdf4" : "#f8fafc",
                  color: rec.durationStatus === "longer_required" ? "#92400e" : rec.durationStatus === "fits" ? "#166534" : "#475569",
                  border: `1px solid ${rec.durationStatus === "longer_required" ? "#fde68a" : rec.durationStatus === "fits" ? "#bbf7d0" : "#e2e8f0"}`
                }}>
                  {rec.durationNotice}
                </div>
              )}
              <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginTop: "4px" }}>{rec.training.hours}</div>
            </div>

            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Livelihood Pathway</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px" }}>
                {rec.pathway.steps.map((step, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "var(--gov-navy)" }}>{step}</span>
                    {i < rec.pathway.steps.length - 1 && <ChevronRight size={10} style={{ color: "#94a3b8" }} />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
        <button
          type="button"
          onClick={() => onViewPathway(rec)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "var(--tricolour-saffron)", color: "#ffffff", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
        >
          View Livelihood Pathway <ChevronRight size={14} />
        </button>
        <button
          type="button"
          onClick={onFindTraining}
          style={{ width: "100%", padding: "8px", borderRadius: "8px", backgroundColor: "transparent", color: "var(--gov-navy)", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
        >
          <MapPin size={13} /> Find Training Centers
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTOR FILTERS
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "All Sectors" },
  { id: "Electronics & Solar", label: "Electronics & Solar" },
  { id: "Leather & Footwear", label: "Leather & Footwear" },
  { id: "Agri & Food Processing", label: "Agri & Food Processing" },
  { id: "Apparel & Tailoring", label: "Apparel & Tailoring" },
  { id: "IT & Digital Services", label: "IT & Digital Services" },
  { id: "Construction & Wood Crafts", label: "Construction & Wood" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Recommendations({ userProfile, onNavigateToCenters, onNavigateToNearby, onStartVoice, onNavigateToRoadmap }) {
  const navigate = useNavigate();
  const { 
    beneficiaryProfile, 
    setSelectedRecommendation, 
    isVoiceAssessmentCompleted, 
    voiceAssessmentStatus, 
    resolveUserId,
    retakeVoiceAssessment 
  } = useSession();
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [backendRecs, setBackendRecs] = useState(null);

  const isUnlocked = isVoiceAssessmentCompleted || voiceAssessmentStatus === "COMPLETED";
  const hasData = useMemo(() => isUnlocked && hasEnoughData(beneficiaryProfile), [isUnlocked, beneficiaryProfile]);
  const profileFilled = hasData;
  const skillAnalysisDone = profileFilled && Array.isArray(beneficiaryProfile.existing_skills) && beneficiaryProfile.existing_skills.length > 0;

  const combinedProfile = useMemo(() => Object.assign({}, userProfile, beneficiaryProfile, {
    name: beneficiaryProfile?.full_name || (userProfile && userProfile.name) || "Beneficiary"
  }), [userProfile, beneficiaryProfile]);

  const displayName = combinedProfile.name;
  const displayInitials = getInitials(displayName);
  const displayDistrict = combinedProfile.district || beneficiaryProfile?.location || "Not provided";

  // Auto-resolve career interest from beneficiary profile without requiring manual selection
  const resolvedCapturedInterest = useMemo(() => {
    if (!beneficiaryProfile) return "it";
    const raw = Array.isArray(beneficiaryProfile.interests) ? beneficiaryProfile.interests : [];
    const first = raw[0];
    if (first) {
      const lower = String(first).toLowerCase();
      if (lower.includes("web") || lower.includes("frontend") || lower.includes("developer")) return "web_development";
      if (lower.includes("repair") || lower.includes("hardware") || lower.includes("computer hardware")) return "computer_repair";
      if (lower.includes("program") || lower.includes("python") || lower.includes("coding") || lower.includes("software")) return "programming";
      if (lower.includes("solar") || lower.includes("electric") || lower.includes("wiring") || lower.includes("pump")) return "electrical";
      if (lower.includes("electronic") || lower.includes("circuit") || lower.includes("iot") || lower.includes("embedded") || lower.includes("robot")) return "electronics";
      if (lower.includes("agri") || lower.includes("farm") || lower.includes("crop")) return "agriculture";
      if (lower.includes("health") || lower.includes("medical") || lower.includes("telehealth")) return "healthcare";
      if (lower.includes("it") || lower.includes("information technology") || lower.includes("computer")) return "it";
      return first;
    }

    const combined = [
      beneficiaryProfile.career_aspiration,
      beneficiaryProfile.current_occupation,
      beneficiaryProfile.family_occupation,
      ...(Array.isArray(beneficiaryProfile.existing_skills) ? beneficiaryProfile.existing_skills : [])
    ].filter(Boolean).join(" ").toLowerCase();

    if (combined.includes("web") || combined.includes("frontend")) return "web_development";
    if (combined.includes("repair") || combined.includes("hardware")) return "computer_repair";
    if (combined.includes("program") || combined.includes("code") || combined.includes("python") || combined.includes("java")) return "programming";
    if (combined.includes("solar") || combined.includes("electric") || combined.includes("wiring")) return "electrical";
    if (combined.includes("electronic") || combined.includes("circuit") || combined.includes("iot") || combined.includes("robot")) return "electronics";
    if (combined.includes("agri") || combined.includes("farm") || combined.includes("crop") || combined.includes("kisan")) return "agriculture";
    if (combined.includes("health") || combined.includes("medical") || combined.includes("telehealth")) return "healthcare";

    return "it";
  }, [beneficiaryProfile]);

  // Load dataset-driven recommendations from backend matching engine
  useEffect(() => {
    let isMounted = true;
    async function loadBackendRecommendations() {
      if (!isUnlocked) return;
      const uid = resolveUserId ? resolveUserId() : (beneficiaryProfile?.beneficiary_id || beneficiaryProfile?.userId || "beneficiary_default");
      try {
        const res = await fetchPersonalizedRecommendations(uid);
        if (isMounted && res && res.success && res.recommendations) {
          const pathways = res.recommendations.top_pathways || [];
          if (pathways.length > 0) {
            const formatted = pathways.map(p => formatDatasetPathwayToRec(p, beneficiaryProfile));
            setBackendRecs(formatted);
          }
        }
      } catch (err) {
        console.warn("Could not load backend recommendations:", err);
      }
    }
    loadBackendRecommendations();
    return () => { isMounted = false; };
  }, [isUnlocked, beneficiaryProfile, resolveUserId]);

  // Generate real recommendations based on actual backend assessment data + dataset mappings
  const allRecs = useMemo(() => {
    if (!hasData) return [];
    if (backendRecs && backendRecs.length > 0) {
      const local = generateRecommendations(beneficiaryProfile, userProfile);
      const combined = [...backendRecs];
      // Keep any unique local trades (e.g. traditional leather, carpentry) available
      local.forEach(loc => {
        if (!combined.some(c => c.title.toLowerCase() === loc.title.toLowerCase())) {
          combined.push(loc);
        }
      });
      return combined;
    }
    return generateRecommendations(beneficiaryProfile, userProfile);
  }, [hasData, backendRecs, beneficiaryProfile, userProfile]);

  // Profile display values
  const primaryInterest = beneficiaryProfile.interests && beneficiaryProfile.interests.length > 0
    ? beneficiaryProfile.interests[0]
    : (beneficiaryProfile.career_aspiration || "Not provided");

  // Filter
  const filteredRecs = useMemo(() => {
    let recs = selectedCategory === "all" ? allRecs : allRecs.filter(r => r.sector_tag === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      recs = recs.filter(r => r.title.toLowerCase().includes(q) || r.sector_tag.toLowerCase().includes(q));
    }
    return recs;
  }, [allRecs, selectedCategory, searchQuery]);

  const displayed = (showAll || searchQuery !== "" || selectedCategory !== "all") ? filteredRecs : filteredRecs.slice(0, 3);

  const handleViewPathway = (rec) => {
    // Save the chosen recommendation as the single source of truth for Roadmap
    if (setSelectedRecommendation) setSelectedRecommendation(rec);
    const uid = resolveUserId ? resolveUserId() : (beneficiaryProfile?.beneficiary_id || beneficiaryProfile?.userId || "beneficiary_default");
    if (rec.rawPathway) {
      saveSelectedPathway(uid, rec.rawPathway).catch(console.error);
    }
    if (onNavigateToRoadmap) onNavigateToRoadmap(rec);
  };
  const handleFindTraining = () => {
    if (onNavigateToCenters) onNavigateToCenters();
    else if (onNavigateToNearby) onNavigateToNearby();
  };
  const handleRetakeVoiceAssessment = () => {
    if (window.confirm("Retake Voice Assessment to update your livelihood profile, skills, and get refreshed recommendations?")) {
      if (retakeVoiceAssessment) {
        retakeVoiceAssessment();
      }
      if (onStartVoice) {
        onStartVoice();
      } else {
        navigate("/voice-assessment");
      }
    }
  };

  // ── State for Dataset-Driven Skill Recommendation System (Features 1 - 7) ────
  const [activeTabMode, setActiveTabMode] = useState("dataset_courses"); // "dataset_courses" | "livelihood_pathways"
  const [selectedInterest, setSelectedInterest] = useState(() => resolvedCapturedInterest || "it");
  const [customInterestInput, setCustomInterestInput] = useState("");
  const [availableInterests, setAvailableInterests] = useState([]);
  const [filterEdu, setFilterEdu] = useState(beneficiaryProfile?.education || "");
  const [filterNsqf, setFilterNsqf] = useState("");
  const [filterMaxWeeks, setFilterMaxWeeks] = useState("");
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [datasetRecsData, setDatasetRecsData] = useState(null);
  const [loadingDatasetRecs, setLoadingDatasetRecs] = useState(false);
  const [datasetRecsError, setDatasetRecsError] = useState(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const recognitionRef = useRef(null);

  // Automatically sync selectedInterest when captured assessment profile loads
  useEffect(() => {
    if (isUnlocked && resolvedCapturedInterest && resolvedCapturedInterest !== selectedInterest) {
      setSelectedInterest(resolvedCapturedInterest);
    }
  }, [isUnlocked, resolvedCapturedInterest]);

  // Sync education filter when beneficiaryProfile updates
  useEffect(() => {
    if (beneficiaryProfile?.education && !filterEdu) {
      setFilterEdu(beneficiaryProfile.education);
    }
  }, [beneficiaryProfile]);

  // Load available interest taxonomy from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInterests() {
      try {
        const res = await fetchSkillInterests();
        if (isMounted && res && res.success && res.interests) {
          setAvailableInterests(res.interests);
        }
      } catch (err) {
        console.warn("Could not load skill interests:", err);
      }
    }
    loadInterests();
    return () => { isMounted = false; };
  }, []);

  // Fetch dataset recommendations whenever interest or filters change
  const loadDatasetCourses = async (interestToUse) => {
    const qInterest = interestToUse !== undefined ? interestToUse : (customInterestInput.trim() || selectedInterest);
    if (!qInterest) return;

    setLoadingDatasetRecs(true);
    setDatasetRecsError(null);
    try {
      const res = await fetchDatasetSkillRecommendations({
        interest: qInterest,
        education: filterEdu,
        nsqfLevel: filterNsqf,
        maxDurationWeeks: filterMaxWeeks,
        includeLegacy: includeHistorical
      });
      if (res && res.success) {
        setDatasetRecsData(res);
      } else {
        setDatasetRecsError(res?.message || "Failed to load course recommendations.");
      }
    } catch (err) {
      setDatasetRecsError("Network error: " + err.message);
    } finally {
      setLoadingDatasetRecs(false);
    }
  };

  // Trigger load on filter or interest change
  useEffect(() => {
    loadDatasetCourses();
  }, [selectedInterest, filterEdu, filterNsqf, filterMaxWeeks, includeHistorical]);

  // Voice recognition for speaking user interest naturally
  const handleToggleVoiceInput = () => {
    if (isVoiceListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please type or click an interest.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getLocaleForLanguage(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsVoiceListening(true);
      setVoiceNotice("Listening... speak your career interest (e.g., 'I want to learn robotics')");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsVoiceListening(false);
      setVoiceNotice(`Heard: "${transcript}"`);
      setCustomInterestInput(transcript);
      // Immediately run recommendation on spoken interest
      loadDatasetCourses(transcript);
    };

    recognition.onerror = (e) => {
      setIsVoiceListening(false);
      setVoiceNotice("Voice input error: " + (e.error || "Could not understand"));
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSelectPredefinedInterest = (interestId) => {
    setSelectedInterest(interestId);
    setCustomInterestInput("");
    setVoiceNotice("");
  };

  const handleCustomSubmit = (e) => {
    if (e) e.preventDefault();
    if (customInterestInput.trim()) {
      loadDatasetCourses(customInterestInput.trim());
    }
  };


  if (!isUnlocked) {
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
            {language === "hi" ? "कौशल एवं आजीविका विश्लेषण" : language === "te" ? "నైపుణ్యం & జీవనోపాధి విశ్లేషణ" : "Skill & Livelihood Analysis"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            {language === "hi"
              ? "मौजूदा कौशल, हस्तांतरणीय क्षमताओं, कौशल अंतराल और आगे के मार्ग का आपका व्यक्तिगत मूल्यांकन।"
              : language === "te"
              ? "మీ ప్రస్తుత నైపుణ్యాలు మరియు సిఫార్సుల వ్యక్తిగతీకరించిన అంచనా."
              : "Your personalized assessment of existing skills, transferable capabilities, skill gaps and the pathway ahead."}
          </p>
        </div>

        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "40px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#9a3412", margin: "0 0 8px" }}>
            {language === "hi" ? "वॉइस असेसमेंट आवश्यक है" : language === "te" ? "వాయిస్ అసెస్‌మెంట్ అవసరం" : "Voice Assessment Required"}
          </h2>
          <p style={{ fontSize: "15px", color: "#7c2d12", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.6 }}>
            {language === "hi"
              ? "अपनी व्यक्तिगत कौशल सिफारिशों और आजीविका विश्लेषण उत्पन्न करने के लिए अपना वॉइस असेसमेंट पूरा करें। साथी एआई आपकी प्रोफ़ाइल बनाने के लिए आपके कौशल, अनुभव और आकांक्षाओं के बारे में पूछेगा।"
              : language === "te"
              ? "మీ వ్యక్తిగతీకరించిన నైపుణ్య విశ్లేషణను రూపొందించడానికి మీ వాయిస్ అసెస్‌మెంట్‌ను పూర్తి చేయండి. మీ నైపుణ్యాలు మరియు ఆకాంక్షల గురించి సాథీ AI అడుగుతుంది."
              : "Complete your Voice Assessment to generate your personalized Skill & Livelihood Analysis. Saathi AI will ask about your skills, experience, and aspirations to build your profile."}
          </p>
          <button
            type="button"
            onClick={() => {
              if (onStartVoice) onStartVoice();
              else navigate("/voice-assessment");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              padding: "12px 28px",
              borderRadius: "8px",
              border: "none",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#c2410c"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ea580c"; }}
          >
            <Mic size={18} /> {language === "hi" ? "वॉइस असेसमेंट शुरू करें" : language === "te" ? "వాయిస్ అసెస్‌మెంట్ ప్రారంభించండి" : "Start Voice Assessment"}
          </button>
          <div style={{ marginTop: "16px", fontSize: "13px", color: "#92400e", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Info size={14} /> {language === "hi" ? "साथी एआई आपको असेसमेंट में मार्गदर्शन करेगा — बस स्वाभाविक रूप से बोलें।" : "Saathi AI will guide you through the assessment — just speak naturally."}
          </div>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", opacity: 0.5, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#e2e8f0", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}>
                {displayInitials}
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#94a3b8", margin: 0 }}>
                  Assessment Report — {displayName}
                </h2>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>{displayDistrict}</div>
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 700 }}>
              <Loader2 size={14} /> Analysis Pending
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "14px" }}>
            Complete Voice Assessment to unlock your personalized analysis
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* 1. Header with Retake Option */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            AI Recommendations <Sparkles size={24} style={{ color: "var(--india-saffron)" }} />
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>
            Personalized livelihood and skilling pathways based on your profile, skills, aspirations, and local opportunities.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", color: profileFilled ? "#16a34a" : "#dc2626" }}>
              {profileFilled ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {profileFilled ? "Voice Assessment Analyzed" : "Assessment incomplete"}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", color: skillAnalysisDone ? "#16a34a" : "#94a3b8" }}>
              {skillAnalysisDone ? <CheckCircle2 size={14} /> : <Info size={14} />}
              {skillAnalysisDone ? "Skills Profile Captured" : "Skills profiling active"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRetakeVoiceAssessment}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            border: "1.5px solid #cbd5e1",
            color: "var(--gov-navy)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--tricolour-saffron)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; }}
        >
          <RotateCcw size={15} />
          <span>{language === "hi" ? "वॉइस असेसमेंट दोबारा दें" : "Retake Voice Assessment"}</span>
        </button>
      </div>

      {/* 2. Beneficiary Skills & Profile Summary Card */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        padding: "20px",
        border: "1.5px solid #e2e8f0",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="var(--india-saffron)" />
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
              Your Voice Assessment Profile & Skills Summary
            </h3>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", backgroundColor: "#ecfdf5", padding: "3px 10px", borderRadius: "9999px", border: "1px solid #a7f3d0" }}>
            PM-AJAY Registered Profile
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", backgroundColor: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #edf2f7" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Current Occupation</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
              {beneficiaryProfile.current_occupation || "Not specified"} {beneficiaryProfile.years_of_experience ? `(${beneficiaryProfile.years_of_experience} yrs)` : ""}
            </div>
            {beneficiaryProfile.family_occupation && (
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Family Trade: <strong>{beneficiaryProfile.family_occupation}</strong>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Career Aspiration</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
              {beneficiaryProfile.career_aspiration || "Skill Development & Livelihood"}
            </div>
            {beneficiaryProfile.employment_preference && (
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Preference: <strong>{beneficiaryProfile.employment_preference}</strong>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Location & Radius</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>
              {beneficiaryProfile.location || beneficiaryProfile.district || "Agra, UP"}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Transit Radius: {beneficiaryProfile.mobility_limit_km || 20} km
            </div>
          </div>
        </div>

        {/* Existing Skills vs Skills to Develop */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {/* Skills Possessed */}
          <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={15} color="#16a34a" />
              <span>Skills You Already Possess</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {Array.isArray(beneficiaryProfile.existing_skills) && beneficiaryProfile.existing_skills.length > 0 ? (
                beneficiaryProfile.existing_skills.map((skill, sIdx) => (
                  <span key={sIdx} style={{ fontSize: "12px", fontWeight: 600, color: "#166534", backgroundColor: "#ffffff", padding: "3px 8px", borderRadius: "6px", border: "1px solid #86efac" }}>
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "12px", color: "#15803d" }}>General practical experience from current livelihood</span>
              )}
            </div>
          </div>

          {/* Skills to Develop */}
          <div style={{ padding: "12px 14px", borderRadius: "10px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e40af", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Target size={15} color="#2563eb" />
              <span>Skills to Develop (Recommended Courses Below)</span>
            </div>
            <div style={{ fontSize: "12px", color: "#1e3a8a", lineHeight: 1.5 }}>
              NSQF certified technical competencies, equipment handling, quality compliance, and commercial standards aligned with PM-AJAY GIA grant support.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mode Selector: Dataset-Driven Skill Recommendations vs Holistic Livelihood Pathways */}
      <div style={{
        display: "flex",
        gap: "12px",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: "8px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <button
          type="button"
          onClick={() => setActiveTabMode("dataset_courses")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTabMode === "dataset_courses" ? "var(--gov-navy)" : "#f1f5f9",
            color: activeTabMode === "dataset_courses" ? "#ffffff" : "#475569",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <BookOpen size={16} /> Dataset Skill Recommendations (NIELIT NSQF)
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode("livelihood_pathways")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTabMode === "livelihood_pathways" ? "var(--gov-navy)" : "#f1f5f9",
            color: activeTabMode === "livelihood_pathways" ? "#ffffff" : "#475569",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Compass size={16} /> Holistic Livelihood Pathways
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: DATASET-DRIVEN SKILL RECOMMENDATION SYSTEM (FEATURES 1 TO 7)
         ───────────────────────────────────────────────────────────────────────────── */}
      {activeTabMode === "dataset_courses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Feature 0: Personalized Assessment Auto-Match Notice */}
          <div style={{
            backgroundColor: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#166534" }}>
                  Personalized Assessment Match: Automatically loaded recommendations for <strong>{selectedInterest.replace(/_/g, " ").toUpperCase()}</strong>
                </div>
                <div style={{ fontSize: "12px", color: "#15803d", marginTop: "2px" }}>
                  Mapped directly from your Voice Assessment responses (occupation, skills, aspirations). No manual selection required.
                </div>
              </div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", backgroundColor: "#ffffff", padding: "4px 10px", borderRadius: "6px", border: "1px solid #86efac" }}>
              Auto-Selected
            </span>
          </div>

          {/* Feature 1 & 2: Career Interest Selection & Voice Input */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "24px",
            border: "1px solid #e2e8f0",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
                  Select or Speak Your Career Interest
                </h2>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  Express what you want to learn. Our deterministic engine maps your interest directly to verified NSQF qualifications.
                </p>
              </div>

              {/* Natural Language Voice Input Button */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: isVoiceListening ? "#dc2626" : "var(--india-saffron)",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: isVoiceListening ? "0 0 14px rgba(220, 38, 38, 0.5)" : "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <Mic size={16} />
                {isVoiceListening ? "Listening... Speak Now" : "Speak Your Interest (Voice)"}
              </button>
            </div>

            {voiceNotice && (
              <div style={{
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid #bfdbfe"
              }}>
                🎙️ {voiceNotice}
              </div>
            )}

            {/* Accessible Predefined Interest Cards / Buttons (Feature 1) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "10px"
            }}>
              {[
                { id: "it", label: "IT / Information Technology", desc: "Software, office automation, systems" },
                { id: "electronics", label: "Electronics", desc: "Circuits, VLSI, hardware manufacturing" },
                { id: "electrical", label: "Electrical-related interests", desc: "Solar PV, power controllers, repair" },
                { id: "web_development", label: "Web Development", desc: "Websites, frontend, responsive apps" },
                { id: "programming", label: "Programming", desc: "Python, Java, coding logic, ML" },
                { id: "computer_repair", label: "Computer Hardware & Repair", desc: "PC assembly, diagnostics & servicing" },
                { id: "iot_embedded", label: "IoT and Embedded Systems", desc: "Smart devices, sensors & controllers" },
                { id: "robotics", label: "Robotics & Drones", desc: "Drone assembly, robotics maintenance" },
                { id: "agriculture", label: "Agriculture & Farm Tech", desc: "IoT for farming, solar pump systems" },
                { id: "healthcare", label: "Healthcare & Medical Tech", desc: "Medical electronics, health records" }
              ].map(item => {
                const isSelected = selectedInterest === item.id && !customInterestInput;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPredefinedInterest(item.id)}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 800, color: isSelected ? "#15803d" : "var(--gov-navy)" }}>
                      {isSelected ? "✓ " : ""}{item.label}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Natural-Language Text Input / Search field */}
            <form onSubmit={handleCustomSubmit} style={{ display: "flex", gap: "10px" }}>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px 12px",
                backgroundColor: "#f8fafc"
              }}>
                <Search size={16} style={{ color: "#64748b", marginRight: "8px" }} />
                <input
                  type="text"
                  placeholder="Or type natural interest: e.g. 'I want to repair computers' or 'I want to learn robotics'..."
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "13.5px",
                    width: "100%",
                    backgroundColor: "transparent"
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: "var(--gov-navy)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Recommend
              </button>
            </form>
          </div>

          {/* Feature 2: Distinction Notice (e.g. Electrical vs Electronics) */}
          {datasetRecsData?.distinctionNotice && (
            <div style={{
              backgroundColor: "#fff7ed",
              border: "1.5px solid #fed7aa",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <AlertTriangle size={20} style={{ color: "#c2410c", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "13px", color: "#9a3412", lineHeight: 1.5 }}>
                {datasetRecsData.distinctionNotice}
              </div>
            </div>
          )}

          {/* Feature 3 & 6: Granular Filters (Education, NSQF Level, Max Duration, Legacy Courses) */}
          <div style={{
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "16px 20px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "var(--gov-navy)" }}>
              <SlidersHorizontal size={16} /> Filters:
            </div>

            {/* Education Level Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="filter-edu" style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Education:</label>
              <select
                id="filter-edu"
                value={filterEdu}
                onChange={(e) => setFilterEdu(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12.5px",
                  backgroundColor: "#ffffff"
                }}
              >
                <option value="">All / Unspecified</option>
                <option value="Class 8 pass">8th Pass</option>
                <option value="Class 10 pass">10th Pass</option>
                <option value="Class 12 pass">12th Pass / ITI</option>
                <option value="Diploma / Graduate">Diploma / Graduate</option>
                <option value="B.Tech / MCA">Engineering / PG</option>
              </select>
            </div>

            {/* NSQF Level Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="filter-nsqf" style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>NSQF Level:</label>
              <select
                id="filter-nsqf"
                value={filterNsqf}
                onChange={(e) => setFilterNsqf(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12.5px",
                  backgroundColor: "#ffffff"
                }}
              >
                <option value="">Any Level</option>
                <option value="3">Level 3 (Foundation / Assistant)</option>
                <option value="4">Level 4 (Technician / Operator)</option>
                <option value="5">Level 5 (Specialist / Analyst)</option>
                <option value="6">Level 6 (Post Graduate / Advanced)</option>
              </select>
            </div>

            {/* Max Duration Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="filter-duration" style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>Max Duration:</label>
              <select
                id="filter-duration"
                value={filterMaxWeeks}
                onChange={(e) => setFilterMaxWeeks(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12.5px",
                  backgroundColor: "#ffffff"
                }}
              >
                <option value="">Any Duration</option>
                <option value="4">Up to 4 Weeks (~1 Month)</option>
                <option value="8">Up to 8 Weeks (~2 Months)</option>
                <option value="12">Up to 12 Weeks (~3 Months)</option>
                <option value="24">Up to 24 Weeks (~6 Months)</option>
              </select>
            </div>

            {/* Feature 5: Show Historical Courses Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <input
                type="checkbox"
                id="filter-legacy"
                checked={includeHistorical}
                onChange={(e) => setIncludeHistorical(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="filter-legacy" style={{ fontSize: "12.5px", color: "#334155", fontWeight: 700, cursor: "pointer" }}>
                Show Historical Courses (Unverified)
              </label>
            </div>
          </div>

          {/* Results Summary Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--gov-navy)" }}>
                {datasetRecsData ? `Found ${datasetRecsData.totalFound} Recommended Courses` : "Recommended Courses"}
              </span>
              {datasetRecsData?.matchedSector && (
                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>
                  (Sector: <strong>{datasetRecsData.matchedSector}</strong>)
                </span>
              )}
            </div>

            {datasetRecsData?.datasetVerificationSummary && (
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Verified: <strong style={{ color: "#047857" }}>{datasetRecsData.datasetVerificationSummary.verifiedCoursesFound}</strong>
                {datasetRecsData.datasetVerificationSummary.historicalIncluded && (
                  <span style={{ marginLeft: "8px" }}>
                    • Historical: <strong style={{ color: "#b91c1c" }}>{datasetRecsData.datasetVerificationSummary.historicalCoursesFound}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Loading / Error States */}
          {loadingDatasetRecs && (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#059669", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Loading dataset recommendations...</div>
            </div>
          )}

          {datasetRecsError && (
            <div style={{ padding: "20px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#b91c1c", fontSize: "14px" }}>
              {datasetRecsError}
            </div>
          )}

          {/* Feature 4: Course Recommendation Cards Grid */}
          {!loadingDatasetRecs && datasetRecsData && datasetRecsData.recommendations?.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px"
            }}>
              {datasetRecsData.recommendations.map((course, idx) => (
                <CourseRecommendationCard
                  key={course.course_id || idx}
                  course={course}
                  isTop={idx === 0}
                  onSelectCourse={(c) => {
                    alert(`Selected track: ${c.course_name} (${c.skill_cluster}). NSQF Level: ${c.nsqf_level}. Visit your nearest PMKK/NIELIT accredited centre with your Aadhaar for registration.`);
                  }}
                />
              ))}
            </div>
          )}

          {!loadingDatasetRecs && datasetRecsData && datasetRecsData.recommendations?.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ fontSize: "15px", color: "#64748b", margin: "0 0 12px 0" }}>
                No courses match your selected filter criteria. Try adjusting duration, education level, or enable historical courses.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterEdu("");
                  setFilterNsqf("");
                  setFilterMaxWeeks("");
                  setIncludeHistorical(true);
                }}
                style={{
                  backgroundColor: "var(--gov-navy)",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Reset Filters & Show All
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: HOLISTIC LIVELIHOOD PATHWAYS (PRESERVED WORKFLOW)
         ───────────────────────────────────────────────────────────────────────────── */}
      {activeTabMode === "livelihood_pathways" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* 3. Based on your profile strip */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gov-navy)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
              Based on your profile:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
              {[
                { label: "Current Livelihood", value: beneficiaryProfile.current_occupation || "Not provided" },
                { label: "Primary Interest", value: primaryInterest },
                { label: "Preference", value: beneficiaryProfile.employment_preference || "Not provided" },
                { label: "Mobility", value: beneficiaryProfile.mobility_limit_km ? "Within " + beneficiaryProfile.mobility_limit_km + " km" : "Not provided" },
                { label: "Training Availability", value: (beneficiaryProfile.trainingAvailabilityDuration || beneficiaryProfile.training_availability_duration || beneficiaryProfile.training_availability || "Not provided") + (beneficiaryProfile.trainingSchedule || beneficiaryProfile.training_schedule ? " • " + (beneficiaryProfile.trainingSchedule || beneficiaryProfile.training_schedule) : "") },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Filter & Search */}
          <div style={{ backgroundColor: "#ffffff", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{ padding: "5px 12px", fontSize: "12px", fontWeight: isActive ? 700 : 600, borderRadius: "20px", backgroundColor: isActive ? "var(--gov-navy)" : "#f1f5f9", color: isActive ? "#ffffff" : "#475569", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", backgroundColor: "#f8fafc" }}>
              <Search size={15} style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search job roles, skills or pathways..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: "none", outline: "none", padding: "0 0 0 8px", fontSize: "13px", width: "100%", backgroundColor: "transparent" }}
              />
            </div>
          </div>

          {/* 5. Recommendation cards */}
          {displayed.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {displayed.map((rec, index) => (
                <RecCard
                  key={rec.id}
                  rec={rec}
                  isTop={index === 0 && !showAll && searchQuery === "" && selectedCategory === "all"}
                  onViewPathway={handleViewPathway}
                  onFindTraining={handleFindTraining}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 600, margin: 0 }}>No recommendations found for this filter.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                style={{ marginTop: "12px", padding: "8px 20px", borderRadius: "8px", backgroundColor: "var(--gov-navy)", color: "#fff", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
              >
                Show All
              </button>
            </div>
          )}

          {/* 6. Bottom actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <button
              type="button"
              onClick={handleFindTraining}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ffffff", color: "var(--gov-navy)", padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
            >
              <MapPin size={15} /> Find Training Centers
            </button>

            {!showAll && searchQuery === "" && selectedCategory === "all" && filteredRecs.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "transparent", color: "var(--gov-navy)", padding: "10px 20px", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
              >
                View More Pathways <ChevronDown size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. Disclaimer */}
      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <Info size={15} style={{ color: "#64748b", flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>
          <strong>Important:</strong> AI Match scores, NSQF levels, GIA eligibility and local demand figures marked "to be verified" must be confirmed at your nearest PMKK (Pradhan Mantri Kaushal Kendra) centre. The AI does not determine government scheme eligibility. Income/salary figures are indicative only.
        </div>
      </div>
    </div>
  );
}
