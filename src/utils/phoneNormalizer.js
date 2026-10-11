// src/utils/phoneNormalizer.js
/**
 * Normalizes speech-to-text transcripts into a valid 10-digit Indian mobile number.
 * Handles:
 * - English spoken digits ("nine", "eight", "zero", "oh", etc.)
 * - Hindi spoken digits ("नौ", "आठ", "शून्य", "जीरो", "ज़ीरो", "एक", etc.)
 * - Devanagari numerals (०-९)
 * - Groupings ("double nine", "triple five")
 * - Formatting prefixes (+91, 91, 0)
 * - Punctuation and spaces
 */

// Digit word mappings (English)
const ENGLISH_DIGITS = {
  zero: "0",
  oh: "0",
  o: "0",
  null: "0",
  nil: "0",
  love: "0",
  one: "1",
  won: "1",
  two: "2",
  to: "2",
  too: "2",
  three: "3",
  tree: "3",
  four: "4",
  for: "4",
  fore: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  ate: "8",
  ait: "8",
  nine: "9",
  nain: "9"
};

// English tens for compound numbers (e.g. "ninety eight" -> 98)
const ENGLISH_TENS = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90
};

// English teens and exact two-digit numbers
const ENGLISH_TWO_DIGIT_NUMBERS = {
  ten: "10", eleven: "11", twelve: "12", thirteen: "13", fourteen: "14",
  fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18", nineteen: "19",
  twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60",
  seventy: "70", eighty: "80", ninety: "90"
};

// Digit word mappings (Hindi / Devanagari & transliterated)
const HINDI_DIGITS = {
  शून्य: "0",
  जीरो: "0",
  ज़ीरो: "0",
  सिफर: "0",
  एक: "1",
  दो: "2",
  तीन: "3",
  चार: "4",
  पांच: "5",
  पाँच: "5",
  छह: "6",
  छः: "6",
  सात: "7",
  आठ: "8",
  नौ: "9",
  // Common transliterated Hindi words
  shunya: "0",
  sifar: "0",
  ek: "1",
  do: "2",
  teen: "3",
  char: "4",
  chaar: "4",
  paanch: "5",
  panch: "5",
  chhah: "6",
  chhe: "6",
  che: "6",
  saat: "7",
  sat: "7",
  aath: "8",
  ath: "8",
  nau: "9",
  no: "9"
};

// Hindi 2-digit numbers commonly transcribed by speech recognition
const HINDI_TWO_DIGIT_NUMBERS = {
  दस: "10", ग्यारह: "11", बारह: "12", तेरह: "13", चौदह: "14",
  पंद्रह: "15", सोलह: "16", सत्रह: "17", अठारह: "18", उन्नीस: "19",
  बीस: "20", इक्कीस: "21", बाईस: "22", तेईस: "23", चौबीस: "24",
  पच्चीस: "25", छब्बीस: "26", सत्ताईस: "27", अट्ठाईस: "28", उनतीस: "29",
  तीस: "30", इकत्तीस: "31", बत्तीस: "32", तैंतीस: "33", चौंतीस: "34",
  पैंतीस: "35", छत्तीस: "36", सैंतीस: "37", अड़तीस: "38", उनतालीस: "39",
  चालीस: "40", इकतालीस: "41", बयालीस: "42", तैंतालीस: "43", चवालीस: "44",
  पैंतालीस: "45", छियालीस: "46", सैंतालीस: "47", अड़तालीस: "48", उनचास: "49",
  पचास: "50", इक्यावन: "51", बावन: "52", तिरपन: "53", चौवन: "54",
  पचपन: "55", छप्पन: "56", सत्तावन: "57", अट्ठावन: "58", उनसठ: "59",
  साठ: "60", इकसठ: "61", बासठ: "62", तिरसठ: "63", चौंसठ: "64", चौसठ: "64",
  पैंसठ: "65", छियासठ: "66", सड़सठ: "67", अड़सठ: "68", उनहत्तर: "69",
  सत्तर: "70", इकहत्तर: "71", बहत्तर: "72", तिहत्तर: "73", चौहत्तर: "74",
  पचहत्तर: "75", छिहत्तर: "76", सतहत्तर: "77", अठहत्तर: "78", उन्यासी: "79",
  अस्सी: "80", इक्यासी: "81", बयासी: "82", तिरासी: "83", चौरासी: "84", चियासी: "86",
  पचासी: "85", छियासी: "86", सत्तासी: "87", अट्ठासी: "88", नवासी: "89",
  नब्बे: "90", इक्यानवे: "91", बानवे: "92", तिरानवे: "93", चौरानवे: "94",
  पंचानवे: "95", पिचानवे: "95", पचानवे: "95", छियानवे: "96", सत्तानवे: "97",
  अट्ठानवे: "98", अठानवे: "98", निन्यानवे: "99"
};

