// server/nsqfDatasetService.cjs
// Dedicated Service for Loading, Searching, Filtering, and Matching NIELIT/NSQF Dataset Records
// Dataset: server/data/nielit_nsqf_full_dataset_with_legacy.csv

const { getAllCourses, getVerifiedCourses, normalizeEducationLevel } = require('./matchingEngine/dataLoader.cjs');
const { resolveInterest, normalizeText } = require('./matchingEngine/interestMapping.cjs');

// Non-NIELIT sector notice registry for transparent guidance without data fabrication
const EXTERNAL_SECTORS = {
  agriculture: {
    name: 'Agriculture & Farming',
    council: 'Agriculture Skill Council of India (ASCI)',
    notice: 'The NIELIT dataset specializes strictly in Electronics & IT qualifications. Traditional agricultural trades (such as organic farming or crop production) are governed by ASCI. Relevant electronics/solar power qualifications from NIELIT (e.g. Solar Pump & PV Installation) are displayed below where applicable.',
    relevantClusters: ['Renewable Energy (Solar)', 'IoT (Internet of Things)']
  },
  healthcare: {
    name: 'Healthcare & Paramedical',
    council: 'Healthcare Sector Skill Council (HSSC)',
    notice: 'The NIELIT dataset specializes strictly in Electronics & IT qualifications. General healthcare and patient nursing trades are governed by HSSC. Relevant medical electronics and healthcare IT qualifications from NIELIT are displayed below where applicable.',
    relevantClusters: ['General Electronics', 'Digital Office & Productivity']
  },
  plumbing: {
    name: 'Plumbing & Pipefitting',
    council: 'Indian Plumbing Skills Council (IPSC)',
    notice: 'The NIELIT dataset specializes in Electronics & IT qualifications. Domestic water plumbing is covered under IPSC / CTS trades. Relevant equipment maintenance qualifications from NIELIT are shown below.',
    relevantClusters: ['Hardware Repair & Maintenance', 'General Electronics']
  },
  construction: {
    name: 'Construction & Masonry',
    council: 'Construction Skill Development Council of India (CSDCI)',
    notice: 'The NIELIT dataset specializes in Electronics & IT qualifications. Building construction is governed by CSDCI. Relevant electrical and solar installation courses from NIELIT are shown below.',
    relevantClusters: ['Renewable Energy (Solar)']
  },
  tailoring: {
    name: 'Apparel & Tailoring',
    council: 'Apparel Made-Ups & Home Furnishing Sector Skill Council (AMHSSC)',
    notice: 'The NIELIT dataset specializes in Electronics & IT qualifications. Garment stitching and tailoring are covered under AMHSSC trades. No direct apparel courses exist in the NIELIT dataset.',
    relevantClusters: []
  }
};

/**
 * Derive clean job role from course name
 */
