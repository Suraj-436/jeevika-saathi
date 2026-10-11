// server/assessmentEngine.cjs
/**
 * Server-side Assessment Evaluation Engine for Jeevika Saathi.
 * Enforces the employment safety gate: INTEREST ≠ VERIFIED SKILL.
 * All verification status decisions happen SERVER-SIDE to prevent frontend tampering.
 */

const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.resolve(__dirname, 'assessments_db.json');

// Startup backup to prevent data loss
try {
  if (fs.existsSync(STORAGE_FILE)) {
    const backupFile = path.resolve(__dirname, 'assessments_db.json.bak');
    fs.copyFileSync(STORAGE_FILE, backupFile);
  }
} catch (e) {
  console.warn('[AssessmentEngine] Startup backup warning:', e.message);
}

// In-memory cache synced with assessments_db.json
let database = {
  users: {},
  reservations: []
};

// Load database if file exists
try {
  if (fs.existsSync(STORAGE_FILE)) {
    const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
    database = JSON.parse(raw);
    if (!database.reservations) database.reservations = [];
    if (!database.users) database.users = {};
  }
} catch (err) {
  console.warn('[AssessmentEngine] Could not load storage file, initializing empty db:', err.message);
}

// Atomic file write queue to prevent concurrency race conditions and file corruption
let writeQueue = Promise.resolve();