// Indic numerals (Devanagari, Telugu, Kannada, Tamil, Gujarati, Bengali)
const INDIC_NUMERALS = {
  // Devanagari (Hindi, Marathi)
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
  // Telugu numerals
  "౦": "0", "౧": "1", "౨": "2", "౩": "3", "౪": "4",
  "౫": "5", "౬": "6", "౭": "7", "౮": "8", "౯": "9",
  // Kannada numerals
  "೦": "0", "೧": "1", "೨": "2", "೩": "3", "೪": "4",
  "೫": "5", "೬": "6", "೭": "7", "೮": "8", "೯": "9",
  // Tamil numerals
  "௦": "0", "௧": "1", "௨": "2", "௩": "3", "௪": "4",
  "௫": "5", "௬": "6", "௭": "7", "௮": "8", "௯": "9",
  // Gujarati
  "૦": "0", "૧": "1", "૨": "2", "૩": "3", "૪": "4",
  "૫": "5", "૬": "6", "૭": "7", "૮": "8", "૯": "9",
  // Bengali
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
};

// Spoken regional digits (Native scripts)
const REGIONAL_DIGITS = {
  // Telugu
  "సున్నా": "0", "ఒకటి": "1", "రెండు": "2", "మూడు": "3", "నాలుగు": "4",
  "ఐదు": "5", "ఆరు": "6", "ఏడు": "7", "ఎనిమిది": "8", "తొమ్మిది": "9",
  // Kannada
  "ಸೊನ್ನೆ": "0", "ಒಂದು": "1", "ಎರಡು": "2", "ಮೂರು": "3", "ನಾಲ್ಕು": "4",
  "ಐದು": "5", "ಆರು": "6", "ಏಳು": "7", "ಎಂಟು": "8", "ಒಂಬತ್ತು": "9",
  // Tamil
  "பூஜ்ஜியம்": "0", "ஒன்று": "1", "இரண்டு": "2", "மூன்று": "3", "நான்கு": "4",
  "ஐந்து": "5", "ஆறு": "6", "ஏழு": "7", "எட்டு": "8", "ஒன்பது": "9",
  // Marathi
  "दोन": "2", "तीन": "3", "चार": "4", "पाच": "5", "सहा": "6", "सात": "7", "आठ": "8", "नऊ": "9"
};

// Transliterated regional digits (Telugu, Kannada, Tamil)
const REGIONAL_TRANSLITERATED = {
  // Telugu
  sunna: "0", okati: "1", rendu: "2", moodu: "3", mudu: "3",
  naalugu: "4", nalugu: "4", aidu: "5", aedhu: "5", ayidu: "5",
  aaru: "6", edu: "7", eedu: "7", yedu: "7", yedhu: "7",
  enimidi: "8", yenimidi: "8", tommidi: "9",
  // Tamil
  poojiyam: "0", suzhiyam: "0", ondru: "1", onnu: "1", rendu: "2",
  moonu: "3", naalu: "4", aindhu: "5", anju: "5", aaru: "6",
  yezhu: "7", elu: "7", ettu: "8", ombadhu: "9",
  // Kannada
  sonne: "0", ondu: "1", eradu: "2", mooru: "3", naalku: "4",
  aidu: "5", aaru: "6", eylu: "7", yelu: "7", entu: "8", ombattu: "9"
};

