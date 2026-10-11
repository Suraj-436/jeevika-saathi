// src/services/matchingService.js
/**
 * Frontend Service for Dataset-Driven AI Livelihood Matching Engine
 * Connects with NIELIT/NSQF verified dataset endpoints on the backend.
 */

const API_BASE = '/api/matching';

/**
 * Fetch personalized recommendations for a beneficiary from verified dataset
 */
export async function fetchPersonalizedRecommendations(userId) {
  try {
    const res = await fetch(`${API_BASE}/recommendations/${encodeURIComponent(userId || 'beneficiary_default')}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not fetch backend recommendations:', err.message);
    return null;
  }
}

let cachedOccupations = null;
let cachedDefaultCourses = null;

/**
 * Fetch verified course catalog with optional search & filters
 */
export async function fetchCourseCatalog(params = {}) {
  const isDefault = Object.keys(params).length === 0;
  if (isDefault && cachedDefaultCourses) {
    return cachedDefaultCourses;
  }
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/courses?${query}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (isDefault && data && data.success !== false) {
      cachedDefaultCourses = data;
    }
    return data;
  } catch (err) {
    console.error('[MatchingService] Failed to fetch courses:', err);
    return { success: false, courses: [] };
  }
}

/**
 * Fetch verified occupation catalog
 */
export async function fetchOccupations() {
  if (cachedOccupations) {
    return cachedOccupations;
  }
  try {
    const res = await fetch(`${API_BASE}/occupations`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (data && data.success !== false) {
      cachedOccupations = data;
    }
    return data;
  } catch (err) {
    console.error('[MatchingService] Failed to fetch occupations:', err);
    return { success: false, occupations: [] };
  }
}

/**
 * Save user's selected livelihood pathway
 */
export async function saveSelectedPathway(userId, pathway) {
  try {
    const res = await fetch(`${API_BASE}/pathway/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId || 'beneficiary_default', pathway })
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('[MatchingService] Failed to save pathway selection:', err);
    return { success: false };
  }
}

/**
 * Fetch user's saved pathway
 */
export async function fetchUserPathway(userId) {
  try {
    const res = await fetch(`${API_BASE}/pathway/${encodeURIComponent(userId || 'beneficiary_default')}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not fetch user pathway:', err);
    return null;
  }
}

/**
 * Fetch dynamic roadmap milestones for user
 */
export async function fetchDynamicRoadmap(userId) {
  try {
    const res = await fetch(`${API_BASE}/roadmap/${encodeURIComponent(userId || 'beneficiary_default')}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not fetch dynamic roadmap:', err);
    return null;
  }
}

/**
 * Fetch available career interests taxonomy from backend
 */
export async function fetchSkillInterests() {
  try {
    const res = await fetch('/api/skills/interests');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not fetch skill interests:', err);
    return { success: false, interests: [] };
  }
}

/**
 * Fetch dataset-driven course recommendations by user interest & filters
 * @param {Object} params - { interest, education, nsqfLevel, maxDurationWeeks, includeLegacy }
 */
export async function fetchDatasetSkillRecommendations(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.interest) query.append('interest', params.interest);
    if (params.education) query.append('education', params.education);
    if (params.nsqfLevel) query.append('nsqfLevel', params.nsqfLevel);
    if (params.maxDurationWeeks) query.append('maxDurationWeeks', params.maxDurationWeeks);
    if (params.includeLegacy !== undefined) query.append('includeLegacy', String(params.includeLegacy));

    const res = await fetch(`/api/skills/recommendations?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not fetch skill recommendations:', err);
    return { success: false, recommendations: [], error: err.message };
  }
}

/**
 * Search NIELIT NSQF dataset records by sector, interest, role, or freeform query
 * @param {Object} params - { sector, interest, role, query, education, nsqfLevel, maxDurationWeeks, includeLegacy, page, limit }
 */
export async function searchNSQFDataset(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.sector) query.append('sector', params.sector);
    if (params.interest) query.append('interest', params.interest);
    if (params.role) query.append('role', params.role);
    if (params.query || params.q) query.append('q', params.query || params.q);
    if (params.education) query.append('education', params.education);
    if (params.nsqfLevel) query.append('nsqfLevel', String(params.nsqfLevel));
    if (params.maxDurationWeeks) query.append('maxDurationWeeks', String(params.maxDurationWeeks));
    if (params.includeLegacy !== undefined) query.append('includeLegacy', String(params.includeLegacy));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`/api/nsqf/search?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not search NSQF dataset:', err);
    return { success: false, records: [], total: 0, error: err.message };
  }
}

/**
 * Fetch NSQF dataset overview and taxonomy
 */
export async function fetchNSQFOverview() {
  try {
    const res = await fetch('/api/nsqf/overview');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MatchingService] Could not fetch NSQF overview:', err);
    return { success: false };
  }
}


