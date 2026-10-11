const { getAllCourses, getVerifiedCourses, getCourseById, normalizeEducationLevel } = require('./dataLoader.cjs');
const { getOccupations, getOccupationById } = require('./occupations.cjs');

/**
 * Tokenize and normalize user input into clean search keywords
 */
function extractKeywords(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.flatMap(item => extractKeywords(item));
  }
  if (typeof input === 'object') {
    return Object.values(input).flatMap(val => extractKeywords(val));
  }
  return String(input)
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

/**
 * Calculate keyword overlap between beneficiary tokens and target tokens
 */
function calculateKeywordOverlap(userTokens, targetTokens) {
  if (!userTokens || userTokens.length === 0 || !targetTokens || targetTokens.length === 0) {
    return { score: 0, matched: [] };
  }

  const matched = [];
  const targetLower = targetTokens.map(t => t.toLowerCase());

  for (const token of userTokens) {
    const isDirectMatch = targetLower.some(target => target === token || target.includes(token) || token.includes(target));
    if (isDirectMatch && !matched.includes(token)) {
      matched.push(token);
    }
  }

  // Base score on proportion of matched keywords
  const score = Math.min(100, Math.round((matched.length / Math.max(1, Math.min(targetTokens.length, 6))) * 100));
  return { score, matched };
}

/**
 * Score a course or occupation against a beneficiary profile
 */
function scoreItem(item, profile, isOccupation = false) {
  const beneficiaryEduLevel = normalizeEducationLevel(profile.education || profile.educationLevel);
  const requiredEduLevel = isOccupation ? item.required_education_level : item.prerequisites.min_education_level;
  const isPrerequisiteMet = beneficiaryEduLevel >= requiredEduLevel;

  // 1. Skill Overlap (Weight: 35%)
  const userSkillTokens = extractKeywords(profile.skills || profile.primarySkills);
  const targetSkillTokens = isOccupation
    ? item.relevant_skills
    : extractKeywords([item.course_name, item.skill_cluster]);

  const skillResult = calculateKeywordOverlap(userSkillTokens, targetSkillTokens);
  const skillScore = skillResult.score;

  // 2. Aspiration & Interest Alignment (Weight: 25%)
  const userInterestTokens = extractKeywords([
    profile.interests,
    profile.aspirations,
    profile.preferredRole,
    profile.domainInterest,
    profile.learningGoals
  ]);
  const interestResult = calculateKeywordOverlap(userInterestTokens, targetSkillTokens);
  const interestScore = interestResult.score;

  // 3. Sector Fit (Weight: 15%)
  let sectorScore = 50; // Neutral default
  const userSector = (profile.sector || profile.preferredSector || profile.sectorInterest || '').toLowerCase();
  const itemSector = (item.sector || '').toLowerCase();

  if (!userSector || userSector === 'both' || userSector === 'all' || userSector.includes('any')) {
    sectorScore = 80;
  } else if (itemSector.includes(userSector) || userSector.includes(itemSector)) {
    sectorScore = 100;
  } else {
    sectorScore = 30;
  }

  // 4. Employment Goal Fit (Weight: 15%)
  let employmentScore = 70; // Neutral default
  const userEmpGoal = (profile.employmentPreference || profile.employmentType || profile.workPreference || '').toLowerCase();
  if (isOccupation) {
    const targets = item.target_employment_types.map(t => t.toLowerCase());
    if (!userEmpGoal || userEmpGoal.includes('any') || userEmpGoal.includes('both')) {
      employmentScore = 90;
    } else if (targets.some(t => t.includes(userEmpGoal) || userEmpGoal.includes(t))) {
      employmentScore = 100;
    } else {
      employmentScore = 50;
    }
  } else {
    // Modular courses often lead to self-employment or immediate gig work
    if (userEmpGoal.includes('self') && item.is_modular) {
      employmentScore = 95;
    } else if (userEmpGoal.includes('wage') && !item.is_modular) {
      employmentScore = 95;
    }
  }

  // 5. Duration / Feasibility Fit (Weight: 10%)
  let feasibilityScore = 75;
  const userTimeline = (profile.timeline || profile.availability || profile.durationPreference || '').toLowerCase();
  const weeks = isOccupation ? 16 : item.est_duration_weeks;

  if (userTimeline.includes('short') || userTimeline.includes('1-3') || userTimeline.includes('1 month')) {
    feasibilityScore = weeks <= 8 ? 100 : (weeks <= 16 ? 60 : 30);
  } else if (userTimeline.includes('medium') || userTimeline.includes('3-6')) {
    feasibilityScore = weeks >= 8 && weeks <= 24 ? 100 : 70;
  } else if (userTimeline.includes('long') || userTimeline.includes('full')) {
    feasibilityScore = weeks >= 16 ? 100 : 75;
  }

  // Composite Calculation
  const totalScore = Math.round(
    (skillScore * 0.35) +
    (interestScore * 0.25) +
    (sectorScore * 0.15) +
    (employmentScore * 0.15) +
    (feasibilityScore * 0.10)
  );

  return {
    match_score: Math.max(15, Math.min(99, totalScore)), // realistic bounded score
    is_prerequisite_met: isPrerequisiteMet,
    beneficiary_education_level: beneficiaryEduLevel,
    required_education_level: requiredEduLevel,
    matched_skills: skillResult.matched,
    matched_interests: interestResult.matched,
    score_breakdown: {
      skill_overlap: skillScore,
      aspiration_alignment: interestScore,
      sector_fit: sectorScore,
      employment_fit: employmentScore,
      feasibility: feasibilityScore
    }
  };
}