// Regional tens
const REGIONAL_TENS = {
  // Telugu
  "ఇరవై": 20, "ముప్పై": 30, "నలభై": 40, "యాభై": 50,
  "అరవై": 60, "డెబ్బై": 70, "ఎనభై": 80, "తొంభై": 90,
  iravai: 20, muppai: 30, nalabhai: 40, yaabhai: 50,
  aravai: 60, debbai: 70, enabhai: 80, tombhai: 90
};

/**
 * Resolves a single token to digit string if it matches a digit word
 */
function resolveSingleDigit(token) {
  if (!token) return null;
  const clean = token.toLowerCase();
  if (ENGLISH_DIGITS[clean] !== undefined) return ENGLISH_DIGITS[clean];
  if (HINDI_DIGITS[clean] !== undefined) return HINDI_DIGITS[clean];
  if (REGIONAL_DIGITS[clean] !== undefined) return REGIONAL_DIGITS[clean];
  if (REGIONAL_TRANSLITERATED[clean] !== undefined) return REGIONAL_TRANSLITERATED[clean];
  if (/^[0-9]$/.test(clean)) return clean;
  return null;
}

/**
 * Normalizes speech transcript into clean digits
 * @param {string} rawText Spoken text
 * @returns {{ success: boolean, number: string, rawDigits: string, partialDigits?: string, error?: string }}
 */
