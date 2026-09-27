import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  RotateCcw, Volume2, Mic, Send, Sparkles, 
  Briefcase, Users, Wrench, Star, TrendingUp, Building2, 
  Car, GraduationCap, Compass, ArrowRight, AlertCircle, Clock
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

const INITIAL_PROMPTS = {
  en: "Welcome! I am Saathi AI. To help find the best livelihood opportunities for you, could you start by telling me about your current work — what do you do for income, and what does your family do?",
  hi: "नमस्ते! मैं साथी एआई हूँ। आपके लिए सर्वोत्तम आजीविका अवसर खोजने हेतु, क्या आप मुझे अपने वर्तमान काम और पारिवारिक व्यवसाय के बारे में बता सकते हैं?",
  mr: "नमस्कार! मी साथी एआय आहे. तुमच्यासाठी सर्वोत्तम उपजीविकेच्या संधी शोधण्यासाठी, तुम्ही सध्या काय काम करता आणि तुमच्या कुटुंबाचा व्यवसाय काय आहे हे सांगू शकाल का?"
};

const NAME_PROMPTS = {
  en: "Before we begin, may I know your name?",
  hi: "शुरू करने से पहले, क्या मैं आपका नाम जान सकता हूँ?",
  mr: "सुरु करण्यापूर्वी, मी आपले नाव जाणून घेऊ शकतो का?"
};

function getFirstPrompt(name, lang) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    return NAME_PROMPTS[lang] || NAME_PROMPTS.en;
  }
  if (lang === "hi") {
    return `नमस्ते ${trimmedName} जी! मैं साथी एआई हूँ। आपके लिए सर्वोत्तम आजीविका अवसर खोजने हेतु, क्या आप मुझे अपने वर्तमान काम और पारिवारिक व्यवसाय के बारे में बता सकते हैं?`;
  }
  if (lang === "mr") {
    return `नमस्कार ${trimmedName} जी! मी साथी एआय आहे. तुमच्यासाठी सर्वोत्तम उपजीविकेच्या संधी शोधण्यासाठी, तुम्ही सध्या काय काम करता आणि तुमच्या कुटुंबाचा व्यवसाय काय आहे हे सांगू शकाल का?`;
  }
  return `Welcome, ${trimmedName}! I am Saathi AI. To help find the best livelihood opportunities for you, could you start by telling me about your current work — what do you do for income, and what does your family do?`;
}

const LANG_MAP = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

