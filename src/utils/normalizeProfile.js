export function normalizeBeneficiaryProfile(profile) {
  // Only return demo profile when explicitly requested via demo mode flag
  if (profile && profile.isDemoMode) {
    return getDemoProfile();
  }

  const p = profile || {};

  // Calculate completion based on real fields
  const checkValues = [
    p.name || p.full_name,
    p.districtState || p.district,
    p.phone,
    p.current_occupation || p.currentLivelihood,
    p.family_occupation || p.tradOccupation,
    (p.existing_skills && p.existing_skills.length > 0) || (p.skills && p.skills.length > 0) ? true : null,
    (p.interests && p.interests.length > 0) ? true : (p.trade && p.trade !== "Not provided" ? true : null),
    p.career_aspiration || p.aspiration,
    p.employment_preference || p.employmentPref,
    p.mobility_limit_km || p.mobility,
    p.training_availability || p.shift || p.trainingAvailabilityDuration
  ];
  
  const totalRequired = checkValues.length;
  const filled = checkValues.filter(v => v !== null && v !== undefined && v !== "" && v !== "Not provided" && v !== false).length;
  const computedCompletion = Math.round((filled / totalRequired) * 100);

  const skillsArray = Array.isArray(p.skills) && p.skills.length > 0 
    ? p.skills 
    : (Array.isArray(p.existing_skills) ? p.existing_skills : []);
  const interestsArray = Array.isArray(p.interests) ? p.interests : [];
  const tradeStr = interestsArray.length > 0 ? interestsArray.join(", ") : (p.trade || "Not provided");

  const mobilityStr = p.mobility_limit_km ? `Within ${p.mobility_limit_km} km` : (p.mobility || "Not provided");

  const isAssessmentComplete = p.voiceStatus === "Completed" || computedCompletion >= 80;

  const displayName = p.name || p.full_name || "Beneficiary";
  
  // Dynamic Initials logic
  let generatedInitials = "B";
  if (displayName && displayName !== "Beneficiary") {
    const parts = displayName.trim().split(" ");
    if (parts.length > 1) {
      generatedInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      generatedInitials = displayName.substring(0, 2).toUpperCase();
    }
  }

  return {
    name: displayName,
    initials: p.initials || generatedInitials,
    districtState: p.districtState || (p.district && p.state ? `${p.district}, ${p.state}` : p.district) || "Not provided",
    district: p.district || "Not provided",
    state: p.state || "Not provided",
    phone: p.phone || "Not provided",
    verified: p.verified || false,
    method: p.method || "Not provided",
    id: p.id || p.userId || p.beneficiary_id || "Not provided",
    casteCert: p.casteCert || "Not provided",
    completion: typeof p.completion === "number" && p.completion > computedCompletion ? p.completion : computedCompletion,
    currentLivelihood: p.current_occupation || p.currentLivelihood || "Not provided",
    aspiration: p.career_aspiration || p.aspiration || "Not provided",
    employmentPref: p.employment_preference || p.employmentPref || "Not provided",
    status: p.status || (p.name ? "Profile Active" : "Registration Pending"),
    statusPercentage: p.statusPercentage || (computedCompletion > 0 ? `${computedCompletion}%` : "0%"),
    
    dob: p.dob || (p.age ? `${p.age} Years` : "Not provided"),
    age: p.age || null,
    gender: p.gender || "Not provided",
    category: p.category || "Scheduled Caste (SC)",
    blockVillage: p.blockVillage || p.village || "Not provided",
    language: p.language || p.preferred_language || "Not provided",
    
    education: p.education || p.education_level || "Not provided",
    literacy: p.literacy || "Not provided",
    skills: skillsArray,
    tradOccupation: p.family_occupation || p.tradOccupation || "Not provided",
    currentEmp: p.current_occupation || p.currentEmp || p.currentLivelihood || "Not provided",
    rplStatus: p.rplStatus || "Pending assessment",
    
    trade: tradeStr,
    nsqfLevel: p.nsqfLevel || "To be determined",
    empPref: p.employment_preference || p.empPref || "Not provided",
    targetWage: p.targetWage || "Not provided",
    mobility: mobilityStr,
    mobility_limit_km: p.mobility_limit_km || null,
    shift: p.training_schedule || p.trainingSchedule || p.training_availability || p.shift || "Not provided",
    trainingAvailability: p.trainingAvailabilityDuration || p.training_availability_duration || p.trainingAvailability || p.training_availability || p.shift || "Not provided",
    trainingAvailabilityDuration: p.trainingAvailabilityDuration || p.training_availability_duration || "Not provided",
    trainingSchedule: p.trainingSchedule || p.training_schedule || "Not provided",
    constraints: p.constraints || "None",
    
    voiceStatus: isAssessmentComplete ? "Completed" : "Pending",
    giaAllotment: p.giaAllotment || "Pending counselling",
    dbtAccount: p.dbtAccount || "Not linked",
    stipend: p.stipend || "Subject to eligibility",
    verified_trade: p.verified_trade || p.verifiedTrade || null,
    verification_status: p.verification_status || p.verificationStatus || null
  };
}

export function getDemoProfile() {
  return {
    name: "Beneficiary",
    initials: "B",
    districtState: "Agra District, Uttar Pradesh",
    district: "Agra, UP",
    phone: "+91 98765 43210 (Aadhaar Seeded)",
    verified: true,
    method: "Aadhaar Verified",
    id: "PMAJAY-2026-UP-8492",
    casteCert: "UP/SC/2021/98421",
    completion: 82,
    currentLivelihood: "Informal Daily Wage Repairer",
    aspiration: "Solar Domestic Electrician",
    employmentPref: "Micro-Enterprise Self-Employment",
    status: "Grant Entitled",
    statusPercentage: "100%",
    
    dob: "12-May-1998 (28 Years)",
    gender: "Male",
    category: "Scheduled Caste (SC), Chamar / Artisan Sub-caste",
    blockVillage: "Bichpuri Block, Village Bainpur",
    language: "Hindi (हिंदी), Bundeli dialect",
    
    education: "Class 8 Pass (Upper Primary School Bainpur)",
    literacy: "Hindi Basic Reading / Spoken Fluency",
    skills: ["Basic Hand Tool Carpentry", "Household Wiring assistance"],
    tradOccupation: "Footwear Craft & Leather Stitching (Hereditary)",
    currentEmp: "Informal Daily Wage Repairer (₹6,500/mo avg)",
    rplStatus: "Eligible for Footwear Artisan L3 direct certification",
    
    trade: "Solar Domestic Electrician (ELE/Q3104)",
    nsqfLevel: "Level 3 / Level 4 Certified",
    empPref: "Micro-Enterprise Self-Employment (Solar Repair Shop)",
    targetWage: "₹16,000 to ₹20,000 / month",
    mobility: "Within Agra District (Max 15 km daily commute)",
    shift: "Full-time Daytime Batches",
    
    voiceStatus: "Completed",
    giaAllotment: "Approved (PMKK Agra)",
    dbtAccount: "State Bank of India (A/C: ******4819, NPCI Seeded)",
    stipend: "₹4,000 / month during training"
  };
}