function saveDb() {
  writeQueue = writeQueue.then(() => {
    return new Promise((resolve) => {
      try {
        const tempPath = `${STORAGE_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const content = JSON.stringify(database, null, 2);
        fs.writeFileSync(tempPath, content, 'utf8');
        try {
          fs.renameSync(tempPath, STORAGE_FILE);
        } catch (renameErr) {
          // Robust fallback for Windows/OneDrive locked files
          fs.copyFileSync(tempPath, STORAGE_FILE);
          try { fs.unlinkSync(tempPath); } catch (_) {}
        }
      } catch (err) {
        console.error('[AssessmentEngine] Failed to persist database atomically:', err.message);
      }
      resolve();
    });
  });
  return writeQueue;
}

// Configurable trade criteria
const TRADE_RULES = {
  plumbing: {
    passScore: 70,
    minSafetyScore: 60,
    weights: {
      toolRecognition: 0.25,
      basicKnowledge: 0.25,
      safetyAwareness: 0.25,
      scenarioUnderstanding: 0.25
    }
  },
  electrician: {
    passScore: 75,
    minSafetyScore: 75, // Mandatory safety gate for electrical safety
    weights: {
      toolRecognition: 0.20,
      basicKnowledge: 0.25,
      safetyAwareness: 0.35, // Higher weight on safety
      scenarioUnderstanding: 0.20
    }
  },
  carpentry: {
    passScore: 70,
    minSafetyScore: 60,
    weights: {
      toolRecognition: 0.25,
      basicKnowledge: 0.25,
      safetyAwareness: 0.25,
      scenarioUnderstanding: 0.25
    }
  },
  tailoring: {
    passScore: 70,
    minSafetyScore: 50,
    weights: {
      toolRecognition: 0.25,
      basicKnowledge: 0.25,
      safetyAwareness: 0.20,
      scenarioUnderstanding: 0.30
    }
  },
  masonry: {
    passScore: 70,
    minSafetyScore: 65,
    weights: {
      toolRecognition: 0.25,
      basicKnowledge: 0.25,
      safetyAwareness: 0.25,
      scenarioUnderstanding: 0.25
    }
  },
  farming: {
    passScore: 70,
    minSafetyScore: 60,
    weights: {
      toolRecognition: 0.25,
      basicKnowledge: 0.25,
      safetyAwareness: 0.25,
      scenarioUnderstanding: 0.25
    }
  }
};

// Ground-truth correct answers & competency mapping
const QUESTION_KEYS = {
  // Plumbing
  "plumb_q1": { competency: "toolRecognition", correct: "opt_pipe_wrench", keywords: ["pipe wrench", "wrench", "पाना", "पाइप रिंच", "రెంచ్", "పైప్ రెంచ్"] },
  "plumb_q2": { competency: "safetyAwareness", correct: "opt_shutoff", keywords: ["shut off", "main valve", "turn off", "पानी बंद", "मुख्य वाल्व", "వాల్వ్ ఆపడం", "నీరు ఆపాలి"] },
  "plumb_q3": { competency: "basicKnowledge", correct: "opt_teflon_tape", keywords: ["teflon", "thread seal", "tape", "टेफ्लॉन टेप", "టెఫ్లాన్ టేప్"] },
  "plumb_q4": { competency: "scenarioUnderstanding", correct: "opt_replace_washer", keywords: ["washer", "seal", "वाशर", "सीलिंग", "వాషర్ మార్చడం"] },
  "plumb_q5": { competency: "basicKnowledge", correct: "opt_pvc_solvent", keywords: ["solvent", "cement", "गोंद", "సిమెంట్", "సాల్వెంట్"] },

  // Electrician
  "elec_q1": { competency: "toolRecognition", correct: "opt_neon_tester", keywords: ["tester", "neon", "voltage", "टेस्टर", "టెస్టర్"] },
  "elec_q2": { competency: "safetyAwareness", correct: "opt_turn_off_mcb", keywords: ["mcb", "main switch", "breaker", "off", "एमसीबी बंद", "మెయిన్ స్విచ్ ఆఫ్"] },
  "elec_q3": { competency: "basicKnowledge", correct: "opt_red_black_green", keywords: ["red black green", "earth", "लाल काला हरा", "ఎరుపు నలుపు ఆకుపచ్చ"] },
  "elec_q4": { competency: "scenarioUnderstanding", correct: "opt_remove_overload", keywords: ["unplug", "overload", "load", "उपकरण हटाएं", "లోడ్ తగ్గించాలి"] },
  "elec_q5": { competency: "safetyAwareness", correct: "opt_rubber_gloves", keywords: ["rubber", "insulated", "रबर दस्ताने", "రబ్బరు గ్లౌజులు"] },

  // Carpentry
  "carp_q1": { competency: "toolRecognition", correct: "opt_try_square", keywords: ["try square", "guniya", "गुनिया", "ట్రై స్క్వేర్", "మూలమట్టం"] },
  "carp_q2": { competency: "basicKnowledge", correct: "opt_with_grain", keywords: ["grain", "along grain", "रेशे की दिशा", "ధాతువు దిశ"] },
  "carp_q3": { competency: "safetyAwareness", correct: "opt_secure_clamp", keywords: ["clamp", "vice", "शिकंजा", "క్లాంప్"] },
  "carp_q4": { competency: "scenarioUnderstanding", correct: "opt_sandpaper", keywords: ["sandpaper", "sand", "रेगमाल", "శాండ్‌పేపర్", "ఉప్పుకాగితం"] },
  "carp_q5": { competency: "basicKnowledge", correct: "opt_pva_glue", keywords: ["wood glue", "fevicol", "फेविकोल", "చెక్క జిగురు"] },

  // Tailoring
  "tail_q1": { competency: "toolRecognition", correct: "opt_measuring_tape", keywords: ["tape", "inch tape", "इंची टेप", "టేప్", "కొలత టేప్"] },
  "tail_q2": { competency: "basicKnowledge", correct: "opt_fabric_shears", keywords: ["shears", "fabric scissor", "कैंची", "కత్తెర"] },
  "tail_q3": { competency: "scenarioUnderstanding", correct: "opt_adjust_tension", keywords: ["tension", "धागे का तनाव", "టెన్షన్ సర్దుబాటు"] },
  "tail_q4": { competency: "safetyAwareness", correct: "opt_turn_off_power", keywords: ["turn off", "switch off", "power off", "स्विच बंद", "పవర్ ఆఫ్"] },
  "tail_q5": { competency: "basicKnowledge", correct: "opt_basting_stitch", keywords: ["basting", "tuck", "कच्चा टांका", "బాస్టింగ్ కుట్టు"] },

  // Masonry
  "maso_q1": { competency: "toolRecognition", correct: "opt_spirit_level", keywords: ["spirit level", "level", "स्पिरिट लेवल", "లెవెల్", "స్పిరిట్ లెవెల్"] },
  "maso_q2": { competency: "basicKnowledge", correct: "opt_cement_sand_water", keywords: ["cement sand water", "mortar", "सीमेंट रेत पानी", "సిమెంట్ ఇసుక నీరు"] },
  "maso_q3": { competency: "safetyAwareness", correct: "opt_water_curing", keywords: ["curing", "water 7 days", "तराई", "క్యూరింగ్", "నీరు చల్లడం"] },
  "maso_q4": { competency: "scenarioUnderstanding", correct: "opt_plumb_bob", keywords: ["plumb bob", "sahul", "साहुल", "సాహుల్", "ప్లంబ్ బాబ్"] },
  "maso_q5": { competency: "safetyAwareness", correct: "opt_goggles_gloves", keywords: ["goggles", "gloves", "दस्ताने चश्मा", "రక్షణ గ్లాసులు గ్లౌజులు"] },

  // Farming / Agriculture
  "farm_q1": { competency: "toolRecognition", correct: "opt_hoe", keywords: ["hoe", "khurpi", "kudal", "कुदाल", "खुरपी", "फावड़ा", "పార", "గునపం"] },
  "farm_q2": { competency: "basicKnowledge", correct: "opt_water_nutrients", keywords: ["water", "nutrients", "fertilizer", "पानी", "खाद", "पोषक", "నీరు", "పోషకాలు"] },
  "farm_q3": { competency: "basicKnowledge", correct: "opt_support_growth", keywords: ["growth", "support", "विकास", "पोषण", "పెరుగుదల", "పంట"] },
  "farm_q4": { competency: "safetyAwareness", correct: "opt_check_safety", keywords: ["safe", "check", "सुरक्षित", "जांचें", "తనిఖీ", "సురక్షితం"] },
  "farm_q5": { competency: "scenarioUnderstanding", correct: "opt_weeding_mulching", keywords: ["weeding", "mulching", "निराई", "गुड़ाई", "खरपतवार", "కలుపు", "కలుపు తీయడం"] }
};

/**
 * Server-side answer evaluation.
 * Calculates competency percentages, weighted overall score, and verification status.
 */
function evaluateAnswers(userId, trade, answers) {
  let normTrade = (trade || '').toLowerCase().trim();
  if (normTrade.includes('farm') || normTrade.includes('agri')) {
    normTrade = 'farming';
  }
  const rules = TRADE_RULES[normTrade];

  if (!rules) {
    throw new Error(`Unsupported assessment trade: ${trade}`);
  }

  // Find all questions associated with this trade
  const tradeQuestions = Object.entries(QUESTION_KEYS).filter(([qId]) => {
    if (normTrade === 'plumbing') return qId.startsWith('plumb_');
    if (normTrade === 'electrician') return qId.startsWith('elec_');
    if (normTrade === 'carpentry') return qId.startsWith('carp_');
    if (normTrade === 'tailoring') return qId.startsWith('tail_');
    if (normTrade === 'masonry') return qId.startsWith('maso_');
    if (normTrade === 'farming') return qId.startsWith('farm_');
    return false;
  });

  const totalQuestions = tradeQuestions.length;
  if (totalQuestions === 0) {
    throw new Error(`No question definitions found for trade ${normTrade}`);
  }

  const competencyStats = {
    toolRecognition: { correct: 0, total: 0 },
    basicKnowledge: { correct: 0, total: 0 },
    safetyAwareness: { correct: 0, total: 0 },
    scenarioUnderstanding: { correct: 0, total: 0 }
  };

  const breakdown = [];
  let rawCorrectCount = 0;

  for (const [qId, qMeta] of tradeQuestions) {
    const comp = qMeta.competency;
    if (competencyStats[comp]) {
      competencyStats[comp].total += 1;
    }

    const userAns = answers && answers[qId];
    let isCorrect = false;

    if (userAns) {
      if (typeof userAns === 'string') {
        const cleanAns = userAns.trim();
        // Exact option id match
        if (cleanAns === qMeta.correct) {
          isCorrect = true;
        } else {
          // Check speech transcript keywords
          const lower = cleanAns.toLowerCase();
          for (const kw of qMeta.keywords) {
            if (lower.includes(kw.toLowerCase())) {
              isCorrect = true;
              break;
            }
          }
        }
      }
    }

    if (isCorrect) {
      rawCorrectCount += 1;
      if (competencyStats[comp]) {
        competencyStats[comp].correct += 1;
      }
    }

    breakdown.push({
      questionId: qId,
      competency: comp,
      isCorrect,
      selected: userAns || null
    });
  }

  // Calculate percentage for each competency
  const competencies = {};
  for (const [compKey, stats] of Object.entries(competencyStats)) {
    competencies[compKey] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  }

  // Weighted overall score
  let weightedScore = 0;
  let weightSum = 0;
  for (const [compKey, weight] of Object.entries(rules.weights)) {
    const compScore = competencies[compKey] !== undefined ? competencies[compKey] : 0;
    weightedScore += compScore * weight;
    weightSum += weight;
  }
  const overallScore = Math.round(weightedScore / (weightSum || 1));

  // Determine Verification Status according to strict employment safety gate
  const safetyScore = competencies.safetyAwareness || 0;
  const passedOverall = overallScore >= rules.passScore;
  const passedSafety = safetyScore >= rules.minSafetyScore;

  let status = 'TRAINING_RECOMMENDED';
  let verificationNotes = '';

  if (passedOverall && passedSafety) {
    status = 'VERIFIED';
    verificationNotes = `Successfully verified competencies for ${trade} (Overall: ${overallScore}%, Safety: ${safetyScore}%). Eligible for verified opportunities.`;
  } else if (!passedSafety) {
    status = 'TRAINING_RECOMMENDED';
    verificationNotes = `Safety awareness threshold (${rules.minSafetyScore}%) not met (Scored: ${safetyScore}%). Safety training recommended before reassessment.`;
  } else if (overallScore >= 50) {
    status = 'REASSESSMENT_REQUIRED';
    verificationNotes = `Minimum pass mark (${rules.passScore}%) not met (Scored: ${overallScore}%). Reassessment recommended after focused practice.`;
  } else {
    status = 'TRAINING_RECOMMENDED';
    verificationNotes = `Comprehensive NSQF-aligned training course recommended for ${trade}.`;
  }

  const now = new Date().toISOString();
  const assessmentId = `sa_${normTrade}_${Date.now()}`;

  const attemptRecord = {
    assessmentId,
    userId: userId || 'anonymous',
    trade: normTrade,
    status, // VERIFIED | REASSESSMENT_REQUIRED | TRAINING_RECOMMENDED
    score: overallScore,
    competencies,
    safetyScore,
    passed: status === 'VERIFIED',
    notes: verificationNotes,
    attemptedAt: now,
    completedAt: now,
    assessmentVersion: '1.0',
    breakdown
  };

  // Persist record in backend database
  if (!database.users[userId]) {
    database.users[userId] = {
      skillAssessments: [],
      verifiedSkills: {}
    };
  }

  database.users[userId].skillAssessments.push(attemptRecord);

  // If VERIFIED, update verifiedSkills map; if not, keep NOT_VERIFIED
  if (status === 'VERIFIED') {
    database.users[userId].verifiedSkills[normTrade] = {
      status: 'VERIFIED',
      score: overallScore,
      competencies,
      verifiedAt: now,
      assessmentId
    };
  } else {
    // If not verified, ensure any previous verification is not wrongly retained if reassessed,
    // or keep previous status if already passed
    if (!database.users[userId].verifiedSkills[normTrade] || database.users[userId].verifiedSkills[normTrade].status !== 'VERIFIED') {
      database.users[userId].verifiedSkills[normTrade] = {
        status: status,
        score: overallScore,
        competencies,
        lastAttemptAt: now
      };
    }
  }

  saveDb();

  return {
    assessment: attemptRecord,
    verifiedStatus: database.users[userId].verifiedSkills[normTrade]
  };
}

function getUserAssessments(userId) {
  if (!userId || !database.users[userId]) {
    return [];
  }
  return database.users[userId].skillAssessments || [];
}

function getUserVerifiedStatus(userId) {
  if (!userId || !database.users[userId]) {
    return {};
  }
  return database.users[userId].verifiedSkills || {};
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ASSESSMENT STATUS & DATA PERSISTENCE
// Statuses: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
// Backend is the source of truth for the Personalization Gate.
// ─────────────────────────────────────────────────────────────────────────────

function getVoiceAssessment(userId) {
  const uid = userId || 'ben-123';
  if (!database.users[uid] || !database.users[uid].voiceAssessment) {
    return {
      status: 'NOT_STARTED',
      completedAt: null,
      updatedAt: null,
      data: {}
    };
  }
  return database.users[uid].voiceAssessment;
}

function saveVoiceAssessment(userId, extractedData, isCompleted = false) {
  const uid = userId || 'ben-123';
  if (!database.users[uid]) {
    database.users[uid] = {
      voiceAssessment: { status: 'NOT_STARTED', completedAt: null, data: {} },
      skillAssessments: [],
      verifiedSkills: {}
    };
  }

  const current = database.users[uid].voiceAssessment || {
    status: 'NOT_STARTED',
    completedAt: null,
    data: {}
  };

  const incoming = extractedData || {};
  const mergedData = { ...(current.data || {}) };

  // Merge extracted fields without overwriting valid data with nulls
  for (const [k, v] of Object.entries(incoming)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length > 0) {
        const existingArr = Array.isArray(mergedData[k]) ? mergedData[k] : [];
        mergedData[k] = [...new Set([...existingArr, ...v])];
      }
    } else if (v !== '') {
      mergedData[k] = v;
    }
  }

  const now = new Date().toISOString();
  let status = current.status;

  // Server-side validation of completion gate:
  // Must have core profile information (current/family occupation, skills, interests, or aspiration)
  const hasCoreInfo = !!(
    mergedData.current_occupation ||
    mergedData.family_occupation ||
    mergedData.career_aspiration ||
    (Array.isArray(mergedData.existing_skills) && mergedData.existing_skills.length > 0) ||
    (Array.isArray(mergedData.interests) && mergedData.interests.length > 0)
  );

  if (isCompleted && hasCoreInfo) {
    status = 'COMPLETED';
  } else if (status !== 'COMPLETED') {
    // If user has engaged or extracted data exists, status is IN_PROGRESS
    status = hasCoreInfo ? 'IN_PROGRESS' : 'NOT_STARTED';
  }

  database.users[uid].voiceAssessment = {
    status,
    completedAt: status === 'COMPLETED' ? (current.completedAt || now) : null,
    updatedAt: now,
    data: mergedData
  };

  // Keep database.users[uid].profile in sync as single source of truth
  if (!database.users[uid].profile) {
    database.users[uid].profile = {};
  }
  const prof = database.users[uid].profile;
  if (mergedData.full_name || mergedData.fullName) prof.name = mergedData.full_name || mergedData.fullName;
  if (mergedData.current_occupation || mergedData.currentOccupation) prof.currentLivelihood = mergedData.current_occupation || mergedData.currentOccupation;
  if (mergedData.career_aspiration || mergedData.careerAspiration) prof.aspiration = mergedData.career_aspiration || mergedData.careerAspiration;
  if (mergedData.employment_preference || mergedData.employmentPreference) prof.employmentPref = mergedData.employment_preference || mergedData.employmentPreference;
  if (mergedData.existing_skills || mergedData.existingSkills) prof.skills = mergedData.existing_skills || mergedData.existingSkills;
  if (mergedData.interests) prof.interests = mergedData.interests;
  if (mergedData.family_occupation || mergedData.familyOccupation) prof.tradOccupation = mergedData.family_occupation || mergedData.familyOccupation;
  if (mergedData.location || mergedData.district) prof.district = mergedData.location || mergedData.district;
  if (mergedData.mobility_limit_km) prof.mobility_limit_km = mergedData.mobility_limit_km;
  if (mergedData.training_availability_duration || mergedData.trainingAvailabilityDuration) {
    prof.trainingAvailabilityDuration = mergedData.training_availability_duration || mergedData.trainingAvailabilityDuration;
  }
  if (mergedData.training_schedule || mergedData.trainingSchedule) {
    prof.trainingSchedule = mergedData.training_schedule || mergedData.trainingSchedule;
  }
  if (status === 'COMPLETED') {
    prof.completion = 100;
  }

  saveDb();

  return database.users[uid].voiceAssessment;
}

function resetVoiceAssessment(userId) {
  const uid = userId || 'ben-123';
  if (!database.users[uid]) {
    database.users[uid] = {
      profile: { completion: 0 },
      voiceAssessment: { status: 'NOT_STARTED', completedAt: null, data: {} },
      skillAssessments: [],
      verifiedSkills: {}
    };
  } else {
    database.users[uid].voiceAssessment = {
      status: 'NOT_STARTED',
      completedAt: null,
      updatedAt: new Date().toISOString(),
      data: {}
    };
    if (database.users[uid].profile) {
      database.users[uid].profile.completion = 0;
    }
  }
  saveDb();
  return database.users[uid].voiceAssessment;
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFICIARY PROFILE PERSISTENCE (SINGLE SOURCE OF TRUTH)
// ─────────────────────────────────────────────────────────────────────────────

function getBeneficiaryProfile(userId) {
  const uid = userId || 'default';
  const user = database.users[uid];
  if (!user || !user.profile) {
    return {
      status: 'NEW',
      profile: {
        id: uid,
        name: null,
        full_name: null,
        age: null,
        dob: null,
        gender: null,
        category: null,
        district: null,
        state: null,
        districtState: null,
        blockVillage: null,
        village: null,
        phone: null,
        language: null,
        education: null,
        literacy: null,
        skills: [],
        tradOccupation: null,
        currentLivelihood: null,
        aspiration: null,
        employmentPref: null,
        targetWage: null,
        mobility: null,
        mobility_limit_km: null,
        trainingAvailability: null,
        trainingAvailabilityDuration: null,
        trainingSchedule: null,
        constraints: null,
        completion: 0
      }
    };
  }

  // Base profile merged with voice assessment extractions if any
  const profile = { ...(user.profile || {}) };
  const va = user.voiceAssessment?.data || {};

  // If profile is missing fields that were captured via voice assessment, safely backfill
  if (!profile.name && (va.full_name || va.fullName)) profile.name = va.full_name || va.fullName;
  if (!profile.full_name && profile.name) profile.full_name = profile.name;
  if (!profile.currentLivelihood && (va.current_occupation || va.currentOccupation)) {
    profile.currentLivelihood = va.current_occupation || va.currentOccupation;
  }
  if (!profile.aspiration && (va.career_aspiration || va.careerAspiration)) {
    profile.aspiration = va.career_aspiration || va.careerAspiration;
  }
  if (!profile.employmentPref && (va.employment_preference || va.employmentPreference)) {
    profile.employmentPref = va.employment_preference || va.employmentPreference;
  }
  if (!profile.trainingAvailabilityDuration && (va.training_availability_duration || va.trainingAvailabilityDuration)) {
    profile.trainingAvailabilityDuration = va.training_availability_duration || va.trainingAvailabilityDuration;
  }
  if (!profile.trainingSchedule && (va.training_schedule || va.trainingSchedule)) {
    profile.trainingSchedule = va.training_schedule || va.trainingSchedule;
  }
  if ((!profile.skills || profile.skills.length === 0) && (va.existing_skills || va.existingSkills)) {
    profile.skills = va.existing_skills || va.existingSkills;
  }

  return {
    status: 'ACTIVE',
    profile
  };
}

function saveBeneficiaryProfile(userId, updates) {
  const uid = userId || 'default';
  if (!database.users[uid]) {
    database.users[uid] = {
      profile: {},
      voiceAssessment: { status: 'NOT_STARTED', completedAt: null, data: {} },
      skillAssessments: [],
      verifiedSkills: {}
    };
  }

  const current = database.users[uid].profile || {};
  const merged = { ...current };

  for (const [key, val] of Object.entries(updates || {})) {
    if (val !== undefined && val !== null) {
      if (Array.isArray(val)) {
        merged[key] = val.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof val === 'string') {
        merged[key] = val.trim();
      } else {
        merged[key] = val;
      }
    }
  }

  // Cross-sync complementary keys
  if (merged.name && !merged.full_name) merged.full_name = merged.name;
  if (merged.full_name && !merged.name) merged.name = merged.full_name;
  if (merged.currentLivelihood && !merged.current_occupation) merged.current_occupation = merged.currentLivelihood;
  if (merged.current_occupation && !merged.currentLivelihood) merged.currentLivelihood = merged.current_occupation;
  if (merged.aspiration && !merged.career_aspiration) merged.career_aspiration = merged.aspiration;
  if (merged.career_aspiration && !merged.aspiration) merged.aspiration = merged.career_aspiration;
  if (merged.employmentPref && !merged.employment_preference) merged.employment_preference = merged.employmentPref;
  if (merged.employment_preference && !merged.employmentPref) merged.employmentPref = merged.employment_preference;
  if (merged.district && merged.state && !merged.districtState) merged.districtState = `${merged.district}, ${merged.state}`;

  merged.updatedAt = new Date().toISOString();
  database.users[uid].profile = merged;

  // Also sync with user's voice assessment data if it exists, keeping single source of truth
  if (!database.users[uid].voiceAssessment) {
    database.users[uid].voiceAssessment = { status: 'NOT_STARTED', completedAt: null, data: {} };
  }
  const vaData = database.users[uid].voiceAssessment.data || {};
  if (merged.full_name) vaData.full_name = merged.full_name;
  if (merged.current_occupation) vaData.current_occupation = merged.current_occupation;
  if (merged.career_aspiration) vaData.career_aspiration = merged.career_aspiration;
  if (merged.employment_preference) vaData.employment_preference = merged.employment_preference;
  if (Array.isArray(merged.skills) && merged.skills.length > 0) vaData.existing_skills = merged.skills;
  if (merged.trainingAvailabilityDuration) vaData.training_availability_duration = merged.trainingAvailabilityDuration;
  if (merged.trainingSchedule) vaData.training_schedule = merged.trainingSchedule;
  database.users[uid].voiceAssessment.data = vaData;

  saveDb();
  return {
    success: true,
    profile: database.users[uid].profile
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPPORTUNITY RESERVATIONS PERSISTENCE (GENUINE BACKEND OPERATIONS)
// Replaces fabricated client-side SMS alerts with genuine recorded records
// ─────────────────────────────────────────────────────────────────────────────

function recordReservation({ userId, centerId, centerName, trade, phone }) {
  if (!database.reservations) {
    database.reservations = [];
  }

  const reservationId = `PMAJAY-RES-${Date.now().toString().slice(-6)}`;
  const record = {
    reservationId,
    userId: userId || 'anonymous',
    centerId: centerId || 'unknown',
    centerName: centerName || 'Skill Center',
    trade: trade || 'Vocational Skilling',
    phone: phone || '',
    reservedAt: new Date().toISOString(),
    status: 'CONFIRMED_DEMO'
  };

  database.reservations.push(record);
  saveDb();
  return record;
}

function getUserReservations(userId) {
  if (!database.reservations || !userId) return [];
  return database.reservations.filter(r => r.userId === userId);
}

function getAllReservations() {
  return database.reservations || [];
}

/**
 * Database Migration Abstraction Layer
 * Defines standard CRUD contracts for migrating from JSON persistence to SQLite / PostgreSQL / MongoDB.
 */
class DatabaseAdapter {
  constructor(storageType = 'json') {
    this.storageType = storageType;
  }

  async getVoiceAssessment(userId) {
    return getVoiceAssessment(userId);
  }

  async saveVoiceAssessment(userId, data, isCompleted) {
    return saveVoiceAssessment(userId, data, isCompleted);
  }

  async evaluateSkill(userId, trade, answers) {
    return evaluateAnswers(userId, trade, answers);
  }

  async saveReservation(details) {
    return recordReservation(details);
  }

  async getReservations(userId) {
    return getUserReservations(userId);
  }
}

function saveUserPathway(userId, pathwayData) {
  const uid = userId || 'beneficiary_default';
  if (!database.users[uid]) {
    database.users[uid] = {
      profile: {},
      voiceAssessment: { status: 'NOT_STARTED', completedAt: null, data: {} },
      skillAssessments: [],
      verifiedSkills: {}
    };
  }

  database.users[uid].selectedPathway = {
    ...pathwayData,
    savedAt: new Date().toISOString()
  };

  saveDb();
  return {
    success: true,
    selectedPathway: database.users[uid].selectedPathway
  };
}

function getUserPathway(userId) {
  const uid = userId || 'beneficiary_default';
  return database.users[uid]?.selectedPathway || null;
}

module.exports = {
  TRADE_RULES,
  evaluateAnswers,
  getUserAssessments,
  getUserVerifiedStatus,
  getVoiceAssessment,
  saveVoiceAssessment,
  resetVoiceAssessment,
  recordReservation,
  getUserReservations,
  getAllReservations,
  getBeneficiaryProfile,
  saveBeneficiaryProfile,
  saveUserPathway,
  getUserPathway,
  DatabaseAdapter
};


