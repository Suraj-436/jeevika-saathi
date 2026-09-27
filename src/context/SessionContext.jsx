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
      selectedRecommendation
    });
  }, [sessionId, messages, assessmentStatus, currentStep, beneficiaryProfile, confidence, isDemoMode, selectedRecommendation]);

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

  // Full reset - called on "Start New Assessment" or by startNewSession
  const startNewSession = useCallback((demo = false) => {
    const newId = generateSessionId();
    setSessionId(newId);
    setMessages([]);
    messagesRef.current = [];
    setAssessmentStatus('idle');
    setCurrentStep('livelihood');
    setBeneficiaryProfile({ ...EMPTY_PROFILE });
    profileRef.current = { ...EMPTY_PROFILE };
    setConfidence(null);
    setIsDemoMode(demo);
    setSelectedRecommendation(null);
    clearStoredVoiceAssessment();
  }, []);

  return (
    <SessionContext.Provider value={{
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
    }}>
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
