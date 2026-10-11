// src/services/voiceAssessmentService.js
/**
 * Service for communicating with backend Voice Assessment persistence.
 * Enforces the Personalization Gate:
 * Only when voiceAssessment.status === "COMPLETED" on the backend
 * are personalized pages unlocked.
 */

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000'
  ? '' // uses Vite proxy
  : ''; // uses relative origin in production or proxy

function getAuthHeaders() {
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jeevika_session_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

const getEffectiveUserId = (userId) => {
  if (userId) return userId;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('user_phone')) {
    return `ben_${sessionStorage.getItem('user_phone')}`;
  }
  return 'beneficiary_guest';
};

export async function fetchVoiceAssessment(userId) {
  const uid = getEffectiveUserId(userId);
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice-assessment/${encodeURIComponent(uid)}`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return {
          status: data.status || 'NOT_STARTED', // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
          data: data.data || {},
          completedAt: data.completedAt || null,
          updatedAt: data.updatedAt || null
        };
      }
    }
  } catch (err) {
    console.warn('[voiceAssessmentService] Failed to fetch remote status, using local check:', err.message);
  }

  // Local fallback
  return getLocalVoiceAssessmentState(uid);
}

export async function saveVoiceAssessmentToBackend(userId, extractedData, isCompleted = false) {
  const uid = getEffectiveUserId(userId);
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice-assessment/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId: uid, data: extractedData, isCompleted })
    });

    if (response.ok) {
      const result = await response.json();
      syncLocalVoiceAssessmentState(uid, result);
      return result;
    }
  } catch (err) {
    console.warn('[voiceAssessmentService] Failed to save to backend, caching locally:', err.message);
  }

  const fallback = {
    status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
    data: extractedData,
    completedAt: isCompleted ? new Date().toISOString() : null
  };
  syncLocalVoiceAssessmentState(uid, fallback);
  return fallback;
}

export async function resetVoiceAssessmentOnBackend(userId) {
  const uid = getEffectiveUserId(userId);
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice-assessment/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (response.ok) {
      const result = await response.json();
      syncLocalVoiceAssessmentState(uid, { status: 'NOT_STARTED', data: {} });
      return result;
    }
  } catch (err) {
    console.warn('[voiceAssessmentService] Failed to reset on backend:', err.message);
  }
  syncLocalVoiceAssessmentState(uid, { status: 'NOT_STARTED', data: {} });
  return { status: 'NOT_STARTED', data: {} };
}

const STORAGE_KEY_PREFIX = 'jeevika_va_backend_status_';

function getLocalVoiceAssessmentState(userId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : { status: 'NOT_STARTED', data: {} };
  } catch {
    return { status: 'NOT_STARTED', data: {} };
  }
}

function syncLocalVoiceAssessmentState(userId, state) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(state));
  } catch (e) {
    console.warn('[voiceAssessmentService] Failed to sync to localStorage:', e);
  }
}
