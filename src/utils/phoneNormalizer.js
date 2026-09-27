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
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9"
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
  ek: "1",
  do: "2",
  teen: "3",
  char: "4",
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
  साठ: "60", इकसठ: "61", बासठ: "62", तिरसठ: "63", चौंसठ: "64",
  पैंसठ: "65", छियासठ: "66", सड़सठ: "67", अड़सठ: "68", उनहत्तर: "69",
  सत्तर: "70", इकहत्तर: "71", बहत्तर: "72", तिहत्तर: "73", चौहत्तर: "74",
  पचहत्तर: "75", छिहत्तर: "76", सतहत्तर: "77", अठहत्तर: "78", उन्यासी: "79",
  अस्सी: "80", इक्यासी: "81", बयासी: "82", तिरासी: "83", चौरासी: "84",
  पचासी: "85", छियासी: "86", सत्तासी: "87", अट्ठासी: "88", नवासी: "89",
  नब्बे: "90", इक्यानवे: "91", बानवे: "92", तिरानवे: "93", चौरानवे: "94",
  पंचानवे: "95", छियानवे: "96", सत्तानवे: "97", अट्ठानवे: "98", निन्यानवे: "99"
};

// Devanagari numerals
const DEVANAGARI_DIGITS = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
};

/**
 * Normalizes speech transcript into clean digits
 * @param {string} rawText Spoken text
 * @returns {{ success: boolean, number: string, rawDigits: string, error?: string }}
 */
export function parseSpokenPhoneNumber(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return { success: false, number: "", rawDigits: "", error: "No speech input received" };
  }

  // 1. Convert Devanagari numerals first
  let text = rawText;
  for (const [devDigit, asciiDigit] of Object.entries(DEVANAGARI_DIGITS)) {
    text = text.replaceAll(devDigit, asciiDigit);
  }

  // 2. Clean punctuation (except hyphens and plus if any)
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
        i++; // skip next
        continue;
      }
    }

    if (token === "triple" && i + 1 < tokens.length) {
      const nextToken = tokens[i + 1];
      const digit = resolveTokenToDigit(nextToken);
      if (digit) {
        digitTokens.push(digit, digit, digit);
        i++; // skip next
        continue;
      }
    }

    // Check Hindi two-digit numbers
    if (HINDI_TWO_DIGIT_NUMBERS[token]) {
      digitTokens.push(...HINDI_TWO_DIGIT_NUMBERS[token].split(""));
      continue;
    }

    // Check single token resolution
    const resolved = resolveTokenToDigit(token);
    if (resolved) {
      digitTokens.push(...resolved.split(""));
      continue;
    }

    // Check if token contains inline digits (e.g., "9876543210" or "9876")
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
      error: "No mobile number detected. Please try again."
    };
  }

  // Normalize Indian mobile number format:
  // If it starts with 91 and has 12 digits -> strip 91
  // If it starts with 0 and has 11 digits -> strip 0
  let normalized = rawDigits;
  if (normalized.length === 12 && normalized.startsWith("91")) {
    normalized = normalized.slice(2);
  } else if (normalized.length === 11 && normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  } else if (normalized.length > 10 && normalized.includes("91")) {
    // Sometimes 91 is at the beginning e.g., 919876543210
    const match = normalized.match(/^(?:91|0)?([6-9]\d{9})$/);
    if (match) {
      normalized = match[1];
    }
  }

  // Extract exactly 10 digits if a 10-digit mobile sequence exists in transcript
  if (normalized.length !== 10) {
    const mobileMatch = normalized.match(/[6-9]\d{9}/);
    if (mobileMatch) {
      normalized = mobileMatch[0];
    }
  }

  // Validate 10 digits
  if (normalized.length === 10 && /^[6-9]\d{9}$/.test(normalized)) {
    return {
      success: true,
      number: normalized,
      rawDigits: rawDigits
    };
  }

  // If 10 digits but doesn't start with 6-9, or wrong length
  if (normalized.length === 10) {
    return {
      success: true,
      number: normalized,
      rawDigits: rawDigits
    };
  }

  return {
    success: false,
    number: normalized,
    rawDigits: rawDigits,
    error: "We couldn't recognize a valid 10-digit mobile number."
  };
}

function resolveTokenToDigit(token) {
  if (!token) return null;
  const clean = token.toLowerCase();
  if (ENGLISH_DIGITS[clean] !== undefined) {
    return ENGLISH_DIGITS[clean];
  }
  if (HINDI_DIGITS[clean] !== undefined) {
    return HINDI_DIGITS[clean];
  }
  if (/^\d+$/.test(clean)) {
    return clean;
  }
  return null;
}