/**
 * Main matching engine function that evaluates a beneficiary against all occupations and verified courses.
 */
function matchBeneficiary(profile = {}) {
  const verifiedCourses = getVerifiedCourses();
  const occupations = getOccupations();

  // 1. Score all occupations
  const scoredOccupations = occupations.map(occ => {
    const scoreData = scoreItem(occ, profile, true);
    
    // Fetch associated primary verified courses
    const primaryCourses = occ.primary_qualifications
      .map(id => getCourseById(id))
      .filter(Boolean);

    // Fetch associated modular bridge courses
    const modularCourses = occ.modular_bridge_qualifications
      .map(id => getCourseById(id))
      .filter(Boolean);

    // Missing prerequisite detail
    let missingPrerequisite = null;
    if (!scoreData.is_prerequisite_met) {
      missingPrerequisite = `Requires ${occ.required_education_label}. Current level: ${profile.education || 'Not specified'}.`;
    }

    return {
      ...occ,
      match_score: scoreData.match_score,
      eligibility_status: scoreData.is_prerequisite_met ? 'ELIGIBLE_NOW' : 'FUTURE_PATHWAY',
      is_eligible_now: scoreData.is_prerequisite_met,
      missing_prerequisite: missingPrerequisite,
      matched_skills: scoreData.matched_skills,
      matched_interests: scoreData.matched_interests,
      score_breakdown: scoreData.score_breakdown,
      primary_courses: primaryCourses,
      modular_courses: modularCourses
    };
  });

  // Separate eligible occupations from future pathways
  const eligibleOccupations = scoredOccupations
    .filter(o => o.is_eligible_now)
    .sort((a, b) => b.match_score - a.match_score);

  const futurePathwayOccupations = scoredOccupations
    .filter(o => !o.is_eligible_now)
    .sort((a, b) => b.match_score - a.match_score);

  // 2. Score individual verified courses directly
  const scoredCourses = verifiedCourses.map(course => {
    const scoreData = scoreItem(course, profile, false);

    let missingPrerequisite = null;
    if (!scoreData.is_prerequisite_met) {
      missingPrerequisite = `Requires ${course.prerequisites.min_education_label}. Current: ${profile.education || 'Unspecified'}.`;
    }

    return {
      ...course,
      match_score: scoreData.match_score,
      eligibility_status: scoreData.is_prerequisite_met ? 'ELIGIBLE_NOW' : 'FUTURE_PATHWAY',
      is_eligible_now: scoreData.is_prerequisite_met,
      missing_prerequisite: missingPrerequisite,
      matched_skills: scoreData.matched_skills,
      matched_interests: scoreData.matched_interests,
      score_breakdown: scoreData.score_breakdown
    };
  });

  const eligibleCourses = scoredCourses
    .filter(c => c.is_eligible_now)
    .sort((a, b) => b.match_score - a.match_score);

  const futureCourses = scoredCourses
    .filter(c => !c.is_eligible_now)
    .sort((a, b) => b.match_score - a.match_score);

  // 3. Assemble structured recommendations
  // Top 3 primary recommendations
  const topOccupations = eligibleOccupations.slice(0, 3);

  // Build actionable pathways for each top occupation
  const recommendedPathways = topOccupations.map((occ, index) => {
    // Pick the best-matching primary course
    const bestCourse = occ.primary_courses[0] || null;
    const modularBridge = occ.modular_courses[0] || null;

    return {
      pathway_id: `pathway-${occ.occupation_id}`,
      rank: index + 1,
      occupation_title: occ.title,
      occupation_id: occ.occupation_id,
      description: occ.description,
      sector: occ.sector,
      nsqf_level: occ.nsqf_level,
      match_percentage: occ.match_score,
      eligibility_status: occ.eligibility_status,
      target_employment: occ.target_employment_types.join(' / '),
      recommended_primary_course: bestCourse ? {
        course_id: bestCourse.course_id,
        course_name: bestCourse.course_name,
        nsqf_level: bestCourse.nsqf_level,
        duration_weeks: bestCourse.est_duration_weeks,
        notional_hours: bestCourse.notional_hours,
        fee_waiver: '100% Free under PM-AJAY GIA Component for SC Candidates',
        source: bestCourse.source
      } : null,
      recommended_modular_bridge: modularBridge ? {
        course_id: modularBridge.course_id,
        course_name: modularBridge.course_name,
        notional_hours: modularBridge.notional_hours,
        role: 'Skill-Bridging Practical Module'
      } : null,
      matched_skills: occ.matched_skills,
      score_breakdown: occ.score_breakdown,
      disclaimer: 'Course admission and stipend eligibility subject to PMKK / NIELIT document verification.'
    };
  });

  return {
    beneficiary_summary: {
      education: profile.education || 'Not provided',
      education_level_score: normalizeEducationLevel(profile.education),
      skills_detected: extractKeywords(profile.skills || profile.primarySkills),
      interests_detected: extractKeywords([profile.interests, profile.aspirations]),
      preferred_sector: profile.sector || 'All Sectors'
    },
    top_pathways: recommendedPathways,
    all_eligible_occupations: eligibleOccupations,
    future_pathways: futurePathwayOccupations.slice(0, 2),
    top_courses_now: eligibleCourses.slice(0, 6),
    future_courses: futureCourses.slice(0, 4),
    matching_timestamp: new Date().toISOString(),
    total_verified_courses_searched: verifiedCourses.length
  };
}

module.exports = {
  matchBeneficiary,
  scoreItem,
  extractKeywords
};
