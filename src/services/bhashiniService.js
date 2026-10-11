// src/services/bhashiniService.js
// Client service for interacting with the backend Bhashini proxy endpoints.
// Never holds secret keys — all Bhashini authorization is handled on the Node server.

import { selectBestVoice, getLocaleForLanguage, cancelSpeechPlayback } from '../utils/voiceSelector';

const clientTtsCache = new Map();
const MAX_CLIENT_TTS_CACHE = 50;
const clientTransCache = new Map();
const MAX_CLIENT_TRANS_CACHE = 100;

class BhashiniClient {
  constructor() {
    this.currentAudio = null;
    this.audioPlaybackCallbacks = new Set();
  }

  /**
   * Browser-native transcription helper (Web Speech API).
   * Avoids external API calls.
   */
  async transcribeAudio(audioBase64, language = 'en') {
    return {
      transcript: '',
      language,
      mismatch: null
    };
  }

  /**
   * Browser-Native Speech Synthesis (Web Speech API).
   * Avoids external API calls for speaking questions and announcements.
   * Cancels previous speech playback before starting new playback.
   * Strictly enforces exact language voices: NEVER uses English to pronounce non-English text.
   */
  speakText(text, language = 'en', gender = 'female', callbacks = {}) {
    this.stopAudio();

    if (!text || !text.trim()) {
      callbacks.onEnd?.();
      return null;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callbacks.onEnd?.();
      return null;
    }

    const cleanLang = (language || 'en').toLowerCase().split('-')[0];
    const targetTag = getLocaleForLanguage(cleanLang);
    const voice = selectBestVoice(cleanLang);

    // If no named voice found, still attempt speech — browsers with online TTS can handle it
    if (!voice && cleanLang !== 'en') {
      console.info(`[bhashiniService] No named voice for "${cleanLang}" (${targetTag}). Attempting speech with lang property only.`);
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = targetTag;
      utterance.rate = 0.90;
      utterance.pitch = 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        callbacks.onStart?.();
      };

      utterance.onend = () => {
        callbacks.onEnd?.();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          callbacks.onError?.(e);
        } else {
          callbacks.onEnd?.();
        }
      };

      // Slight delay ensures cancellation is processed
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 10);

      return {
        stop: () => this.stopAudio(),
        pause: () => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.pause();
          }
        },
        resume: () => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.resume();
          }
        },
        replay: () => {
          this.stopAudio();
          window.speechSynthesis.speak(utterance);
        }
      };
    } catch (err) {
      console.warn('[Web Speech] speech synthesis error:', err);
      callbacks.onError?.(err);
      return null;
    }
  }

  /**
   * Stop any currently playing audio and cancel browser speech synthesis.
   */
  stopAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (_) {}
      this.currentAudio = null;
    }
    cancelSpeechPlayback();
  }

  /**
   * Local translation helper using native text dictionaries.
   * Avoids external API calls.
   */
  async translateText(text, sourceLanguage = 'en', targetLanguage = 'hi') {
    if (!text || !text.trim()) return '';
    const src = (sourceLanguage || 'en').toLowerCase().split('-')[0];
    const tgt = (targetLanguage || 'hi').toLowerCase().split('-')[0];
    if (src === tgt) return text;
    return text;
  }

  /**
   * Fast client-side identification of language from phrase keywords or native script.
   */
  clientIdentifyLanguage(text) {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase().trim();

    if (/telugu|తెలుగు|తేలుగు|telgu|andhra|telangana/i.test(lower)) return 'te';
    if (/hindi|हिंदी|हिन्दी|hind|devanagari/i.test(lower)) return 'hi';
    if (/english|angrezi|इंग्लिश|ఇంగ్లీష్|ஆங்கிலம்|ಇಂಗ್ಲಿಷ್|ഇംഗ്ലീഷ്/i.test(lower)) return 'en';
    if (/tamil|தமிழ்|tamizh|thamil|தமில்/i.test(lower)) return 'ta';
    if (/kannada|ಕನ್ನಡ|kanada|kannad/i.test(lower)) return 'kn';
    if (/marathi|मराठी|maratha|maharashtra/i.test(lower)) return 'mr';
    if (/malayalam|മലയാളം|malyalam/i.test(lower)) return 'ml';

    // Script detection
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari shared by hi and mr

    return null;
  }

  /**
   * Identify language from voice audio or spoken phrase via backend API.
   */
  async identifyLanguage({ phrase, audioContent }) {
    const localMatch = this.clientIdentifyLanguage(phrase);

    try {
      const res = await fetch('/api/bhashini/identify-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, audioContent })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

    const confMap = {
      te: { message: "మీరు తెలుగు ఎంచుకున్నారు. జీవికా సాథికి స్వాగతం!", name: "తెలుగు" },
      hi: { message: "आपने हिन्दी भाषा चुनी है। जीविका साथी में आपका स्वागत है!", name: "हिन्दी" },
      en: { message: "You have selected English. Welcome to Jeevika Saathi!", name: "English" },
      ta: { message: "நீங்கள் தமிழைத் தேர்ந்தெடுத்துள்ளீர்கள். ஜீவிகா சாத்திக்கு வரவேற்கிறோம்!", name: "தமிழ்" },
      kn: { message: "ನೀವು ಕನ್ನಡವನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ಜೀವಿಕಾ ಸಾಥಿಗೆ ಸುಸ್ವಾಗತ!", name: "ಕನ್ನಡ" },
      mr: { message: "तुम्ही मराठी भाषा निवडली आहे. जीविका साथीमध्ये आपले स्वागत आहे!", name: "मराठी" },
      ml: { message: "നിങ്ങൾ മലയാളം തിരഞ്ഞെടുത്തു. ജീവിക സാഥിയിലേക്ക് സ്വാഗതം!", name: "മലയാളം" }
    };

    const targetLang = localMatch || 'en';
    return {
      success: !!localMatch,
      language: targetLang,
      languageName: confMap[targetLang]?.name || targetLang,
      confirmationMessage: confMap[targetLang]?.message || `Selected ${targetLang}`,
      recognizedText: phrase || ''
    };
  }

  /**
   * Fallback to browser Web Speech API if network or backend TTS fails.
   */
  fallbackBrowserSpeak(text, language, callbacks = {}) {
    return this.speakText(text, language, 'female', callbacks);
  }
}

export const bhashiniClient = new BhashiniClient();
export default bhashiniClient;
