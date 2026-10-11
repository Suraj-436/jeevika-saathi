// server/matchingEngine/skillRecommender.cjs
// Deterministic Dataset-Driven Skill & Course Recommendation Engine
// Ranks courses from the official NIELIT NSQF dataset based on:
// 1. Relevance to selected interest & skill clusters
// 2. Education level / entry profile compatibility
// 3. NSQF level suitability
// 4. Available training time / duration compatibility
// 5. Current verification status (current_verified prioritized)

const { getAllCourses, normalizeEducationLevel } = require('./dataLoader.cjs');
const { resolveInterest, getAvailableInterests, normalizeText } = require('./interestMapping.cjs');

/**
 * Filter and score courses for a user interest and profile constraints.
 *
 * @param {Object} options
 * @param {string} options.interest - User's selected or stated interest
 * @param {string} [options.education] - User's education level string (e.g. '10th pass', '12th', 'Graduate')
 * @param {number|string} [options.nsqfLevel] - Desired or target NSQF level
 * @param {number|string} [options.maxDurationWeeks] - Max duration willing to train in weeks
 * @param {boolean} [options.includeLegacy=false] - Whether to include legacy_unverified records
 * @param {string} [options.skills] - Existing user skills (comma separated or array)
 * @returns {Object} Structured recommendation result
 */
