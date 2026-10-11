const fs = require('fs');
const path = require('path');

/**
 * Educational qualification levels normalized to an ordinal scale:
 * 0: None / Basic Literacy
 * 1: Class 5 pass
 * 2: Class 8 pass
 * 3: Class 10 pass (Secondary)
 * 4: Class 12 pass / ITI (Higher Secondary / Technical Certificate)
 * 5: Diploma / Graduate / Bachelor's (Polytechnic Diploma, BA, BSc, BCom, BCA, etc.)
 * 6: Engineering / Postgraduate (B.Tech, BE, MCA, M.Sc, etc.)
 */
const EDUCATION_LEVEL_ORDER = {
  'none': 0,
  'literacy': 0,
  '5th': 1,
  'class 5': 1,
  '8th': 2,
  'class 8': 2,
  '10th': 3,
  'class 10': 3,
  'matric': 3,
  'secondary': 3,
  '12th': 4,
  'class 12': 4,
  'intermediate': 4,
  'iti': 4,
  'diploma': 5,
  'graduate': 5,
  'bachelor': 5,
  'degree': 5,
  'engineering': 6,
  'btech': 6,
  'be': 6,
  'postgraduate': 6,
  'mtech': 6,
  'mca': 6
};

/**
 * Normalize an educational string to a standard level score (0-6)
 */
function normalizeEducationLevel(eduStr) {
  if (!eduStr) return 0;
  const s = eduStr.toLowerCase().trim();

  if (s.includes('b.tech') || s.includes('engineering') || s.includes('be ') || s.includes('mca') || s.includes('postgraduate') || s.includes('btech')) {
    return 6;
  }
  if (s.includes('diploma') || s.includes('graduate') || s.includes('degree') || s.includes('bachelor') || s.includes('b.sc') || s.includes('bca')) {
    return 5;
  }
  if (s.includes('12th') || s.includes('class 12') || s.includes('iti') || s.includes('intermediate') || s.includes('higher secondary')) {
    return 4;
  }
  if (s.includes('10th') || s.includes('class 10') || s.includes('matric') || s.includes('secondary')) {
    return 3;
  }
  if (s.includes('8th') || s.includes('class 8')) {
    return 2;
  }
  if (s.includes('5th') || s.includes('class 5')) {
    return 1;
  }
  return 0;
}

/**
 * Map raw inferred entry profile from dataset to a standardized minimum requirement
 */
function parseEntryPrerequisites(entryProfileStr) {
  if (!entryProfileStr) {
    return {
      raw: '',
      min_education_level: 0,
      min_education_label: 'Open to All / Basic Literacy',
      min_age: 14,
      technical_background_required: false
    };
  }

  const s = entryProfileStr.trim();
  const lower = s.toLowerCase();
  let minLevel = 3; // Default sensible requirement if unspecified
  let minLabel = 'Class 10th Pass';
  let minAge = 14;
  let technicalBg = false;

  if (lower.includes('b.tech') || lower.includes('engineering') || lower.includes('be in')) {
    minLevel = 6;
    minLabel = 'B.Tech / B.E. / Technical Degree';
    minAge = 20;
    technicalBg = true;
  } else if (lower.includes('diploma') || lower.includes('graduate') || lower.includes('b.sc')) {
    minLevel = 5;
    minLabel = 'Diploma / Graduate';
    minAge = 18;
    technicalBg = lower.includes('diploma in') || lower.includes('science');
  } else if (lower.includes('12th') || lower.includes('iti')) {
    minLevel = 4;
    minLabel = 'Class 12th Pass or ITI Certificate';
    minAge = 16;
    technicalBg = lower.includes('iti') || lower.includes('science');
  } else if (lower.includes('10th') || lower.includes('matric')) {
    minLevel = 3;
    minLabel = 'Class 10th Pass';
    minAge = 14;
  } else if (lower.includes('8th')) {
    minLevel = 2;
    minLabel = 'Class 8th Pass';
    minAge = 14;
  }

  return {
    raw: s,
    min_education_level: minLevel,
    min_education_label: minLabel,
    min_age: minAge,
    technical_background_required: technicalBg
  };
}

/**
 * Extract reliable skills a learner can expect to develop based purely on verified course data
 */
function deriveExpectedSkills(courseName, skillCluster) {
  const skills = new Set();
  if (skillCluster && skillCluster !== 'General IT/Electronics') {
    skills.add(skillCluster);
  }
  const cleanName = (courseName || '')
    .replace(/^(Foundation course in|Certificate Course in|Certified|Diploma in|Advance Diploma in|Post Graduate Program in|Essentials of|Fundamentals of)\s+/i, '')
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
  if (cleanName && cleanName.length > 2) {
    skills.add(cleanName);
  }
  return Array.from(skills);
}

