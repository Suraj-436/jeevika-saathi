const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DB_KEY_BENEFICIARIES = 'db_beneficiaries';
const DB_KEY_PROFILES = 'db_livelihood_profiles';

const getAuthHeaders = () => {
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jeevika_session_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Fetch beneficiary profile from the backend server.
 */
export const fetchBackendBeneficiaryProfile = async (userId) => {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/beneficiary/profile/${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      console.warn(`[ProfileService] Backend returned ${res.status} for profile fetch.`);
      return null;
    }
    const data = await res.json();
    return data.profile || null;
  } catch (err) {
    console.warn('[ProfileService] Backend profile fetch failed:', err.message);
    return null;
  }
};

/**
 * Persist beneficiary profile to the backend server.
 */
export const saveBackendBeneficiaryProfile = async (userId, profileData) => {
  if (!userId || !profileData) return null;
  try {
    const res = await fetch('/api/beneficiary/profile/save', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, profileData })
    });
    if (!res.ok) {
      console.warn(`[ProfileService] Backend returned ${res.status} for profile save.`);
      return null;
    }
    const data = await res.json();
    return data.profile || null;
  } catch (err) {
    console.warn('[ProfileService] Backend profile save failed:', err.message);
    return null;
  }
};

// --- INITIALIZE DEMO DATA (If DB is empty, neutral schema only) ---
export const initializeDemoData = () => {
  // No-op to avoid polluting user environment with fictional personas
};

// --- BENEFICIARIES API ---

export const getBeneficiaryProfile = async (beneficiaryId) => {
  await delay(400); // Simulate network latency
  const data = JSON.parse(localStorage.getItem(DB_KEY_BENEFICIARIES) || '[]');
  return data.find(b => b.id === beneficiaryId) || null;
};

export const updateBeneficiaryProfile = async (beneficiaryId, updates) => {
  await delay(500);
  const data = JSON.parse(localStorage.getItem(DB_KEY_BENEFICIARIES) || '[]');
  const index = data.findIndex(b => b.id === beneficiaryId);
  if (index === -1) throw new Error('Beneficiary not found');
  
  data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(DB_KEY_BENEFICIARIES, JSON.stringify(data));
  return data[index];
};

// --- LIVELIHOOD PROFILES API ---

export const getLivelihoodProfile = async (beneficiaryId) => {
  await delay(400);
  const data = JSON.parse(localStorage.getItem(DB_KEY_PROFILES) || '[]');
  return data.find(p => p.beneficiary_id === beneficiaryId) || null;
};

export const updateLivelihoodProfile = async (beneficiaryId, updates) => {
  await delay(500);
  let data = JSON.parse(localStorage.getItem(DB_KEY_PROFILES) || '[]');
  let index = data.findIndex(p => p.beneficiary_id === beneficiaryId);
  
  let profile;
  if (index === -1) {
    // Create new profile if none exists
    profile = {
      id: `prof-${Date.now()}`,
      beneficiary_id: beneficiaryId,
      ...updates,
      data_source: updates.data_source || 'Manual Entry',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.push(profile);
  } else {
    // Update existing
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
    profile = data[index];
  }
  
  localStorage.setItem(DB_KEY_PROFILES, JSON.stringify(data));
  return profile;
};

// --- UTILITY ---

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  
  // Define required fields for a "complete" profile
  const requiredFields = [
    'education_level',
    'current_occupation',
    'existing_skills',
    'interests',
    'career_aspiration',
    'employment_preference',
    'mobility_limit_km',
    'daily_income_min'
  ];
  
  let filled = 0;
  requiredFields.forEach(field => {
    const val = profile[field];
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val) && val.length > 0) {
        filled++;
      } else if (!Array.isArray(val)) {
        filled++;
      }
    }
  });
  
  return Math.round((filled / requiredFields.length) * 100);
};

/**
 * Merge AI-extracted data from voice assessment into the livelihood profile.
 * - Only updates fields that the AI actually extracted (non-null / non-empty)
 * - Merges arrays (skills, interests) rather than overwriting
 * - Sets data_source to 'Voice Assessment' for fields updated via AI
 * - Does NOT overwrite manually entered fields with null
 */
export const upsertLivelihoodFromVoice = async (beneficiaryId, extractedData) => {
  await delay(200);
  let data = JSON.parse(localStorage.getItem(DB_KEY_PROFILES) || '[]');
  let index = data.findIndex(p => p.beneficiary_id === beneficiaryId);

  const now = new Date().toISOString();
  const arrayFields = ['existing_skills', 'traditional_skills', 'interests'];

  if (index === -1) {
    // No profile yet — create one from extracted data
    const profile = {
      id: `prof-${Date.now()}`,
      beneficiary_id: beneficiaryId,
      ...extractedData,
      data_source: 'Voice Assessment',
      profile_confidence: 'Voice-extracted — pending review',
      rpl_eligible: 'Assessment pending',
      created_at: now,
      updated_at: now
    };
    data.push(profile);
    localStorage.setItem(DB_KEY_PROFILES, JSON.stringify(data));
    return profile;
  }

  // Merge: only update fields that have actual extracted values
  const existing = { ...data[index] };

  for (const [key, value] of Object.entries(extractedData)) {
    if (value === null || value === undefined) continue;
    if (arrayFields.includes(key)) {
      // Merge arrays without duplicates
      if (Array.isArray(value) && value.length > 0) {
        const current = Array.isArray(existing[key]) ? existing[key] : [];
        const merged = [...new Set([...current, ...value])];
        existing[key] = merged;
      }
    } else if (value !== '') {
      existing[key] = value;
    }
  }

  existing.data_source = 'Voice Assessment';
  existing.updated_at = now;
  data[index] = existing;

  localStorage.setItem(DB_KEY_PROFILES, JSON.stringify(data));
  return data[index];
};