function recommendCourses(options = {}) {
  const rawInterest = options.interest || '';
  const includeLegacy = options.includeLegacy === true || options.includeLegacy === 'true' || options.includeLegacy === '1';
  const filterEducation = options.education ? String(options.education).trim() : '';
  const userEduScore = filterEducation ? normalizeEducationLevel(filterEducation) : null;
  const filterNsqf = options.nsqfLevel ? parseInt(options.nsqfLevel, 10) : null;
  const filterMaxDuration = options.maxDurationWeeks ? parseInt(options.maxDurationWeeks, 10) : null;

  // Resolve interest using deterministic mapping
  const resolved = resolveInterest(rawInterest);

  // If no interest resolved and no interest query provided, return available interest taxonomy
  if (!resolved && !rawInterest.trim()) {
    return {
      success: true,
      query: { rawInterest: '', includeLegacy, education: filterEducation },
      matchedInterest: null,
      matchedSector: null,
      distinctionNotice: null,
      availableInterests: getAvailableInterests(),
      totalFound: 0,
      recommendations: [],
      message: 'Please provide or select an interest to receive dataset-driven course recommendations.'
    };
  }

  // Load all courses from cached dataset
  let allCourses = [];
  try {
    allCourses = getAllCourses();
  } catch (err) {
    return {
      success: false,
      error: 'DATASET_UNAVAILABLE',
      message: 'Failed to access course dataset: ' + err.message,
      recommendations: []
    };
  }

  if (!allCourses || allCourses.length === 0) {
    return {
      success: false,
      error: 'EMPTY_DATASET',
      message: 'The course dataset is empty.',
      recommendations: []
    };
  }

  // If rawInterest provided but not matched to taxonomy, perform broad keyword search across dataset
  let targetSector = resolved ? resolved.sector : null;
  let targetClusters = resolved ? resolved.skillClusters : [];
  let targetKeywords = resolved ? resolved.keywords : normalizeText(rawInterest).split(/\s+/).filter(t => t.length > 2);
  let distinctionNotice = resolved ? resolved.distinctionNotice || null : null;

  // Filter courses by interest relevance
  let matchedCourses = allCourses.filter(course => {
    // 1. By default, only current_verified unless includeLegacy is requested
    if (!includeLegacy && !course.is_verified) {
      return false;
    }

    if (resolved) {
      // Cluster match
      if (targetClusters.includes(course.skill_cluster)) {
        return true;
      }
      // Sector + keyword match for focused relevance
      if (course.sector === targetSector) {
        const cNameLower = course.course_name.toLowerCase();
        if (targetKeywords.some(kw => cNameLower.includes(kw))) {
          return true;
        }
      }
      return false;
    } else {
      // Freeform fallback search: course name or cluster contains raw interest tokens
      const cNameLower = course.course_name.toLowerCase();
      const cClusterLower = course.skill_cluster.toLowerCase();
      return targetKeywords.some(kw => cNameLower.includes(kw) || cClusterLower.includes(kw));
    }
  });

  // Apply explicit optional filters
  if (filterNsqf && !isNaN(filterNsqf)) {
    matchedCourses = matchedCourses.filter(c => c.nsqf_level === filterNsqf);
  }

  if (filterMaxDuration && !isNaN(filterMaxDuration)) {
    matchedCourses = matchedCourses.filter(c => c.est_duration_weeks <= filterMaxDuration);
  }

  // Score and rank each candidate course deterministically
  const scoredList = matchedCourses.map(course => {
    let score = 50; // base score
    const matchReasons = [];

    // 1. Interest & Cluster relevance (up to +30)
    if (resolved && resolved.skillClusters.includes(course.skill_cluster)) {
      score += 25;
      matchReasons.push(`Direct match for skill cluster: ${course.skill_cluster}`);
    } else if (resolved && course.sector === resolved.sector) {
      score += 15;
      matchReasons.push(`Aligns with ${course.sector} sector curriculum`);
    } else {
      score += 10;
      matchReasons.push(`Matches keyword search for "${rawInterest}"`);
    }

    // 2. Education & Entry Profile match (up to +25)
    let eligibilityStatus = 'ELIGIBLE';
    let eligibilityNote = '';
    const reqEduLevel = course.prerequisites ? course.prerequisites.min_education_level : 0;
    const reqEduLabel = course.prerequisites ? course.prerequisites.min_education_label : 'Open to All';

    if (userEduScore !== null) {
      if (userEduScore >= reqEduLevel) {
        score += 20;
        eligibilityStatus = 'ELIGIBLE';
        eligibilityNote = `You meet the inferred entry requirement (${reqEduLabel}).`;
        matchReasons.push(eligibilityNote);
      } else {
        // Do NOT exclude, but transparently flag eligibility uncertainty
        score -= 10;
        eligibilityStatus = 'REQUIRES_PREREQUISITE_CHECK';
        eligibilityNote = `Course typically expects ${reqEduLabel}. Candidate level: ${filterEducation}. Verify flexible admission at local NIELIT centre.`;
        matchReasons.push(`Entry profile advisory: Typically requires ${reqEduLabel}`);
      }
    } else {
      // User education unknown: explain transparently and suggest clarification
      eligibilityStatus = 'UNKNOWN_USER_EDUCATION';
      eligibilityNote = `Entry requirement is inferred as ${reqEduLabel}. Please specify your education level to verify direct eligibility.`;
    }

    // 3. NSQF level suitability (up to +15)
    // Levels 3-5 are prime vocational skilling levels under PM-AJAY / NIELIT
    if (course.nsqf_level >= 3 && course.nsqf_level <= 5) {
      score += 15;
      matchReasons.push(`Standard NSQF Level ${course.nsqf_level} skilling qualification`);
    } else if (course.nsqf_level > 5) {
      score += 5;
      matchReasons.push(`Advanced NSQF Level ${course.nsqf_level} specialization`);
    } else {
      score += 10;
      matchReasons.push(`Foundational NSQF Level ${course.nsqf_level} qualification`);
    }

    // 4. Compatibility with training duration (up to +15)
    if (filterMaxDuration && !isNaN(filterMaxDuration)) {
      if (course.est_duration_weeks <= filterMaxDuration) {
        score += 15;
        matchReasons.push(`Fits within your preferred ${filterMaxDuration}-week window (${course.est_duration_weeks} wks)`);
      }
    } else {
      // Reasonable duration bonus (4 to 24 weeks is standard)
      if (course.est_duration_weeks >= 4 && course.est_duration_weeks <= 24) {
        score += 10;
      }
    }

    // 5. Verification status (+15 for verified, -15 for legacy)
    if (course.is_verified) {
      score += 15;
      matchReasons.push('Current verified NIELIT NSQF course');
    } else {
      score -= 15;
      matchReasons.push('Historical record (legacy qualification - verify current batch availability)');
    }

    return {
      course_id: course.course_id,
      source_id: course.source_id,
      course_name: course.course_name,
      sector: course.sector,
      skill_cluster: course.skill_cluster,
      expected_skills: course.expected_skills || [course.skill_cluster],
      nsqf_level: course.nsqf_level,
      notional_hours: course.notional_hours,
      est_duration_weeks: course.est_duration_weeks,
      course_type: course.course_type,
      is_modular: course.is_modular,
      entry_profile: {
        raw: course.prerequisites ? course.prerequisites.raw : '',
        inferred_minimum: reqEduLabel,
        is_inferred: true
      },
      verification_status: course.status, // 'CURRENT_VERIFIED' or 'LEGACY_UNVERIFIED'
      is_verified: course.is_verified,
      is_historical: !course.is_verified,
      source_url: course.source,
      source_disclaimer: 'Source link is an official institutional reference and does not guarantee current batch admissions or immediate seat availability.',
      fee_info: course.fee_note,
      fee_note: course.fee_note,
      match_score: Math.max(10, Math.min(99, score)),
      matching_reasons: matchReasons,
      eligibility: {
        status: eligibilityStatus,
        note: eligibilityNote
      }
    };
  });

  // Rank results: highest match_score first, verified before unverified, then shorter duration
  scoredList.sort((a, b) => {
    if (b.match_score !== a.match_score) {
      return b.match_score - a.match_score;
    }
    if (a.is_verified !== b.is_verified) {
      return a.is_verified ? -1 : 1;
    }
    return a.est_duration_weeks - b.est_duration_weeks;
  });

  return {
    success: true,
    query: {
      rawInterest,
      education: filterEducation || null,
      nsqfLevel: filterNsqf || null,
      maxDurationWeeks: filterMaxDuration || null,
      includeLegacy
    },
    matchedInterest: resolved ? {
      id: resolved.id,
      label: resolved.label,
      description: resolved.description
    } : {
      id: 'custom_keyword',
      label: rawInterest,
      description: `Custom search for: ${rawInterest}`
    },
    matchedSector: targetSector || (scoredList[0] ? scoredList[0].sector : 'IT/Electronics'),
    matchedSkillClusters: targetClusters,
    distinctionNotice: distinctionNotice,
    datasetVerificationSummary: {
      verifiedCoursesFound: scoredList.filter(c => c.is_verified).length,
      historicalCoursesFound: scoredList.filter(c => !c.is_verified).length,
      historicalIncluded: includeLegacy
    },
    totalFound: scoredList.length,
    recommendations: scoredList
  };
}

module.exports = {
  recommendCourses,
  resolveInterest,
  getAvailableInterests
};
