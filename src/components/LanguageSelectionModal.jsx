// src/components/LanguageSelectionModal.jsx
// Official Pre-Login / Registration Language Selection Screen for Jeevika Saathi
// Allows beneficiaries to choose language via tactile cards OR voice recognition.
// Reads the chosen language aloud in the respective native language and applies it immediately.

import React, { useState, useEffect, useRef } from "react";
import { Globe, Volume2, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Mic, Loader2, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import bhashiniClient from "../services/bhashiniService";
import { AudioRecorder } from "../utils/audioRecorder";

const LANGUAGE_CARDS = [
  {
    code: "te",
    name: "తెలుగు",
    subname: "Telugu",
    greeting: "నమస్కారం! జీవికా సాథి పోర్టల్‌కు స్వాగతం.",
    badge: "వాయిస్ సపోర్ట్",
    popular: true
  },
  {
    code: "hi",
    name: "हिन्दी",
    subname: "Hindi",
    greeting: "नमस्ते! जीविका साथी राष्ट्रीय पोर्टल में आपका स्वागत है।",
    badge: "वॉयस सपोर्ट",
    popular: true
  },
  {
    code: "en",
    name: "English",
    subname: "English",
    greeting: "Welcome to Jeevika Saathi National Livelihood Portal.",
    badge: "Voice Support",
    popular: true
  },
  {
    code: "ta",
    name: "தமிழ்",
    subname: "Tamil",
    greeting: "வணக்கம்! ஜீவிகா சாத்தி தேசிய போர்ட்டலுக்கு வரவேற்கிறோம்.",
    badge: "குரல் ஆதரவு",
    popular: false
  },
  {
    code: "kn",
    name: "ಕನ್ನಡ",
    subname: "Kannada",
    greeting: "ನಮಸ್ಕಾರ! ಜೀವಿಕಾ ಸಾಥಿ ರಾಷ್ಟ್ರೀಯ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ.",
    badge: "ಧ್ವನಿ ಬೆಂಬಲ",
    popular: false
  },
  {
    code: "mr",
    name: "मराठी",
    subname: "Marathi",
    greeting: "नमस्कार! जीविका साथी राष्ट्रीय पोर्टलवर आपले स्वागत आहे.",
    badge: "आवाज समर्थन",
    popular: false
  },
  {
    code: "ml",
    name: "മലയാളം",
    subname: "Malayalam",
    greeting: "നമസ്കാരം! ജീവിക സാഥി ദേശീയ പോർട്ടലിലേക്ക് സ്വാഗതം.",
    badge: "വോയ്‌സ് പിന്തുണ",
    popular: false
  }
];

export default function LanguageSelectionModal({ isOpen, onClose, onConfirm }) {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(language || "te");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Voice language selection states
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceConfirmation, setVoiceConfirmation] = useState(null);
  const [voiceError, setVoiceError] = useState(null);

  const recognitionRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const autoProceedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      bhashiniClient.stopAudio();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      if (audioRecorderRef.current) {
        try { audioRecorderRef.current.stop(); } catch (_) {}
      }
      if (autoProceedTimeoutRef.current) {
        clearTimeout(autoProceedTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Process recognized text to detect language and announce confirmation
  const handleDetectedLanguage = async (text) => {
    if (!text || !text.trim()) return;
    setIsProcessingVoice(true);
    setVoiceTranscript(text);

    try {
      const idResult = await bhashiniClient.identifyLanguage({ phrase: text });
      const targetLang = idResult.language || "te";

      setSelectedLang(targetLang);
      setLanguage(targetLang);

      try {
        localStorage.setItem("jeevika_language", targetLang);
        localStorage.setItem("jeevika_language_chosen", "true");
      } catch (_) {}

      const confMsg = idResult.confirmationMessage || `${idResult.languageName || targetLang} selected.`;
      setVoiceConfirmation({
        lang: targetLang,
        name: idResult.languageName,
        message: confMsg
      });

      // Read out confirmation in that respective language using Bhashini TTS
      bhashiniClient.speakText(confMsg, targetLang, "female", {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false)
      });

      // Auto continue after brief pause so user hears their language confirmation
      if (autoProceedTimeoutRef.current) clearTimeout(autoProceedTimeoutRef.current);
      autoProceedTimeoutRef.current = setTimeout(() => {
        if (onConfirm) onConfirm(targetLang);
        if (onClose) onClose();
      }, 2400);

    } catch (err) {
      console.warn("Language voice detection error:", err);
      setVoiceError("Could not recognize language. Please tap your preferred language card below.");
    } finally {
      setIsListeningVoice(false);
      setIsProcessingVoice(false);
    }
  };

  // Start Voice Recognition to choose language
  const handleStartVoiceLanguage = async () => {
    bhashiniClient.stopAudio();
    setVoiceError(null);
    setVoiceConfirmation(null);
    setVoiceTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (_) {}
        }

        const LANG_MAP = { en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN", kn: "kn-IN", mr: "mr-IN", ml: "ml-IN" };
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = LANG_MAP[selectedLang] || LANG_MAP[language] || "en-IN";
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.continuous = false;

        let finalSpeech = "";

        recognition.onstart = () => {
          setIsListeningVoice(true);
          setIsProcessingVoice(false);
        };

        recognition.onresult = (e) => {
          let full = "";
          for (let i = 0; i < e.results.length; i++) {
            full += (full ? " " : "") + e.results[i][0].transcript.trim();
          }
          finalSpeech = full.trim();
          setVoiceTranscript(finalSpeech);
        };

        recognition.onerror = (e) => {
          console.warn("[VoiceLangRecognition] error:", e.error);
          setIsListeningVoice(false);
          if (e.error === "not-allowed") {
            setVoiceError("Microphone permission required to choose language by voice.");
          } else if (e.error !== "no-speech") {
            setVoiceError("Could not hear speech clearly. Please try speaking again or click a card.");
          }
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
          if (finalSpeech) {
            handleDetectedLanguage(finalSpeech);
          }
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Browser SpeechRecognition failed, fallback to AudioRecorder:", err);
      }
    }

    // Fallback: AudioRecorder via 16kHz PCM WAV
    try {
      setIsListeningVoice(true);
      const recorder = new AudioRecorder();
      audioRecorderRef.current = recorder;
      await recorder.start();

      setTimeout(async () => {
        try {
          const wavBase64 = await recorder.stop();
          setIsListeningVoice(false);
          setIsProcessingVoice(true);
          const result = await bhashiniClient.identifyLanguage({ audioContent: wavBase64 });
          if (result && result.language) {
            handleDetectedLanguage(result.recognizedText || result.language);
          }
        } catch (e) {
          setIsListeningVoice(false);
          setIsProcessingVoice(false);
          setVoiceError("Please speak your language name clearly.");
        }
      }, 3500);
    } catch (micErr) {
      setIsListeningVoice(false);
      setVoiceError("Microphone access is needed to speak your language.");
    }
  };

  // Read aloud all language options sequentially
  const handleReadAloudLanguages = () => {
    bhashiniClient.stopAudio();
    setIsPlayingAudio(true);
    const summary = "1. తెలుగు - Telugu, 2. हिन्दी - Hindi, 3. English, 4. ಕನ್ನಡ - Kannada, 5. தமிழ் - Tamil, 6. मराठी - Marathi. Speak your language or tap any card.";
    bhashiniClient.speakText(summary, "hi", "female", {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const handleCardClick = (langCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    setVoiceConfirmation(null);

    const card = LANGUAGE_CARDS.find((c) => c.code === langCode);
    if (card && card.greeting) {
      setIsPlayingAudio(true);
      bhashiniClient.speakText(card.greeting, langCode, "female", {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false)
      });
    }
  };

  const handleContinue = () => {
    bhashiniClient.stopAudio();
    try {
      localStorage.setItem("jeevika_language", selectedLang);
      localStorage.setItem("jeevika_language_chosen", "true");
    } catch (_) {}
    setLanguage(selectedLang);
    if (onConfirm) onConfirm(selectedLang);
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(6, 17, 31, 0.88)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto"
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          width: "100%",
          maxWidth: "780px",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          animation: "fadeInUp 0.25s ease-out"
        }}
      >
        {/* Tricolour Accent Line */}
        <div style={{ display: "flex", height: "4px", width: "100%" }}>
          <div style={{ flex: 1, backgroundColor: "#FF9933" }} />
          <div style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
          <div style={{ flex: 1, backgroundColor: "#138808" }} />
        </div>

        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px 14px",
            backgroundColor: "var(--surface-subtle)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "var(--govt-sky)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Globe size={26} color="var(--govt-blue)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--govt-blue)",
                  backgroundColor: "var(--govt-sky)",
                  padding: "2px 8px",
                  borderRadius: "4px"
                }}
              >
                PM-AJAY GIA Component
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--tricolour-green-dark)",
                  backgroundColor: "var(--tricolour-green-light)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Sparkles size={11} /> Bhashini AI Enabled
              </span>
            </div>
            <h2
              id="lang-modal-title"
              style={{
                fontSize: "19px",
                fontWeight: 800,
                color: "var(--govt-navy)",
                margin: 0,
                lineHeight: 1.3
              }}
            >
              अपनी भाषा चुनें | మీ భాషను ఎంచుకోండి | Choose Language
            </h2>
          </div>
        </div>

        {/* ── INTERACTIVE VOICE LANGUAGE SELECTION BANNER ── */}
        <div
          style={{
            padding: "16px 24px",
            background: isListeningVoice
              ? "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
              : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            borderBottom: "1.5px solid",
            borderColor: isListeningVoice ? "#f87171" : "#86efac",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handleStartVoiceLanguage}
                disabled={isProcessingVoice}
                style={{
                  padding: "10px 18px",
                  backgroundColor: isListeningVoice ? "#dc2626" : "#00337a",
                  color: "#ffffff",
                  border: isListeningVoice ? "2px solid #ef4444" : "2px solid #2563eb",
                  borderRadius: "30px",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: isListeningVoice ? "0 0 16px rgba(220, 38, 38, 0.5)" : "0 4px 12px rgba(0, 51, 122, 0.25)",
                  transition: "all 0.15s ease"
                }}
              >
                {isListeningVoice ? (
                  <>
                    <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ffffff", animation: "pulse 1s infinite" }} />
                    <Mic size={16} />
                    <span>Listening... Speak Your Language</span>
                  </>
                ) : isProcessingVoice ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Detecting Language...</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} />
                    <span>🎙️ बोलकर भाषा चुनें | మాట్లాడి భాషను ఎంచుకోండి</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReadAloudLanguages}
                disabled={isPlayingAudio}
                title="Read language list aloud"
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Volume2 size={14} color="#16a34a" />
                <span>{isPlayingAudio ? "Playing Audio..." : "🔊 Read Options Aloud"}</span>
              </button>
            </div>

            <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>
              Speak: <strong style={{ color: "#00337a" }}>"Telugu", "తెలుగు", "Hindi", "English", "Tamil", "Kannada", "Malayalam"</strong>
            </div>
          </div>

          {/* Voice transcript & confirmation feedback */}
          {voiceTranscript && (
            <div style={{ fontSize: "12.5px", color: "#1e293b", backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              Heard: <em>"{voiceTranscript}"</em>
            </div>
          )}

          {voiceConfirmation && (
            <div style={{ fontSize: "13px", color: "#166534", backgroundColor: "#f0fdf4", padding: "8px 14px", borderRadius: "8px", border: "1px solid #86efac", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={16} color="#16a34a" />
              <span>{voiceConfirmation.message}</span>
            </div>
          )}

          {voiceError && (
            <div style={{ fontSize: "12px", color: "#991b1b", backgroundColor: "#fef2f2", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fca5a5", fontWeight: 600 }}>
              {voiceError}
            </div>
          )}
        </div>

        {/* Language Grid */}
        <div style={{ padding: "20px 24px", maxHeight: "360px", overflowY: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px"
            }}
          >
            {LANGUAGE_CARDS.map((card) => {
              const isSelected = selectedLang === card.code;
              return (
                <button
                  key={card.code}
                  type="button"
                  onClick={() => handleCardClick(card.code)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `2.5px solid ${isSelected ? "#00337a" : "#e2e8f0"}`,
                    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                    position: "relative",
                    boxShadow: isSelected ? "0 4px 14px rgba(0, 51, 122, 0.16)" : "0 1px 3px rgba(0, 0, 0, 0.05)"
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        color: "#00337a"
                      }}
                    >
                      <CheckCircle2 size={18} fill="#00337a" color="#ffffff" />
                    </div>
                  )}

                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#001e47", marginBottom: "2px" }}>
                    {card.name}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "8px" }}>
                    {card.subname}
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isSelected ? "#00337a" : "#475569",
                      backgroundColor: isSelected ? "rgba(0, 51, 122, 0.1)" : "#f1f5f9",
                      padding: "3px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    <Volume2 size={12} color={isSelected ? "#00337a" : "#16a34a"} />
                    <span>{card.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ministry & Bhashini trust footnote */}
          <div
            style={{
              marginTop: "16px",
              padding: "10px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: "11.5px", color: "#475569", lineHeight: 1.4 }}>
              <strong>Ministry of Social Justice & Empowerment</strong> • Powered by National Language Translation Mission (Bhashini). Your language preference is saved and active across all forms and assessments.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: "14px 24px 18px",
            backgroundColor: "var(--surface-subtle)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Selected: <strong style={{ color: "#00337a", fontSize: "15px" }}>{LANGUAGE_CARDS.find((c) => c.code === selectedLang)?.name} ({LANGUAGE_CARDS.find((c) => c.code === selectedLang)?.subname})</strong>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            style={{
              backgroundColor: "#00337a",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(0, 51, 122, 0.25)",
              transition: "background-color 0.15s ease"
            }}
          >
            <span>{t("continueWithLang", "Continue to Portal")}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