export function parseSpokenPhoneNumber(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { success: false, number: "", rawDigits: "", error: "No speech input received" };
  }

  // 1. Direct Regex Fast-Path:
  // If the speech-to-text directly produced a 10-digit mobile number starting with 6-9
  const directMatch = rawText.match(/\b([6-9]\d{9})\b/);
  if (directMatch) {
    return {
      success: true,
      number: directMatch[1],
      rawDigits: directMatch[1]
    };
  }

  // If text has +91 or 91 prefix followed by 10 digits
  const countryCodeMatch = rawText.match(/(?:\+91|91|0)[\s-]*([6-9]\d{9})\b/);
  if (countryCodeMatch) {
    return {
      success: true,
      number: countryCodeMatch[1],
      rawDigits: countryCodeMatch[1]
    };
  }

  // 2. Convert Indic numerals first
  let text = rawText;
  for (const [indicDigit, asciiDigit] of Object.entries(INDIC_NUMERALS)) {
    text = text.replaceAll(indicDigit, asciiDigit);
  }

  // 3. Pre-process punctuation:
  // Convert hyphens, underscores, slashes to spaces so "ninety-eight" becomes "ninety eight"
  text = text.replace(/[-–—_/\\()]/g, " ");
  // Strip "plus" word or "+" prefix when spoken e.g. "plus nine one"
  text = text.replace(/\bplus\b|\+/gi, " ");
  // Strip standard punctuation
  text = text.toLowerCase().replace(/[,.:;?!|#*]/g, " ").trim();

  // 4. Tokenize
  const tokens = text.split(/\s+/).filter(Boolean);
  const digitTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check multipliers: "double", "triple"
    if ((token === "double" || token === "twice") && i + 1 < tokens.length) {
      const nextToken = tokens[i + 1];
      const digit = resolveSingleDigit(nextToken);
      if (digit) {
        digitTokens.push(digit, digit);
        i++; // skip next
        continue;
      }
    }

    if ((token === "triple" || token === "thrice") && i + 1 < tokens.length) {
      const nextToken = tokens[i + 1];
      const digit = resolveSingleDigit(nextToken);
      if (digit) {
        digitTokens.push(digit, digit, digit);
        i++; // skip next
        continue;
      }
    }

    // Check "two times 9", "three times 5"
    if ((token === "two" || token === "2") && i + 2 < tokens.length && tokens[i + 1] === "times") {
      const digit = resolveSingleDigit(tokens[i + 2]);
      if (digit) {
        digitTokens.push(digit, digit);
        i += 2;
        continue;
      }
    }

    if ((token === "three" || token === "3") && i + 2 < tokens.length && tokens[i + 1] === "times") {
      const digit = resolveSingleDigit(tokens[i + 2]);
      if (digit) {
        digitTokens.push(digit, digit, digit);
        i += 2;
        continue;
      }
    }

    // Check English Tens compound: "ninety eight" -> 98, "seventy six" -> 76
    if (ENGLISH_TENS[token] !== undefined) {
      if (i + 1 < tokens.length) {
        const nextToken = tokens[i + 1];
        const nextUnit = resolveSingleDigit(nextToken);
        if (nextUnit && nextUnit !== "0") {
          const compoundValue = ENGLISH_TENS[token] + parseInt(nextUnit, 10);
          digitTokens.push(...String(compoundValue).split(""));
          i++; // skip next unit
          continue;
        }
      }
      // Standalone tens: "twenty" -> "20"
      digitTokens.push(...String(ENGLISH_TENS[token]).split(""));
      continue;
    }

    // Check Regional Tens compound: e.g. Telugu "iravai aidu" -> 25
    if (REGIONAL_TENS[token] !== undefined) {
      if (i + 1 < tokens.length) {
        const nextToken = tokens[i + 1];
        const nextUnit = resolveSingleDigit(nextToken);
        if (nextUnit && nextUnit !== "0") {
          const compoundValue = REGIONAL_TENS[token] + parseInt(nextUnit, 10);
          digitTokens.push(...String(compoundValue).split(""));
          i++;
          continue;
        }
      }
      digitTokens.push(...String(REGIONAL_TENS[token]).split(""));
      continue;
    }

    // Check Hindi two-digit numbers (दस -> 10, अट्ठानवे -> 98)
    if (HINDI_TWO_DIGIT_NUMBERS[token]) {
      digitTokens.push(...HINDI_TWO_DIGIT_NUMBERS[token].split(""));
      continue;
    }

    // Check English teens (eleven -> 11, nineteen -> 19)
    if (ENGLISH_TWO_DIGIT_NUMBERS[token]) {
      digitTokens.push(...ENGLISH_TWO_DIGIT_NUMBERS[token].split(""));
      continue;
    }

    // Check single digit words
    const singleDigit = resolveSingleDigit(token);
    if (singleDigit) {
      digitTokens.push(singleDigit);
      continue;
    }

    // Check inline digits inside token (e.g. "98765" or "43210")
    const digitsOnly = token.replace(/\D/g, "");
    if (digitsOnly.length > 0) {
      digitTokens.push(...digitsOnly.split(""));
    }
  }

  const rawDigits = digitTokens.join("");

  if (rawDigits.length === 0) {
    return {
      success: false,
      number: "",
      rawDigits: "",
      error: "No mobile number detected. Please tap the microphone and speak your 10-digit number."
    };
  }

  // 5. Clean country codes (+91, 91, 0):
  // If it starts with 91 and has 12 digits -> strip 91
  // If it starts with 0 and has 11 digits -> strip 0
  let normalized = rawDigits;
  if (normalized.length === 12 && normalized.startsWith("91")) {
    normalized = normalized.slice(2);
  } else if (normalized.length === 11 && normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  } else if (normalized.length > 10 && normalized.startsWith("91")) {
    // If starts with 91 and remaining is valid 10 digits
    const rem = normalized.slice(2);
    if (/^[6-9]\d{9}$/.test(rem)) {
      normalized = rem;
    }
  }

  // Check if a contiguous 10-digit Indian mobile number exists anywhere within the digits
  const mobileMatch = normalized.match(/[6-9]\d{9}/);
  if (mobileMatch) {
    return {
      success: true,
      number: mobileMatch[0],
      rawDigits: rawDigits
    };
  }

  // If exactly 10 digits
  if (normalized.length === 10) {
    return {
      success: true,
      number: normalized,
      rawDigits: rawDigits
    };
  }

  // If more than 10 digits, take the last 10 or first 10 if starting with [6-9]
  if (normalized.length > 10) {
    const last10 = normalized.slice(-10);
    if (/^[6-9]\d{9}$/.test(last10)) {
      return { success: true, number: last10, rawDigits };
    }
    const first10 = normalized.slice(0, 10);
    if (/^[6-9]\d{9}$/.test(first10)) {
      return { success: true, number: first10, rawDigits };
    }
  }

  // Less than 10 digits or incomplete
  return {
    success: false,
    number: normalized,
    rawDigits: rawDigits,
    partialDigits: normalized,
    error: `Heard ${normalized.length} digit${normalized.length > 1 ? "s" : ""} (${normalized}). A valid Indian mobile number requires 10 digits.`
  };
}

