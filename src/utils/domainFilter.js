import { PM_AJAY_KNOWLEDGE } from "../data/pmAjayKnowledge";
import { NSQF_KNOWLEDGE } from "../data/nsqfKnowledge";
import { FAQS } from "../data/faq";

/**
 * Domain-restriction and input validation utility for Saathi Assistant.
 * Strictly enforces that only PM-AJAY, NSQF, skilling, eligibility, and portal guidance questions are answered.
 */

// Allowed domain concepts & keywords (English & Hindi)
const ALLOWED_CONCEPTS = [
  "pm-ajay", "pm ajay", "pmajay", "ajay",
  "nsqf", "ncvet", "nsdc", "qualification pack", "qp", "nos",
  "skill", "skilling", "training", "course", "trade", "certificate", "certification",
  "livelihood", "beneficiary", "eligibility", "eligible", "stipend", "dbt", "grant", "allowance",
  "sc", "scheduled caste", "artisan", "rpl", "prior learning",
  "center", "centre", "pmkk", "map", "opportunity", "opportunities", "seat", "enroll", "enrollment",
  "jeevika", "saathi", "voice", "assessment", "profile", "roadmap", "help",
  // Hindi concepts
  "पीएम-अजय", "पीएम अजय", "कौशल", "ट्रेनिंग", "प्रशिक्षण", "हुनर", "आजीविका",
  "एनएसक्यूएफ", "वज़ीफ़ा", "स्टाइपेंड", "डीबीटी", "पात्रता", "पात्र", "लाभार्थी",
  "अनुसूचित जाति", "कारीगर", "टूलकिट", "केंद्र", "सेंटर", "साथी", "जीविका साथी"
];

// Out-of-scope prohibited topics (cricket, movies, weather, jokes, homework, coding, politics, recipes, etc.)
const DISALLOWED_TOPICS = [
  "cricket", "ipl", "football", "match", "score",
  "movie", "film", "actor", "actress", "cinema", "song", "bollywood", "hollywood",
  "weather", "forecast", "rain", "temperature",
  "recipe", "cooking", "food", "cook", "restaurant",
  "joke", "funny", "meme", "riddle", "story",
  "coding", "javascript", "python", "html", "css", "java", "sql", "bug", "algorithm",
  "homework", "essay", "physics", "chemistry", "calculus",
  "election", "political party", "bjp", "congress", "vote", "war", "celebrity"
];

/**
 * Validates whether user query is within the supported PM-AJAY & NSQF domain.
 * @param {string} query 
 * @returns {boolean}
 */
export function isRelevantQuery(query) {
  if (!query || typeof query !== "string") return false;
  const q = query.trim().toLowerCase();
  if (q.length < 2) return false;

  // 1. Check for prohibited topics explicitly
  const hasDisallowed = DISALLOWED_TOPICS.some((badWord) => {
    const regex = new RegExp(`\\b${badWord}\\b`, "i");
    return regex.test(q);
  });

  if (hasDisallowed) {
    return false;
  }

  // 2. Check for presence of allowed concepts
  const hasAllowed = ALLOWED_CONCEPTS.some((keyword) => {
    return q.includes(keyword);
  });

  return hasAllowed;
}

/**
 * Standard out-of-scope response when user asks an unrelated query.
 * @param {string} lang 
 * @returns {string}
 */
export function getDomainRestrictedResponse(lang = "en") {
  const responses = {
    hi: "मैं 'साथी असिस्टेंट' (Saathi Assistant) हूँ, जो केवल पीएम-अजय (PM-AJAY) और एनएसक्यूएफ (NSQF) कौशल मार्गदर्शन के लिए समर्पित है। कृपया मुझसे पीएम-अजय योजनाओं, एनएसक्यूएफ कोर्स, पात्रता, वज़ीफ़ा या कौशल केंद्रों के बारे में पूछें।",
    en: "I'm Saathi Assistant, focused on PM-AJAY and NSQF-related guidance. Please ask me about PM-AJAY, NSQF, skill training, eligibility, or livelihood opportunities.",
    te: "నేను సాథీ అసిస్టెంట్, PM-AJAY మరియు NSQF నైపుణ్య మార్గదర్శకత్వంపై మాత్రమే సహాయం చేయగలను. దయచేసి PM-AJAY, కోర్సులు లేదా అర్హత గురించి అడగండి.",
    ta: "நான் சாதி உதவியாளர் (Saathi Assistant). PM-AJAY மற்றும் NSQF பயிற்சி தொடர்பான கேள்விகளுக்கு மட்டுமே பதிலளிக்க முடியும்.",
    kn: "ನಾನು ಸಾಥಿ ಸಹಾಯಕ, PM-AJAY ಮತ್ತು NSQF ಕೌಶಲ್ಯ ತರಬೇತಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ.",
    mr: "मी साथी असिस्टंट आहे, जो केवळ पीएम-अजय आणि एनएसक्यूएफ कौशल्य मार्गदर्शनासाठी समर्पित आहे."
  };

  return responses[lang] || responses.en;
}

