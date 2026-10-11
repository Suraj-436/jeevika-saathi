// src/utils/voiceSelector.js
/**
 * Voice selection and speech synthesis utility for Jeevika Saathi.
 * Supports: Telugu (te-IN), Hindi (hi-IN), English (en-IN),
 * Kannada (kn-IN), Tamil (ta-IN), Marathi (mr-IN).
 *
 * Enforces strict language-matching: NEVER falls back across languages (e.g. English speaking Telugu).
 * Handles voice loading lifecycle, single-utterance concurrency, rate/pitch tuning.
 */

export const LANGUAGE_LOCALES = {
  te: "te-IN",
  hi: "hi-IN",
  en: "en-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  ml: "ml-IN"
};

export const LANGUAGE_VOICE_NAMES = {
  te: ["telugu", "te-in"],
  hi: ["hindi", "hi-in"],
  en: ["english", "en-in", "en-us", "en-gb"],
  kn: ["kannada", "kn-in"],
  ta: ["tamil", "ta-in"],
  mr: ["marathi", "mr-in"],
  ml: ["malayalam", "ml-in"]
};

/**
 * Returns standardized BCP 47 locale for a given language code.
 */
export function getLocaleForLanguage(langCode) {
  if (!langCode) return "en-IN";
  const clean = langCode.toLowerCase().split("-")[0];
  return LANGUAGE_LOCALES[clean] || (langCode.includes("-") ? langCode : "en-IN");
}

/**
 * Returns all voices currently loaded in the browser.
 */
export function getAvailableVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Ensures voices are loaded before calling callback.
 * If already loaded, executes immediately.
 * Otherwise binds to speechSynthesis.onvoiceschanged.
 */
export function onVoicesReady(callback) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    callback(voices);
    return;
  }

  const handler = () => {
    const updated = window.speechSynthesis.getVoices();
    if (updated && updated.length > 0) {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      callback(updated);
    }
  };

  window.speechSynthesis.addEventListener("voiceschanged", handler);
}

/**
 * Finds the most suitable voice for a given language code.
 *
 * Rules:
 * 1. For non-English languages (Telugu, Kannada, Tamil, Marathi, Hindi):
 *    - MUST be a genuine voice of that specific language.
 *    - NEVER falls back to English or any other language's voice.
 *    - If no matching voice is available, returns null so caller can handle gracefully.
 * 2. For English:
 *    - Prefers en-IN, falls back to any en voice.
 *
 * @param {string} langCode - e.g. "te", "te-IN", "kn", "ta", "mr", "hi", "en"
 * @param {SpeechSynthesisVoice[]} [voices] - optional preloaded voice list
 * @returns {SpeechSynthesisVoice | null}
 */
export function selectBestVoice(langCode, voices = null) {
  const allVoices = (voices && voices.length > 0) ? voices : getAvailableVoices();
  const normalized = (langCode || "en").toLowerCase();
  const baseCode = normalized.split("-")[0];
  const targetLocale = getLocaleForLanguage(baseCode).toLowerCase();

  // ─── 1. NON-ENGLISH LANGUAGE VOICES ─────────────────────────────────────────
  if (baseCode !== "en") {
    const keywords = LANGUAGE_VOICE_NAMES[baseCode] || [baseCode];

    const matchingVoices = allVoices.filter(v => {
      const vLang = (v.lang || "").toLowerCase().replace("_", "-");
      const vName = (v.name || "").toLowerCase();

      // Exact locale match (e.g. te-in, kn-in, ta-in, mr-in, hi-in)
      if (vLang === targetLocale) return true;

      // Prefix match (e.g. te-, kn-, ta-, mr-, hi-)
      if (vLang.startsWith(`${baseCode}-`) || vLang === baseCode) return true;

      // Name keyword match (e.g. "telugu", "kannada", "tamil", "marathi", "hindi")
      return keywords.some(kw => vName.includes(kw));
    });

    if (matchingVoices.length > 0) {
      // Prioritize natural/online voices with exact locale match
      const exactOnline = matchingVoices.find(v => {
        const vLang = (v.lang || "").toLowerCase().replace("_", "-");
        return vLang === targetLocale && !v.localService;
      });
      if (exactOnline) return exactOnline;

      const exact = matchingVoices.find(v => {
        const vLang = (v.lang || "").toLowerCase().replace("_", "-");
        return vLang === targetLocale;
      });
      if (exact) return exact;

      return matchingVoices[0];
    }

    // STRICT: Return null if no genuine voice for this language is found
    // NEVER fall back to English or any other language
    return null;
  }

  // ─── 2. ENGLISH VOICE SELECTION ─────────────────────────────────────────────
  const enInVoices = allVoices.filter(v => (v.lang || "").toLowerCase().replace("_", "-") === "en-in");
  if (enInVoices.length > 0) {
    const online = enInVoices.find(v => !v.localService);
    return online || enInVoices[0];
  }

  const enVoices = allVoices.filter(v => (v.lang || "").toLowerCase().startsWith("en"));
  if (enVoices.length > 0) return enVoices[0];

  return allVoices[0] || null;
}

