export function normalizeBeneficiaryProfile(profile) {
  // If we have any real data (e.g. from user login or assessment), DO NOT use demo data.
  if (!profile || (!profile.name && Object.keys(profile).length === 0)) {
    return getDemoProfile();
  }

  // Calculate completion based on real fields
  const checkValues = [
    profile.name || profile.full_name,
    profile.districtState || profile.district,
    profile.phone,
    profile.current_occupation || profile.currentLivelihood,
    profile.family_occupation || profile.tradOccupation,
    (profile.existing_skills && profile.existing_skills.length > 0) ? true : null,
    (profile.interests && profile.interests.length > 0) ? true : (profile.trade ? true : null),
    profile.career_aspiration || profile.aspiration,
    profile.employment_preference || profile.employmentPref,
    profile.mobility_limit_km || profile.mobility,
    profile.training_availability || profile.shift
  ];
  
  const totalRequired = checkValues.length;
  const filled = checkValues.filter(v => v !== null && v !== undefined && v !== "" && v !== "Not provided" && v !== false).length;
  const computedCompletion = Math.round((filled / totalRequired) * 100);

  const skillsArray = Array.isArray(profile.skills) ? profile.skills : (Array.isArray(profile.existing_skills) ? profile.existing_skills : []);
  const interestsArray = Array.isArray(profile.interests) ? profile.interests : [];
  const tradeStr = interestsArray.length > 0 ? interestsArray.join(", ") : (profile.trade || "Not provided");

  const mobilityStr = profile.mobility_limit_km ? `Within ${profile.mobility_limit_km} km` : (profile.mobility || "Not provided");

  // Determine Voice Profiling Status based on filled data or an explicit flag
  // If AI assessment is done, we expect some fields to be populated. Or if explicit flag is passed.
  // We'll say completed if they filled at least their employment_preference and aspiration, or if explicitly complete.
  // But wait, the app might not have isCompleted mapped down here. If they have some fields, let's just use the computed percentage.
  // Actually, VoiceAssessment sets data, so if we have some AI fields, we can say "In Progress", or if completion > 70%, "Completed".
  // Let's use a simple heuristic or check if we have a flag.
  const isAssessmentComplete = profile.voiceStatus === "Completed" || computedCompletion >= 80;

  const displayName = profile.name || profile.full_name || "Beneficiary";
  
  // Dynamic Initials logic
  let generatedInitials = "B"; // Fallback
  if (profile.name || profile.full_name) {
    const parts = displayName.trim().split(" ");
    if (parts.length > 1) {
      generatedInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      generatedInitials = displayName.substring(0, 2).toUpperCase();
    }
  }

  return {
    name: displayName,
    initials: profile.initials || generatedInitials,
    districtState: profile.districtState || profile.district || "Not provided",
    district: profile.district || "Not provided",
    phone: profile.phone || "Not provided",
    verified: profile.verified || false,
    method: profile.method || "Not provided",
    id: profile.id || "Not provided",
    casteCert: profile.casteCert || "Not provided",
    completion: typeof profile.completion === "number" && profile.completion > computedCompletion ? profile.completion : computedCompletion,
    currentLivelihood: profile.current_occupation || profile.currentLivelihood || "Not provided",
    aspiration: profile.career_aspiration || profile.aspiration || "Not provided",
    employmentPref: profile.employment_preference || profile.employmentPref || "Not provided",
    status: profile.status || "Not provided",
    statusPercentage: profile.statusPercentage || "0%",
    
    dob: profile.dob || (profile.age ? `${profile.age} Years` : "Not provided"),
    gender: profile.gender || "Not provided",
    category: profile.category || "Not provided",
    blockVillage: profile.blockVillage || profile.village || "Not provided",
    language: profile.language || profile.preferred_language || "Not provided",
    
    education: profile.education || profile.education_level || "Not provided",
    literacy: profile.literacy || "Not provided",
    skills: skillsArray,
    tradOccupation: profile.family_occupation || profile.tradOccupation || "Not provided",
    currentEmp: profile.current_occupation || profile.currentEmp || "Not provided",
    rplStatus: profile.rplStatus || "Not provided",
    
    trade: tradeStr,
    nsqfLevel: profile.nsqfLevel || "To be determined",
    empPref: profile.employment_preference || profile.empPref || "Not provided",
    targetWage: profile.targetWage || "Not provided",
    mobility: mobilityStr,
    shift: profile.training_schedule || profile.trainingSchedule || profile.training_availability || profile.shift || "Not provided",
    trainingAvailability: profile.trainingAvailabilityDuration || profile.training_availability_duration || profile.trainingAvailability || profile.training_availability || profile.shift || "Not provided",
    trainingAvailabilityDuration: profile.trainingAvailabilityDuration || profile.training_availability_duration || "Not provided",
    trainingSchedule: profile.trainingSchedule || profile.training_schedule || "Not provided",
    
    voiceStatus: isAssessmentComplete ? "Completed" : "Pending",
    giaAllotment: profile.giaAllotment || "Not provided",
    dbtAccount: profile.dbtAccount || "Not provided",
    stipend: profile.stipend || "Not provided"
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