/**
 * Local verified answering engine for relevant domain queries
 * @param {string} query 
 * @param {string} lang 
 * @returns {string}
 */
export function answerRelevantQuery(query, lang = "en") {
  const q = query.toLowerCase();

  // What is PM-AJAY
  if (q.includes("what is pm") || q.includes("pm-ajay kya") || q.includes("pm ajay kya") || q.includes("योजना क्या है")) {
    const faq = FAQS.find(f => f.id === "what-is-pmajay");
    return lang === "hi" ? faq.answerHi : faq.answerEn;
  }

  // What is NSQF
  if (q.includes("nsqf") && (q.includes("what") || q.includes("kya") || q.includes("level"))) {
    const faq = FAQS.find(f => f.id === "what-is-nsqf");
    return lang === "hi" ? faq.answerHi : faq.answerEn;
  }

  // Eligibility
  if (q.includes("eligib") || q.includes("patra") || q.includes("पात्र") || q.includes("eligible")) {
    const faq = FAQS.find(f => f.id === "am-i-eligible");
    return lang === "hi" ? faq.answerHi : faq.answerEn;
  }

  // How Jeevika Saathi works
  if (q.includes("how does") || q.includes("jeevika") || q.includes("kaise kaam") || q.includes("काम कैसे")) {
    const faq = FAQS.find(f => f.id === "how-jeevika-works");
    return lang === "hi" ? faq.answerHi : faq.answerEn;
  }

  // Nearby Centers & Map
  if (q.includes("center") || q.includes("centre") || q.includes("map") || q.includes("kendra") || q.includes("केंद") || q.includes("मैप")) {
    const faq = FAQS.find(f => f.id === "nearby-centers");
    return lang === "hi" ? faq.answerHi : faq.answerEn;
  }

  // Stipend / DBT
  if (q.includes("stipend") || q.includes("dbt") || q.includes("paisa") || q.includes("rupee") || q.includes("वजीफा") || q.includes("वज़ीफ़ा")) {
    return lang === "hi"
      ? "पीएम-अजय जीआईए घटक के तहत सभी स्वीकृत एनएसक्यूएफ कोर्स के दौरान लाभार्थियों को ₹3,000 से ₹4,500 प्रति माह का नकद वज़ीफ़ा सीधे आधार-सीडेड बैंक खाते (DBT) में भेजा जाता है। इसके अलावा कोर्स पूरा होने पर नि:शुल्क टूलकिट भी दी जाती है।"
      : "Under the PM-AJAY GIA Component, beneficiaries receive a monthly direct cash stipend between ₹3,000 to ₹4,500/month disbursed via Direct Benefit Transfer (DBT) into their Aadhaar-linked bank account, along with a free startup toolkit on completion.";
  }

  // Default helpful domain response
  return lang === "hi"
    ? "जीविका साथी के उपलब्ध आंकड़ों के अनुसार, आप सोलर इलेक्ट्रीशियन (NSQF Level 3), फुटवियर लेदर कारीगर, और बीपीओ कस्टमर एग्जीक्यूटिव जैसे नि:शुल्क सरकारी कोर्स में नामांकन कर सकते हैं। अधिक जानकारी के लिए 'अनुशंसाएँ' या 'नज़दीकी अवसर' टैब देखें।"
    : "Based on available PM-AJAY guidelines, you can enroll in 100% sponsored NSQF courses such as Solar Domestic Electrician (Level 3), Footwear Leather Artisan, and Customer Service Executive with monthly DBT stipends. Visit the 'AI Recommendations' or 'Nearby Opportunities' tabs for details.";
}