export default function VoiceAssessment({ onComplete, onNavigateToCenters }) {
  const { language, setLanguage } = useLanguage();
  const { updateProfile, startNewSession, beneficiaryProfile } = useSession();
  const navigate = useNavigate();

  // ─── Restore from active session if present ───────────────────────────────
  const storedAssessment = getStoredVoiceAssessment();

  // ─── Core state ───────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState(
    () => storedAssessment?.sessionId || (Math.floor(10 + Math.random() * 89) + ["RK", "AK", "SP", "VS"][Math.floor(Math.random() * 4)])
  );

  // Assessment started flag: true only if user explicitly started or previously completed
  const [hasStarted, setHasStarted] = useState(
    () => Boolean(storedAssessment?.hasStarted && (storedAssessment?.messages?.length > 1 || storedAssessment?.isCompleted))
  );
  const hasStartedRef = useRef(hasStarted);
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  // Confirmation modal: displayed on initial visit if assessment has not started/completed
  const [showConfirmModal, setShowConfirmModal] = useState(
    () => !Boolean(storedAssessment?.hasStarted || storedAssessment?.isCompleted)
  );
  const [isNewAssessmentPrompt, setIsNewAssessmentPrompt] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Track the last prompt spoken via TTS to prevent duplicate utterances
  const lastSpokenPromptRef = useRef(storedAssessment?.currentPrompt || null);

  // voiceStatus: "idle" | "starting" | "playing" | "listening" | "processing" | "complete" | "error"
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  // Current AI question shown and spoken
  const [currentPrompt, setCurrentPrompt] = useState(
    () => storedAssessment?.currentPrompt || ""
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
    fullName: beneficiaryProfile?.full_name || beneficiaryProfile?.fullName || null,
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

  // ─── Refs — avoid stale closures ──────────────────────────────────────────
  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false); // processing lock
  const isSpeakingRef = useRef(false);
  const languageRef = useRef(language);
  const messagesStateRef = useRef(storedAssessment?.messages || []); // mirrors messages state for use in callbacks
  const isCompletedRef = useRef(isCompleted);

  // Sync refs
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);

  // ─── Persist voice assessment state to sessionStorage ────────────────────
  useEffect(() => {
    if (!hasStarted && !isCompleted) return;
    saveStoredVoiceAssessment({
      sessionId,
      hasStarted,
      currentPrompt,
      messages: messagesRef.current,
      lastUserText,
      isCompleted,
      showModal,
      confidence,
      detectedProfile,
    });
  }, [sessionId, hasStarted, currentPrompt, lastUserText, isCompleted, showModal, confidence, detectedProfile]);

  // ─── Start Listening Helper ───────────────────────────────────────────────
  const startListening = useCallback(() => {
    setLiveTranscript("");
    setErrorMsg(null);
    try {
      recognitionRef.current?.abort();
    } catch (_) {}

    setTimeout(() => {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("[SpeechRecognition] start error:", e);
        setErrorMsg("Could not start microphone automatically. Tap the microphone to continue.");
        setVoiceStatus("idle");
      }
    }, 100);
  }, []);

  // ─── Speech Synthesis ─────────────────────────────────────────────────────
  const speakText = useCallback((text) => {
    if (!hasStartedRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceStatus("idle");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.93;
      utterance.lang = LANG_MAP[languageRef.current] || "en-IN";

      isSpeakingRef.current = true;
      setVoiceStatus("playing");

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setVoiceStatus("playing");
      };
      utterance.onend = () => {
        isSpeakingRef.current = false;
        
        // AUTOMATIC LOOP: If not completed, start listening automatically
        if (!isCompletedRef.current) {
          setTimeout(() => startListening(), 100);
        } else {
          setVoiceStatus("complete");
        }
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setVoiceStatus("idle");
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      isSpeakingRef.current = false;
      setVoiceStatus("idle");
    }
  }, [startListening]);

  // Speak when currentPrompt changes during an active assessment
  useEffect(() => {
    if (!hasStartedRef.current || !currentPrompt || isCompleted) return;
    if (lastSpokenPromptRef.current === currentPrompt) return;
    lastSpokenPromptRef.current = currentPrompt;
    speakText(currentPrompt);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPrompt, isCompleted, speakText]);

  // ─── Speech Recognition setup ────────────────────────────────────────────
  // Re-create recognition when language changes so lang is always correct
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg("Voice recognition is not supported in this browser. Please use Chrome or Edge, or type your answer below.");
      return;
    }

    // Tear down previous instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;    // show live transcript
    rec.lang = LANG_MAP[language] || "en-IN";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setVoiceStatus("listening");
      setLiveTranscript("");
      setErrorMsg(null);
    };

    rec.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          final += r[0].transcript;
        } else {
          interim += r[0].transcript;
        }
      }
      setLiveTranscript(final || interim);
    };

    rec.onerror = (event) => {
      console.error("[SpeechRecognition] error:", event.error);
      isProcessingRef.current = false;
      const errMessages = {
        "not-allowed": "Microphone access was denied. Please allow microphone permission and try again.",
        "no-speech": "No speech was detected. Please try again.",
        "audio-capture": "Could not access microphone. Please check your device.",
        "network": "Speech recognition failed due to network issues.",
        "aborted": null, // user manually stopped — no error message needed
      };
      const msg = errMessages[event.error] !== undefined ? errMessages[event.error] : `Speech recognition error: ${event.error}`;
      if (msg) setErrorMsg(msg);
      setVoiceStatus("idle");
      setLiveTranscript("");
    };

    rec.onend = () => {
      // Only process if we captured something and aren't already processing
      const captured = liveTranscriptRef.current?.trim();
      if (captured && !isProcessingRef.current) {
        isProcessingRef.current = true;
        setLastUserText(captured);
        setLiveTranscript("");
        submitAnswer(captured);
      } else if (!isProcessingRef.current) {
        setVoiceStatus("idle");
        setLiveTranscript("");
      }
    };

    recognitionRef.current = rec;
  }, [language]); // eslint-disable-line

  // Keep a ref to liveTranscript so onend closure can access latest value
  const liveTranscriptRef = useRef("");
  useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);

  // ─── Submit Answer to backend ─────────────────────────────────────────────
  const submitAnswer = useCallback(async (text) => {
    if (!text || !text.trim()) {
      isProcessingRef.current = false;
      setVoiceStatus("idle");
      return;
    }

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

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          language: LANG_MAP[languageRef.current] || "en-IN"
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

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
        setCurrentPrompt("Assessment completed. Thank you!");
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
      } else {
        setCurrentPrompt(nextQuestion);
        isProcessingRef.current = false;
        // speakText called via the useEffect on currentPrompt
      }
    } catch (err) {
      console.error("[VoiceAssessment] submitAnswer error:", err);
      isProcessingRef.current = false;
      setVoiceStatus("idle");
      setErrorMsg(err.message || "AI service is temporarily unavailable. Please try again.");
    }
  }, [speakText]);

  // ─── Confirm Start Handler ───────────────────────────────────────────────
  const handleConfirmStart = useCallback(() => {
    if (isStarting) return;
    setIsStarting(true);
    setVoiceStatus("starting");
    setShowConfirmModal(false);
    setErrorMsg(null);

    // If starting fresh after "Start New Assessment":
    if (isNewAssessmentPrompt) {
      clearStoredVoiceAssessment();
      if (startNewSession) {
        startNewSession();
      }

      const newId = Math.floor(10 + Math.random() * 89) + ["RK", "AK", "SP", "VS"][Math.floor(Math.random() * 4)];
      setSessionId(newId);
      setIsCompleted(false);
      isCompletedRef.current = false;
      setShowModal(false);
      setShowTextInput(false);
      setUserTextInput("");
      setLiveTranscript("");
      setLastUserText("");
      setConfidence(0);
      setDetectedProfile({
        fullName: beneficiaryProfile?.full_name || beneficiaryProfile?.fullName || null,
        currentOccupation: null, familyOccupation: null, existingSkills: null,
        areasOfInterest: null, careerAspiration: null, employmentPreference: null,
        mobility: null, trainingAvailability: null,
        trainingAvailabilityDuration: null, trainingSchedule: null,
      });
      setIsNewAssessmentPrompt(false);
    }

    // Check beneficiary name and format the opening question
    const currentName = (beneficiaryProfile?.full_name || beneficiaryProfile?.fullName || "").trim();
    const firstPrompt = getFirstPrompt(currentName, languageRef.current);

    const initialMsg = { speaker: "assistant", text: firstPrompt };
    messagesRef.current = [initialMsg];
    messagesStateRef.current = [initialMsg];
    setCurrentPrompt(firstPrompt);
    setHasStarted(true);
    hasStartedRef.current = true;
    lastSpokenPromptRef.current = firstPrompt;

    // Small delay to ensure audio context and UI readiness before speaking opening question
    setTimeout(() => {
      speakText(firstPrompt);
      setIsStarting(false);
    }, 250);
  }, [isStarting, isNewAssessmentPrompt, beneficiaryProfile, startNewSession, speakText]);

  // ─── Dismiss Modal Handler (Not Now / Cancel) ─────────────────────────────
  const handleDismissModal = useCallback(() => {
    setShowConfirmModal(false);
    setIsStarting(false);
    setVoiceStatus("idle");

    if (isNewAssessmentPrompt) {
      setIsNewAssessmentPrompt(false);
    } else {
      // User clicked "Not Now" on the start confirmation modal -> redirect to Home
      clearStoredVoiceAssessment();
      navigate("/home");
    }
  }, [isNewAssessmentPrompt, navigate]);

  // ─── Mic button click ─────────────────────────────────────────────────────
  const handleMicClick = useCallback(() => {
    if (isProcessingRef.current || isStarting) return;

    if (!hasStartedRef.current) {
      handleConfirmStart();
      return;
    }

    if (voiceStatus === "playing" || isSpeakingRef.current) {
      // User interrupts TTS to speak
      window.speechSynthesis?.cancel();
      isSpeakingRef.current = false;
    }

    if (voiceStatus === "listening") {
      // Stop recognition — onend will handle submission
      try { recognitionRef.current?.stop(); } catch (_) {}
      return;
    }

    // Start fresh recognition manually
    startListening();
  }, [voiceStatus, startListening, isStarting, handleConfirmStart]);

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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    try { recognitionRef.current?.abort(); } catch (_) {}
    isSpeakingRef.current = false;
    isProcessingRef.current = false;
    setVoiceStatus("idle");

    setIsNewAssessmentPrompt(true);
    setShowConfirmModal(true);
  }, []);

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
  const micBgColor = !hasStarted ? "#0f4c3a" : isListening ? "#ea580c" : isBusy ? "#64748b" : "#0f4c3a";
  const micDisabled = isBusy || voiceStatus === "complete" || isStarting;

  const statusLabel = (() => {
    if (!hasStarted) return "Ready to begin";
    switch (voiceStatus) {
      case "starting": return "Starting assessment...";
      case "playing": return "Saathi AI is speaking...";
      case "listening": return "Listening… Speak now";
      case "processing": return "Understanding you...";
      case "complete": return "Assessment complete ✓";
      case "error": return "Something went wrong";
      default: return "Ready to begin";
    }
  })();

  const statusColor = !hasStarted ? "#475569" : isListening ? "#9a3412" : isSpeaking ? "#0f766e" : "#475569";
  const statusBg = !hasStarted ? "#f1f5f9" : isListening ? "#ffedd5" : isSpeaking ? "#ccfbf1" : "#f1f5f9";

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
            <span>Voice Assessment — Session #{sessionId}</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", margin: 0, lineHeight: 1.25 }}>
            Let's find the right opportunities for you.
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <button type="button" onClick={handleStartNewAssessment} style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px",
            backgroundColor: "transparent", border: "1px solid #cbd5e1", borderRadius: "6px",
            fontSize: "12px", fontWeight: 700, color: "#1e293b", cursor: "pointer"
          }}>
            <RotateCcw size={13} /><span>Start New Assessment</span>
          </button>

          {/* Progress bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#334155" }}>Step {progressStep + 1} of 8</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ea580c" }}>{isCompleted ? "Complete" : !hasStarted ? "Ready" : "In Progress"}</span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {[...Array(8)].map((_, idx) => (
                <div key={idx} style={{
                  width: "22px", height: "4px", borderRadius: "2px",
                  backgroundColor: !hasStarted ? (idx === 0 ? "#fed7aa" : "#cbd5e1") : idx <= progressStep ? "#ea580c" : "#cbd5e1",
                  transition: "background-color 0.3s ease"
                }} />
              ))}
            </div>
          </div>

          {/* Language Switcher */}
          <div style={{ display: "flex", gap: "4px" }}>
            {[{ code: "en", label: "English" }, { code: "hi", label: "हिंदी" }, { code: "mr", label: "मराठी" }].map((item) => {
              const active = language === item.code;
              return (
                <button key={item.code} type="button" onClick={() => setLanguage(item.code)} style={{
                  padding: "5px 12px", borderRadius: "4px", fontSize: "12px",
                  fontWeight: active ? 700 : 500, backgroundColor: active ? "#0f382c" : "transparent",
                  color: active ? "#ffffff" : "#475569", border: "none", cursor: "pointer"
                }}>
                  {item.label}
                </button>
              );
            })}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "4px", backgroundColor: "#ccfbf1",
                  color: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px"
                }}>🏛️</div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Saathi AI</span>
                <span style={{
                  fontSize: "10.5px", fontWeight: 700, color: "#0284c7", backgroundColor: "#e0f2fe",
                  padding: "2px 8px", borderRadius: "12px"
                }}>Spoken Voice</span>
              </div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: isSpeaking ? "#0d9488" : isListening ? "#ea580c" : "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                {isSpeaking && <><Volume2 size={13} className="pulse-icon" /><span>Playing...</span></>}
                {isListening && <><Mic size={13} className="pulse-icon" /><span>Listening...</span></>}
                {isBusy && <span>Processing...</span>}
                {voiceStatus === "starting" && <span>Starting...</span>}
                {!isSpeaking && !isListening && !isBusy && voiceStatus !== "starting" && (
                  <span>{hasStarted ? "Ready" : "Ready to begin"}</span>
                )}
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: hasStarted ? "#1e293b" : "#475569", lineHeight: 1.5 }}>
              {hasStarted ? (
                `"${currentPrompt}"`
              ) : (
                <span>Ready when you are. Click 'Start Assessment' below to begin your voice session.</span>
              )}
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
              title={!hasStarted ? "Click to start assessment" : isListening ? "Click to stop" : "Click to speak"}
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
                  height: (!hasStarted || isBusy || voiceStatus === "complete") ? "6px" : `${h}px`,
                  borderRadius: "2px", backgroundColor: "#f97316",
                  animation: (hasStarted && (isSpeaking || isListening)) ? `soundWavePulse 1.${2 + (i % 3)}s ease-in-out infinite alternate` : "none",
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
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                backgroundColor: !hasStarted ? "#94a3b8" : isListening ? "#ea580c" : isSpeaking ? "#0d9488" : "#94a3b8"
              }} />
              <span>{statusLabel}</span>
            </div>

            {/* Prominent Start Assessment Button when in idle state */}
            {!hasStarted && (
              <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleConfirmStart}
                  disabled={isStarting}
                  style={{
                    padding: "12px 28px",
                    backgroundColor: "#ea580c",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: isStarting ? "default" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                    transition: "all 0.2s ease",
                    opacity: isStarting ? 0.8 : 1
                  }}
                  onMouseEnter={(e) => { if (!isStarting) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                  onMouseLeave={(e) => { if (!isStarting) e.currentTarget.style.backgroundColor = "#ea580c"; }}
                >
                  <Sparkles size={16} />
                  <span>{isStarting ? "Starting..." : "Start Assessment"}</span>
                </button>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                  Click when you are ready to begin speaking
                </span>
              </div>
            )}

            {/* Live transcript display */}
            {(liveTranscript || lastUserText) && (
              <div style={{
                width: "100%", maxWidth: "480px", marginTop: "8px", padding: "10px 14px",
                backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0",
                fontSize: "13px", color: "#15803d", fontWeight: 600, textAlign: "left"
              }}>
                <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginBottom: "2px" }}>
                  {liveTranscript ? "Hearing:" : "You said:"}
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

            {/* Language / security note */}
            <div style={{ fontSize: "11.5px", color: "#64748b", margin: "8px 0" }}>
              {language === "hi" ? "हिंदी चयनित" : language === "mr" ? "मराठी निवडले" : "English selected"} | Your conversation is securely stored.
            </div>

            {/* Prefer typing toggle */}
            {!isCompleted && (
              <button type="button" onClick={() => setShowTextInput(!showTextInput)} style={{
                background: "none", border: "none", color: "#0f766e", fontSize: "12px",
                fontWeight: 600, textDecoration: "underline", cursor: "pointer", padding: "2px 6px"
              }}>
                {showTextInput ? "Close typing window" : "Prefer typing? Click here"}
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
                    placeholder="Type your answer here..."
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

      {/* ── START ASSESSMENT CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
          animation: "modalFadeIn 0.25s ease-out"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "36px 32px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            animation: "modalScaleIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}>
            {/* Friendly Mic Icon */}
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#ffedd5",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "18px",
              boxShadow: "0 0 0 8px #fff7ed"
            }}>
              <Mic size={28} />
            </div>

            <div style={{
              fontSize: "11.5px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#ea580c",
              marginBottom: "6px"
            }}>
              Voice Assessment
            </div>

            <h2 style={{
              fontSize: "21px",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 10px 0",
              lineHeight: 1.3
            }}>
              {isNewAssessmentPrompt
                ? "Would you like to start a new voice assessment?"
                : "Would you like to start your voice assessment?"}
            </h2>

            <p style={{
              fontSize: "13.5px",
              color: "#64748b",
              margin: "0 0 24px 0",
              lineHeight: 1.55,
              maxWidth: "380px"
            }}>
              Saathi AI will ask you a few questions about your work, skills, interests, aspirations and training availability.
            </p>

            <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
              <button
                type="button"
                onClick={handleConfirmStart}
                disabled={isStarting}
                style={{
                  flex: 1.2,
                  padding: "12px 20px",
                  backgroundColor: "#ea580c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: isStarting ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 10px rgba(234, 88, 12, 0.25)",
                  transition: "all 0.2s ease",
                  opacity: isStarting ? 0.8 : 1
                }}
                onMouseEnter={(e) => { if (!isStarting) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                onMouseLeave={(e) => { if (!isStarting) e.currentTarget.style.backgroundColor = "#ea580c"; }}
              >
                <Sparkles size={16} />
                <span>{isStarting ? "Starting..." : "Start Assessment"}</span>
              </button>

              <button
                type="button"
                onClick={handleDismissModal}
                disabled={isStarting}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
              >
                {isNewAssessmentPrompt ? "Cancel" : "Not Now"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              Assessment Completed
            </h2>

            <p style={{
              fontSize: "14px",
              color: "#475569",
              margin: "0 0 24px 0",
              lineHeight: 1.5
            }}>
              Your information has been successfully captured and your livelihood profile is ready.
            </p>

            <button
              type="button"
              onClick={() => navigate("/livelihood-profile")}
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
              View My Profile <ArrowRight size={18} />
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
              Close and review assessment
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
