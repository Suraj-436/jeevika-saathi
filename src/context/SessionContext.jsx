import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  getStoredSessionContext, 
  saveStoredSessionContext, 
  clearStoredVoiceAssessment 
} from '../utils/sessionManager';

// ── Empty profile shape ───────────────────────────────────────
export const EMPTY_PROFILE = {
  full_name: null,
  fullName: null,
  age: null,
  education: null,
  preferred_language: null,
  location: null,
  family_occupation: null,
  current_occupation: null,
  occupation_description: null,
  years_of_experience: null,
  existing_skills: [],
  traditional_skills: [],
  interests: [],           // areas of interest
  career_aspiration: null,
  employment_preference: null,
  mobility_limit_km: null,
  training_availability: null,          // "Available" / "Available for training"
  trainingAvailability: null,
  training_availability_duration: null, // "1 month", "2 months", "3 months", "Not decided"
  trainingAvailabilityDuration: null,
  training_schedule: null,              // "Weekends", "Evenings", "After 6 PM", "Full-time"
  trainingSchedule: null,
  constraints: null,
};

const ARRAY_FIELDS = ['existing_skills', 'traditional_skills', 'interests'];

// ── Generate a short random session ID ───────────────────────
function generateSessionId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ── Merge incoming extracted data into existing profile ───────
function mergeProfile(existing, incoming) {
  const result = { ...existing };
  for (const [k, v] of Object.entries(incoming)) {
    if (v === null || v === undefined) continue;
    if (ARRAY_FIELDS.includes(k)) {
      if (Array.isArray(v) && v.length > 0) {
        const current = Array.isArray(existing[k]) ? existing[k] : [];
        result[k] = [...new Set([...current, ...v])];
      }
    } else if (v !== '') {
      result[k] = v;
    }
  }

  // Cross-sync camelCase and snake_case keys for single source of truth
  if (result.trainingAvailabilityDuration && !result.training_availability_duration) {
    result.training_availability_duration = result.trainingAvailabilityDuration;
  } else if (result.training_availability_duration && !result.trainingAvailabilityDuration) {
    result.trainingAvailabilityDuration = result.training_availability_duration;
  }

  if (result.trainingSchedule && !result.training_schedule) {
    result.training_schedule = result.trainingSchedule;
  } else if (result.training_schedule && !result.trainingSchedule) {
    result.trainingSchedule = result.training_schedule;
  }

  if (result.trainingAvailability && !result.training_availability) {
    result.training_availability = result.trainingAvailability;
  } else if (result.training_availability && !result.trainingAvailability) {
    result.trainingAvailability = result.training_availability;
  }

  if (result.fullName && !result.full_name) {
    result.full_name = result.fullName;
  } else if (result.full_name && !result.fullName) {
    result.fullName = result.full_name;
  }

  return result;
}

import { 
  fetchVoiceAssessment, 
  saveVoiceAssessmentToBackend, 
  resetVoiceAssessmentOnBackend 
} from '../services/voiceAssessmentService';
import { fetchVerifiedSkillsStatus } from '../services/assessmentService';
import { 
  fetchBackendBeneficiaryProfile, 
  saveBackendBeneficiaryProfile 
} from '../services/profileService';

