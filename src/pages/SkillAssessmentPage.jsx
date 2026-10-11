// src/pages/SkillAssessmentPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ClipboardCheck, Volume2, VolumeX, Mic, MicOff, CheckCircle2, 
  AlertTriangle, ArrowRight, ArrowLeft, RotateCcw, BookOpen, 
  ShieldCheck, Award, Wrench, Zap, Hammer, Scissors, Layers, 
  ExternalLink, Clock, UserCheck, HelpCircle, Sprout
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useSession } from "../context/SessionContext";
import { selectBestVoice, getLocaleForLanguage, cancelSpeechPlayback } from "../utils/voiceSelector";
import { 
  SKILL_ASSESSMENT_QUESTIONS, 
  TRADE_DEFINITIONS, 
  COMPETENCY_LABELS 
} from "../data/skillAssessmentQuestions";
import { 
  submitAssessmentForEvaluation, 
  fetchUserAssessmentHistory, 
  fetchVerifiedSkillsStatus 
} from "../services/assessmentService";
import { searchNSQFDataset } from "../services/matchingService";

export default function SkillAssessmentPage({ 
  userProfile, 
  onNavigateToTraining, 
  onNavigateToProfile,
  onNavigateToVoice 
}) {
  const { language, t } = useLanguage();
  const { beneficiaryProfile, updateProfile } = useSession();

  const userId = userProfile?.id || beneficiaryProfile?.beneficiary_id || (typeof sessionStorage !== "undefined" && sessionStorage.getItem("user_phone") ? `ben_${sessionStorage.getItem("user_phone")}` : "beneficiary_guest");

  // Identify pre-selected trade from Voice Assessment or profile
  const voiceInterestTrade = useMemo(() => {
    const combined = [
      ...(beneficiaryProfile?.interests || []),
      beneficiaryProfile?.current_occupation,
      beneficiaryProfile?.career_aspiration,
      userProfile?.trade
    ].filter(Boolean).join(" ").toLowerCase();

    if (/plumb/.test(combined)) return "plumbing";
    if (/electr/.test(combined)) return "electrician";
    if (/carpent|wood/.test(combined)) return "carpentry";
    if (/tailor|sew|stitch|cloth|garment/.test(combined)) return "tailoring";
    if (/mason|brick|construct/.test(combined)) return "masonry";
    if (/farm|agri|crop|cultivation|harvest/.test(combined)) return "farming";
    return null;
  }, [beneficiaryProfile, userProfile]);

  // Page States: 'select_trade' | 'intro' | 'assessment' | 'submitting' | 'result'
  const [stage, setStage] = useState("select_trade");
  const [selectedTrade, setSelectedTrade] = useState("plumbing");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [verifiedMap, setVerifiedMap] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NIELIT / NSQF Dataset Recommendations State
  const [nsqfCourses, setNsqfCourses] = useState([]);
  const [loadingNsqf, setLoadingNsqf] = useState(false);
  const [nsqfNotice, setNsqfNotice] = useState(null);
  const [nsqfSearchTerm, setNsqfSearchTerm] = useState("");
  const [isVoiceSearchingNsqf, setIsVoiceSearchingNsqf] = useState(false);
  const [speakingCourseId, setSpeakingCourseId] = useState(null);

  // Speech Recognition Reference
  const recognitionRef = useRef(null);
  const nsqfRecognitionRef = useRef(null);
  const lastSpokenQRef = useRef(null); // Prevents duplicate auto-speak on re-renders

  // Fetch NIELIT dataset courses matching trade or explicit search term
  const loadNsqfCoursesForTrade = async (tradeKey, explicitQuery = "") => {
    setLoadingNsqf(true);
    setNsqfNotice(null);
    try {
      let params = { limit: 6 };
      if (explicitQuery) {
        params.query = explicitQuery;
      } else if (tradeKey === "electrician") {
        params.sector = "Electronics";
        params.interest = "electrical";
      } else if (tradeKey === "farming") {
        params.sector = "Electronics";
        params.interest = "agriculture";
      } else if (tradeKey === "plumbing" || tradeKey === "carpentry" || tradeKey === "masonry") {
        params.role = "maintenance";
        params.sector = "Electronics";
      } else {
        params.sector = "IT";
      }

      const res = await searchNSQFDataset(params);
      if (res && res.success) {
        setNsqfCourses(res.records || []);
        if (res.notice) setNsqfNotice(res.notice);
      }
    } catch (err) {
      console.warn("Could not load NSQF courses for trade:", err);
    } finally {
      setLoadingNsqf(false);
    }
  };

  // Trigger dataset fetch when selectedTrade changes
  useEffect(() => {
    loadNsqfCoursesForTrade(selectedTrade, nsqfSearchTerm);
  }, [selectedTrade]);

  // Audio readout for low-literacy beneficiaries
  const handleSpeakCourse = (course) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingCourseId === course.id) {
      cancelSpeechPlayback();
      setSpeakingCourseId(null);
      return;
    }
    cancelSpeechPlayback();
    const textToSpeak = `${course.qualification}. Sector: ${course.sector}. NSQF Level ${course.nsqf_level}. Training duration: ${course.training_info?.notional_hours || 200} hours. Inferred entry requirement: ${course.entry_profile?.inferred_minimum || 'Open to all'}. Free training provided under PM-AJAY.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = getLocaleForLanguage(language);
    const voice = selectBestVoice(window.speechSynthesis.getVoices(), language);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeakingCourseId(null);
    utterance.onerror = () => setSpeakingCourseId(null);
    setSpeakingCourseId(course.id);
    window.speechSynthesis.speak(utterance);
  };

  // Voice search for courses
  const handleVoiceSearchNsqf = () => {
    if (isVoiceSearchingNsqf) {
      if (nsqfRecognitionRef.current) nsqfRecognitionRef.current.stop();
      setIsVoiceSearchingNsqf(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please type your search.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = getLocaleForLanguage(language);
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsVoiceSearchingNsqf(true);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setIsVoiceSearchingNsqf(false);
      setNsqfSearchTerm(transcript);
      loadNsqfCoursesForTrade(selectedTrade, transcript);
    };
    rec.onerror = () => setIsVoiceSearchingNsqf(false);
    rec.onend = () => setIsVoiceSearchingNsqf(false);
    nsqfRecognitionRef.current = rec;
    rec.start();
  };

  // Auto-set trade if Voice Assessment identified one
  useEffect(() => {
    if (voiceInterestTrade) {
      setSelectedTrade(voiceInterestTrade);
    }
  }, [voiceInterestTrade]);

  // Load user assessment history and verified status on mount
  useEffect(() => {
    async function loadHistory() {
      const [hist, verified] = await Promise.all([
        fetchUserAssessmentHistory(userId),
        fetchVerifiedSkillsStatus(userId)
      ]);
      setHistoryList(hist || []);
      setVerifiedMap(verified || {});
    }
    loadHistory();
  }, [userId]);

  // Get question bank for active trade
  const tradeQuestions = useMemo(() => {
    return SKILL_ASSESSMENT_QUESTIONS[selectedTrade] || [];
  }, [selectedTrade]);

  const currentQuestion = tradeQuestions[currentQIndex];
  const tradeMeta = TRADE_DEFINITIONS[selectedTrade] || TRADE_DEFINITIONS.plumbing;

  // Multilingual strings
  const strings = {
    en: {
      pageTitle: "Skill Competency Assessment",
      pageSubtitle: "Verify your practical skills to unlock verified customer-facing opportunities.",
      safetyGateBanner: "Critical Safety Gate: Stated interest ≠ Verified skill. Complete this evaluation to earn verified status.",
      recommendedForYou: "Recommended Based on Voice Assessment",
      voiceIdentifiedMsg: `Voice Assessment detected interest in ${tradeMeta.name.en}. Let's check your basic ${tradeMeta.name.en.toLowerCase()} skills.`,
      chooseTradeTitle: "Choose a Trade to Assess",
      chooseTradeDesc: "Select the skill you want to verify. You do not need formal certificates to take this basic assessment.",
      startBtn: "Start Skill Assessment",
      trainingBtn: "I Want Training First",
      questionOf: (curr, total) => `Question ${curr} of ${total}`,
      listenBtn: "Listen to Question",
      stopListenBtn: "Stop Audio",
      speakAnswerBtn: "Speak Your Answer",
      listeningMsg: "Listening... speak the tool or answer clearly",
      nextBtn: "Next Question",
      prevBtn: "Previous",
      submitBtn: "Complete & Verify Skill",
      resultTitle: `${tradeMeta.name.en.toUpperCase()} SKILL ASSESSMENT RESULT`,
      statusVerified: "SKILL VERIFIED ✓",
      statusTraining: "TRAINING RECOMMENDED",
      statusReassessment: "REASSESSMENT RECOMMENDED",
      verifiedDesc: "Congratulations! Your competencies have been verified. You are now eligible for verified customer-facing bookings.",
      trainingDesc: "Your basic skills are not fully verified yet. We recommend completing an NSQF-aligned training course to build mastery.",
      reassessmentDesc: "You were close to the passing threshold! Review key safety and tool concepts and retake the assessment.",
      competencyScores: "Competency Breakdown",
      practicalVerification: "Practical Verification (Simulated)",
      practicalDone: "Completed Safely ✓",
      retakeBtn: "Retake Assessment",
      exploreTrainingBtn: "Explore Training Centers",
      viewProfileBtn: "View Updated Profile",
      historyBtn: "View Past Attempts",
      attempt: "Attempt",
      score: "Score",
      date: "Date",
      status: "Status",
      passMark: `Passing Threshold: ${tradeMeta.passScore}%`,
      orTapOption: "or tap an option below",
      noMatchMsg: "Could not match. Please select an option or try speaking again."
    },
    hi: {
      pageTitle: "व्यावहारिक कौशल मूल्यांकन",
      pageSubtitle: "ग्राहक-उन्मुख सत्यापित अवसरों को अनलॉक करने के लिए अपने कौशल का सत्यापन करें।",
      safetyGateBanner: "सुरक्षा गेट: केवल रुचि ≠ सत्यापित कौशल। प्रमाणित होने के लिए यह मूल्यांकन पूरा करें।",
      recommendedForYou: "वॉइस असेसमेंट के आधार पर अनुशंसित",
      voiceIdentifiedMsg: `वॉइस असेसमेंट में ${tradeMeta.name.hi} में रुचि पाई गई। आइए आपके बुनियादी ${tradeMeta.name.hi} कौशल की जाँच करें।`,
      chooseTradeTitle: "मूल्यांकन के लिए ट्रेड चुनें",
      chooseTradeDesc: "जिस कौशल की जाँच करनी है उसे चुनें। इस बुनियादी मूल्यांकन के लिए डिग्री की आवश्यकता नहीं है।",
      startBtn: "कौशल मूल्यांकन शुरू करें",
      trainingBtn: "मुझे पहले प्रशिक्षण चाहिए",
      questionOf: (curr, total) => `प्रश्न ${curr} / ${total}`,
      listenBtn: "प्रश्न सुनें",
      stopListenBtn: "आवाज रोकें",
      speakAnswerBtn: "बोलकर उत्तर दें",
      listeningMsg: "सुन रहे हैं... कृपया अपना उत्तर स्पष्ट बोलें",
      nextBtn: "अगला प्रश्न",
      prevBtn: "पिछला प्रश्न",
      submitBtn: "मूल्यांकन जमा करें और जाँचें",
      resultTitle: `${tradeMeta.name.hi} कौशल मूल्यांकन परिणाम`,
      statusVerified: "कौशल सत्यापित ✓",
      statusTraining: "प्रशिक्षण अनुशंसित",
      statusReassessment: "पुनः मूल्यांकन अनुशंसित",
      verifiedDesc: "बधाई हो! आपकी बुनियादी दक्षताएं सत्यापित हो गई हैं। अब आप सत्यापित कामगार अवसरों के लिए पात्र हैं।",
      trainingDesc: "आपका कौशल अभी पूरी तरह से सत्यापित नहीं है। हम सलाह देते हैं कि आप प्रशिक्षण पूरा करें।",
      reassessmentDesc: "आप पास होने के बेहद करीब थे! सुरक्षा और औजारों के नियमों को दोहराएं और दोबारा प्रयास करें।",
      competencyScores: "दक्षता विवरण (Competency Breakdown)",
      practicalVerification: "व्यावहारिक सत्यापन (सुरक्षित सिमुलेशन)",
      practicalDone: "सफलतापूर्वक पूर्ण ✓",
      retakeBtn: "दोबारा मूल्यांकन दें",
      exploreTrainingBtn: "प्रशिक्षण केंद्र देखें",
      viewProfileBtn: "प्रोफाइल देखें",
      historyBtn: "पिछले प्रयास देखें",
      attempt: "प्रयास",
      score: "अंक",
      date: "दिनांक",
      status: "स्थिति",
      passMark: `उत्तीर्ण अंक: ${tradeMeta.passScore}%`,
      orTapOption: "या नीचे विकल्प चुनें",
      noMatchMsg: "मेल नहीं मिला। कृपया विकल्प चुनें या फिर से बोलें।"
    },
    te: {
      pageTitle: "నైపుణ్య సామర్థ్య అంచనా",
      pageSubtitle: "ధృవీకరించబడిన ఉద్యోగ మరియు వ్యాపార అవకాశాలను అన్‌లాక్ చేయడానికి మీ నైపుణ్యాలను ధృవీకరించుకోండి.",
      safetyGateBanner: "భద్రతా నిబంధన: కేవలం ఆసక్తి ≠ ధృవీకరించబడిన నైపుణ్యం. సర్టిఫై కావడానికి ఈ పరీక్షను పూర్తి చేయండి.",
      recommendedForYou: "వాయిస్ అసెస్‌మెంట్ ఆధారంగా సిఫార్సు చేయబడింది",
      voiceIdentifiedMsg: `వాయిస్ అసెస్‌మెంట్‌లో ${tradeMeta.name.te} పట్ల ఆసక్తి ఉన్నట్లు గుర్తించబడింది. మీ ప్రాథమిక ${tradeMeta.name.te} నైపుణ్యాలను పరిశీలిద్దాం.`,
      chooseTradeTitle: "పరీక్ష కోసం వృత్తిని ఎంచుకోండి",
      chooseTradeDesc: "మీరు ధృవీకరించుకోవాలనుకుంటున్న నైపుణ్యాన్ని ఎంచుకోండి. దీనికి ఎలాంటి ముందస్తు డిగ్రీ అవసరం లేదు.",
      startBtn: "నైపుణ్య అంచనాను ప్రారంభించండి",
      trainingBtn: "నాకు ముందుగా శిక్షణ కావాలి",
      questionOf: (curr, total) => `ప్రశ్న ${curr} / ${total}`,
      listenBtn: "ప్రశ్న వినండి",
      stopListenBtn: "ఆడియో ఆపు",
      speakAnswerBtn: "మాట్లాడి సమాధానం ఇవ్వండి",
      listeningMsg: "వింటున్నాము... మీ సమాధానాన్ని స్పష్టంగా చెప్పండి",
      nextBtn: "తరువాతి ప్రశ్న",
      prevBtn: "మునుపటి ప్రశ్న",
      submitBtn: "సమర్పించి ధృవీకరించుకోండి",
      resultTitle: `${tradeMeta.name.te} నైపుణ్య అంచనా ఫలితం`,
      statusVerified: "నైపుణ్యం ధృవీకరించబడింది ✓",
      statusTraining: "శిక్షణ సిఫార్సు చేయబడింది",
      statusReassessment: "పునః మూల్యాంకనం సిఫార్సు చేయబడింది",
      verifiedDesc: "అభినందనలు! మీ ప్రాథమిక సామర్థ్యాలు ధృవీకరించబడ్డాయి. మీరు ఇప్పుడు ధృవీకరించబడిన ఉద్యోగాలకు అర్హులు.",
      trainingDesc: "మీ నైపుణ్యం ఇంకా పూర్తిగా ధృవీకరించబడలేదు. నిపుణత పొందడానికి శిక్షణా కోర్సు తీసుకోవాలని సిఫార్సు చేస్తున్నాము.",
      reassessmentDesc: "మీరు ఉత్తీర్ణత మార్కులకు దగ్గరగా వచ్చారు! భద్రతా అంశాలను పరిశీలించి మళ్ళీ పరీక్ష రాయండి.",
      competencyScores: "సామర్థ్య విభజన (Competency Breakdown)",
      practicalVerification: "ప్రాక్టికల్ వెరిఫికేషన్ (సురక్షిత సిమ్యులేషన్)",
      practicalDone: "విజయవంతంగా పూర్తయింది ✓",
      retakeBtn: "మళ్లీ పరీక్ష రాయండి",
      exploreTrainingBtn: "శిక్షణా కేంద్రాలను చూడండి",
      viewProfileBtn: "ప్రొఫైల్ చూడండి",
      historyBtn: "గత ప్రయత్నాలు చూడండి",
      attempt: "ప్రయత్నం",
      score: "స్కోరు",
      date: "తేదీ",
      status: "స్థితి",
      passMark: `ఉత్తీర్ణత మార్కు: ${tradeMeta.passScore}%`,
      orTapOption: "లేదా క్రింద ఆప్షన్ ఎంచుకోండి",
      noMatchMsg: "సరిపోలలేదు. దయచేసి ఆప్షన్ ఎంచుకోండి లేదా మళ్ళీ చెప్పండి."
    },
    kn: {
      pageTitle: "ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯ ಸಾಮರ್ಥ್ಯ ಮೌಲ್ಯಮಾಪನ",
      pageSubtitle: "ಪರಿಶೀಲಿತ ಉದ್ಯೋಗ ಮತ್ತು ವ್ಯಾಪಾರಾವಕಾಶಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸಿಕೊಳ್ಳಿ.",
      safetyGateBanner: "ಸುರಕ್ಷತಾ ಮಾನದಂಡ: ಕೇವಲ ಆಸಕ್ತಿ ≠ ಪರಿಶೀಲಿತ ಕೌಶಲ್ಯ. ಪ್ರಮಾಣೀಕರಿಸಲು ಈ ಪರೀಕ್ಷೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
      recommendedForYou: "ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನದ ಆಧಾರದ ಮೇಲೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
      voiceIdentifiedMsg: `ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನದಲ್ಲಿ ${tradeMeta.name.kn || tradeMeta.name.en} ನಲ್ಲಿ ಆಸಕ್ತಿ ಕಂಡುಬಂದಿದೆ. ನಿಮ್ಮ ಮೂಲಭೂತ ಕೌಶಲ್ಯಗಳನ್ನು ಪರಿಶೀಲಿಸೋಣ.`,
      chooseTradeTitle: "ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ವೃತ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      chooseTradeDesc: "ನೀವು ಪರೀಕ್ಷಿಸಲು ಬಯಸುವ ಕೌಶಲ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಇದಕ್ಕೆ ಯಾವುದೇ ಪದವಿ ಅಗತ್ಯವಿಲ್ಲ.",
      startBtn: "ಕೌಶಲ್ಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಪ್ರಾರಂಭಿಸಿ",
      trainingBtn: "ನನಗೆ ಮೊದಲು ತರಬೇತಿ ಬೇಕು",
      questionOf: (curr, total) => `ಪ್ರಶ್ನೆ ${curr} / ${total}`,
      listenBtn: "ಪ್ರಶ್ನೆ ಆಲಿಸಿ",
      stopListenBtn: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
      speakAnswerBtn: "ಮಾತನಾಡಿ ಉತ್ತರಿಸಿ",
      listeningMsg: "ಆಲಿಸುತ್ತಿದ್ದೇವೆ... ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ",
      nextBtn: "ಮುಂದಿನ ಪ್ರಶ್ನೆ",
      prevBtn: "ಹಿಂದಿನ ಪ್ರಶ್ನೆ",
      submitBtn: "ಸಲ್ಲಿಸಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ",
      resultTitle: `${tradeMeta.name.kn || tradeMeta.name.en} ಕೌಶಲ್ಯ ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶ`,
      statusVerified: "ಕೌಶಲ್ಯ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ✓",
      statusTraining: "ತರಬೇತಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
      statusReassessment: "ಮರು ಮೌಲ್ಯಮಾಪನ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
      verifiedDesc: "ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಮೂಲಭೂತ ಸಾಮರ್ಥ್ಯಗಳು ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿವೆ. ನೀವು ಈಗ ಉದ್ಯೋಗಾವಕಾಶಗಳಿಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ.",
      trainingDesc: "ನಿಮ್ಮ ಕೌಶಲ್ಯವು ಇನ್ನೂ ಸಂಪೂರ್ಣವಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿಲ್ಲ. ತರಬೇತಿ ಕೋರ್ಸ್ ತೆಗೆದುಕೊಳ್ಳಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ.",
      reassessmentDesc: "ನೀವು ಉತ್ತೀರ್ಣತೆಗೆ ಹತ್ತಿರದಲ್ಲಿದ್ದೀರಿ! ಸುರಕ್ಷತಾ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      competencyScores: "ಸಾಮರ್ಥ್ಯ ವಿವರ (Competency Breakdown)",
      practicalVerification: "ಪ್ರಾಯೋಗಿಕ ಪರಿಶೀಲನೆ (ಸುರಕ್ಷಿತ ಸಿಮ್ಯುಲೇಶನ್)",
      practicalDone: "ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ ✓",
      retakeBtn: "ಮತ್ತೆ ಪರೀಕ್ಷೆ ನೀಡಿ",
      exploreTrainingBtn: "ತರಬೇತಿ ಕೇಂದ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      viewProfileBtn: "ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ",
      historyBtn: "ಹಿಂದಿನ ಪ್ರಯತ್ನಗಳು",
      attempt: "ಪ್ರಯತ್ನ",
      score: "ಅಂಕ",
      date: "ದಿನಾಂಕ",
      status: "ಸ್ಥಿತಿ",
      passMark: `ಉತ್ತೀರ್ಣ ಮಾರ್ಕ್: ${tradeMeta.passScore}%`,
      orTapOption: "ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಯನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ",
      noMatchMsg: "ಹೊಂದಾಣಿಕೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ ಅಥವಾ ಮತ್ತೆ ಮಾತನಾಡಿ."
    },
    ta: {
      pageTitle: "நடைமுறை திறன் தகுதி மதிப்பீடு",
      pageSubtitle: "சரிபார்க்கப்பட்ட வேலை மற்றும் வணிக வாய்ப்புகளைப் பெற உங்கள் திறன்களை சரிபார்க்கவும்.",
      safetyGateBanner: "பாதுகாப்பு விதி: ஆர்வம் மட்டும் ≠ சரிபார்க்கப்பட்ட திறன். சான்றளிக்க இந்த மதிப்பீட்டை முடிக்கவும்.",
      recommendedForYou: "குரல் மதிப்பீட்டின் அடிப்படையில் பரிந்துரைக்கப்படுகிறது",
      voiceIdentifiedMsg: `குரல் மதிப்பீட்டில் ${tradeMeta.name.ta || tradeMeta.name.en} மீதான ஆர்வம் கண்டறியப்பட்டது. உங்கள் அடிப்படை திறன்களை சோதிப்போம்.`,
      chooseTradeTitle: "மதிப்பீட்டிற்கான தொழிலைத் தேர்ந்தெடுக்கவும்",
      chooseTradeDesc: "நீங்கள் சரிபார்க்க விரும்பும் திறனைத் தேர்வுசெய்யவும். இதற்கு எந்த முந்தைய பட்டமும் தேவையில்லை.",
      startBtn: "திறன் மதிப்பீட்டைத் தொடங்குங்கள்",
      trainingBtn: "எனக்கு முதலில் பயிற்சி தேவை",
      questionOf: (curr, total) => `கேள்வி ${curr} / ${total}`,
      listenBtn: "கேள்வியைக் கேளுங்கள்",
      stopListenBtn: "குரலை நிறுத்து",
      speakAnswerBtn: "பேசி பதிலளிக்கவும்",
      listeningMsg: "கேட்கிறது... தயவுசெய்து உங்கள் பதிலை தெளிவாகப் பேசுங்கள்",
      nextBtn: "அடுத்த கேள்வி",
      prevBtn: "முந்தைய கேள்வி",
      submitBtn: "சமர்ப்பித்து சரிபார்க்கவும்",
      resultTitle: `${tradeMeta.name.ta || tradeMeta.name.en} திறன் மதிப்பீட்டு முடிவு`,
      statusVerified: "திறன் சரிபார்க்கப்பட்டது ✓",
      statusTraining: "பயிற்சி பரிந்துரைக்கப்படுகிறது",
      statusReassessment: "மறு மதிப்பீடு பரிந்துரைக்கப்படுகிறது",
      verifiedDesc: "வாழ்த்துக்கள்! உங்கள் அடிப்படை திறன்கள் சரிபார்க்கப்பட்டன. இப்போது நீங்கள் வேலை வாய்ப்புகளுக்கு தகுதியுடையவர்.",
      trainingDesc: "உங்கள் திறன் இன்னும் முழுமையாக சரிபார்க்கப்படவில்லை. பயிற்சி பெற பரிந்துரைக்கிறோம்.",
      reassessmentDesc: "நீங்கள் தேர்ச்சி பெற மிக அருகில் இருந்தீர்கள்! பாதுகாப்பு விதிகளை கவனித்து மீண்டும் முயற்சிக்கவும்.",
      competencyScores: "திறன் விவரம் (Competency Breakdown)",
      practicalVerification: "நடைமுறை சரிபார்ப்பு (பாதுகாப்பான உருவகப்படுத்துதல்)",
      practicalDone: "வெற்றிகரமாக முடிந்தது ✓",
      retakeBtn: "மீண்டும் மதிப்பீடு எடுங்கள்",
      exploreTrainingBtn: "பயிற்சி மையங்களைப் பார்க்கவும்",
      viewProfileBtn: "சுயவிவரத்தைப் பார்க்கவும்",
      historyBtn: "முந்தைய முயற்சிகள்",
      attempt: "முயற்சி",
      score: "மதிப்பெண்",
      date: "தேதி",
      status: "நிலை",
      passMark: `தேர்ச்சி வரம்பு: ${tradeMeta.passScore}%`,
      orTapOption: "அல்லது கீழே உள்ள விருப்பத்தைத் தேர்ந்தெடுக்கவும்",
      noMatchMsg: "பொருந்தவில்லை. தயவுசெய்து ஒரு விருப்பத்தைத் தேர்ந்தெடுக்கவும் அல்லது மீண்டும் பேசவும்."
    },
    mr: {
      pageTitle: "व्यावहारिक कौशल्य क्षमता मूल्यांकन",
      pageSubtitle: "सत्यापित रोजगार व व्यवसाय संधी मिळवण्यासाठी आपल्या कौशल्यांची पडताळणी करा.",
      safetyGateBanner: "सुरक्षा गेट: केवळ आवड ≠ सत्यापित कौशल्य. प्रमाणित होण्यासाठी हे मूल्यांकन पूर्ण करा.",
      recommendedForYou: "आवाज मूल्यांकनावर आधारित शिफारस",
      voiceIdentifiedMsg: `आवाज मूल्यांकनामध्ये ${tradeMeta.name.mr || tradeMeta.name.en} मधील रस आढळला. चला आपल्या मूलभूत कौशल्यांची तपासणी करूया.`,
      chooseTradeTitle: "मूल्यांकनासाठी ट्रेड निवडा",
      chooseTradeDesc: "ज्या कौशल्याची चाचणी घ्यायची आहे ते निवडा. यासाठी कोणत्याही पदवीची आवश्यकता नाही.",
      startBtn: "कौशल्य मूल्यांकन सुरू करा",
      trainingBtn: "मला आधी प्रशिक्षण हवे आहे",
      questionOf: (curr, total) => `प्रश्न ${curr} / ${total}`,
      listenBtn: "प्रश्न ऐका",
      stopListenBtn: "आवाज थांबवा",
      speakAnswerBtn: "बोलून उत्तर द्या",
      listeningMsg: "ऐकत आहोत... कृपया आपले उत्तर स्पष्टपणे बोला",
      nextBtn: "पुढील प्रश्न",
      prevBtn: "मागील प्रश्न",
      submitBtn: "मूल्यांकन सबमिट करा आणि तपासा",
      resultTitle: `${tradeMeta.name.mr || tradeMeta.name.en} कौशल्य मूल्यांकन निकाल`,
      statusVerified: "कौशल्य सत्यापित ✓",
      statusTraining: "प्रशिक्षण शिफारस",
      statusReassessment: "पुनर्मूल्यांकन शिफारस",
      verifiedDesc: "अभिनंदन! तुमच्या मूलभूत क्षमतांची यशस्वी पडताळणी झाली आहे. आता तुम्ही प्रमाणित रोजगारासाठी पात्र आहात.",
      trainingDesc: "तुमचे कौशल्य अद्याप पूर्णपणे सत्यापित झालेले नाही. आम्ही प्रशिक्षण पूर्ण करण्याची शिफारस करतो.",
      reassessmentDesc: "तुम्ही उत्तीर्ण होण्याच्या अगदी जवळ होता! सुरक्षेचे नियम तपासा आणि पुन्हा प्रयत्न करा.",
      competencyScores: "क्षमता तपशील (Competency Breakdown)",
      practicalVerification: "प्रात्यक्षिक पडताळणी (सुरक्षित सिम्युलेशन)",
      practicalDone: "यशस्वीरीत्या पूर्ण ✓",
      retakeBtn: "पुन्हा मूल्यांकन द्या",
      exploreTrainingBtn: "प्रशिक्षण केंद्रे पहा",
      viewProfileBtn: "प्रोफाइल पहा",
      historyBtn: "मागील प्रयत्न",
      attempt: "प्रयत्न",
      score: "गुण",
      date: "दिनांक",
      status: "स्थिती",
      passMark: `उत्तीर्ण गुण: ${tradeMeta.passScore}%`,
      orTapOption: "किंवा खालील पर्याय निवडा",
      noMatchMsg: "जुळले नाही. कृपया खालील पर्याय निवडा किंवा पुन्हा बोला."
    }
  };

  const ui = strings[language] || strings.en;

  // Voice playback of current question
  const speakQuestion = (q) => {
    if (!q || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    cancelSpeechPlayback();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const cleanLang = (language || "en").toLowerCase().split("-")[0];
    const langCode = getLocaleForLanguage(cleanLang);
    const textToSpeak = q.audioPrompt?.[cleanLang] || q.question?.[cleanLang] || q.question?.en;

    const bestVoice = selectBestVoice(cleanLang, window.speechSynthesis.getVoices());
    // If no named voice found, still attempt speech — browsers with online TTS can handle it
    if (!bestVoice && cleanLang !== "en") {
      console.info(`[SkillAssessment] No named voice for ${cleanLang}. Attempting speech with lang property only.`);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    utterance.rate = 0.90; // Natural, clear pace for Indian languages
    utterance.pitch = 1.0;

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak question when it changes (voice-first for low-literacy users)
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Only auto-speak during active assessment, and only once per question
    if (stage === "assessment" && currentQuestion) {
      const speakKey = `${selectedTrade}_${currentQIndex}`;
      if (lastSpokenQRef.current !== speakKey) {
        lastSpokenQRef.current = speakKey;
        // Small delay to let the UI render before speaking
        const timer = setTimeout(() => {
          speakQuestion(currentQuestion);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [currentQIndex, stage, selectedTrade]);

  // Voice Answering using Speech Recognition
  const toggleVoiceListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please tap an option.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getLocaleForLanguage(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setVoiceTranscript(transcript);
      setIsListening(false);

      // Auto-select option if transcript matches (using keywords + text matching)
      if (currentQuestion && currentQuestion.options) {
        let matched = false;
        for (const opt of currentQuestion.options) {
          // 1. Check option text match (current language + English fallback)
          const optText = (opt.text?.[language] || opt.text?.en || "").toLowerCase();
          if (transcript.includes(optText) || optText.includes(transcript)) {
            handleSelectOption(currentQuestion.id, opt.id);
            matched = true;
            break;
          }
          // 2. Check keyword match (multilingual keywords from question data)
          if (opt.keywords && Array.isArray(opt.keywords)) {
            for (const kw of opt.keywords) {
              if (transcript.includes(kw.toLowerCase())) {
                handleSelectOption(currentQuestion.id, opt.id);
                matched = true;
                break;
              }
            }
            if (matched) break;
          }
        }
        // If no match found, the transcript is displayed and user can try again or tap manually
      }
    };

    recognition.onerror = (err) => {
      console.warn("[SkillAssessment] Speech recognition error:", err.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSelectOption = (qId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionId
    }));
  };

  // Submit assessment to backend evaluation engine
  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    setStage("submitting");

    try {
      const result = await submitAssessmentForEvaluation(userId, selectedTrade, answers);
      setAssessmentResult(result.assessment);

      // Refresh history and status map
      const [hist, verified] = await Promise.all([
        fetchUserAssessmentHistory(userId),
        fetchVerifiedSkillsStatus(userId)
      ]);
      setHistoryList(hist || []);
      setVerifiedMap(verified || {});

      // Update beneficiary profile with verified skill if passed
      if (result.assessment.status === "VERIFIED") {
        const existingSkills = Array.isArray(beneficiaryProfile.existing_skills)
          ? [...beneficiaryProfile.existing_skills]
          : [];
        const tradeTitle = tradeMeta.name.en;
        if (!existingSkills.includes(tradeTitle)) {
          existingSkills.push(tradeTitle);
        }
        updateProfile({
          existing_skills: existingSkills,
          verified_trade: tradeTitle,
          verification_status: "VERIFIED"
        });
      }

      setStage("result");
    } catch (err) {
      console.error("[SkillAssessment] Failed to submit:", err);
      alert("Submission error: " + err.message);
      setStage("assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trade selection icons helper
  const getTradeIcon = (tradeKey) => {
    switch (tradeKey) {
      case "plumbing": return Wrench;
      case "electrician": return Zap;
      case "carpentry": return Hammer;
      case "tailoring": return Scissors;
      case "masonry": return Layers;
      case "farming": return Sprout;
      default: return Wrench;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 1. SELECT TRADE & COURSE OPTION STAGE
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "select_trade") {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Header Banner */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <ClipboardCheck size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
                {ui.pageTitle}
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                {ui.pageSubtitle}
              </p>
            </div>
          </div>

          {/* Critical Employment Safety Gate Banner */}
          <div style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <ShieldCheck size={20} style={{ color: "#d97706", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#92400e" }}>
              {ui.safetyGateBanner}
            </span>
          </div>

          {/* Voice Assessment Context Prompt */}
          {voiceInterestTrade && (
            <div style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={20} style={{ color: "#16a34a" }} />
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {ui.recommendedForYou}
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#14532d" }}>
                    {ui.voiceIdentifiedMsg}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrade(voiceInterestTrade);
                    setStage("assessment");
                    setCurrentQIndex(0);
                    setAnswers({});
                  }}
                  style={{
                    backgroundColor: "#15803d",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {ui.startBtn} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trade Selection Grid */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: "0 0 6px 0" }}>
            {ui.chooseTradeTitle}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px 0" }}>
            {ui.chooseTradeDesc}
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px"
          }}>
            {Object.entries(TRADE_DEFINITIONS).map(([key, def]) => {
              const Icon = getTradeIcon(key);
              const isSelected = selectedTrade === key;
              const verInfo = verifiedMap[key];
              const isVerified = verInfo?.status === "VERIFIED";

              return (
                <div
                  key={key}
                  onClick={() => setSelectedTrade(key)}
                  style={{
                    border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                    backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
                    borderRadius: "12px",
                    padding: "18px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        backgroundColor: isSelected ? "#059669" : "#f1f5f9",
                        color: isSelected ? "#ffffff" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--gov-navy)" }}>
                          {def.name[language] || def.name.en}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                          {def.passScore}% Pass Mark
                        </div>
                      </div>
                    </div>

                    {isVerified ? (
                      <span style={{
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <CheckCircle2 size={12} /> VERIFIED
                      </span>
                    ) : verInfo?.status === "TRAINING_RECOMMENDED" ? (
                      <span style={{
                        backgroundColor: "#fef3c7",
                        color: "#b45309",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "12px"
                      }}>
                        Training Recommended
                      </span>
                    ) : (
                      <span style={{
                        backgroundColor: "#f1f5f9",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "12px"
                      }}>
                        Not Assessed
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "12.5px", color: "#475569", margin: 0, lineHeight: 1.4 }}>
                    {def.description[language] || def.description.en}
                  </p>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: "1px solid #f1f5f9"
                  }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrade(key);
                        setStage("assessment");
                        setCurrentQIndex(0);
                        setAnswers({});
                      }}
                      style={{
                        backgroundColor: "#059669",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {ui.startBtn} <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToTraining) onNavigateToTraining();
                      }}
                      style={{
                        backgroundColor: "transparent",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "5px 10px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <BookOpen size={13} /> {ui.trainingBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment History Section */}
        {historyList.length > 0 && (
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "20px 24px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer"
            }} onClick={() => setShowHistory(!showHistory)}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} style={{ color: "var(--gov-navy)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--gov-navy)", margin: 0 }}>
                  {ui.historyBtn} ({historyList.length})
                </h3>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#059669" }}>
                {showHistory ? "Hide ▲" : "Show ▼"}
              </span>
            </div>

            {showHistory && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {historyList.slice().reverse().map((item, idx) => (
                  <div
                    key={item.assessmentId || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, color: "var(--gov-navy)", textTransform: "capitalize", marginRight: "10px" }}>
                        {item.trade}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date(item.completedAt || item.attemptedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-dark)" }}>
                        {ui.score}: {item.score}%
                      </span>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 10px",
                        borderRadius: "12px",
                        backgroundColor: item.status === "VERIFIED" ? "#dcfce7" : "#fee2e2",
                        color: item.status === "VERIFIED" ? "#16a34a" : "#dc2626"
                      }}>
                        {item.status === "VERIFIED" ? ui.statusVerified : ui.statusTraining}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── OFFICIAL NIELIT / NSQF CERTIFIED QUALIFICATIONS INTEGRATION ── */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>
                  Official Dataset
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
                  Official NIELIT / NSQF Certified Qualifications
                </h3>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Explore government-approved courses matching your skill. 100% free under PM-AJAY GIA Component.
              </p>
            </div>

            {/* Voice & Text Search */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search qualification or skill..."
                value={nsqfSearchTerm}
                onChange={(e) => {
                  setNsqfSearchTerm(e.target.value);
                  loadNsqfCoursesForTrade(selectedTrade, e.target.value);
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  width: "190px"
                }}
              />
              <button
                type="button"
                onClick={handleVoiceSearchNsqf}
                title="Speak interest"
                style={{
                  backgroundColor: isVoiceSearchingNsqf ? "#dc2626" : "var(--gov-navy)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Mic size={15} />
                <span>{isVoiceSearchingNsqf ? "Listening..." : "Speak"}</span>
              </button>
            </div>
          </div>

          {/* External Sector Scope Notice Banner */}
          {nsqfNotice && (
            <div style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "12.5px",
              lineHeight: 1.45,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <AlertTriangle size={18} style={{ color: "#d97706", flexShrink: 0 }} />
              <span>{nsqfNotice}</span>
            </div>
          )}

          {/* Quick Domain Filter Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "electrician", label: "Solar & Electrical" },
              { id: "farming", label: "Agri Tech / IoT" },
              { id: "it", label: "IT & Software" },
              { id: "electronics", label: "Electronics & Repair" },
              { id: "robotics", label: "Robotics & Drones" },
              { id: "healthcare", label: "Healthcare Tech" }
            ].map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  setNsqfSearchTerm("");
                  if (chip.id === "it") loadNsqfCoursesForTrade("it", "IT");
                  else if (chip.id === "electronics") loadNsqfCoursesForTrade("electronics", "Electronics");
                  else if (chip.id === "robotics") loadNsqfCoursesForTrade("robotics", "Robotics");
                  else if (chip.id === "healthcare") loadNsqfCoursesForTrade("healthcare", "Healthcare");
                  else setSelectedTrade(chip.id);
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "20px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  color: "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {loadingNsqf ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "14px" }}>
              Loading official qualifications from NIELIT NSQF dataset...
            </div>
          ) : nsqfCourses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>
              No courses found for this criteria. Try selecting another trade or broader keywords.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {nsqfCourses.map(course => (
                <div
                  key={course.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "10.5px", fontWeight: 800, padding: "2px 7px", borderRadius: "6px" }}>
                        {course.sector}
                      </span>
                      <span style={{ backgroundColor: "#f0fdf4", color: "#15803d", fontSize: "10.5px", fontWeight: 800, padding: "2px 7px", borderRadius: "6px" }}>
                        NSQF Level {course.nsqf_level}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.35 }}>
                      {course.qualification}
                    </h4>

                    <div style={{ fontSize: "12px", color: "#475569", marginBottom: "8px" }}>
                      <strong>Job Role:</strong> {course.job_role}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                      {course.skills?.slice(0, 3).map((sk, idx) => (
                        <span key={idx} style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px" }}>
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      ⏱️ {course.training_info?.notional_hours} Hours (~{course.training_info?.est_duration_weeks} Weeks)
                    </div>
                    <div style={{ fontSize: "11px", color: "#15803d", fontWeight: 700, marginTop: "4px" }}>
                      ✓ 100% Free Training under PM-AJAY GIA
                    </div>
                  </div>

                  {/* Accessible Listen & Action Buttons */}
                  <div style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => handleSpeakCourse(course)}
                      title="Listen to course details"
                      style={{
                        flex: 1,
                        backgroundColor: speakingCourseId === course.id ? "#dc2626" : "#f1f5f9",
                        color: speakingCourseId === course.id ? "#ffffff" : "#1e293b",
                        border: "none",
                        borderRadius: "6px",
                        padding: "7px 10px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px"
                      }}
                    >
                      <Volume2 size={13} />
                      <span>{speakingCourseId === course.id ? "Stop" : "Listen"}</span>
                    </button>

                    {course.training_info?.source_url && (
                      <a
                        href={course.training_info.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          backgroundColor: "#00337a",
                          color: "#ffffff",
                          borderRadius: "6px",
                          padding: "7px 10px",
                          fontSize: "11.5px",
                          fontWeight: 700,
                          textAlign: "center",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px"
                        }}
                      >
                        <span>Syllabus</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 2. SUBMITTING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "submitting") {
    return (
      <div style={{
        maxWidth: "600px",
        margin: "60px auto",
        textAlign: "center",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "48px 32px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          border: "4px solid #f3f4f6",
          borderTop: "4px solid #059669",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
        }} />
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: "0 0 8px 0" }}>
          Evaluating Competency Assessment...
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
          Verifying responses against safety and skill standards on server...
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 3. ACTIVE ASSESSMENT STAGE (LOW-LITERACY QUESTION PRESENTATION)
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "assessment" && currentQuestion) {
    const selectedOptId = answers[currentQuestion.id];
    const totalQ = tradeQuestions.length;
    const isFirst = currentQIndex === 0;
    const isLast = currentQIndex === totalQ - 1;
    const progressPercent = Math.round(((currentQIndex + 1) / totalQ) * 100);

    const compLabel = COMPETENCY_LABELS[currentQuestion.competency]?.[language] ||
                      COMPETENCY_LABELS[currentQuestion.competency]?.en ||
                      currentQuestion.competency;

    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Progress Bar & Header */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "16px 20px",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                backgroundColor: "#ecfdf5",
                color: "#059669",
                fontWeight: 800,
                fontSize: "12px",
                padding: "3px 10px",
                borderRadius: "6px"
              }}>
                {tradeMeta.name[language] || tradeMeta.name.en}
              </span>
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#64748b" }}>
                {ui.questionOf(currentQIndex + 1, totalQ)}
              </span>
            </div>

            <span style={{
              fontSize: "11.5px",
              fontWeight: 700,
              backgroundColor: "#f1f5f9",
              color: "#334155",
              padding: "3px 8px",
              borderRadius: "4px"
            }}>
              {compLabel}
            </span>
          </div>

          <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: "#059669",
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>

        {/* Question Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          
          {/* Question Text & Audio Playback Button */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--gov-navy)",
              margin: 0,
              lineHeight: 1.4,
              flex: 1
            }}>
              {currentQuestion.question[language] || currentQuestion.question.en}
            </h2>

            {/* Audio Button - Crucial for low-literacy users */}
            <button
              type="button"
              onClick={() => speakQuestion(currentQuestion)}
              title={isSpeaking ? ui.stopListenBtn : ui.listenBtn}
              style={{
                backgroundColor: isSpeaking ? "#fee2e2" : "#f0fdf4",
                color: isSpeaking ? "#dc2626" : "#059669",
                border: isSpeaking ? "1px solid #fca5a5" : "1px solid #a7f3d0",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: isSpeaking ? "0 0 12px rgba(239, 68, 68, 0.4)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Voice Answer Micro-Prompt */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            padding: "10px 14px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={toggleVoiceListening}
                style={{
                  backgroundColor: isListening ? "#dc2626" : "#0f766e",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                {isListening ? ui.listeningMsg : ui.speakAnswerBtn}
              </button>
              {voiceTranscript && (
                <span style={{ fontSize: "12px", color: "#334155", fontStyle: "italic" }}>
                  "{voiceTranscript}"
                </span>
              )}
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              {ui.orTapOption}
            </span>
          </div>

          {/* Visual Options Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px"
          }}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  style={{
                    border: isSelected ? "2.5px solid #059669" : "1.5px solid #e2e8f0",
                    backgroundColor: isSelected ? "#ecfdf5" : "#ffffff",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "10px",
                    position: "relative",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 4px 12px rgba(5, 150, 105, 0.15)" : "none"
                  }}
                >
                  {/* Visual Representation (Icon or Badge) */}
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    backgroundColor: isSelected ? "#a7f3d0" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>
                    {opt.visualIcon === "Pipe" ? "🔧" :
                     opt.visualIcon === "Hammer" ? "🔨" :
                     opt.visualIcon === "Saw" ? "🪚" :
                     opt.visualIcon === "Scissors" ? "✂️" :
                     opt.visualIcon === "Tape" ? "📏" :
                     opt.visualIcon === "Level" ? "⚖️" :
                     opt.visualIcon === "Check" ? "✅" :
                     opt.visualIcon === "Hoe" ? "⛏️" :
                     opt.visualIcon === "Water" ? "💧" :
                     opt.visualIcon === "Sprout" ? "🌱" :
                     opt.visualIcon === "Plant" ? "🌿" :
                     opt.visualIcon === "Shield" ? "🛡️" :
                     opt.visualIcon === "Alert" ? "⚠️" :
                     opt.visualIcon === "X" ? "❌" :
                     opt.visualIcon === "Tool" ? "🔩" :
                     opt.visualIcon === "Rock" ? "🪨" :
                     opt.visualIcon === "Paint" ? "🎨" :
                     opt.visualIcon === "Plastic" ? "🧴" : "🛠️"}
                  </div>

                  {/* Option Text */}
                  <span style={{
                    fontSize: "15px",
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? "#065f46" : "#1e293b",
                    lineHeight: 1.3
                  }}>
                    {opt.text[language] || opt.text.en}
                  </span>

                  {/* Radio indicator */}
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: isSelected ? "5px solid #059669" : "2px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    marginTop: "auto"
                  }} />
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: "1px solid #f1f5f9"
          }}>
            <button
              type="button"
              disabled={isFirst}
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              style={{
                backgroundColor: "#f8fafc",
                color: isFirst ? "#cbd5e1" : "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: isFirst ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <ArrowLeft size={16} /> {ui.prevBtn}
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmitAssessment}
                disabled={!selectedOptId || isSubmitting}
                style={{
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: !selectedOptId || isSubmitting ? "not-allowed" : "pointer",
                  opacity: !selectedOptId || isSubmitting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)"
                }}
              >
                <CheckCircle2 size={18} /> {ui.submitBtn}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentQIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                disabled={!selectedOptId}
                style={{
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: !selectedOptId ? "not-allowed" : "pointer",
                  opacity: !selectedOptId ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {ui.nextBtn} <ArrowRight size={16} />
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: 4. RESULT STAGE (LOW-LITERACY CLEAR SCORECARD)
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "result" && assessmentResult) {
    const isPassed = assessmentResult.status === "VERIFIED";
    const comp = assessmentResult.competencies || {};

    return (
      <div style={{ maxWidth: "750px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Main Result Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          border: isPassed ? "2px solid #10b981" : "2px solid #f59e0b",
          boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px"
        }}>
          
          {/* Status Icon */}
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: isPassed ? "#dcfce7" : "#fef3c7",
            color: isPassed ? "#16a34a" : "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isPassed ? "0 0 20px rgba(16, 185, 129, 0.2)" : "none"
          }}>
            {isPassed ? <Award size={38} /> : <AlertTriangle size={36} />}
          </div>

          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
              {ui.resultTitle}
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: 900,
              color: isPassed ? "#15803d" : "#b45309",
              margin: "6px 0 0"
            }}>
              {isPassed ? ui.statusVerified :
               assessmentResult.status === "REASSESSMENT_REQUIRED" ? ui.statusReassessment :
               ui.statusTraining}
            </h1>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--gov-navy)", marginTop: "4px" }}>
              Overall Score: {assessmentResult.score}%
            </div>
          </div>

          <p style={{
            fontSize: "14.5px",
            color: "#334155",
            maxWidth: "540px",
            margin: 0,
            lineHeight: 1.5
          }}>
            {isPassed ? ui.verifiedDesc :
             assessmentResult.status === "REASSESSMENT_REQUIRED" ? ui.reassessmentDesc :
             ui.trainingDesc}
          </p>

          {/* Competencies Checklist */}
          <div style={{
            width: "100%",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            marginTop: "10px"
          }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "var(--gov-navy)",
              margin: "0 0 14px 0",
              textAlign: "left"
            }}>
              {ui.competencyScores}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", textAlign: "left" }}>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Basic Knowledge</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: (comp.basicKnowledge || 0) >= 60 ? "#16a34a" : "#dc2626" }}>
                  {comp.basicKnowledge || 0}% ✓
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Tool Recognition</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: (comp.toolRecognition || 0) >= 60 ? "#16a34a" : "#dc2626" }}>
                  {comp.toolRecognition || 0}% ✓
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Safety Awareness</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: (comp.safetyAwareness || 0) >= 60 ? "#16a34a" : "#dc2626" }}>
                  {comp.safetyAwareness || 0}% ✓
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Scenario Understanding</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: (comp.scenarioUnderstanding || 0) >= 60 ? "#16a34a" : "#dc2626" }}>
                  {comp.scenarioUnderstanding || 0}% ✓
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{ui.practicalVerification}</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#16a34a" }}>
                  {ui.practicalDone}
                </span>
              </div>

            </div>
          </div>

          {/* Action Pathways */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
            {isPassed ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToProfile) onNavigateToProfile();
                  }}
                  style={{
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)"
                  }}
                >
                  <UserCheck size={18} /> {ui.viewProfileBtn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStage("select_trade");
                  }}
                  style={{
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Assess Another Trade
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToTraining) onNavigateToTraining();
                  }}
                  style={{
                    backgroundColor: "#d97706",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <BookOpen size={18} /> {ui.exploreTrainingBtn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStage("assessment");
                    setCurrentQIndex(0);
                    setAnswers({});
                  }}
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#059669",
                    border: "1.5px solid #059669",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <RotateCcw size={16} /> {ui.retakeBtn}
                </button>
              </>
            )}
          </div>

        </div>

        {/* ── NSQF QUALIFICATIONS RECOMMENDED POST-ASSESSMENT ── */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>
                Govt-Certified Training Pathway
              </span>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--gov-navy)", margin: "4px 0 0 0" }}>
                Recommended NIELIT Qualifications for {tradeMeta.name[language] || tradeMeta.name.en}
              </h3>
            </div>
            <span style={{ fontSize: "12px", color: "#15803d", fontWeight: 700 }}>
              100% Free under PM-AJAY GIA
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {nsqfCourses.slice(0, 3).map(course => (
              <div
                key={course.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px",
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      {course.sector}
                    </span>
                    <span style={{ backgroundColor: "#f0fdf4", color: "#15803d", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      NSQF Level {course.nsqf_level}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      ⏱️ {course.training_info?.notional_hours} Hours
                    </span>
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a" }}>
                    {course.qualification}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#475569", marginTop: "2px" }}>
                    Entry: {course.entry_profile?.inferred_minimum} (Inferred)
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleSpeakCourse(course)}
                    style={{
                      backgroundColor: speakingCourseId === course.id ? "#dc2626" : "#ffffff",
                      color: speakingCourseId === course.id ? "#ffffff" : "#1e293b",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Volume2 size={13} />
                    <span>{speakingCourseId === course.id ? "Stop" : "Listen"}</span>
                  </button>

                  {course.training_info?.source_url && (
                    <a
                      href={course.training_info.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "#00337a",
                        color: "#ffffff",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>Syllabus</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return null;
}
