// server/bhashiniService.cjs
// Server-side integration with Government of India's Bhashini (ULCA / Dhruva) API
// Kept strictly on the backend — NEVER exposes credentials to the browser/client.

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const https = require('https');

const BHASHINI_ENDPOINT = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

// Supported Language Registry for Jeevika Saathi
const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', native: 'English', bhashiniCode: 'en', asr: true, tts: true, translation: true },
  hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी', bhashiniCode: 'hi', asr: true, tts: true, translation: true },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు', bhashiniCode: 'te', asr: true, tts: true, translation: true },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்', bhashiniCode: 'ta', asr: true, tts: true, translation: true },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', bhashiniCode: 'kn', asr: true, tts: true, translation: true },
  mr: { code: 'mr', name: 'Marathi', native: 'मराठी', bhashiniCode: 'mr', asr: true, tts: true, translation: true },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം', bhashiniCode: 'ml', asr: true, tts: true, translation: true }
};

// Canonical mapping of multilingual terms to standard English identifiers for the matching engine
const CANONICAL_OCCUPATIONS = {
  // Electrician / Electronics
  'इलेक्ट्रीशियन': 'Electrician',
  'बिजली मिस्त्री': 'Electrician',
  'विद्युत': 'Electrician',
  'ఎలక్ట్రీషియన్': 'Electrician',
  'విద్యుత్ పని': 'Electrician',
  'மின்சார வல்லுநர்': 'Electrician',
  'ಎಲೆಕ್ಟ್ರಿಷಿಯನ್': 'Electrician',
  'ഇലക്ട്രീഷ്യൻ': 'Electrician',
  'electrician': 'Electrician',
  'electrical': 'Electrician',

  // Tailor / Apparel
  'दर्जी': 'Tailor',
  'सिलाई': 'Tailor',
  'सिलाइ': 'Tailor',
  'दुपट्टा': 'Tailor',
  'కట్టర్': 'Tailor',
  'టైలర్': 'Tailor',
  'కుట్టుపని': 'Tailor',
  'தையல்காரர்': 'Tailor',
  'தையல்': 'Tailor',
  'ದರ್ಜಿ': 'Tailor',
  'ಹೊಲಿಗೆ': 'Tailor',
  'തയ്യൽക്കാരൻ': 'Tailor',
  'തയ്യൽ': 'Tailor',
  'tailor': 'Tailor',
  'tailoring': 'Tailor',
  'sewing': 'Tailor',

  // Carpenter
  'बढ़ई': 'Carpenter',
  'लकड़ी का काम': 'Carpenter',
  'వడ్రంగి': 'Carpenter',
  'చెక్క పని': 'Carpenter',
  'தச்சர்': 'Carpenter',
  'ಬಡಗಿ': 'Carpenter',
  'തച്ചൻ': 'Carpenter',
  'carpenter': 'Carpenter',
  'carpentry': 'Carpenter',

  // Plumber
  'नलसाज': 'Plumber',
  'प्लम्बर': 'Plumber',
  'ప్లంబర్': 'Plumber',
  'குழாய் பழுதுபார்ப்பவர்': 'Plumber',
  'ಪ್ಲಂಬರ್': 'Plumber',
  'പ്ലംബർ': 'Plumber',
  'plumber': 'Plumber',
  'plumbing': 'Plumber',

  // Solar / Renewable
  'सौर': 'Solar Technician',
  'सोलर': 'Solar Technician',
  'సోలార్': 'Solar Technician',
  'சூரிய ஆற்றல்': 'Solar Technician',
  'ಸೌರ': 'Solar Technician',
  'സോളാർ': 'Solar Technician',
  'solar': 'Solar Technician',

  // Farming / Agriculture
  'किसान': 'Farmer',
  'खेती': 'Farmer',
  'कृषि': 'Farmer',
  'రైతు': 'Farmer',
  'వ్యవసాయం': 'Farmer',
  'விவசாயி': 'Farmer',
  'ರೈತ': 'Farmer',
  'ಕೃಷಿ': 'Farmer',
  'കർഷകൻ': 'Farmer',
  'farmer': 'Farmer',
  'farming': 'Farmer',
  'agriculture': 'Farmer',

  // Mason / Construction
  'राजमिस्त्री': 'Mason',
  'भवन निर्माण': 'Mason',
  'మేస్త్రీ': 'Mason',
  'கொத்தனார்': 'Mason',
  'ಮೇಸ್ತ್ರಿ': 'Mason',
  'മേസ്തിരി': 'Mason',
  'mason': 'Mason',
  'construction': 'Mason',

  // Driver / Automotive
  'ड्राइवर': 'Driver',
  'वाहन चालक': 'Driver',
  'మోటారు డ్రైవర్': 'Driver',
  'డ్రైవర్': 'Driver',
  'ஓட்டுநர்': 'Driver',
  'ಚಾಲಕ': 'Driver',
  'ഡ്രൈവർ': 'Driver',
  'driver': 'Driver',
  'driving': 'Driver',

  // Digital / Computer
  'कंप्यूटर': 'Computer Operator',
  'डेटा एंट्री': 'Computer Operator',
  'కంప్యూటర్': 'Computer Operator',
  'డేటా ఎంట్రీ': 'Computer Operator',
  'கணினி': 'Computer Operator',
  'ಗಣಕಯಂತ್ರ': 'Computer Operator',
  'കമ്പ്യൂട്ടർ': 'Computer Operator',
  'computer': 'Computer Operator',
  'data entry': 'Computer Operator'
};