// ── Context ───────────────────────────────────────────────────
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const initialStored = getStoredSessionContext();

  const [sessionId, setSessionId] = useState(() => initialStored?.sessionId || generateSessionId());
  const [messages, setMessages] = useState(() => initialStored?.messages || []);
  const [assessmentStatus, setAssessmentStatus] = useState(() => initialStored?.assessmentStatus || 'idle');
  const [currentStep, setCurrentStep] = useState(() => initialStored?.currentStep || 'livelihood');
  const [beneficiaryProfile, setBeneficiaryProfile] = useState(() => initialStored?.beneficiaryProfile || { ...EMPTY_PROFILE });
  const [confidence, setConfidence] = useState(() => initialStored?.confidence ?? null);
  const [isDemoMode, setIsDemoMode] = useState(() => initialStored?.isDemoMode || false);
  // The recommendation the user chose on the Recommendations page via "View Livelihood Pathway"
  const [selectedRecommendation, setSelectedRecommendation] = useState(() => initialStored?.selectedRecommendation || null);

  // ─── Dual Status Systems (Voice Assessment Gate vs Skill Verification Gate) ──
  // A. Voice Assessment Status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' (Personalization Gate)
  const [voiceAssessmentStatus, setVoiceAssessmentStatus] = useState(
    () => initialStored?.voiceAssessmentStatus || 'NOT_STARTED'
  );

  // B. Skill Verification Status: 'NOT_ASSESSED' | 'IN_PROGRESS' | 'TRAINING_RECOMMENDED' | 'REASSESSMENT_REQUIRED' | 'VERIFIED' (Competency Gate)
  const [skillVerificationStatus, setSkillVerificationStatus] = useState(
    () => initialStored?.skillVerificationStatus || 'NOT_ASSESSED'
  );
  const [verifiedTrade, setVerifiedTrade] = useState(
    () => initialStored?.verifiedTrade || null
  );

  // Refs so callbacks always see latest state without stale closures
  const messagesRef = useRef(initialStored?.messages || []);
  const profileRef = useRef(initialStored?.beneficiaryProfile || { ...EMPTY_PROFILE });

  // Sync state to sessionStorage whenever key properties update
  useEffect(() => {
    saveStoredSessionContext({
      sessionId,
      messages,
      assessmentStatus,
      currentStep,
      beneficiaryProfile,
      confidence,
      isDemoMode,
      selectedRecommendation,
      voiceAssessmentStatus,
      skillVerificationStatus,
      verifiedTrade
    });
  }, [
    sessionId, messages, assessmentStatus, currentStep, 
    beneficiaryProfile, confidence, isDemoMode, selectedRecommendation,
    voiceAssessmentStatus, skillVerificationStatus, verifiedTrade
  ]);

  const resolveUserId = useCallback(() => {
    if (beneficiaryProfile?.beneficiary_id) return beneficiaryProfile.beneficiary_id;
    if (beneficiaryProfile?.userId) return beneficiaryProfile.userId;
    if (beneficiaryProfile?.id) return beneficiaryProfile.id;
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('jeevika_user_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.userId || parsed.id) return parsed.userId || parsed.id;
        } catch (e) {}
      }
      const phone = sessionStorage.getItem('user_phone');
      if (phone) return `ben_${phone}`;
    }
    return 'beneficiary_guest';
  }, [beneficiaryProfile?.beneficiary_id, beneficiaryProfile?.userId, beneficiaryProfile?.id]);

  const syncedUserIdRef = useRef(null);

  const syncUserSession = useCallback(async (forcedUid) => {
    const uid = forcedUid || resolveUserId();
    syncedUserIdRef.current = uid;
    try {
      const [va, skills, remoteProfile] = await Promise.all([
        fetchVoiceAssessment(uid),
        fetchVerifiedSkillsStatus(uid),
        fetchBackendBeneficiaryProfile(uid)
      ]);

      if (remoteProfile && Object.keys(remoteProfile).length > 0) {
        setBeneficiaryProfile(prev => ({ ...prev, ...remoteProfile }));
        profileRef.current = { ...profileRef.current, ...remoteProfile };
      }

      if (va && va.status) {
        setVoiceAssessmentStatus(va.status);
        if (va.status === 'COMPLETED') {
          setAssessmentStatus('completed');
          if (va.data && Object.keys(va.data).length > 0) {
            setBeneficiaryProfile(prev => mergeProfile(prev, va.data));
          }
        } else {
          setAssessmentStatus(va.status === 'IN_PROGRESS' ? 'in_progress' : 'idle');
        }
      } else {
        setVoiceAssessmentStatus('NOT_STARTED');
        setAssessmentStatus('idle');
      }

      if (skills) {
        const verifiedEntry = Object.entries(skills).find(([, v]) => v.status === 'VERIFIED');
        if (verifiedEntry) {
          setSkillVerificationStatus('VERIFIED');
          setVerifiedTrade(verifiedEntry[0]);
        } else {
          const anyAttempt = Object.entries(skills)[0];
          setSkillVerificationStatus(anyAttempt ? (anyAttempt[1].status || 'TRAINING_RECOMMENDED') : 'NOT_ASSESSED');
        }
      }

      return { va, skills, remoteProfile };
    } catch (e) {
      console.warn('[SessionContext] Could not sync backend status:', e);
      return null;
    }
  }, [resolveUserId]);

  // Sync with Backend on Startup (Backend is the Single Source of Truth)
  useEffect(() => {
    let isMounted = true;
    const uid = resolveUserId();

    // Prevent infinite refetch loop when updating profile
    if (syncedUserIdRef.current === uid) {
      return;
    }
    syncUserSession(uid);
    return () => { isMounted = false; };
  }, [resolveUserId, syncUserSession]);

  const addMessage = useCallback((msg) => {
    setMessages(prev => {
      const next = [...prev, msg];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const addMessages = useCallback((msgs) => {
    setMessages(prev => {
      const next = [...prev, ...msgs];
      messagesRef.current = next;
      return next;
    });
  }, []);

  const updateProfile = useCallback((extracted) => {
    setBeneficiaryProfile(prev => {
      const merged = mergeProfile(prev, extracted);
      profileRef.current = merged;
      return merged;
    });
  }, []);

  // Update and save beneficiary profile directly
  const updateBeneficiaryProfile = useCallback(async (newProfileData) => {
    const uid = resolveUserId();
    
    // Update local state immediately
    setBeneficiaryProfile(prev => {
      const updated = { ...prev, ...newProfileData };
      profileRef.current = updated;
      return updated;
    });

    // Update sessionStorage profile if exists
    try {
      if (typeof sessionStorage !== 'undefined') {
        const storedStr = sessionStorage.getItem('jeevika_user_profile');
        const stored = storedStr ? JSON.parse(storedStr) : {};
        sessionStorage.setItem('jeevika_user_profile', JSON.stringify({ ...stored, ...newProfileData }));
      }
    } catch (err) {
      console.warn('[SessionContext] Error updating sessionStorage:', err);
    }

    // Persist to backend database
    try {
      const result = await saveBackendBeneficiaryProfile(uid, newProfileData);
      if (result) {
        setBeneficiaryProfile(prev => ({ ...prev, ...result }));
        profileRef.current = { ...profileRef.current, ...result };
      }
      return result;
    } catch (err) {
      console.warn('[SessionContext] Error saving profile to backend:', err);
      return null;
    }
  }, [resolveUserId]);

  // Mark Voice Assessment Completed securely on backend
  const markVoiceAssessmentCompleted = useCallback(async (extractedData) => {
    const uid = resolveUserId();
    const profileToSave = extractedData || profileRef.current;
    
    // Save to backend database as source of truth
    const result = await saveVoiceAssessmentToBackend(uid, profileToSave, true);
    
    setVoiceAssessmentStatus(result.status || 'COMPLETED');
    setAssessmentStatus('completed');
    if (extractedData) {
      updateProfile(extractedData);
    }
    return result;
  }, [resolveUserId, updateProfile]);

  // Full reset - called on "Start New Assessment" or by startNewSession
  const startNewSession = useCallback((demo = false) => {
    const newId = generateSessionId();
    const uid = resolveUserId();
    setSessionId(newId);
    setMessages([]);
    messagesRef.current = [];
    setAssessmentStatus('idle');
    setVoiceAssessmentStatus('NOT_STARTED');
    setCurrentStep('livelihood');
    setBeneficiaryProfile({ ...EMPTY_PROFILE });
    profileRef.current = { ...EMPTY_PROFILE };
    setConfidence(null);
    setIsDemoMode(demo);
    setSelectedRecommendation(null);
    clearStoredVoiceAssessment();
    resetVoiceAssessmentOnBackend(uid);
  }, [resolveUserId]);

  const clearSession = useCallback(() => {
    setMessages([]);
    messagesRef.current = [];
    setAssessmentStatus('idle');
    setVoiceAssessmentStatus('NOT_STARTED');
    setCurrentStep('livelihood');
    setBeneficiaryProfile({ ...EMPTY_PROFILE });
    profileRef.current = { ...EMPTY_PROFILE };
    setConfidence(null);
    setSelectedRecommendation(null);
    setSkillVerificationStatus('NOT_ASSESSED');
    setVerifiedTrade(null);
    syncedUserIdRef.current = null;
    clearStoredVoiceAssessment();
  }, []);

  const retakeVoiceAssessment = useCallback(async () => {
    const uid = resolveUserId();
    setVoiceAssessmentStatus('NOT_STARTED');
    setAssessmentStatus('idle');
    setMessages([]);
    messagesRef.current = [];
    clearStoredVoiceAssessment();
    try {
      await resetVoiceAssessmentOnBackend(uid);
    } catch (err) {
      console.warn('[SessionContext] Failed to reset voice assessment on backend:', err);
    }
  }, [resolveUserId]);

  const isVoiceAssessmentCompleted = voiceAssessmentStatus === 'COMPLETED';

  const contextValue = React.useMemo(() => ({
    // Identity
    sessionId,
    isDemoMode,

    // Conversation
    messages,
    messagesRef,
    addMessage,
    addMessages,
    setMessages,

    // Assessment lifecycle
    assessmentStatus,
    setAssessmentStatus,
    currentStep,
    setCurrentStep,

    // Voice Assessment Personalization Gate
    voiceAssessmentStatus,
    setVoiceAssessmentStatus,
    isVoiceAssessmentCompleted,
    markVoiceAssessmentCompleted,

    // Skill Verification Competency Gate
    skillVerificationStatus,
    setSkillVerificationStatus,
    verifiedTrade,
    setVerifiedTrade,

    // Profile
    beneficiaryProfile,
    profileRef,
    updateProfile,
    confidence,
    setConfidence,

    // Selected recommendation (from Recommendations page)
    selectedRecommendation,
    setSelectedRecommendation,

    // Actions
    startNewSession,
    setIsDemoMode,
    updateBeneficiaryProfile,
    resolveUserId,
    syncUserSession,
    clearSession,
    retakeVoiceAssessment,
  }), [
    sessionId,
    isDemoMode,
    messages,
    addMessage,
    addMessages,
    setMessages,
    assessmentStatus,
    setAssessmentStatus,
    currentStep,
    setCurrentStep,
    voiceAssessmentStatus,
    setVoiceAssessmentStatus,
    isVoiceAssessmentCompleted,
    markVoiceAssessmentCompleted,
    skillVerificationStatus,
    setSkillVerificationStatus,
    verifiedTrade,
    setVerifiedTrade,
    beneficiaryProfile,
    updateProfile,
    confidence,
    setConfidence,
    selectedRecommendation,
    setSelectedRecommendation,
    startNewSession,
    setIsDemoMode,
    updateBeneficiaryProfile,
    resolveUserId,
    syncUserSession,
    clearSession,
    retakeVoiceAssessment,
  ]);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}

// ── Field detection helper ────────────────────────────────────
export function isFieldDetected(profile, key) {
  const v = profile[key];
  return v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== '');
}

// ── Format a profile field for display ───────────────────────
export function formatFieldValue(key, value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null;
  if (key === 'mobility_limit_km') return `${value} km`;
  return String(value);
}

// ── Count filled required steps ───────────────────────────────
export function countFilledSteps(profile, requiredSteps) {
  return requiredSteps.filter(k => isFieldDetected(profile, k)).length;
}
