import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  RotateCcw, Volume2, Mic, Send, Sparkles, 
  Briefcase, Users, Wrench, Star, TrendingUp, Building2, 
  Car, GraduationCap, Compass, ArrowRight, AlertCircle, Clock,
  AlertTriangle, Square, Check, CheckCircle2, Edit3
} from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { useSession } from "../context/SessionContext";
import { useNavigate } from "react-router-dom";
import { 
  getStoredVoiceAssessment, 
  saveStoredVoiceAssessment, 
  clearStoredVoiceAssessment 
} from "../utils/sessionManager";
import { selectBestVoice, cancelSpeechPlayback, getLocaleForLanguage } from "../utils/voiceSelector";
import LanguageSelector from "./LanguageSelector";

const INITIAL_PROMPTS = {
  en: "Welcome! I am Saathi AI. To help find the best livelihood opportunities for you, could you start by telling me about your current work — what do you do for income, and what does your family do?",
  hi: "नमस्ते! मैं साथी एआई हूँ। आपके लिए सर्वोत्तम आजीविका अवसर खोजने हेतु, क्या आप मुझे अपने वर्तमान काम और पारिवारिक व्यवसाय के बारे में बता सकते हैं?",
  te: "నమస్కారం! నేను సాథి ఏఐ. మీ కోసం ఉత్తమ జీవనోపాధి అవకాశాలను కనుగొనడానికి, మీరు ప్రస్తుతం ఏం పని చేస్తున్నారు మరియు మీ కుటుంబం ఏం చేస్తుందో చెప్పగలరా?",
  ta: "வணக்கம்! நான் சாத்தி AI. உங்களுக்கான சிறந்த வாழ்வாதார வாய்ப்புகளைக் கண்டறிய, உங்கள் தற்போதைய வேலை மற்றும் உங்கள் குடும்ப தொழில் பற்றி சொல்ல முடியுமா?",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ಸಾಥಿ AI. ನಿಮಗಾಗಿ ಉತ್ತಮ ಜೀವನೋಪಾಯದ ಅವಕಾಶಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಲು, ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಕೆಲಸ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ವೃತ್ತಿಯ ಬಗ್ಗೆ ಹೇಳಬಹುದೇ?",
  mr: "नमस्कार! मी साथी एआई आहे. तुमच्यासाठी सर्वोत्तम उपजीविकेच्या संधी शोधण्यासाठी, तुम्ही सध्या उत्पन्नासाठी काय काम करता आणि तुमचे कुटुंब काय करते हे मला सांगू शकाल का?",
  ml: "നമസ്കാരം! ഞാൻ സാഥി AI ആണ്. നിങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമായ ഉപജീവന അവസരങ്ങൾ കണ്ടെത്തുന്നതിന്, നിങ്ങളുടെ നിലവിലെ ജോലിയെക്കുറിച്ചും കുടുംബത്തിന്റെ ജോലിയെക്കുറിച്ചും പറയാമോ?"
};

const LANG_MAP = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", mr: "mr-IN", ml: "ml-IN" };

