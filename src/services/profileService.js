// Simulated Supabase/PostgreSQL service layer using localStorage
// This fully simulates async DB operations and sets up the architecture for future AI integration.

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DB_KEY_BENEFICIARIES = 'db_beneficiaries';
const DB_KEY_PROFILES = 'db_livelihood_profiles';

// --- INITIALIZE DEMO DATA (If DB is empty) ---
export const initializeDemoData = () => {
  if (!localStorage.getItem(DB_KEY_BENEFICIARIES)) {
    const demoBeneficiaries = [
      {
        id: 'ben-123',
        full_name: 'Beneficiary',
        age: 26,
        gender: 'Male',
        mobile_number: '9876543210',
        state: 'Uttar Pradesh',
        district: 'Barabanki',
        village: 'Shivpur',
        preferred_language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(DB_KEY_BENEFICIARIES, JSON.stringify(demoBeneficiaries));
  }

  if (!localStorage.getItem(DB_KEY_PROFILES)) {
    const demoProfiles = [
      {
        id: 'prof-123',
        beneficiary_id: 'ben-123',
        family_occupation: 'Farming (Wheat & Mustard)',
        current_occupation: 'Informal Laborer & Pump Assistant',
        occupation_description: 'Assisting in local farms, repairing small irrigation pumps, and general labor work around the village.',
        years_of_experience: 4,
        daily_income_min: 250,
        daily_income_max: 300,
        income_frequency: 'Daily',
        existing_skills: ['Basic Wiring', 'Pump Repair', 'Manual Farming', 'Tractor Driving'],
        traditional_skills: ['Local Crop Management'],
        interests: ['Solar Panel Installation', 'Electrician Work', 'Mechanic'],
        career_aspiration: 'Certified Electrician with stable income',
        employment_preference: 'Local Wage Employment or Apprenticeship',
        mobility_limit_km: 25,
        training_availability: 'Part-time or Weekend',
        physical_constraints: 'None',
        digital_literacy_level: 'Basic Smartphone Usage',
        education_level: '10th Pass',
        education_details: 'Passed from Govt High School, Shivpur',
        profile_completion: 0, // Will be calculated dynamically
        profile_confidence: 'Pending AI verification',
        rpl_eligible: 'Assessment pending',
        data_source: 'Manual Entry',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(DB_KEY_PROFILES, JSON.stringify(demoProfiles));
  }
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