function resolveTokenToDigit(token) {
  return resolveSingleDigit(token);
}

/**
 * Normalizes speech transcript into a clean N-digit OTP (default 4 digits)
 * @param {string} rawText Spoken text
 * @param {number} length Expected number of OTP digits (default 4)
 * @returns {{ success: boolean, otp: string, digits: string[], rawDigits: string, error?: string }}
 */
export function parseSpokenOtp(rawText, length = 4) {
  if (!rawText || typeof rawText !== "string") {
    return { success: false, otp: "", digits: [], rawDigits: "", error: "No speech input received" };
  }

  // 1. Convert Indic numerals first
  let text = rawText;
  for (const [indicDigit, asciiDigit] of Object.entries(INDIC_NUMERALS)) {
    text = text.replaceAll(indicDigit, asciiDigit);
  }

  // 2. Clean punctuation
  text = text.toLowerCase().replace(/[,.:;?!_]/g, " ").trim();

  // 3. Process tokens and groupings ("double five", "triple nine", Hindi 2-digit numbers)
  const tokens = text.split(/\s+/).filter(Boolean);
  const digitTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check for "double" or "triple" multipliers
    if (token === "double" && i + 1 < tokens.length) {
      const nextToken = tokens[i + 1];
      const digit = resolveTokenToDigit(nextToken);
      if (digit) {
        digitTokens.push(digit, digit);
        i++;
        continue;
      }
    }

    if (token === "triple" && i + 1 < tokens.length) {
      const nextToken = tokens[i + 1];
      const digit = resolveTokenToDigit(nextToken);
      if (digit) {
        digitTokens.push(digit, digit, digit);
        i++;
        continue;
      }
    }

    // Check Hindi two-digit numbers
    if (HINDI_TWO_DIGIT_NUMBERS[token]) {
      digitTokens.push(...HINDI_TWO_DIGIT_NUMBERS[token].split(""));
      continue;
    }

    // Check English two-digit numbers
    if (ENGLISH_TWO_DIGIT_NUMBERS[token]) {
      digitTokens.push(...ENGLISH_TWO_DIGIT_NUMBERS[token].split(""));
      continue;
    }

    // Check single token resolution
    const resolved = resolveTokenToDigit(token);
    if (resolved) {
      digitTokens.push(...resolved.split(""));
      continue;
    }

    // Check if token contains inline digits (e.g., "5482" or "12")
    const digitsOnly = token.replace(/\D/g, "");
    if (digitsOnly.length > 0) {
      digitTokens.push(...digitsOnly.split(""));
    }
  }

  const rawDigits = digitTokens.join("");

  if (rawDigits.length >= length) {
    const otpCandidate = rawDigits.slice(0, length);
    return {
      success: true,
      otp: otpCandidate,
      digits: otpCandidate.split(""),
      rawDigits
    };
  }

  if (rawDigits.length > 0) {
    return {
      success: false,
      otp: rawDigits,
      digits: rawDigits.split(""),
      rawDigits,
      error: `Heard ${rawDigits.length} digit${rawDigits.length > 1 ? 's' : ''} (${rawDigits}). Please speak all ${length} digits.`
    };
  }

  return {
    success: false,
    otp: "",
    digits: [],
    rawDigits: "",
    error: "No OTP digits detected. Please speak your 4-digit OTP clearly."
  };
}

/**
 * Normalizes phone number to 10 digits from raw typed or pasted input.
 * Strips +91, leading 0, spaces, dashes, parentheses.
 * @param {string} input
 * @returns {string} 10-digit phone string
 */
export function normalizePhoneNumber(input) {
  if (!input) return "";
  let digits = String(input).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    const match = digits.match(/[6-9]\d{9}/);
    if (match) digits = match[0];
  }
  return digits.slice(0, 10);
}

