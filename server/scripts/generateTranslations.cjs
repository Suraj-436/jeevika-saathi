// server/scripts/generateTranslations.cjs
// Generates official Bhashini translations for all UI keys for Tamil, Kannada, and Malayalam.
const fs = require('fs');
const path = require('path');
const { translateText } = require('../bhashiniService.cjs');

async function main() {
  const transModule = await import('../../src/data/translations.js');
  const en = transModule.TRANSLATIONS.en;
  const hi = transModule.TRANSLATIONS.hi;
  const te = transModule.TRANSLATIONS.te;

  console.log('Starting Bhashini translation generation for ta, kn, ml...');
  const keys = Object.keys(en);
  console.log(`Total keys to process: ${keys.length}`);

  const ta = {};
  const kn = {};
  const ml = {};

  // Additional keys for Bhashini and Language Selector UI
  const additionalEn = {
    languageSelectTitle: "Select Your Preferred Language",
    languageSelectSub: "Choose your native language for voice guidance, forms, and assessments under PM-AJAY.",
    continueWithLang: "Continue to Portal",
    changeLanguage: "Change Language",
    voiceSupportedBadge: "🎙️ Bhashini Voice Ready",
    bhashiniPowered: "Powered by Bhashini AI (Government of India)",
    speakingInNative: "Speaking in",
    listeningBhashini: "Listening via Bhashini... Speak now",
    transcribingAudio: "Transcribing your speech via Bhashini...",
    speechRecognized: "Speech Recognized:",
    confirmOrEdit: "Confirm or edit your answer before submitting",
    editAnswer: "Edit Answer",
    confirmAndSend: "Confirm & Send",
    replayAudio: "Replay",
    pauseAudio: "Pause",
    stopAudio: "Stop",
    audioPlaying: "Playing audio...",
    languageMismatchDetected: "Language Mismatch Detected",
    mismatchPrompt: "You spoke in a different language from your selected language.",
    switchToLanguage: "Switch Language",
    translateToSelected: "Translate to Selected Language",
    micPermissionDenied: "Microphone access was denied. Please allow microphone permissions or type your answer.",
    micUnavailable: "Microphone is unavailable. Please type your answer below."
  };

  const allKeys = { ...en, ...additionalEn };
  const allKeyList = Object.keys(allKeys);

  for (let i = 0; i < allKeyList.length; i++) {
    const k = allKeyList[i];
    const enVal = allKeys[k];

    // Check if value has format placeholders or is brand name
    if (k === 'govIndia') {
      ta[k] = "இந்திய அரசு | GOVERNMENT OF INDIA";
      kn[k] = "ಭಾರತ ಸರ್ಕಾರ | GOVERNMENT OF INDIA";
      ml[k] = "ഭാരത സർക്കാർ | GOVERNMENT OF INDIA";
      continue;
    }
    if (k === 'portalBrandName') {
      ta[k] = "ஜீவிகா சாத்தி";
      kn[k] = "ಜೀವಿಕಾ ಸಾಥಿ";
      ml[k] = "ജീവിക സാഥി";
      continue;
    }
    if (k === 'saathiAI') {
      ta[k] = "சாத்தி AI";
      kn[k] = "ಸಾಥಿ AI";
      ml[k] = "സാഥി AI";
      continue;
    }

    try {
      const resTa = await translateText(enVal, 'en', 'ta');
      ta[k] = resTa.translatedText || enVal;

      const resKn = await translateText(enVal, 'en', 'kn');
      kn[k] = resKn.translatedText || enVal;

      const resMl = await translateText(enVal, 'en', 'ml');
      ml[k] = resMl.translatedText || enVal;

      if ((i + 1) % 25 === 0 || i === allKeyList.length - 1) {
        console.log(`Progress: ${i + 1}/${allKeyList.length} keys processed...`);
      }
    } catch (err) {
      console.warn(`Translation error for key ${k}:`, err.message);
      ta[k] = enVal;
      kn[k] = enVal;
      ml[k] = enVal;
    }
  }

  // Also add additional keys to hi and te
  const hiAdditional = {
    languageSelectTitle: "अपनी पसंदीदा भाषा चुनें",
    languageSelectSub: "पीएम-अजय के तहत वॉयस मार्गदर्शन, फॉर्म और मूल्यांकन के लिए अपनी मातृभाषा चुनें।",
    continueWithLang: "पोर्टल पर जारी रखें",
    changeLanguage: "भाषा बदलें",
    voiceSupportedBadge: "🎙️ भाषिणी वॉयस सक्षम",
    bhashiniPowered: "भाषिणी एआई (भारत सरकार) द्वारा संचालित",
    speakingInNative: "बोल रहे हैं",
    listeningBhashini: "भाषिणी के माध्यम से सुन रहे हैं... अब बोलें",
    transcribingAudio: "भाषिणी द्वारा आपकी आवाज़ को पहचाना जा रहा है...",
    speechRecognized: "पहचाना गया भाषण:",
    confirmOrEdit: "सबमिट करने से पहले अपने उत्तर की पुष्टि करें या संपादित करें",
    editAnswer: "उत्तर संपादित करें",
    confirmAndSend: "पुष्टि करें और भेजें",
    replayAudio: "पुनः सुनें",
    pauseAudio: "रोकें",
    stopAudio: "समाप्त करें",
    audioPlaying: "ऑडियो बज रहा है...",
    languageMismatchDetected: "भाषा का अंतर पहचाना गया",
    mismatchPrompt: "आपने चुनी गई भाषा से भिन्न भाषा में बात की है।",
    switchToLanguage: "भाषा बदलें",
    translateToSelected: "चुनी गई भाषा में अनुवाद करें",
    micPermissionDenied: "माइक्रोफ़ोन एक्सेस अस्वीकार कर दिया गया। कृपया अनुमति दें या टाइप करें।",
    micUnavailable: "माइक्रोफ़ोन अनुपलब्ध है। कृपया नीचे टाइप करें।"
  };

  const teAdditional = {
    languageSelectTitle: "మీ ప్రాధాన్య భాషను ఎంచుకోండి",
    languageSelectSub: "పీఎం-అజయ్ కింద వాయిస్ గైడెన్స్, ఫారమ్‌లు మరియు అసెస్‌మెంట్‌ల కోసం మీ మాతృభాషను ఎంచుకోండి.",
    continueWithLang: "పోర్టల్‌ను కొనసాగించండి",
    changeLanguage: "భాషను మార్చండి",
    voiceSupportedBadge: "🎙️ భాషిణి వాయిస్ సిద్ధంగా ఉంది",
    bhashiniPowered: "భాషిణి ఏఐ (భారత ప్రభుత్వం) ద్వారా ఆధారితం",
    speakingInNative: "మాట్లాడుతున్నారు",
    listeningBhashini: "భాషిణి ద్వారా వింటున్నారు... ఇప్పుడు మాట్లాడండి",
    transcribingAudio: "భాషిణి ద్వారా మీ వాయిస్ నమోదు చేయబడుతోంది...",
    speechRecognized: "గుర్తించిన మాటలు:",
    confirmOrEdit: "సమర్పించే ముందు మీ సమాధానాన్ని నిర్ధారించండి లేదా సవరించండి",
    editAnswer: "సమాధానం సవరించండి",
    confirmAndSend: "నిర్ధారించి పంపండి",
    replayAudio: "మళ్ళీ వినండి",
    pauseAudio: "పాజ్",
    stopAudio: "ఆపండి",
    audioPlaying: "ఆడియో ప్లే అవుతోంది...",
    languageMismatchDetected: "భాష వ్యత్యాసం గుర్తించబడింది",
    mismatchPrompt: "మీరు ఎంచుకున్న భాష కాకుండా వేరే భాషలో మాట్లాడారు.",
    switchToLanguage: "భాషను మార్చండి",
    translateToSelected: "ఎంచుకున్న భాషలోకి అనువదించండి",
    micPermissionDenied: "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి అనుమతించండి లేదా టైప్ చేయండి.",
    micUnavailable: "మైక్రోఫోన్ అందుబాటులో లేదు. దయచేసి క్రింద టైప్ చేయండి."
  };

  const finalEn = { ...en, ...additionalEn };
  const finalHi = { ...hi, ...hiAdditional };
  const finalTe = { ...te, ...teAdditional };

  const outputJs = `// src/data/translations.js
// Multilingual dictionary and language registry for Jeevika Saathi.
// Fully integrated with Government of India's Bhashini AI.

export const LANGUAGES = [
  { code: "en", name: "English", label: "English", nativeName: "English", voiceSupported: true },
  { code: "hi", name: "हिन्दी", label: "Hindi", nativeName: "हिन्दी", voiceSupported: true },
  { code: "te", name: "తెలుగు", label: "Telugu", nativeName: "తెలుగు", voiceSupported: true },
  { code: "ta", name: "தமிழ்", label: "Tamil", nativeName: "தமிழ்", voiceSupported: true },
  { code: "kn", name: "ಕನ್ನಡ", label: "Kannada", nativeName: "ಕನ್ನಡ", voiceSupported: true },
  { code: "ml", name: "മലയാളം", label: "Malayalam", nativeName: "മലയാളം", voiceSupported: true }
];

export const TRANSLATIONS = {
  en: ${JSON.stringify(finalEn, null, 2)},
  hi: ${JSON.stringify(finalHi, null, 2)},
  te: ${JSON.stringify(finalTe, null, 2)},
  ta: ${JSON.stringify(ta, null, 2)},
  kn: ${JSON.stringify(kn, null, 2)},
  ml: ${JSON.stringify(ml, null, 2)}
};
`;

  const targetPath = path.resolve(__dirname, '../../src/data/translations.js');
  fs.writeFileSync(targetPath, outputJs, 'utf8');
  console.log(`Successfully generated translations and saved to ${targetPath}`);
}

main().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