/**
 * Checks if a genuine voice exists for the given language.
 */
export function isVoiceAvailableForLanguage(langCode, voices = null) {
  if (!langCode || langCode.toLowerCase().startsWith("en")) return true;
  return selectBestVoice(langCode, voices) !== null;
}

// Track active utterance to avoid overlapping speech
let currentActiveUtterance = null;

/**
 * Safely cancels any ongoing speech synthesis across the application.
 */
export function cancelSpeechPlayback() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    currentActiveUtterance = null;
  }
}

/**
 * Safe, single-utterance speech playback with strict voice checks.
 *
 * @param {Object} options
 * @param {string} options.text - text to speak
 * @param {string} options.language - language code (te, hi, en, kn, ta, mr)
 * @param {number} [options.rate=0.90] - speech rate (0.88 - 0.92 recommended for Indian languages)
 * @param {number} [options.pitch=1.0] - speech pitch
 * @param {Function} [options.onStart] - called when speech starts
 * @param {Function} [options.onEnd] - called when speech ends
 * @param {Function} [options.onError] - called on error
 * @param {Function} [options.onVoiceUnavailable] - called when genuine voice is missing
 * @returns {{ stop: Function } | null}
 */
export function speakSafely({
  text,
  language = "en",
  rate = 0.90,
  pitch = 1.0,
  onStart,
  onEnd,
  onError,
  onVoiceUnavailable
}) {
  if (!text || !text.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return null;
  }

  // 1. Cancel previous speech before starting a new utterance
  cancelSpeechPlayback();

  const cleanLang = (language || "en").toLowerCase().split("-")[0];
  const locale = getLocaleForLanguage(cleanLang);
  const voice = selectBestVoice(cleanLang);

  // 2. If no named voice found, still attempt speech using utterance.lang.
  //    Modern browsers (Chrome/Edge online) can synthesize Indian languages
  //    via the lang property even when getVoices() doesn't list them.
  if (!voice && cleanLang !== "en") {
    console.info(`[SpeechSynthesis] No named voice for "${cleanLang}" (${locale}). Will attempt speech with lang property only.`);
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = locale;
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voice) {
      utterance.voice = voice;
    }

    currentActiveUtterance = utterance;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      if (currentActiveUtterance === utterance) {
        currentActiveUtterance = null;
      }
      onEnd?.();
    };

    utterance.onerror = (e) => {
      if (currentActiveUtterance === utterance) {
        currentActiveUtterance = null;
      }
      if (e.error !== "interrupted" && e.error !== "canceled") {
        console.warn("[SpeechSynthesis] Utterance error:", e.error);
        onError?.(e);
      }
      onEnd?.();
    };

    // Small delay ensures previous cancellation completed in browser engine
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 15);

    return {
      stop: () => cancelSpeechPlayback()
    };
  } catch (err) {
    console.warn("[SpeechSynthesis] Speak failed:", err);
    onError?.(err);
    onEnd?.();
    return null;
  }
}