/**
 * Basic robust CSV parser that properly handles quoted strings containing commas
 */
function parseCSV(csvText) {
  const lines = [];
  let currentRow = [];
  let currentToken = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentToken += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentToken.trim());
      if (currentRow.some(col => col.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }

  if (currentToken.length > 0 || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    if (currentRow.some(col => col.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

let cachedCourses = null;

/**
 * Load, clean, normalize, and index all courses from the dataset.
 */
function loadDataset() {
  if (cachedCourses) return cachedCourses;

  const csvPath = path.join(__dirname, '..', 'data', 'nielit_nsqf_full_dataset_with_legacy.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Dataset not found at: ${csvPath}`);
  }

  const rawContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(rawContent);
  if (rows.length < 2) {
    throw new Error('Dataset CSV is empty or has no header.');
  }

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const headerMap = {};
  headers.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const getCol = (row, colName) => {
    const idx = headerMap[colName];
    return idx !== undefined && row[idx] !== undefined ? row[idx] : '';
  };

  const courses = [];
  const seenCompositeKeys = new Map();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || !row.some(c => c.length > 0)) continue;

    const sourceId = getCol(row, 'id');
    const courseName = getCol(row, 'course_name');
    const sector = getCol(row, 'sector');
    const courseType = getCol(row, 'course_type');
    const nsqfLevelRaw = getCol(row, 'nsqf_level');
    const notionalHoursRaw = getCol(row, 'notional_hours');
    const estDurationWeeksRaw = getCol(row, 'est_duration_weeks_approx');
    const plannedReviewDate = getCol(row, 'planned_review_date');
    const skillCluster = getCol(row, 'skill_cluster');
    const entryProfileRaw = getCol(row, 'typical_entry_profile_inferred');
    const statusRaw = getCol(row, 'status');
    const feeNote = getCol(row, 'fee_note');
    const source = getCol(row, 'source');

    // Create unique composite course_id to resolve duplicates between FQ and MOD
    const typeTag = courseType.toLowerCase().includes('full') ? 'FQ' : 'MOD';
    let courseId = `${sourceId}-${typeTag}`;
    if (seenCompositeKeys.has(courseId)) {
      const count = seenCompositeKeys.get(courseId) + 1;
      seenCompositeKeys.set(courseId, count);
      courseId = `${courseId}-${count}`;
    } else {
      seenCompositeKeys.set(courseId, 1);
    }

    const nsqfLevel = parseInt(nsqfLevelRaw, 10) || 3;
    const notionalHours = parseInt(notionalHoursRaw, 10) || 0;
    const durationWeeks = parseInt(estDurationWeeksRaw, 10) || (notionalHours > 0 ? Math.ceil(notionalHours / 25) : 8);

    const isVerified = statusRaw.toLowerCase() === 'current_verified';
    const prerequisites = parseEntryPrerequisites(entryProfileRaw);

    // Build course entity
    const course = {
      course_id: courseId,
      source_id: sourceId,
      course_name: courseName,
      sector: sector || 'Electronics & IT',
      course_type: courseType || 'Full Qualification',
      is_modular: !courseType.toLowerCase().includes('full'),
      nsqf_level: nsqfLevel,
      notional_hours: notionalHours,
      est_duration_weeks: durationWeeks,
      planned_review_date: plannedReviewDate,
      skill_cluster: skillCluster || 'General IT/Electronics',
      expected_skills: deriveExpectedSkills(courseName, skillCluster),
      prerequisites: prerequisites,
      status: isVerified ? 'CURRENT_VERIFIED' : 'LEGACY_UNVERIFIED',
      is_verified: isVerified,
      fee_note: feeNote || 'PM-AJAY GIA Component provides 100% free training and certification for SC beneficiaries.',
      source: source || 'NIELIT'
    };

    courses.push(course);
  }

  cachedCourses = courses;
  return courses;
}

/**
 * Get all courses
 */
function getAllCourses() {
  return loadDataset();
}

/**
 * Get only current verified courses (filters out legacy unverified)
 */
function getVerifiedCourses() {
  return loadDataset().filter(c => c.is_verified);
}

/**
 * Find course by course_id
 */
function getCourseById(courseId) {
  return loadDataset().find(c => c.course_id === courseId);
}

module.exports = {
  loadDataset,
  getAllCourses,
  getVerifiedCourses,
  getCourseById,
  deriveExpectedSkills,
  normalizeEducationLevel,
  parseEntryPrerequisites,
  EDUCATION_LEVEL_ORDER
};
