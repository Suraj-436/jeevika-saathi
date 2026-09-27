// src/utils/sessionManager.js
/**
 * Session persistence manager for Jeevika Saathi.
 *
 * Rules:
 * 1. BROWSER REFRESH (F5, Ctrl+R, reload):
 *    - Keeps all session data (auth, route, assessment, profile, roadmap).
 *    - Uses sessionStorage so it survives refresh within the same browser tab.
 * 2. DEV SERVER RESTART (npm run dev):
 *    - A new unique SERVER_INSTANCE_ID is generated when Vite starts up.
 *    - If stored server ID !== current server ID, session is completely reset.
 * 3. CLOSING TAB/BROWSER:
 *    - sessionStorage naturally clears when tab is closed.
 * 4. LOGOUT:
 *    - Explicitly clears all session data and redirects to /login.
 * 5. NEW ASSESSMENT:
 *    - Resets only assessment-specific data, keeps auth and user profile.
 */

const SERVER_ID_KEY = "DEV_SERVER_INSTANCE_ID";
const AUTH_PROFILE_KEY = "jeevika_auth_profile";
const SESSION_DATA_KEY = "jeevika_session_context";
const VOICE_ASSESSMENT_KEY = "jeevika_voice_assessment_state";
const LAST_ROUTE_KEY = "jeevika_active_route";

// Read compile-time injected server instance ID from Vite define
function getCurrentServerInstanceId() {
  if (typeof __DEV_SERVER_INSTANCE_ID__ !== "undefined") {
    return __DEV_SERVER_INSTANCE_ID__;
  }
  return "dev_default_session";
}

/**
 * Validates whether the active browser session matches the current running server instance.
 * If server was restarted, clears old prototype session and initializes fresh instance ID.
 */
export function validateServerSession() {
  if (typeof window === "undefined" || !window.sessionStorage) return false;

  const currentId = getCurrentServerInstanceId();
  const storedId = sessionStorage.getItem(SERVER_ID_KEY);

  if (!storedId) {
    // Fresh session start
    sessionStorage.setItem(SERVER_ID_KEY, currentId);
    return true;
  }

  if (storedId !== currentId) {
    // Dev server was restarted! Clear all old prototype session state
    console.info("[SessionManager] Development server restart detected. Resetting prototype session.");
    sessionStorage.clear();
    sessionStorage.setItem(SERVER_ID_KEY, currentId);
    return false;
  }

  return true;
}

// ── Auth User Profile ──────────────────────────────────────────
export function getStoredUserProfile() {
  if (!validateServerSession()) return null;
  try {
    const raw = sessionStorage.getItem(AUTH_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("[SessionManager] Failed to read stored user profile:", e);
    return null;
  }
}

export function saveStoredUserProfile(profile) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  validateServerSession();
  try {
    if (profile) {
      sessionStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
    } else {
      sessionStorage.removeItem(AUTH_PROFILE_KEY);
    }
  } catch (e) {
    console.warn("[SessionManager] Failed to save user profile:", e);
  }
}

// ── Session Context (Beneficiary Profile, Answers, Progress) ───
export function getStoredSessionContext() {
  if (!validateServerSession()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("[SessionManager] Failed to read session context:", e);
    return null;
  }
}

export function saveStoredSessionContext(data) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  validateServerSession();
  try {
    if (data) {
      sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(SESSION_DATA_KEY);
    }
  } catch (e) {
    console.warn("[SessionManager] Failed to save session context:", e);
  }
}

// ── Voice Assessment Component State ───────────────────────────
export function getStoredVoiceAssessment() {
  if (!validateServerSession()) return null;
  try {
    const raw = sessionStorage.getItem(VOICE_ASSESSMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("[SessionManager] Failed to read voice assessment:", e);
    return null;
  }
}

export function saveStoredVoiceAssessment(state) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  validateServerSession();
  try {
    if (state) {
      sessionStorage.setItem(VOICE_ASSESSMENT_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(VOICE_ASSESSMENT_KEY);
    }
  } catch (e) {
    console.warn("[SessionManager] Failed to save voice assessment:", e);
  }
}

export function clearStoredVoiceAssessment() {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    sessionStorage.removeItem(VOICE_ASSESSMENT_KEY);
  } catch (e) {}
}

// ── Route Tracking ─────────────────────────────────────────────
export function getStoredRoute() {
  if (!validateServerSession()) return null;
  try {
    return sessionStorage.getItem(LAST_ROUTE_KEY);
  } catch (e) {
    return null;
  }
}

export function saveStoredRoute(route) {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  if (!route || route === "/login") return;
  try {
    sessionStorage.setItem(LAST_ROUTE_KEY, route);
  } catch (e) {}
}

// ── Full Logout Cleanup ────────────────────────────────────────
export function clearAllSession() {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const currentId = sessionStorage.getItem(SERVER_ID_KEY) || getCurrentServerInstanceId();
    sessionStorage.clear();
    sessionStorage.setItem(SERVER_ID_KEY, currentId);
  } catch (e) {
    console.warn("[SessionManager] Clear error:", e);
  }
}