const CANONICAL_SKILLS = {
  // Electrical / Soldering
  'वायरिंग': 'House Wiring',
  'सोल्डरिंग': 'Soldering',
  'వైరింగ్': 'House Wiring',
  'సోల్డరింగ్': 'Soldering',
  'மின் வயரிங்': 'House Wiring',
  'ವೈರಿಂಗ್': 'House Wiring',
  'വയറിംഗ്': 'House Wiring',
  'wiring': 'House Wiring',
  'soldering': 'Soldering',
  'circuit repair': 'Circuit Repair',

  // Apparel / Stitching
  'कटाई': 'Cutting',
  'सिलाई': 'Stitching',
  'कढ़ाई': 'Embroidery',
  'కటింగ్': 'Cutting',
  'కుట్టు': 'Stitching',
  'ఎంబ్రాయిడరీ': 'Embroidery',
  'வெட்டுதல்': 'Cutting',
  'தையல்': 'Stitching',
  'ಕತ್ತರಿಸುವುದು': 'Cutting',
  'ಹೊಲಿಗೆ': 'Stitching',
  'മുറിക്കൽ': 'Cutting',
  'തയ്യൽ': 'Stitching',
  'cutting': 'Cutting',
  'stitching': 'Stitching',
  'embroidery': 'Embroidery',

  // Carpentry
  'पॉलिश': 'Polishing',
  'लकड़ी जोड़ना': 'Wood Joining',
  'పాలిష్': 'Polishing',
  'మెరుగుపెట్టడం': 'Polishing',
  'மரம் இழைத்தல்': 'Wood Polishing',
  'ಪಾಲಿಶ್': 'Polishing',
  'പോളിഷിംഗ്': 'Polishing',
  'polishing': 'Polishing',
  'woodwork': 'Woodwork'
};

/**
 * Generic HTTPS POST to Bhashini Dhruva inference pipeline.
 */
