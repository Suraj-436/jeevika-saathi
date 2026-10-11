import React, { useState, useEffect, useRef } from "react";
import { Volume2, MapPin, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { bhashiniClient } from "../services/bhashiniService";

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE DYNAMIC PAGE GUIDES (6 LANGUAGES: EN, HI, TE, TA, KN, ML)
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_GUIDES = {
  "home": {
    label: {
      en: "Home Page",
      hi: "होम पेज (मुख्य पृष्ठ)",
      te: "హోమ్ పేజీ (ప్రధాన పేజీ)",
      ta: "முகப்புப் பக்கம் (முதன்மைப் பக்கம்)",
      kn: "ಮುಖಪುಟ (ಮುಖ್ಯ ಪುಟ)",
      ml: "ഹോം പേജ് (പ്രധാന പേജ്)"
    },
    text: {
      en: "Welcome to Jeevika Saathi. This is your home page, where you can access your voice assessment, profile, skill analysis, recommendations, nearby opportunities and livelihood roadmap.",
      hi: "जीविका साथी में आपका स्वागत है। यह आपका मुख्य पृष्ठ है, जहाँ से आप मौखिक मूल्यांकन, प्रोफाइल, कौशल विश्लेषण, सिफारिशें, निकटतम अवसर और आजीविका रोडमैप तक पहुँच सकते हैं।",
      te: "జీవిక సాథికి స్వాగతం. ఇది మీ హోమ్ పేజీ, ఇక్కడ మీరు మీ వాయిస్ అసెస్‌మెంట్, ప్రొఫైల్, నైపుణ్య విశ్లేషణ, సిఫార్సులు, సమీప అవకాశాలు మరియు జీవనోపాధి రోడ్‌మ్యాప్‌ను చూడవచ్చు.",
      ta: "ஜீவிகா சாத்திக்கு வரவேற்கிறோம். இது உங்கள் முகப்புப் பக்கம், இங்கு உங்கள் குரல் மதிப்பீடு, சுயவிவரம், திறன் பகுப்பாய்வு, பரிந்துரைகள் மற்றும் வாழ்வாதார வழிகாட்டுதலை அணுகலாம்.",
      kn: "ಜೀವಿಕಾ ಸಾಥಿಗೆ ಸ್ವಾಗತ. ಇದು ನಿಮ್ಮ ಮುಖಪುಟ, ಇಲ್ಲಿ ನೀವು ನಿಮ್ಮ ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ, ಪ್ರೊಫೈಲ್, ಕೌಶಲ್ಯ ವಿಶ್ಲೇಷಣೆ, ಶಿಫಾರಸುಗಳು ಮತ್ತು ಜೀವನೋಪಾಯದ ಮಾರ್ಗಸೂಚಿಯನ್ನು ಪ್ರವೇಶಿಸಬಹುದು.",
      ml: "ജീവിക സാഥിയിലേക്ക് സ്വാഗതം. ഇത് നിങ്ങളുടെ ഹോം പേജാണ്, ഇവിടെ നിങ്ങൾക്ക് നിങ്ങളുടെ വോയ്‌സ് അസസ്സ്മെന്റ്, പ്രൊഫൈൽ, നൈപുണ്യ വിശകലനം, ശുപാർശകൾ, ഉപജീവന മാർഗ്ഗരേഖ എന്നിവ കാണാം."
    }
  },
  "voice-assessment": {
    label: {
      en: "Voice Assessment",
      hi: "मौखिक कौशल मूल्यांकन",
      te: "వాయిస్ అసెస్‌మెంట్",
      ta: "குரல் திறன் மதிப்பீடு",
      kn: "ಧ್ವನಿ ಕೌಶಲ್ಯ ಮೌಲ್ಯಮಾಪನ",
      ml: "വോയ്‌സ് അസസ്സ്മെന്റ്"
    },
    text: {
      en: "You are on the Voice Assessment page. Here Saathi AI talks with you and collects information about your work, skills, interests, aspirations and training availability.",
      hi: "आप मौखिक कौशल मूल्यांकन पेज पर हैं। यहाँ साथी एआई आपसे बात करता है और आपके काम, कौशल, रुचियों, आकांक्षाओं और प्रशिक्षण उपलब्धता के बारे में जानकारी एकत्र करता है।",
      te: "మీరు వాయిస్ అసెస్‌మెంట్ పేజీలో ఉన్నారు. ఇక్కడ సాథి ఏఐ మీతో మాట్లాడి మీ పని, నైపుణ్యాలు, ఆసక్తులు, ఆకాంక్షలు మరియు శిక్షణ లభ్యత గురించిన సమాచారాన్ని సేకరిస్తుంది.",
      ta: "நீங்கள் குரல் மதிப்பீட்டு பக்கத்தில் உள்ளீர்கள். இங்கே சாத்தி AI உங்களுடன் பேசி உங்கள் வேலை, திறன்கள், ஆர்வங்கள் மற்றும் விருப்பங்களைப் பற்றிய தகவல்களைச் சேகரிக்கிறது.",
      kn: "ನೀವು ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಇಲ್ಲಿ ಸಾಥಿ AI ನಿಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಿ ನಿಮ್ಮ ಕೆಲಸ, ಕೌಶಲ್ಯಗಳು, ಆಸಕ್ತಿಗಳು ಮತ್ತು ಆಕಾಂಕ್ಷೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಸಂಗ್ರಹಿಸುತ್ತದೆ.",
      ml: "നിങ്ങൾ വോയ്‌സ് അസസ്സ്മെന്റ് പേജിലാണ്. ഇവിടെ സാഥി AI നിങ്ങളോട് സംസാരിച്ച് നിങ്ങളുടെ ജോലി, കഴിവുകൾ, താല്പര്യങ്ങൾ എന്നിവയെക്കുറിച്ചുള്ള വിവരങ്ങൾ ശേഖരിക്കുന്നു."
    }
  },
  "skill-assessment": {
    label: {
      en: "Skill Assessment",
      hi: "कौशल मूल्यांकन",
      te: "నైపుణ్య అంచనా",
      ta: "திறன் மதிப்பீடு",
      kn: "ಕೌಶಲ್ಯ ಮೌಲ್ಯಮಾಪನ",
      ml: "നൈപുണ്യ വിലയിരുത്തൽ"
    },
    text: {
      en: "You are on the Skill Assessment page. Here you can verify your basic competencies in practical trades like plumbing, electrical work, carpentry, tailoring, or masonry with visual and audio questions.",
      hi: "आप कौशल मूल्यांकन पेज पर हैं। यहाँ आप प्लंबिंग, इलेक्ट्रीशियन, बढ़ईगीरी, सिलाई या चिनाई जैसे व्यावहारिक ट्रेड्स में अपने बुनियादी कौशल की दृश्य और ऑडियो प्रश्नों द्वारा जाँच कर सकते हैं।",
      te: "మీరు నైపుణ్య అంచనా పేజీలో ఉన్నారు. ఇక్కడ మీరు ప్లంబింగ్, ఎలక్ట్రీషియన్, వడ్రంగి, టైలరింగ్ లేదా మేసన్రీ వంటి ప్రాక్టికల్ పనులలో దృశ్య మరియు ఆడియో ప్రశ్నల ద్వారా మీ ప్రాథమిక నైపుణ్యాలను ధృవీకరించుకోవచ్చు.",
      ta: "நீங்கள் திறன் மதிப்பீட்டு பக்கத்தில் உள்ளீர்கள். பிளம்பிங், எலக்ட்ரிக்கல், தச்சு, தையல் போன்ற வேலைகளில் உங்கள் அடிப்படை திறன்களை சரிபார்க்கலாம்.",
      kn: "ನೀವು ಕೌಶಲ್ಯ ಮೌಲ್ಯಮಾಪನ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಕೊಳಾಯಿ, ವಿದ್ಯುತ್, ಬಡಗಿ, ಟೈಲರಿಂಗ್‌ನಂತಹ ಪ್ರಾಯೋಗಿಕ ವೃತ್ತಿಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೂಲ ಕೌಶಲ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.",
      ml: "നിങ്ങൾ നൈപുണ്യ വിലയിരുത്തൽ പേജിലാണ്. പ്ലംബിംഗ്, ഇലക്ട്രിക്കൽ, തയ്യൽ തുടങ്ങിയ പ്രായോഗിക മേഖലകളിലെ നിങ്ങളുടെ അടിസ്ഥാന കഴിവുകൾ ഇവിടെ പരിശോധിക്കാം."
    }
  },
  "livelihood-profile": {
    label: {
      en: "Livelihood Profile",
      hi: "आजीविका प्रोफाइल",
      te: "జీవనోపాధి ప్రొఫైల్",
      ta: "வாழ்வாதார சுயவிவரம்",
      kn: "ಜೀವನೋಪಾಯದ ಪ್ರೊಫೈಲ್",
      ml: "ഉപജീവന പ്രൊഫൈൽ"
    },
    text: {
      en: "You are on your Profile page. Here you can review the personal, educational, skill and livelihood information collected during your assessment.",
      hi: "आप अपनी प्रोफाइल पेज पर हैं। यहाँ आप अपने मूल्यांकन के दौरान एकत्र की गई व्यक्तिगत, शैक्षिक, कौशल और आजीविका संबंधी जानकारी की समीक्षा कर सकते हैं।",
      te: "మీరు మీ ప్రొఫైల్ పేజీలో ఉన్నారు. ఇక్కడ మీ అసెస్‌మెంట్ సమయంలో సేకరించిన వ్యక్తిగత, విద్యా, నైపుణ్య మరియు జీవనోపాధి సమాచారాన్ని పరిశీలించవచ్చు.",
      ta: "நீங்கள் உங்கள் சுயவிவரப் பக்கத்தில் உள்ளீர்கள். உங்கள் தனிப்பட்ட, கல்வி, திறன் மற்றும் வாழ்வாதாரத் தகவல்களை இங்கே மதிப்பாய்வு செய்யலாம்.",
      kn: "ನೀವು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಮೌಲ್ಯಮಾಪನದ ಸಮಯದಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾದ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ, ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಕೌಶಲ್ಯ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.",
      ml: "നിങ്ങൾ നിങ്ങളുടെ പ്രൊഫൈൽ പേജിലാണ്. അസസ്സ്മെന്റ് സമയത്ത് ശേഖരിച്ച നിങ്ങളുടെ വ്യക്തിഗത, വിദ്യാഭ്യാസ, നൈപുണ്യ വിവരങ്ങൾ ഇവിടെ അവലോകനം ചെയ്യാം."
    }
  },
  "skill-analysis": {
    label: {
      en: "Skill & Analysis",
      hi: "कौशल अंतर विश्लेषण",
      te: "నైపుణ్యం & విశ్లేషణ",
      ta: "திறன் மற்றும் பகுப்பாய்வு",
      kn: "ಕೌಶಲ್ಯ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ",
      ml: "നൈപുണ്യവും വിശകലനവും"
    },
    text: {
      en: "You are on the Skill and Analysis page. Here Jeevika Saathi analyzes your existing skills, identifies skill gaps and shows the pathway toward your target livelihood.",
      hi: "आप कौशल और विश्लेषण पेज पर हैं। यहाँ जीविका साथी आपके मौजूदा कौशल का विश्लेषण करता है, कौशल अंतर की पहचान करता है और आपके लक्षित आजीविका की ओर का मार्ग दिखाता है।",
      te: "మీరు నైపుణ్యం మరియు విశ్లేషణ పేజీలో ఉన్నారు. ఇక్కడ జీవిక సాథి మీ ప్రస్తుత నైపుణ్యాలను విశ్లేషించి, నైపుణ్య లోపాలను గుర్తించి, మీ లక్ష్య జీవనోపాధికి మార్గాన్ని చూపుతుంది.",
      ta: "நீங்கள் திறன் மற்றும் பகுப்பாய்வு பக்கத்தில் உள்ளீர்கள். இங்கே ஜீவிகா சாத்தி உங்கள் திறன்களை பகுப்பாய்வு செய்து இடைவெளிகளை அடையாளம் காட்டுகிறது.",
      kn: "ನೀವು ಕೌಶಲ್ಯ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಇಲ್ಲಿ ಜೀವಿಕಾ ಸಾಥಿ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಕೌಶಲ್ಯಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಅಂತರಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ.",
      ml: "നിങ്ങൾ നൈപുണ്യവും വിശകലനവും പേജിലാണ്. ഇവിടെ ജീവിക സാഥി നിങ്ങളുടെ കഴിവുകൾ വിശകലനം ചെയ്യുകയും ലക്ഷ്യത്തിലേക്കുള്ള വഴി കാണിക്കുകയും ചെയ്യുന്നു."
    }
  },
  "recommendations": {
    label: {
      en: "Recommendations",
      hi: "सिफारिशें",
      te: "సిఫార్సులు",
      ta: "பரிந்துரைகள்",
      kn: "ಶಿಫಾರಸುಗಳು",
      ml: "ശുപാർശകൾ"
    },
    text: {
      en: "You are on the Recommendations page. Here you can explore livelihood and training pathways recommended based on your skills, interests, aspirations, availability and preferences.",
      hi: "आप सिफारिशें पेज पर हैं। यहाँ आप अपने कौशल, रुचियों, आकांक्षाओं, उपलब्धता और प्राथमिकताओं के आधार पर अनुशंसित आजीविका और प्रशिक्षण मार्गों का पता लगा सकते हैं।",
      te: "మీరు సిఫార్సుల పేజీలో ఉన్నారు. ఇక్కడ మీ నైపుణ్యాలు, ఆసక్తులు, ఆకాంక్షలు, లభ్యత మరియు ప్రాధాన్యతల ఆధారంగా సిఫార్సు చేయబడిన శిక్షణా మార్గాలను అన్వేషించవచ్చు.",
      ta: "நீங்கள் பரிந்துரைகள் பக்கத்தில் உள்ளீர்கள். உங்கள் திறன்கள், ஆர்வங்கள் மற்றும் விருப்பங்களின் அடிப்படையில் பரிந்துரைக்கப்பட்ட பயிற்சி வழிகளை ஆராயலாம்.",
      kn: "ನೀವು ಶಿಫಾರಸುಗಳ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳು ಮತ್ತು ಆಸಕ್ತಿಗಳ ಆಧಾರದ ಮೇಲೆ ಶಿಫಾರಸು ಮಾಡಲಾದ ಜೀವನೋಪಾಯದ ಮಾರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಬಹುದು.",
      ml: "നിങ്ങൾ ശുപാർശകൾ പേജിലാണ്. നിങ്ങളുടെ കഴിവുകളുടെയും താല്പര്യങ്ങളുടെയും അടിസ്ഥാനത്തിൽ ശുപാർശ ചെയ്ത പരിശീലന വഴികൾ ഇവിടെ പര്യവേക്ഷണം ചെയ്യാം."
    }
  },
  "nearby-opportunities": {
    label: {
      en: "Nearby Opportunities",
      hi: "निकटतम अवसर एवं केंद्र",
      te: "సమీప అవకాశాలు",
      ta: "அருகிலுள்ள வாய்ப்புகள்",
      kn: "ಹತ್ತಿರದ ಅವಕಾಶಗಳು",
      ml: "സമീപത്തുള്ള അവസരങ്ങൾ"
    },
    text: {
      en: "You are on the Nearby Opportunities page. Here you can explore relevant training centers and livelihood opportunities based on your location and mobility preferences.",
      hi: "आप निकटतम अवसर पेज पर हैं। यहाँ आप अपने स्थान और गतिशीलता प्राथमिकताओं के आधार पर प्रासंगिक प्रशिक्षण केंद्र और आजीविका के अवसर खोज सकते हैं।",
      te: "మీరు సమీప అవకాశాల పేజీలో ఉన్నారు. ఇక్కడ మీ స్థానం మరియు ప్రయాణ ప్రాధాన్యతల ఆధారంగా సంబంధిత శిక్షణా కేంద్రాలు మరియు జీవనోపాధి అవకాశాలను చూడవచ్చు.",
      ta: "நீங்கள் அருகிலுள்ள வாய்ப்புகள் பக்கத்தில் உள்ளீர்கள். உங்கள் இருப்பிடத்தின் அடிப்படையில் தொடர்புடைய பயிற்சி மையங்கள் மற்றும் வாய்ப்புகளைக் கண்டறியலாம்.",
      kn: "ನೀವು ಹತ್ತಿರದ ಅವಕಾಶಗಳ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ನಿಮ್ಮ ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ಸೂಕ್ತ ತರಬೇತಿ ಕೇಂದ್ರಗಳು ಮತ್ತು ಜೀವನೋಪಾಯ ಅವಕಾಶಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
      ml: "നിങ്ങൾ സമീപത്തുള്ള അവസരങ്ങൾ പേജിലാണ്. നിങ്ങളുടെ ലൊക്കേഷനെ അടിസ്ഥാനമാക്കിയുള്ള പരിശീലന കേന്ദ്രങ്ങളും അവസരങ്ങളും ഇവിടെ കണ്ടെത്താം."
    }
  },
  "roadmap": {
    label: {
      en: "Livelihood Roadmap",
      hi: "आजीविका रोडमैप",
      te: "జీవనోపాధి రోడ్‌మ్యాప్",
      ta: "வாழ்வாதார வழிகாட்டுதல்",
      kn: "ಜೀವನೋಪಾಯದ ಮಾರ್ಗಸೂಚಿ",
      ml: "ഉപജീവന മാർഗ്ഗരേഖ"
    },
    text: {
      en: "You are on your Livelihood Roadmap page. This page shows your personalized journey from your current skills through training, assessment and certification, toward employment or self-employment.",
      hi: "आप अपनी आजीविका रोडमैप पेज पर हैं। यह पेज आपके वर्तमान कौशल से प्रशिक्षण, मूल्यांकन और प्रमाणन के माध्यम से रोजगार या स्वरोजगार तक की आपकी व्यक्तिगत यात्रा को दर्शाता है।",
      te: "మీరు మీ జీవనోపాధి రోడ్‌మ్యాప్ పేజీలో ఉన్నారు. ఈ పేజీ మీ ప్రస్తుత నైపుణ్యాల నుండి శిక్షణ, అసెస్‌మెంట్ మరియు సర్టిఫికేషన్ ద్వారా ఉపాధి దిశగా మీ ప్రయాణాన్ని చూపుతుంది.",
      ta: "நீங்கள் உங்கள் வாழ்வாதார வழிகாட்டுதல் பக்கத்தில் உள்ளீர்கள். பயிற்சி முதல் வேலைவாய்ப்பு அல்லது சுயதொழில் நோக்கிய உங்கள் பயணத்தை இது காட்டுகிறது.",
      kn: "ನೀವು ನಿಮ್ಮ ಜೀವನೋಪಾಯದ ಮಾರ್ಗಸೂಚಿ ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ಕೌಶಲ್ಯಗಳಿಂದ ಉದ್ಯೋಗ ಅಥವಾ ಸ್ವಯಂ ಉದ್ಯೋಗದವರೆಗಿನ ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಇದು ತೋರಿಸುತ್ತದೆ.",
      ml: "നിങ്ങൾ ഉപജീവന മാർഗ്ഗരേഖ പേജിലാണ്. നിലവിലെ കഴിവുകളിൽ നിന്ന് തൊഴിൽ അല്ലെങ്കിൽ സ്വയംതൊഴിൽ വരെയുള്ള നിങ്ങളുടെ യാത്ര ഇത് കാണിക്കുന്നു."
    }
  },
  "about": {
    label: {
      en: "About PM-AJAY",
      hi: "पीएम-अजय योजना विवरण",
      te: "పీఎం-అజయ్ గురించి",
      ta: "PM-AJAY பற்றி",
      kn: "PM-AJAY ಬಗ್ಗೆ",
      ml: "PM-AJAY സംബന്ധിച്ച്"
    },
    text: {
      en: "You are on the About PM-AJAY page. Here you can learn about the Pradhan Mantri Anusuchit Jaati Abhyuday Yojana scheme guidelines and benefits.",
      hi: "आप पीएम-अजय योजना विवरण पेज पर हैं। यहाँ आप प्रधानमंत्री अनुसूचित जाति अभ्युदय योजना के दिशा-निर्देशों और लाभों की जानकारी ले सकते हैं।",
      te: "మీరు పీఎం-అజయ్ పేజీలో ఉన్నారు. ఇక్కడ మీరు ప్రధాన మంత్రి అనుసూచిత జాతి అభ్యుదయ యోజన మార్గదర్శకాలు మరియు ప్రయోజనాల గురించి తెలుసుకోవచ్చు.",
      ta: "நீங்கள் PM-AJAY திட்ட பக்கத்தில் உள்ளீர்கள். பிரதான் மந்திரி அனுசூசித் ஜாதி அபியுதய யோஜனா திட்ட வழிகாட்டுதல்கள் மற்றும் நன்மைகளை இங்கே அறியலாம்.",
      kn: "ನೀವು PM-AJAY ಪುಟದಲ್ಲಿದ್ದೀರಿ. ಪ್ರಧಾನ ಮಂತ್ರಿ ಅನುಸೂಚಿತ ಜಾತಿ ಅಭ್ಯುದಯ ಯೋಜನೆಯ ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ಪ್ರಯೋಜನಗಳನ್ನು ಇಲ್ಲಿ ತಿಳಿದುಕೊಳ್ಳಿ.",
      ml: "നിങ്ങൾ PM-AJAY പേജിലാണ്. പ്രധാൻ മന്ത്രി അനുസൂചിത് ജാതി അഭ്യുദയ് യോജന പദ്ധതിയുടെ മാർഗ്ഗനിർദ്ദേശങ്ങളും ആനുകൂല്യങ്ങളും ഇവിടെ മനസ്സിലാക്കാം."
    }
  },
  "help": {
    label: {
      en: "Help & FAQ",
      hi: "नागरिक सहायता",
      te: "సహాయం & తరచుగా అడిగే ప్రశ్నలు",
      ta: "உதவி & கேள்விகள்",
      kn: "ಸಹಾಯ ಮತ್ತು FAQ",
      ml: "സഹായവും ചോദ്യോത്തരങ്ങളും"
    },
    text: {
      en: "You are on the Help and FAQ page. Here you can find answers to frequently asked questions about PM-AJAY schemes and services.",
      hi: "आप नागरिक सहायता पेज पर हैं। यहाँ आप पीएम-अजय योजनाओं और सेवाओं से जुड़े अक्सर पूछे जाने वाले प्रश्नों के उत्तर पा सकते हैं।",
      te: "మీరు సహాయం మరియు తరచుగా అడిగే ప్రశ్నల పేజీలో ఉన్నారు. ఇక్కడ పీఎం-అజయ్ పథకాలు మరియు సేవల గురించిన సాధారణ ప్రశ్నలకు సమాధానాలు పొందవచ్చు.",
      ta: "நீங்கள் உதவி பக்கத்தில் உள்ளீர்கள். PM-AJAY திட்டங்கள் மற்றும் சேவைகள் தொடர்பான பொதுவான கேள்விகளுக்கான பதில்களை இங்கே காணலாம்.",
      kn: "ನೀವು ಸಹಾಯ ಪುಟದಲ್ಲಿದ್ದೀರಿ. PM-AJAY ಯೋಜನೆಗಳು ಮತ್ತು ಸೇವೆಗಳ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಗಳನ್ನು ಇಲ್ಲಿ ಹುಡುಕಿ.",
      ml: "നിങ്ങൾ സഹായ പേജിലാണ്. PM-AJAY പദ്ധതികളെയും സേവനങ്ങളെയും കുറിച്ചുള്ള പതിവ് ചോദ്യങ്ങൾക്ക് ഇവിടെ ഉത്തരം കണ്ടെത്താം."
    }
  },
  "monitoring": {
    label: {
      en: "Monitoring Dashboard",
      hi: "निगरानी डैशबोर्ड",
      te: "పర్యవేక్షణ డ్యాష్‌బోర్డ్",
      ta: "கண்காணிப்பு டாஷ்போர்டு",
      kn: "ಮೇಲ್ವಿಚಾರಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      ml: "മോണിറ്ററിംഗ് ഡാഷ്‌ബോർഡ്"
    },
    text: {
      en: "You are on the Monitoring and MIS Dashboard. This page displays administrative metrics, beneficiary enrollment, and progress tracking.",
      hi: "आप निगरानी डैशबोर्ड पर हैं। यहाँ प्रशासनिक स्तर पर जिलों की प्रगति और लाभार्थियों के प्रशिक्षण आंकड़ों की जानकारी उपलब्ध है।",
      te: "మీరు పర్యవేక్షణ డ్యాష్‌బోర్డ్‌లో ఉన్నారు. ఈ పేజీ పరిపాలనా ప్రమాణాలు, లబ్ధిదారుల నమోదు మరియు పురోగతిని ప్రదర్శిస్తుంది.",
      ta: "நீங்கள் கண்காணிப்பு டாஷ்போர்டில் உள்ளீர்கள். நிர்வாக அளவிலான முன்னேற்றம் மற்றும் பயனாளிகளின் புள்ளிவிவரங்கள் இங்கே கிடைக்கின்றன.",
      kn: "ನೀವು ಮೇಲ್ವಿಚಾರಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿದ್ದೀರಿ. ಆಡಳಿತಾತ್ಮಕ ಮಟ್ಟದ ಪ್ರಗತಿ ಮತ್ತು ಫಲಾನುಭವಿಗಳ ಅಂಕಿಅಂಶಗಳನ್ನು ಇಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.",
      ml: "നിങ്ങൾ മോണിറ്ററിംഗ് ഡാഷ്‌ബോർഡിലാണ്. ഭരണതലത്തിലുള്ള പുരോഗതിയും ഗുണഭോക്താക്കളുടെ വിവരങ്ങളും ഇവിടെ ലഭ്യമാണ്."
    }
  }
};

function getFallbackPathKey() {
  if (typeof window === "undefined") return "home";
  const p = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "home";
  return PAGE_GUIDES[p] ? p : "home";
}

export default function VoiceAssistant({ activeTab }) {
  const { language } = useLanguage();
  const [toastMessage, setToastMessage] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const toastTimerRef = useRef(null);

  const currentKey = (activeTab && PAGE_GUIDES[activeTab]) ? activeTab : getFallbackPathKey();
  const pageData = PAGE_GUIDES[currentKey] || PAGE_GUIDES["home"];

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      bhashiniClient.stopAudio();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Stop speech if user navigates to a different page
  useEffect(() => {
    bhashiniClient.stopAudio();
    setIsSpeaking(false);
    setToastMessage(null);
  }, [activeTab]);

  const handleWhereAmI = async () => {
    const textToSpeak = pageData.text[language] || pageData.text.en;

    // Visual Toast Banner for accessibility & hearing impaired
    setToastMessage({
      title: pageData.label[language] || pageData.label.en,
      text: textToSpeak
    });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 8000);

    // Speak using Bhashini TTS (with automatic browser fallback)
    setIsSpeaking(true);
    try {
      await bhashiniClient.speakText(textToSpeak, language, "female", {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    } catch (err) {
      console.warn("[VoiceAssistant] TTS error:", err);
      setIsSpeaking(false);
    }
  };

  const handleCloseToast = () => {
    bhashiniClient.stopAudio();
    setIsSpeaking(false);
    setToastMessage(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  return (
    <>
      {/* Inline styles for responsive layout and animations */}
      <style>{`
        @keyframes whereAmIPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fadeInWhereAmI {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .where-am-i-speaking-icon {
          animation: whereAmIPulse 1.2s infinite ease-in-out;
        }
        @media (max-width: 640px) {
          .where-am-i-btn {
            height: 46px !important;
            padding: 0 14px !important;
          }
          .where-am-i-subtitle {
            display: none !important;
          }
          .where-am-i-context {
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Visual Announcement Banner when user clicks "Where Am I?" */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "#0f382c",
            color: "#ffffff",
            padding: "14px 18px",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            border: "2px solid #ea580c",
            maxWidth: "380px",
            animation: "fadeInWhereAmI 0.25s ease-out",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "2px"
            }}
          >
            <Volume2 size={15} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, color: "#fed7aa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <MapPin size={12} color="#ea580c" />
              <span>{toastMessage.title}</span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#f1f5f9", marginTop: "4px", lineHeight: 1.45 }}>
              {toastMessage.text}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseToast}
            aria-label="Close announcement"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "2px",
              marginTop: "1px"
            }}
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {/* FLOATING "WHERE AM I? • AUDIO GUIDE" PILL BUTTON */}
      <aside
        aria-label="Audio Guide Navigation Helper"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 995
        }}
      >
        <button
          type="button"
          onClick={handleWhereAmI}
          className="where-am-i-btn"
          title={
            language === "hi"
              ? "कहाँ हैं आप? सुनिए (Where Am I? • Audio Guide)"
              : language === "te"
              ? "నేను ఎక్కడ ఉన్నాను? వినండి (Where Am I? • Audio Guide)"
              : language === "ta"
              ? "நான் எங்கே இருக்கிறேன்? கேளுங்கள் (Where Am I? • Audio Guide)"
              : language === "kn"
              ? "ನಾನು ಎಲ್ಲಿದ್ದೇನೆ? ಕೇಳಿ (Where Am I? • Audio Guide)"
              : language === "ml"
              ? "ഞാൻ എവിടെയാണ്? കേൾക്കൂ (Where Am I? • Audio Guide)"
              : "Where Am I? • Audio Guide"
          }
          aria-label="Where Am I audio guide"
          style={{
            height: "52px",
            padding: "0 20px",
            borderRadius: "9999px",
            backgroundColor: "#0f382c",
            color: "#ffffff",
            border: "2.5px solid #ffffff",
            boxShadow: isSpeaking
              ? "0 0 0 4px rgba(234, 88, 12, 0.85), 0 10px 28px rgba(15, 56, 44, 0.5)"
              : "0 0 0 3px rgba(234, 88, 12, 0.5), 0 8px 24px rgba(15, 56, 44, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "11px",
            transition: "all 0.2s ease",
            userSelect: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.backgroundColor = "#0a2920";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1.0)";
            e.currentTarget.style.backgroundColor = "#0f382c";
          }}
        >
          {/* Circular Orange Speaker Icon */}
          <div
            className={isSpeaking ? "where-am-i-speaking-icon" : ""}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#ea580c",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(234, 88, 12, 0.4)"
            }}
          >
            <Volume2 size={16} />
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, lineHeight: 1.15, display: "flex", alignItems: "center", gap: "6px" }}>
              <span>
                {language === "hi"
                  ? "कहाँ हैं आप?"
                  : language === "te"
                  ? "నేను ఎక్కడ ఉన్నాను?"
                  : language === "ta"
                  ? "நான் எங்கே இருக்கிறேன்?"
                  : language === "kn"
                  ? "ನಾನು ಎಲ್ಲಿದ್ದೇನೆ?"
                  : language === "ml"
                  ? "ഞാൻ എവിടെയാണ്?"
                  : "Where Am I?"}
              </span>
              <span className="where-am-i-subtitle" style={{ fontSize: "11px", color: "#fed7aa", fontWeight: 700 }}>
                • {language === "hi"
                  ? "ऑडियो गाइड"
                  : language === "te"
                  ? "ఆడియో గైడ్"
                  : language === "ta"
                  ? "ஆடியோ வழிகாட்டி"
                  : language === "kn"
                  ? "ಆಡಿಯೋ ಮಾರ್ಗದರ್ಶಿ"
                  : language === "ml"
                  ? "ഓഡിയോ ഗൈഡ്"
                  : "Audio Guide"}
              </span>
            </div>
            <div className="where-am-i-context" style={{ fontSize: "11px", color: "#a7f3d0", fontWeight: 600, marginTop: "1px" }}>
              {pageData.label[language] || pageData.label.en}
            </div>
          </div>
        </button>
      </aside>
    </>
  );
}