function deriveJobRole(courseName, skillCluster) {
  if (!courseName) return skillCluster || 'Technical Specialist';
  return courseName
    .replace(/^(Foundation course in|Certificate Course in|Certified|Diploma in|Advance Diploma in|Post Graduate Program in|Essentials of|Fundamentals of)\s+/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
}

/**
 * Maps course to structured, standardized JSON presentation format
 */
function formatRecord(course) {
  const reqEduLabel = course.prerequisites ? course.prerequisites.min_education_label : 'Open to All';
  const role = deriveJobRole(course.course_name, course.skill_cluster);

  return {
    id: course.course_id,
    source_id: course.source_id,
    qualification: course.course_name,
    job_role: role,
    sector: course.sector,
    skill_cluster: course.skill_cluster,
    skills: course.expected_skills || [course.skill_cluster],
    occupation: course.skill_cluster || course.sector,
    nsqf_level: course.nsqf_level,
    training_info: {
      course_type: course.course_type,
      is_modular: course.is_modular,
      notional_hours: course.notional_hours,
      est_duration_weeks: course.est_duration_weeks,
      fee_note: course.fee_note,
      source_url: course.source,
      source_disclaimer: 'Official institutional curriculum reference under NIELIT / NSQC.'
    },
    entry_profile: {
      raw: course.prerequisites ? course.prerequisites.raw : '',
      inferred_minimum: reqEduLabel,
      is_inferred: true
    },
    status: course.status, // CURRENT_VERIFIED or LEGACY_UNVERIFIED
    is_verified: course.is_verified,
    is_historical: !course.is_verified
  };
}

/**
 * Dedicated service to search, filter, and match NIELIT NSQF dataset records
 *
 * @param {Object} queryOptions
 * @param {string} [queryOptions.sector] - Preferred sector (e.g., 'IT', 'Electronics', or external sectors)
 * @param {string} [queryOptions.interest] - Beneficiary interest (e.g. 'Web Development', 'Robotics', 'Electrical')
 * @param {string} [queryOptions.role] - Specific job role search term
 * @param {string} [queryOptions.query] - Freeform keyword search or voice transcript
 * @param {number|string} [queryOptions.nsqfLevel] - Desired NSQF level (1-8)
 * @param {number|string} [queryOptions.maxDurationWeeks] - Maximum training duration in weeks
 * @param {string} [queryOptions.education] - User's education level (e.g. '10th', '12th', 'ITI', 'Graduate')
 * @param {boolean} [queryOptions.includeLegacy=false] - Whether to include legacy historical records
 * @param {number} [queryOptions.limit=20] - Max records to return
 * @param {number} [queryOptions.page=1] - Page number for pagination
 * @returns {Object} Structured JSON containing results and metadata
 */
function searchRecords(queryOptions = {}) {
  const rawSector = (queryOptions.sector || '').trim();
  const rawInterest = (queryOptions.interest || '').trim();
  const rawRole = (queryOptions.role || '').trim();
  const rawQuery = (queryOptions.query || queryOptions.q || '').trim();
  const includeLegacy = queryOptions.includeLegacy === true || queryOptions.includeLegacy === 'true' || queryOptions.includeLegacy === '1';
  const filterNsqf = queryOptions.nsqfLevel ? parseInt(queryOptions.nsqfLevel, 10) : null;
  const filterMaxDuration = queryOptions.maxDurationWeeks ? parseInt(queryOptions.maxDurationWeeks, 10) : null;
  const userEduLevel = queryOptions.education ? normalizeEducationLevel(queryOptions.education) : null;
  const limit = Math.max(1, Math.min(parseInt(queryOptions.limit, 10) || 20, 50));
  const page = Math.max(1, parseInt(queryOptions.page, 10) || 1);

  // Load cached dataset (parses CSV only once)
  let allCourses = [];
  try {
    allCourses = getAllCourses();
  } catch (err) {
    return {
      success: false,
      error: 'DATASET_LOAD_ERROR',
      message: 'Failed to access NIELIT NSQF dataset: ' + err.message,
      records: [],
      total: 0
    };
  }

  // Combine query parameters into searchable tokens
  const combinedSearchStr = [rawInterest, rawRole, rawQuery].filter(Boolean).join(' ');
  const normalizedSearch = normalizeText(combinedSearchStr);
  const searchTokens = normalizedSearch.split(/\s+/).filter(t => t.length > 1);

  // Check if sector or interest points to an external / non-NIELIT sector
  let externalSectorNotice = null;
  let externalClusterFallback = [];
  const checkSectorKey = rawSector.toLowerCase().trim();
  const checkInterestKey = rawInterest.toLowerCase().trim();

  for (const [secKey, secInfo] of Object.entries(EXTERNAL_SECTORS)) {
    if (checkSectorKey.includes(secKey) || checkInterestKey.includes(secKey) || normalizedSearch.includes(secKey)) {
      externalSectorNotice = secInfo.notice;
      externalClusterFallback = secInfo.relevantClusters;
      break;
    }
  }

  // Check resolved interest mapping (taxonomy layer)
  let resolvedInterest = null;
  if (combinedSearchStr) {
    resolvedInterest = resolveInterest(combinedSearchStr);
  }

  // Filter dataset records
  let matched = allCourses.filter(course => {
    // 1. Verification filter: default to verified only unless includeLegacy requested
    if (!includeLegacy && !course.is_verified) {
      return false;
    }

    // 2. Direct sector filter if provided
    if (rawSector) {
      const cSectorLower = course.sector.toLowerCase();
      const targetSecLower = rawSector.toLowerCase();

      // Check if user specifically asked for IT or Electronics
      if (targetSecLower === 'it' && cSectorLower === 'it') {
        // Matched
      } else if (targetSecLower === 'electronics' && cSectorLower === 'electronics') {
        // Matched
      } else if (cSectorLower.includes(targetSecLower)) {
        // Partial matched
      } else if (externalClusterFallback.length > 0) {
        // Non-NIELIT sector: match only fallback tech clusters
        if (!externalClusterFallback.includes(course.skill_cluster)) {
          return false;
        }
      } else {
        return false;
      }
    }

    // 3. NSQF level filter
    if (filterNsqf && !isNaN(filterNsqf) && course.nsqf_level !== filterNsqf) {
      return false;
    }

    // 4. Max duration filter
    if (filterMaxDuration && !isNaN(filterMaxDuration) && course.est_duration_weeks > filterMaxDuration) {
      return false;
    }

    // 5. Keyword & Interest search
    if (searchTokens.length > 0 || resolvedInterest) {
      const cNameLower = course.course_name.toLowerCase();
      const cClusterLower = course.skill_cluster.toLowerCase();
      const cSectorLower = course.sector.toLowerCase();

      // Interest taxonomy match
      if (resolvedInterest) {
        if (resolvedInterest.skillClusters.includes(course.skill_cluster)) {
          return true;
        }
        if (course.sector === resolvedInterest.sector && resolvedInterest.keywords.some(kw => cNameLower.includes(kw))) {
          return true;
        }
      }

      // External sector fallback match
      if (externalClusterFallback.length > 0) {
        if (externalClusterFallback.includes(course.skill_cluster)) {
          return true;
        }
      }

      // Role specific filter
      if (rawRole) {
        const roleTokens = normalizeText(rawRole).split(/\s+/).filter(Boolean);
        const matchRole = roleTokens.some(rt => {
          if (cNameLower.includes(rt)) return true;
          // Stemming: "programmer" -> "program", "developer" -> "develop", "technician" -> "technic"
          if (rt.endsWith('er') && cNameLower.includes(rt.slice(0, -2))) return true;
          if (rt.endsWith('or') && cNameLower.includes(rt.slice(0, -2))) return true;
          if (rt.endsWith('ian') && cNameLower.includes(rt.slice(0, -3))) return true;
          return false;
        });
        if (matchRole) {
          return true;
        }
      }

      // General token match (matches course name or cluster or sector)
      const tokenMatch = searchTokens.some(token => {
        return cNameLower.includes(token) || cClusterLower.includes(token) || cSectorLower.includes(token);
      });

      return tokenMatch;
    }

    // If no search tokens or interest specified, keep record (e.g. when querying by sector alone)
    return true;
  });

  // Sort: current_verified first, then closer NSQF level, then shorter duration
  matched.sort((a, b) => {
    if (a.is_verified !== b.is_verified) {
      return a.is_verified ? -1 : 1;
    }
    return a.est_duration_weeks - b.est_duration_weeks;
  });

  const total = matched.length;
  const startIndex = (page - 1) * limit;
  const paginated = matched.slice(startIndex, startIndex + limit);

  // Format records to structured JSON
  const formattedRecords = paginated.map(course => {
    const rec = formatRecord(course);
    // Add education compatibility assessment if user education provided
    if (userEduLevel !== null) {
      const minReq = course.prerequisites ? course.prerequisites.min_education_level : 0;
      rec.eligibility = {
        is_eligible: userEduLevel >= minReq,
        user_level: userEduLevel,
        min_required_level: minReq,
        note: userEduLevel >= minReq
          ? `You meet the inferred entry qualification (${rec.entry_profile.inferred_minimum}).`
          : `Typically expects ${rec.entry_profile.inferred_minimum}. Verify flexible admission at local NIELIT centre.`
      };
    }
    return rec;
  });

  // Compose user-friendly notice or empty message
  let message = null;
  if (total === 0) {
    if (externalSectorNotice) {
      message = externalSectorNotice;
    } else if (rawSector || combinedSearchStr) {
      message = `No NIELIT qualifications found matching "${rawSector || combinedSearchStr}". Try broader keywords like "IT", "Electronics", "Solar", or "Hardware".`;
    } else {
      message = 'No dataset records match the selected criteria.';
    }
  } else if (resolvedInterest && resolvedInterest.distinctionNotice) {
    message = resolvedInterest.distinctionNotice;
  } else if (externalSectorNotice) {
    message = externalSectorNotice;
  }

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    query: {
      sector: rawSector || null,
      interest: rawInterest || null,
      role: rawRole || null,
      query: rawQuery || null,
      nsqfLevel: filterNsqf,
      maxDurationWeeks: filterMaxDuration,
      includeLegacy
    },
    notice: message,
    records: formattedRecords
  };
}

/**
 * Return summary statistics and available taxonomy from dataset
 */
function getDatasetOverview() {
  const courses = getAllCourses();
  const verified = courses.filter(c => c.is_verified);
  const legacy = courses.filter(c => !c.is_verified);

  const sectors = {};
  const clusters = {};
  const nsqfLevels = {};

  verified.forEach(c => {
    sectors[c.sector] = (sectors[c.sector] || 0) + 1;
    clusters[c.skill_cluster] = (clusters[c.skill_cluster] || 0) + 1;
    nsqfLevels[c.nsqf_level] = (nsqfLevels[c.nsqf_level] || 0) + 1;
  });

  return {
    totalRecords: courses.length,
    verifiedCount: verified.length,
    legacyCount: legacy.length,
    sectors,
    skillClusters: Object.keys(clusters).sort(),
    nsqfLevels,
    datasetSource: 'National Institute of Electronics and Information Technology (NIELIT) - NSQC Approved NSQF Register'
  };
}

module.exports = {
  searchRecords,
  getDatasetOverview,
  formatRecord,
  EXTERNAL_SECTORS
};