function callDhruvaPipeline(payload) {
  return new Promise((resolve, reject) => {
    const inferenceKey = (process.env.BHASHINI_INFERENCE_KEY || '').trim();
    if (!inferenceKey) {
      return reject(new Error('BHASHINI_INFERENCE_KEY is not configured in environment.'));
    }

    const bodyString = JSON.stringify(payload);
    const req = https.request({
      hostname: 'dhruva-api.bhashini.gov.in',
      path: '/services/inference/pipeline',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': inferenceKey,
        'Content-Length': Buffer.byteLength(bodyString)
      },
      timeout: 25000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const errDetail = parsed.message || parsed.error || `HTTP ${res.statusCode}`;
            reject(new Error(`Bhashini API error (${res.statusCode}): ${errDetail}`));
          }
        } catch (e) {
          reject(new Error(`Bhashini response parse error: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Bhashini API request timed out after 25 seconds'));
    });

    req.on('error', (err) => {
      reject(new Error(`Bhashini connection error: ${err.message}`));
    });

    req.write(bodyString);
    req.end();
  });
}

/**
 * Perform Speech-to-Text (ASR) via Bhashini.
 * @param {string} audioBase64 - Base64-encoded audio (WAV / 16kHz mono recommended)
 * @param {string} language - 2-letter language code (te, hi, en, ta, kn, ml)
 */
async function transcribeAudio(audioBase64, language = 'en') {
  if (!audioBase64) {
    throw new Error('Audio content is required for speech recognition');
  }

  const cleanLang = (language || 'en').toLowerCase().split('-')[0];
  const langConfig = SUPPORTED_LANGUAGES[cleanLang] || SUPPORTED_LANGUAGES.en;

  // Clean raw base64 (strip data URI scheme if sent from browser)
  const cleanBase64 = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '').trim();

  const payload = {
    pipelineTasks: [
      {
        taskType: 'asr',
        config: {
          language: {
            sourceLanguage: langConfig.bhashiniCode
          },
          audioFormat: 'wav'
        }
      }
    ],
    inputData: {
      audio: [
        {
          audioContent: cleanBase64
        }
      ]
    }
  };

  const response = await callDhruvaPipeline(payload);
  const taskRes = response.pipelineResponse?.[0];
  const transcript = taskRes?.output?.[0]?.source?.trim() || '';

  return {
    transcript,
    language: cleanLang,
    service: 'bhashini_asr'
  };
}

// In-memory cache for synthesized speech and translations to avoid duplicate external API calls
const ttsCache = new Map();
const MAX_TTS_CACHE = 100;
const translationCache = new Map();
const MAX_TRANSLATION_CACHE = 200;

function getFromCache(cache, key) {
  if (cache.has(key)) {
    const value = cache.get(key);
    // Refresh LRU order
    cache.delete(key);
    cache.set(key, value);
    return value;
  }
  return null;
}

function setToCache(cache, key, value, maxSize = 100) {
  if (cache.size >= maxSize) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

/**
 * Perform Text-to-Speech (TTS) via Bhashini.
 * @param {string} text - Text to read aloud in native language
 * @param {string} language - 2-letter language code
 * @param {string} gender - 'female' | 'male' (default: 'female')
 */
async function synthesizeSpeech(text, language = 'en', gender = 'female') {
  if (!text || !text.trim()) {
    throw new Error('Text is required for speech synthesis');
  }

  const cleanLang = (language || 'en').toLowerCase().split('-')[0];
  const langConfig = SUPPORTED_LANGUAGES[cleanLang] || SUPPORTED_LANGUAGES.en;
  const cleanGender = gender === 'male' ? 'male' : 'female';
  const cleanText = text.trim();
  const cacheKey = `${cleanLang}:${cleanGender}:${cleanText}`;

  const cached = getFromCache(ttsCache, cacheKey);
  if (cached) {
    return {
      audioContent: cached,
      format: 'wav',
      language: cleanLang,
      service: 'bhashini_tts_cached'
    };
  }

  const payload = {
    pipelineTasks: [
      {
        taskType: 'tts',
        config: {
          language: {
            sourceLanguage: langConfig.bhashiniCode
          },
          gender: cleanGender
        }
      }
    ],
    inputData: {
      input: [
        {
          source: cleanText
        }
      ]
    }
  };

  const response = await callDhruvaPipeline(payload);
  const taskRes = response.pipelineResponse?.[0];
  const audioContent = taskRes?.audio?.[0]?.audioContent || '';

  if (!audioContent) {
    throw new Error('Bhashini TTS returned empty audio stream');
  }

  setToCache(ttsCache, cacheKey, audioContent, MAX_TTS_CACHE);

  return {
    audioContent,
    format: 'wav',
    language: cleanLang,
    service: 'bhashini_tts'
  };
}

/**
 * Perform Machine Translation (NMT) via Bhashini.
 * @param {string} text - Source text
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 */
async function translateText(text, sourceLanguage = 'en', targetLanguage = 'hi') {
  if (!text || !text.trim()) {
    return { translatedText: '', sourceLanguage, targetLanguage };
  }

  const src = (sourceLanguage || 'en').toLowerCase().split('-')[0];
  const tgt = (targetLanguage || 'hi').toLowerCase().split('-')[0];

  if (src === tgt) {
    return { translatedText: text, sourceLanguage: src, targetLanguage: tgt };
  }

  const cleanText = text.trim();
  const cacheKey = `${src}:${tgt}:${cleanText}`;
  const cachedTranslation = getFromCache(translationCache, cacheKey);
  if (cachedTranslation) {
    return {
      translatedText: cachedTranslation,
      sourceLanguage: src,
      targetLanguage: tgt,
      service: 'bhashini_translation_cached'
    };
  }

  const payload = {
    pipelineTasks: [
      {
        taskType: 'translation',
        config: {
          language: {
            sourceLanguage: src,
            targetLanguage: tgt
          }
        }
      }
    ],
    inputData: {
      input: [
        {
          source: cleanText
        }
      ]
    }
  };

  const response = await callDhruvaPipeline(payload);
  const taskRes = response.pipelineResponse?.[0];
  const translatedText = taskRes?.output?.[0]?.target?.trim() || '';

  if (translatedText) {
    setToCache(translationCache, cacheKey, translatedText, MAX_TRANSLATION_CACHE);
  }

  return {
    translatedText,
    sourceLanguage: src,
    targetLanguage: tgt,
    service: 'bhashini_nmt'
  };
}

/**
 * Detect script family of recognized text to catch language mismatches.
 * @param {string} text
 * @returns {string} Detected language code: 'te', 'hi', 'ta', 'kn', 'ml', 'en', or 'unknown'
 */
function detectScriptLanguage(text) {
  if (!text) return 'en';

  const teluguCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const tamilCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const kannadaCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  const malayalamCount = (text.match(/[\u0D00-\u0D7F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  const counts = [
    { lang: 'te', count: teluguCount },
    { lang: 'hi', count: devanagariCount },
    { lang: 'ta', count: tamilCount },
    { lang: 'kn', count: kannadaCount },
    { lang: 'ml', count: malayalamCount },
    { lang: 'en', count: latinCount }
  ];

  counts.sort((a, b) => b.count - a.count);

  if (counts[0].count > 0) {
    return counts[0].lang;
  }
  return 'unknown';
}

/**
 * Check if the text matches the user's selected language.
 * Distinguishes speech recognition from translation as required by Rule 4.
 */
function checkLanguageMismatch(text, selectedLanguage) {
  const cleanSelected = (selectedLanguage || 'en').toLowerCase().split('-')[0];
  const detected = detectScriptLanguage(text);

  // If text is predominantly another Indian script, flag mismatch
  const isMismatch = detected !== 'unknown' && detected !== cleanSelected && detected !== 'en';

  return {
    isMismatch,
    selectedLanguage: cleanSelected,
    detectedLanguage: detected,
    detectedName: SUPPORTED_LANGUAGES[detected]?.name || detected
  };
}

/**
 * Normalizes multilingual user responses into canonical English tags for the matching engine.
 * Ensures the existing NIELIT dataset matching logic runs with 100% precision regardless of language.
 */
function normalizeToCanonical(text, type = 'skill') {
  if (!text || typeof text !== 'string') return text;
  const clean = text.trim().toLowerCase();

  // Search dictionary mapping
  for (const [key, canonical] of Object.entries(type === 'occupation' ? CANONICAL_OCCUPATIONS : CANONICAL_SKILLS)) {
    if (clean.includes(key.toLowerCase())) {
      return canonical;
    }
  }

  // Check occupation map as well
  for (const [key, canonical] of Object.entries(CANONICAL_OCCUPATIONS)) {
    if (clean.includes(key.toLowerCase())) {
      return canonical;
    }
  }

  return text;
}

const CONFIRMATION_PHRASES = {
  te: {
    message: "మీరు తెలుగు ఎంచుకున్నారు. జీవికా సాథికి స్వాగతం!",
    name: "తెలుగు"
  },
  hi: {
    message: "आपने हिन्दी भाषा चुनी है। जीविका साथी में आपका स्वागत है!",
    name: "हिन्दी"
  },
  en: {
    message: "You have selected English. Welcome to Jeevika Saathi!",
    name: "English"
  },
  ta: {
    message: "நீங்கள் தமிழைத் தேர்ந்தெடுத்துள்ளீர்கள். ஜீவிகா சாத்திக்கு வரவேற்கிறோம்!",
    name: "தமிழ்"
  },
  kn: {
    message: "ನೀವು ಕನ್ನಡವನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ಜೀವಿಕಾ ಸಾಥಿಗೆ ಸುಸ್ವಾಗತ!",
    name: "ಕನ್ನಡ"
  },
  mr: {
    message: "तुम्ही मराठी भाषा निवडली आहे. जीविका साथीमध्ये आपले स्वागत आहे!",
    name: "मराठी"
  },
  ml: {
    message: "നിങ്ങൾ മലയാളം തിരഞ്ഞെടുത്തു. ജീവിക സാഥിയിലേക്ക് സ്വാഗതം!",
    name: "മലയാളം"
  }
};

/**
 * Identify target language code from spoken text/transcript.
 */
function identifyLanguageFromSpeech(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.toLowerCase().trim();

  // Direct language keyword match
  if (/telugu|తెలుగు|తేలుగు|telgu|andhra|telangana/i.test(text)) return 'te';
  if (/hindi|हिंदी|हिन्दी|hind|devanagari/i.test(text)) return 'hi';
  if (/english|angrezi|इंग्लिश|ఇంగ్లీష్|ஆங்கிலம்|ಇಂಗ್ಲಿಷ್|ഇംഗ്ലീഷ്/i.test(text)) return 'en';
  if (/tamil|தமிழ்|tamizh|thamil|தமில்/i.test(text)) return 'ta';
  if (/kannada|ಕನ್ನಡ|kanada|kannad/i.test(text)) return 'kn';
  if (/marathi|मराठी|maratha|maharashtra/i.test(text)) return 'mr';
  if (/malayalam|മലയാളം|malyalam/i.test(text)) return 'ml';

  // Script detection fallback if user spoke a sentence in native script
  const detected = detectScriptLanguage(rawText);
  if (detected && detected !== 'unknown') {
    return detected;
  }
  return null;
}

module.exports = {
  SUPPORTED_LANGUAGES,
  CONFIRMATION_PHRASES,
  transcribeAudio,
  synthesizeSpeech,
  translateText,
  detectScriptLanguage,
  checkLanguageMismatch,
  normalizeToCanonical,
  identifyLanguageFromSpeech
};