export default function VoiceAssessment({ onComplete, onNavigateToCenters }) {
  const { language, setLanguage, t } = useLanguage();
  const { updateProfile, startNewSession, markVoiceAssessmentCompleted } = useSession();
  const navigate = useNavigate();

  // ─── Restore from active session if present ───────────────────────────────
  const storedAssessment = getStoredVoiceAssessment();

  // ─── Core state ───────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(
    () => storedAssessment?.sessionId || (Math.floor(10 + Math.random() * 89) + ["RK", "AK", "SP", "VS"][Math.floor(Math.random() * 4)])
  );

  // voiceStatus: "idle" | "playing" | "listening" | "processing" | "complete" | "error"
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  // Current AI question shown and spoken
  const [currentPrompt, setCurrentPrompt] = useState(
    () => storedAssessment?.currentPrompt || INITIAL_PROMPTS[language] || INITIAL_PROMPTS.en
  );

  // Conversation history sent to backend
  const messagesRef = useRef(storedAssessment?.messages || []);

  // Transcript from speech recognition (live display)
  const [liveTranscript, setLiveTranscript] = useState("");
  const [lastUserText, setLastUserText] = useState(() => storedAssessment?.lastUserText || "");

  // Text-input fallback
  const [showTextInput, setShowTextInput] = useState(false);
  const [userTextInput, setUserTextInput] = useState("");

  // Profile & Completion Modal
  const [isCompleted, setIsCompleted] = useState(() => storedAssessment?.isCompleted || false);
  const [showModal, setShowModal] = useState(() => storedAssessment?.showModal || false);
  const [confidence, setConfidence] = useState(() => storedAssessment?.confidence || 0);
  const [detectedProfile, setDetectedProfile] = useState(() => storedAssessment?.detectedProfile || {
    currentOccupation: null,
    familyOccupation: null,
    existingSkills: null,
    areasOfInterest: null,
    careerAspiration: null,
    employmentPreference: null,
    mobility: null,
    trainingAvailability: null,
    trainingAvailabilityDuration: null,
    trainingSchedule: null,
  });

  // Speech & Recognition States
  const [recognizedTranscript, setRecognizedTranscript] = useState("");
  const [languageMismatch, setLanguageMismatch] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const finalTranscriptRef = useRef("");
  const hasProcessedResultRef = useRef(false);
  const lastSpokenPromptRef = useRef("");

  // ─── Refs — avoid stale closures ──────────────────────────────────────────
  const recognitionRef = useRef(null);
  const browserTranscriptRef = useRef("");
  const abortControllerRef = useRef(null);
  const requestSeqRef = useRef(0);
  const isProcessingRef = useRef(false); // processing lock
  const isSpeakingRef = useRef(false);
  const languageRef = useRef(language);
  const messagesStateRef = useRef(storedAssessment?.messages || []); // mirrors messages state for use in callbacks
  const isCompletedRef = useRef(isCompleted);

  // Sync refs
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);

  // Comprehensive component unmount cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (_) {}
      }
    };
  }, []);

  // ─── Initialize messages on first mount (if none stored) ─────────────────
  useEffect(() => {
    if (!messagesRef.current || messagesRef.current.length === 0) {
      const initialMsg = { speaker: "assistant", text: INITIAL_PROMPTS[language] || INITIAL_PROMPTS.en };
      messagesRef.current = [initialMsg];
      messagesStateRef.current = [initialMsg];
      setCurrentPrompt(initialMsg.text);
    }
  }, []); // only on mount

  // ─── Update and speak initial prompt when language changes at start ────────
  useEffect(() => {
    // If conversation is just starting (only 1 initial assistant greeting)
    if (messagesRef.current && messagesRef.current.length <= 1 && !isCompleted) {
      const localizedPrompt = INITIAL_PROMPTS[language] || INITIAL_PROMPTS.en;
      const updatedMsg = { speaker: "assistant", text: localizedPrompt };
      messagesRef.current = [updatedMsg];
      messagesStateRef.current = [updatedMsg];
      setCurrentPrompt(localizedPrompt);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setTimeout(() => speakText(localizedPrompt), 250);
    }
  }, [language]); // trigger on language change

  // ─── Persist voice assessment state to sessionStorage ────────────────────
  useEffect(() => {
    saveStoredVoiceAssessment({
      sessionId,
      currentPrompt,
      messages: messagesRef.current,
      lastUserText,
      isCompleted,
      showModal,
      confidence,
      detectedProfile,
    });
  }, [sessionId, currentPrompt, lastUserText, isCompleted, showModal, confidence, detectedProfile]);

  // ─── Browser-Native Speech Synthesis (Web Speech API) ──────────────────────
  const stopAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
    setVoiceStatus("idle");
    isSpeakingRef.current = false;
  }, []);

  const speakText = useCallback((text, force = false) => {
    if (!text || !text.trim() || isCompletedRef.current) return;
    const cleanText = text.trim();

    // Prevent the same question from being spoken repeatedly
    if (!force && lastSpokenPromptRef.current === cleanText && voiceStatus === "playing") {
      return;
    }

    // Cancel previous speech playback before starting new playback
    cancelSpeechPlayback();

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceStatus("idle");
      isSpeakingRef.current = false;
      return;
    }

    try {
      const cleanLang = (languageRef.current || "en").toLowerCase().split("-")[0];
      const targetLang = getLocaleForLanguage(cleanLang);
      const voice = selectBestVoice(cleanLang);

      // If no named voice found for non-English, still attempt speech — Chrome/Edge online TTS often works with just the lang property
      if (!voice && cleanLang !== "en") {
        console.info(`[VoiceAssessment] No named voice for "${cleanLang}". Attempting speech with lang property only.`);
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = 0.90; // Natural, clear cadence for Indian languages
      utterance.pitch = 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        lastSpokenPromptRef.current = cleanText;
        setVoiceStatus("playing");
        isSpeakingRef.current = true;
      };

      utterance.onend = () => {
        setVoiceStatus("idle");
        isSpeakingRef.current = false;
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("[VoiceAssessment] SpeechSynthesis error:", e);
        }
        setVoiceStatus("idle");
        isSpeakingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("[VoiceAssessment] SpeechSynthesis exception:", e);
      setVoiceStatus("idle");
      isSpeakingRef.current = false;
    }
  }, [voiceStatus]);

  const replayCurrentPrompt = useCallback(() => {
    if (currentPrompt) {
      speakText(currentPrompt, true);
    }
  }, [currentPrompt, speakText]);

  // Speak when currentPrompt changes (after initial mount too)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!currentPrompt || isCompleted) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const t = setTimeout(() => speakText(currentPrompt), 500);
      return () => clearTimeout(t);
    }
    speakText(currentPrompt);
    return () => {
      stopAudio();
    };
  }, [currentPrompt]); // eslint-disable-line

  // ─── Browser-Native Speech Recognition (Web Speech API) ────────────────────
  const startRecordingAudio = useCallback(() => {
    if (isProcessingRef.current || voiceStatus === "listening") return;

    setErrorMsg(null);
    setLiveTranscript("");
    setRecognizedTranscript("");
    setLanguageMismatch(null);
    browserTranscriptRef.current = "";
    finalTranscriptRef.current = "";
    hasProcessedResultRef.current = false;

    // Cancel previous speech playback before starting recording
    stopAudio();

    const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      setErrorMsg("Voice recognition is not supported in this browser. Please type your answer below.");
      setShowTextInput(true);
      setVoiceStatus("idle");
      return;
    }

    try {
      // Allow only one active speech-recognition session at a time
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
        recognitionRef.current = null;
      }

      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.lang = LANG_MAP[languageRef.current] || "en-IN";
      rec.interimResults = true;
      rec.continuous = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsRecording(true);
        setVoiceStatus("listening");
      };

      rec.onresult = (event) => {
        let fullFinal = "";
        let interimText = "";
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            fullFinal += (fullFinal ? " " : "") + item[0].transcript.trim();
          } else {
            interimText += (interimText ? " " : "") + item[0].transcript.trim();
          }
        }
        finalTranscriptRef.current = fullFinal;
        browserTranscriptRef.current = fullFinal;
        const combined = (fullFinal + (interimText ? " " + interimText : "")).trim();
        if (combined) {
          setLiveTranscript(combined);
        }
      };

      rec.onerror = (e) => {
        if (e.error !== "no-speech") {
          console.warn("[VoiceAssessment SpeechRecognition error]:", e.error);
          if (e.error === "not-allowed") {
            setErrorMsg("Microphone permission was denied. Please allow microphone access or type your answer below.");
            setShowTextInput(true);
          }
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (voiceStatus === "listening") {
          setVoiceStatus("idle");
        }
      };

      rec.start();
    } catch (recErr) {
      console.warn("[VoiceAssessment SpeechRecognition start failed]:", recErr);
      setErrorMsg("Could not start microphone. Please type your answer below.");
      setShowTextInput(true);
      setVoiceStatus("idle");
      setIsRecording(false);
    }
  }, [stopAudio, voiceStatus]);

  const stopRecordingAudio = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    setVoiceStatus("idle");
    setIsRecording(false);

    const finalAnswer = (finalTranscriptRef.current || browserTranscriptRef.current || liveTranscript).trim();
    if (finalAnswer && !hasProcessedResultRef.current) {
      hasProcessedResultRef.current = true;
      setLiveTranscript(finalAnswer);
      setRecognizedTranscript(finalAnswer);
      setUserTextInput(finalAnswer);
    } else if (!finalAnswer) {
      setLiveTranscript("");
      setErrorMsg("No clear speech detected. Please speak closer to the microphone or type below.");
      setShowTextInput(true);
    }
  }, [liveTranscript]);

  const handleSwitchLanguage = (newLang) => {
    setLanguage(newLang);
    setLanguageMismatch(null);
  };

  const handleTranslateAndSend = (text) => {
    setLanguageMismatch(null);
    setRecognizedTranscript("");
    submitAnswer(text);
  };

  // ─── Submit Answer to backend ─────────────────────────────────────────────
  const submitAnswer = useCallback(async (text) => {
    if (!text || !text.trim() || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    requestSeqRef.current += 1;
    const currentSeq = requestSeqRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Stop speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setVoiceStatus("processing");
    setShowTextInput(false);
    setUserTextInput("");
    setErrorMsg(null);

    // Append user message to conversation
    const userMsg = { speaker: "user", text: text.trim() };
    const updatedMessages = [...messagesRef.current, userMsg];
    messagesRef.current = updatedMessages;
    messagesStateRef.current = updatedMessages;

    let response;
    let requestUrl = "/api/chat";
    const currentUserId = (typeof sessionStorage !== "undefined" && sessionStorage.getItem("user_phone")) 
      ? `ben_${sessionStorage.getItem("user_phone")}`
      : "beneficiary_guest";
    const authToken = sessionStorage.getItem("jeevika_session_token");

    const requestHeaders = {
      "Content-Type": "application/json",
      ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
    };

    const requestPayload = {
      messages: updatedMessages,
      language: LANG_MAP[languageRef.current] || "en-IN",
      userId: currentUserId
    };

    try {
      try {
        requestUrl = "/api/chat";
        response = await fetch(requestUrl, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestPayload),
          signal
        });
      } catch (proxyError) {
        if (proxyError.name === "AbortError" || currentSeq !== requestSeqRef.current) {
          return;
        }
        // If relative proxy endpoint is unreachable, fall back to direct backend URL
        requestUrl = "http://localhost:3001/api/chat";
        response = await fetch(requestUrl, {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestPayload),
          signal
        });
      }

      if (currentSeq !== requestSeqRef.current) return;

      if (!response.ok) {
        let errData = {};
        let rawBody = "";
        try {
          rawBody = await response.text();
          errData = JSON.parse(rawBody);
        } catch (_) {}

        console.error(`[Voice API] Request URL: ${requestUrl}`);
        console.error(`[Voice API] Status: ${response.status}`);
        console.error(`[Voice API] Response:`, rawBody || "(empty)");
        console.error(`[Voice API] Error:`, errData.error || `HTTP ${response.status}`);

        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (currentSeq !== requestSeqRef.current) return;

      // Merge extracted data into profile state
      const ext = data.extracted_data || {};
      // Save to global session state
      if (updateProfile && Object.keys(ext).length > 0) {
        updateProfile(ext);
      }

      setDetectedProfile((prev) => ({
        currentOccupation:
          ext.current_occupation ? ext.current_occupation : prev.currentOccupation,
        familyOccupation:
          ext.family_occupation ? ext.family_occupation : prev.familyOccupation,
        existingSkills: (() => {
          const skills = Array.isArray(ext.existing_skills) ? ext.existing_skills.filter(Boolean) : [];
          if (skills.length > 0) return skills.join(", ");
          return prev.existingSkills;
        })(),
        areasOfInterest: (() => {
          const interests = Array.isArray(ext.interests) ? ext.interests.filter(Boolean) : [];
          if (interests.length > 0) return interests.join(", ");
          return prev.areasOfInterest;
        })(),
        careerAspiration:
          ext.career_aspiration ? ext.career_aspiration : prev.careerAspiration,
        employmentPreference:
          ext.employment_preference ? ext.employment_preference : prev.employmentPreference,
        mobility: (() => {
          if (ext.mobility_limit_km !== null && ext.mobility_limit_km !== undefined && ext.mobility_limit_km !== 0) {
            return `Within ${ext.mobility_limit_km} km`;
          }
          return prev.mobility;
        })(),
        trainingAvailability:
          ext.training_availability_duration || ext.trainingAvailabilityDuration || ext.training_availability || ext.trainingAvailability || prev.trainingAvailability,
        trainingAvailabilityDuration:
          ext.training_availability_duration || ext.trainingAvailabilityDuration || prev.trainingAvailabilityDuration,
        trainingSchedule:
          ext.training_schedule || ext.trainingSchedule || prev.trainingSchedule,
      }));

      if (typeof data.confidence === "number") {
        setConfidence(Math.round(data.confidence * 100));
      }

      const nextQuestion = data.assistant_message || "Could you tell me a bit more?";

      // Append assistant message
      const assistantMsg = { speaker: "assistant", text: nextQuestion };
      messagesRef.current = [...updatedMessages, assistantMsg];
      messagesStateRef.current = messagesRef.current;

      if (data.is_complete) {
        setIsCompleted(true);
        isCompletedRef.current = true;
        setCurrentPrompt("Assessment completed. Thank you! Preparing your personalized skill recommendations...");
        setVoiceStatus("complete");
        isProcessingRef.current = false;
        setShowModal(true);
        
        // Ensure mic and TTS are stopped
        try { recognitionRef.current?.abort(); } catch (_) {}
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}

        if (markVoiceAssessmentCompleted) {
          markVoiceAssessmentCompleted(ext);
        }

        // Automatically navigate the beneficiary to Recommendations page after brief completion celebration
        setTimeout(() => {
          if (onComplete) {
            onComplete(ext);
          } else {
            navigate("/recommendations");
          }
        }, 1800);
      } else {
        setCurrentPrompt(nextQuestion);
        isProcessingRef.current = false;
        // speakText called via the useEffect on currentPrompt
      }
    } catch (err) {
      if (err.name === "AbortError" || currentSeq !== requestSeqRef.current) {
        return;
      }
      console.error(`[Voice API] Request URL: ${requestUrl}`);
      console.error(`[Voice API] Status: Network/Connection Error`);
      console.error(`[Voice API] Response: None`);
      console.error(`[Voice API] Error:`, err.message || err);

      isProcessingRef.current = false;
      setVoiceStatus("idle");

      const isNetworkErr = !err.message || err.message === "Failed to fetch" || err.message.includes("NetworkError");
      const friendlyMsg = isNetworkErr
        ? "Unable to connect to AI server. Please verify the backend service is running on port 3001."
        : (err.message || "AI service is temporarily unavailable. Please try again.");

      setErrorMsg(friendlyMsg);
    } finally {
      if (currentSeq === requestSeqRef.current && isProcessingRef.current) {
        isProcessingRef.current = false;
      }
    }
  }, [speakText]);

  // ─── Mic button click ─────────────────────────────────────────────────────
  const handleMicClick = useCallback(() => {
    if (isProcessingRef.current) return;

    if (voiceStatus === "playing" || isSpeakingRef.current) {
      stopAudio();
      return;
    }

    if (voiceStatus === "listening" || isRecording) {
      stopRecordingAudio();
    } else {
      startRecordingAudio();
    }
  }, [voiceStatus, isRecording, stopAudio, stopRecordingAudio, startRecordingAudio]);

  // ─── Text submit ──────────────────────────────────────────────────────────
  const handleTextSubmit = useCallback(() => {
    const text = userTextInput.trim();
    if (!text || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setLastUserText(text);
    setLiveTranscript("");
    submitAnswer(text);
  }, [userTextInput, submitAnswer]);

  // ─── New Assessment ───────────────────────────────────────────────────────
  const handleStartNewAssessment = useCallback(() => {
    window.speechSynthesis?.cancel();
    try { recognitionRef.current?.abort(); } catch (_) {}
    isSpeakingRef.current = false;
    isProcessingRef.current = false;

    clearStoredVoiceAssessment();
    if (startNewSession) {
      startNewSession();
    }

    const newId = Math.floor(10 + Math.random() * 89) + ["RK", "AK", "SP", "VS"][Math.floor(Math.random() * 4)];
    setSessionId(newId);

    const initialMsg = { speaker: "assistant", text: INITIAL_PROMPTS[language] || INITIAL_PROMPTS.en };
    messagesRef.current = [initialMsg];
    messagesStateRef.current = [initialMsg];

    setIsCompleted(false);
    isCompletedRef.current = false;
    setShowModal(false);
    setShowTextInput(false);
    setUserTextInput("");
    setLiveTranscript("");
    setLastUserText("");
    setConfidence(0);
    setErrorMsg(null);
    setDetectedProfile({
      currentOccupation: null, familyOccupation: null, existingSkills: null,
      areasOfInterest: null, careerAspiration: null, employmentPreference: null,
      mobility: null, trainingAvailability: null,
      trainingAvailabilityDuration: null, trainingSchedule: null,
    });
    setCurrentPrompt(initialMsg.text);
    setVoiceStatus("idle");

    // Give the TTS a moment then speak
    setTimeout(() => speakText(initialMsg.text), 300);
  }, [language, speakText, startNewSession]);

  // ─── Derived state for UI ─────────────────────────────────────────────────
  const profileAttributes = [
    { key: "currentOccupation", label: "Current Occupation", icon: Briefcase, value: detectedProfile.currentOccupation },
    { key: "familyOccupation", label: "Family Occupation", icon: Users, value: detectedProfile.familyOccupation },
    { key: "existingSkills", label: "Existing Skills", icon: Wrench, value: detectedProfile.existingSkills },
    { key: "areasOfInterest", label: "Areas of Interest", icon: Star, value: detectedProfile.areasOfInterest },
    { key: "careerAspiration", label: "Career Aspiration", icon: TrendingUp, value: detectedProfile.careerAspiration },
    { key: "employmentPreference", label: "Employment Preference", icon: Building2, value: detectedProfile.employmentPreference },
    { key: "mobility", label: "Mobility", icon: Car, value: detectedProfile.mobility },
    { key: "trainingAvailability", label: "Training Availability", icon: GraduationCap, value: detectedProfile.trainingAvailabilityDuration || detectedProfile.trainingAvailability },
    ...(detectedProfile.trainingSchedule ? [{ key: "trainingSchedule", label: "Training Schedule", icon: Clock, value: detectedProfile.trainingSchedule }] : []),
  ].map((a) => ({ ...a, detected: !!a.value }));

  const detectedCount = profileAttributes.filter((a) => a.detected).length;
  const progressStep = isCompleted ? 7 : Math.min(7, detectedCount);

  const isBusy = voiceStatus === "processing";
  const isListening = voiceStatus === "listening";
  const isSpeaking = voiceStatus === "playing";

  // ─── Status label / button styling ───────────────────────────────────────
  const micBgColor = isListening ? "#ea580c" : isBusy ? "#64748b" : "#0f4c3a";
  const micDisabled = isBusy || voiceStatus === "complete";

  const statusLabel = (() => {
    switch (voiceStatus) {
      case "playing": return t("assessment.speaking", "Saathi AI is speaking...");
      case "listening": return t("assessment.listening", "Listening… Speak now");
      case "processing": return t("assessment.processing", "Understanding you...");
      case "complete": return t("assessment.complete", "Assessment complete ✓");
      case "error": return t("assessment.error", "Something went wrong");
      default: return t("assessment.tapToSpeak", "Tap to speak");
    }
  })();

  const statusColor = isListening ? "#9a3412" : isSpeaking ? "#0f766e" : "#475569";
  const statusBg = isListening ? "#ffedd5" : isSpeaking ? "#ccfbf1" : "#f1f5f9";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── TOP BAR ── */}
      <div style={{
        backgroundColor: "#f4ede4", borderRadius: "12px", padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px"
      }}>
        <div>
          <div style={{
            fontSize: "11px", fontWeight: 800, letterSpacing: "0.06em", color: "#0f382c",
            textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px"
          }}>
            <div style={{
              width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#0f382c",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px"
            }}>🤖</div>
            <span>{t("nav.voiceAssessment", "Voice Assessment")} — {t("assessment.session", "Session")} #{sessionId}</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.25 }}>
            {t("assessment.title", "Let's find the right opportunities for you.")}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <button type="button" onClick={handleStartNewAssessment} style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px",
            backgroundColor: "transparent", border: "1px solid #cbd5e1", borderRadius: "6px",
            fontSize: "12px", fontWeight: 700, color: "#1e293b", cursor: "pointer"
          }}>
            <RotateCcw size={13} /><span>{t("assessment.startNew", "Start New Assessment")}</span>
          </button>

          {/* Progress bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>
                {t("assessment.step", "Step")} {progressStep + 1} {t("assessment.of", "of")} 8
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ea580c" }}>
                {isCompleted ? t("assessment.complete", "Complete") : t("assessment.inProgress", "In Progress")}
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {[...Array(8)].map((_, idx) => (
                <div key={idx} style={{
                  width: "22px", height: "4px", borderRadius: "2px",
                  backgroundColor: idx <= progressStep ? "#ea580c" : "#cbd5e1",
                  transition: "background-color 0.3s ease"
                }} />
              ))}
            </div>
          </div>

          {/* Universal Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "20px", alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* AI Question Card */}
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
            borderRadius: "12px", padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "4px", backgroundColor: "#ccfbf1",
                  color: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px"
                }}>🏛️</div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Saathi AI</span>
                <span style={{
                  fontSize: "10.5px", fontWeight: 700, color: "#0284c7", backgroundColor: "#e0f2fe",
                  padding: "2px 8px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "3px"
                }}>
                  <Sparkles size={10} /> {t("voiceSupportedBadge", "Bhashini Voice")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Audio controls */}
                <button
                  type="button"
                  onClick={replayCurrentPrompt}
                  title={t("replayAudio", "Replay Audio")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer"
                  }}
                >
                  <RotateCcw size={11} />
                  <span>{t("replayAudio", "Replay")}</span>
                </button>

                {isSpeaking && (
                  <button
                    type="button"
                    onClick={stopAudio}
                    title={t("stopAudio", "Stop Audio")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      border: "1px solid #fecaca",
                      backgroundColor: "#fef2f2",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#b91c1c",
                      cursor: "pointer"
                    }}
                  >
                    <Square size={10} fill="#b91c1c" />
                    <span>{t("stopAudio", "Stop")}</span>
                  </button>
                )}

                <div style={{ fontSize: "11.5px", fontWeight: 700, color: isSpeaking ? "#0d9488" : isListening ? "#ea580c" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                  {isSpeaking && <><Volume2 size={13} className="pulse-icon" /><span>{t("assessment.playing", "Playing...")}</span></>}
                  {isListening && <><Mic size={13} className="pulse-icon" /><span>{t("assessment.listeningPill", "Listening...")}</span></>}
                  {isBusy && <span>{t("assessment.processingPill", "Processing...")}</span>}
                  {!isSpeaking && !isListening && !isBusy && <span>{t("assessment.ready", "Ready")}</span>}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", lineHeight: 1.5 }}>
              "{currentPrompt}"
            </div>
          </div>

          {/* Microphone Interaction Card */}
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px",
            padding: "36px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
          }}>
            {/* Big mic button */}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={micDisabled}
              title={isListening ? t("assessment.clickToStop", "Click to stop") : t("assessment.clickToSpeak", "Click to speak")}
              style={{
                width: "70px", height: "70px", borderRadius: "50%",
                backgroundColor: micDisabled ? "#94a3b8" : micBgColor,
                color: "#ffffff", border: "none",
                cursor: micDisabled ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isListening
                  ? "0 0 0 8px rgba(234,88,12,0.2), 0 8px 24px rgba(234,88,12,0.4)"
                  : isBusy ? "none"
                  : "0 0 0 6px rgba(15,76,58,0.15), 0 8px 24px rgba(15,76,58,0.3)",
                transition: "all 0.25s ease"
              }}
            >
              {isSpeaking ? <Volume2 size={30} /> : <Mic size={30} />}
            </button>

            {/* Waveform animation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", height: "28px", margin: "18px 0 14px" }}>
              {[12, 22, 16, 26, 14, 20, 10].map((h, i) => (
                <div key={i} style={{
                  width: "4px",
                  height: (isBusy || voiceStatus === "complete") ? "6px" : `${h}px`,
                  borderRadius: "2px", backgroundColor: "#f97316",
                  animation: (isSpeaking || isListening) ? `soundWavePulse 1.${2 + (i % 3)}s ease-in-out infinite alternate` : "none",
                  animationDelay: `${i * 0.1}s`, transition: "height 0.2s ease"
                }} />
              ))}
            </div>

            {/* Status pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px",
              borderRadius: "16px", backgroundColor: statusBg, color: statusColor,
              fontSize: "12px", fontWeight: 700, marginBottom: "8px"
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isListening ? "#ea580c" : "#0d9488" }} />
              <span>{statusLabel}</span>
            </div>

            {/* Language Mismatch Warning Banner */}
            {languageMismatch && (
              <div style={{
                width: "100%", maxWidth: "480px", marginTop: "12px", padding: "12px 14px",
                backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a",
                fontSize: "12.5px", color: "#92400e", textAlign: "left"
              }}>
                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <AlertTriangle size={15} color="#d97706" />
                  <span>{t("languageMismatchDetected", "Language Mismatch Detected")}</span>
                </div>
                <div style={{ fontSize: "12px", lineHeight: 1.4 }}>
                  You spoke in <strong>{languageMismatch.detectedName}</strong>, but your interface language is set to <strong>{LANG_MAP[language] ? language.toUpperCase() : "Selected"}</strong>.
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchLanguage(languageMismatch.detectedLanguage)}
                    style={{
                      padding: "5px 12px", fontSize: "11px", fontWeight: 700,
                      backgroundColor: "#d97706", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer"
                    }}
                  >
                    Switch to {languageMismatch.detectedName}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTranslateAndSend(recognizedTranscript || liveTranscript, languageMismatch.detectedLanguage, language)}
                    style={{
                      padding: "5px 12px", fontSize: "11px", fontWeight: 600,
                      backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", borderRadius: "4px", cursor: "pointer"
                    }}
                  >
                    Translate & Send
                  </button>
                </div>
              </div>
            )}

            {/* Transcript Confirmation & Editing Card */}
            {recognizedTranscript && !isBusy && (
              <div style={{
                width: "100%", maxWidth: "480px", marginTop: "12px", padding: "12px",
                backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #86efac", textAlign: "left"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534" }}>
                    {t("speechRecognized", "Speech Recognized (Native Script):")}
                  </span>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>
                    {t("confirmOrEdit", "Review or edit before sending")}
                  </span>
                </div>
                <input
                  type="text"
                  value={recognizedTranscript}
                  onChange={(e) => setRecognizedTranscript(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", borderRadius: "6px",
                    border: "1px solid #bbf7d0", fontSize: "13px", fontWeight: 600, color: "#14532d",
                    backgroundColor: "#ffffff", marginBottom: "8px", outline: "none"
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && recognizedTranscript.trim() && !isBusy) {
                      const ans = recognizedTranscript;
                      setRecognizedTranscript("");
                      submitAnswer(ans);
                    }
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setRecognizedTranscript("")}
                    style={{
                      padding: "5px 10px", fontSize: "11px", fontWeight: 600,
                      backgroundColor: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer"
                    }}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ans = recognizedTranscript;
                      setRecognizedTranscript("");
                      submitAnswer(ans);
                    }}
                    style={{
                      padding: "5px 14px", fontSize: "11px", fontWeight: 700,
                      backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer",
                      display: "inline-flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    <Check size={12} />
                    <span>{t("confirmAndSend", "Confirm & Send")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live transcript display (when not awaiting confirmation) */}
            {!recognizedTranscript && (liveTranscript || lastUserText) && (
              <div style={{
                width: "100%", maxWidth: "480px", marginTop: "8px", padding: "10px 14px",
                backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0",
                fontSize: "13px", color: "#15803d", fontWeight: 600, textAlign: "left"
              }}>
                <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginBottom: "2px" }}>
                  {liveTranscript ? t("assessment.hearing", "Hearing:") : t("assessment.youSaid", "You said:")}
                </span>
                "{liveTranscript || lastUserText}"
              </div>
            )}

            {/* Error message */}
            {errorMsg && (
              <div style={{
                width: "100%", maxWidth: "480px", marginTop: "8px", padding: "10px 14px",
                backgroundColor: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca",
                fontSize: "12.5px", color: "#b91c1c", fontWeight: 600, textAlign: "left",
                display: "flex", alignItems: "flex-start", gap: "8px"
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Language / Bhashini note */}
            <div style={{ fontSize: "11.5px", color: "#64748b", margin: "8px 0" }}>
              <span>{t("bhashiniPowered", "Powered by Bhashini AI (Government of India)")}</span> • <span>{language.toUpperCase()}</span>
            </div>

            {/* Prefer typing toggle */}
            {!isCompleted && (
              <button type="button" onClick={() => setShowTextInput(!showTextInput)} style={{
                background: "none", border: "none", color: "#0f766e", fontSize: "12px",
                fontWeight: 600, textDecoration: "underline", cursor: "pointer", padding: "2px 6px"
              }}>
                {showTextInput ? t("assessment.closeTyping", "Close typing window") : t("assessment.preferTyping", "Prefer typing? Click here")}
              </button>
            )}

            {/* Text input fallback */}
            {showTextInput && !isCompleted && (
              <div style={{
                width: "100%", maxWidth: "480px", marginTop: "16px", padding: "12px",
                backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "left"
              }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={userTextInput}
                    onChange={(e) => setUserTextInput(e.target.value)}
                    placeholder={t("assessment.typePlaceholder", "Type your answer here...")}
                    disabled={isBusy}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: "6px",
                      border: "1px solid #cbd5e1", fontSize: "13px", outline: "none",
                      backgroundColor: isBusy ? "#f1f5f9" : "#fff"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && userTextInput.trim() && !isBusy) handleTextSubmit();
                    }}
                  />
                  <button type="button" disabled={isBusy || !userTextInput.trim()} onClick={handleTextSubmit} style={{
                    padding: "8px 14px",
                    backgroundColor: (isBusy || !userTextInput.trim()) ? "#94a3b8" : "#0f382c",
                    color: "#ffffff", border: "none", borderRadius: "6px",
                    cursor: (isBusy || !userTextInput.trim()) ? "default" : "pointer",
                    fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px"
                  }}>
                    <Send size={12} /><span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Opportunity Matching Card */}
          <div style={{
            backgroundColor: isCompleted ? "#ecfdf5" : "#f0fdfa",
            border: isCompleted ? "1.5px solid #10b981" : "1px solid #ccfbf1",
            borderRadius: "10px", padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "6px",
                backgroundColor: isCompleted ? "#d1fae5" : "#99f6e4",
                color: isCompleted ? "#047857" : "#0f766e",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}><Compass size={17} /></div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f766e" }}>Local Opportunity Matching</div>
                <div style={{ fontSize: "11.5px", color: "#475569" }}>
                  {isCompleted
                    ? "✓ PM-AJAY Certified Training Centers & Composite GIA Toolkits identified in your district!"
                    : "Local opportunity matching will appear after your profile is complete."}
                </div>
              </div>
            </div>
            {isCompleted && (
              <button type="button" onClick={() => onComplete && onComplete()} style={{
                padding: "8px 16px", backgroundColor: "#0f382c", color: "#ffffff",
                border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
                boxShadow: "0 2px 8px rgba(15,56,44,0.25)"
              }}>
                <span>View Recommendations</span><ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: AI Understanding Panel ── */}
        <div style={{
          backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
          borderRadius: "12px", padding: "22px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fef3c7",
              color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center"
            }}><Sparkles size={16} /></div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>AI is Understanding You</h2>
              <p style={{ fontSize: "11px", color: "#64748b", margin: "1px 0 0" }}>Real-time structured profile synthesis</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {profileAttributes.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={item.key} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: idx < profileAttributes.length - 1 ? "1px solid #f1f5f9" : "none", gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "4px",
                      backgroundColor: item.detected ? "#dcfce7" : "#f8fafc",
                      color: item.detected ? "#15803d" : "#94a3b8",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}><IconComp size={13} /></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155" }}>{item.label}</div>
                      <div style={{
                        fontSize: "11px", fontStyle: item.detected ? "normal" : "italic",
                        fontWeight: item.detected ? 600 : 400,
                        color: item.detected ? "#0f766e" : "#94a3b8",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {item.detected ? item.value : "Not yet detected"}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: "2px 8px", borderRadius: "10px", fontSize: "10.5px", fontWeight: 700,
                    backgroundColor: item.detected ? "#dcfce7" : "#f8fafc",
                    border: item.detected ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                    color: item.detected ? "#15803d" : "#94a3b8",
                    display: "flex", alignItems: "center", gap: "4px", flexShrink: 0
                  }}>
                    <span>{item.detected ? "●" : "○"}</span>
                    <span>{item.detected ? "Detected" : "Pending"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confidence footer */}
          <div style={{
            marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>Profile Confidence</span>
            <span style={{
              fontSize: "11px", fontWeight: 700,
              color: isCompleted ? "#15803d" : confidence > 0 ? "#0f766e" : "#64748b"
            }}>
              {confidence === 0 && !detectedProfile.currentOccupation ? "Pending analysis" : `${confidence}% Confidence`}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "modalFadeIn 0.3s ease-out"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "40px 32px",
            width: "90%",
            maxWidth: "420px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            animation: "modalScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}>
            {/* Success Icon */}
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#dcfce7",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow: "0 0 0 8px #f0fdf4"
            }}>
              <Sparkles size={32} style={{ animation: "pulseIcon 2s infinite" }} />
            </div>

            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 12px 0"
            }}>
              {t("assessment.modalTitle", "Assessment Completed")}
            </h2>

            <p style={{
              fontSize: "14px",
              color: "#475569",
              margin: "0 0 24px 0",
              lineHeight: 1.5
            }}>
              {t("assessment.modalDesc", "Your information has been successfully captured. Taking you to your personalized skill recommendations...")}
            </p>

            <button
              type="button"
              onClick={() => {
                if (onComplete) onComplete(detectedProfile);
                else navigate("/recommendations");
              }}
              style={{
                width: "100%",
                padding: "14px 24px",
                backgroundColor: "#0f382c",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 6px -1px rgba(15, 56, 44, 0.2), 0 2px 4px -1px rgba(15, 56, 44, 0.1)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#164e3f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0f382c"; }}
            >
              <span>{t("assessment.viewRecsBtn", "View Recommendations")}</span> <ArrowRight size={18} />
            </button>
            
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                marginTop: "16px",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {t("assessment.closeModal", "Close and review assessment")}
            </button>
          </div>
        </div>
      )}

      {/* Global keyframe animations */}
      <style>{`
        @keyframes soundWavePulse { 0% { height: 6px; } 100% { height: 26px; } }
        .pulse-icon { animation: pulseIcon 1.5s infinite; }
        @keyframes pulseIcon { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
