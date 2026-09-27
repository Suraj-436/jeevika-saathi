import React, { useState, useEffect } from "react";
import { 
  Mic, Volume2, VolumeX, RotateCcw, CheckCircle2, 
  ArrowRight, ShieldCheck, Award, MapPin, AlertCircle, 
  Sparkles, Check, RefreshCw 
} from "lucide-react";
import confetti from "canvas-confetti";
import { INTERVIEW_STEPS, TRADES, LANGUAGES } from "../data/trades";

export default function VoiceAssistantStudio({ darkMode, currentLang, setCurrentLang, onNavigateToCenters }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [userCustomAnswer, setUserCustomAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [enrolledTrade, setEnrolledTrade] = useState(null);

  const [profileData, setProfileData] = useState({
    age: 28,
    district: "Agra",
    state: "Uttar Pradesh",
    education_level: "Class 8 Pass",
    family_traditional_occupation: "Leather Craft & Footwear",
    current_occupation: "Daily Wage Laborer",
    monthly_income: "₹5,000 – ₹7,000",
    skill_interests: ["Leather 2.0", "Solar Electrician"],
    employment_preference: "Self-Employment (Micro-Enterprise)",
    max_travel_km: "15 km",
    needs_stipend: true,
    has_disability: false
  });

  const step = INTERVIEW_STEPS[currentStepIndex] || INTERVIEW_STEPS[0];
  const aiQuestion = step.questions[currentLang] || step.questions["hi"] || step.questions["en"];
  const sampleUserAnswer = step.sampleAnswer?.[currentLang] || step.sampleAnswer?.["hi"] || step.sampleAnswer?.["en"];

  // Web Speech Synthesis Audio
  const speakQuestion = (text, langCode = currentLang) => {
    if (audioMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      const langMap = {
        hi: "hi-IN",
        ta: "ta-IN",
        te: "te-IN",
        kn: "kn-IN",
        mr: "mr-IN",
        bn: "bn-IN",
        or: "or-IN",
        pa: "pa-IN",
        en: "en-IN"
      };
      utterance.lang = langMap[langCode] || "hi-IN";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
      setIsSpeaking(false);
    }
  };

  // Speak on phase transition
  useEffect(() => {
    if (aiQuestion && !audioMuted) {
      speakQuestion(aiQuestion, currentLang);
    }
  }, [currentStepIndex, currentLang]);

  // Turn submission handler
  const handleSubmitTurn = (customText = null) => {
    const textToRecord = customText || userCustomAnswer || sampleUserAnswer;
    setIsSubmitting(true);

    setTimeout(() => {
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", text: aiQuestion, phase: step.phase },
        { role: "user", text: textToRecord, phase: step.phase }
      ]);

      if (step.profileFields) {
        setProfileData((prev) => ({ ...prev, ...step.profileFields }));
      }

      setUserCustomAnswer("");
      setIsSubmitting(false);

      if (currentStepIndex < INTERVIEW_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        try {
          confetti({ particleCount: 60, spread: 70 });
        } catch (e) {}
      }
    }, 400);
  };

  const handleSimulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleSubmitTurn(sampleUserAnswer);
    }, 1200);
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentStepIndex(0);
    setConversationHistory([]);
    setEnrolledTrade(null);
  };

  // Matched NSQF Recommendations
  const matchedTrades = [
    {
      trade: TRADES.find((t) => t.id === "nsqf-003") || TRADES[0],
      score: 96,
      reasons: [
        "Matches Class 8 entry requirement (NSQF Level 3)",
        "Direct traditional affinity with family leathercraft heritage",
        "High regional labor demand in Agra footwear cluster",
        "Full GIA sponsorship + ₹4,000/mo DBT sustenance"
      ]
    },
    {
      trade: TRADES.find((t) => t.id === "nsqf-002") || TRADES[1],
      score: 84,
      reasons: [
        "Aligns with candidate's stated interest in electrical & solar",
        "Priority sector under PM Surya Ghar Muft Bijli Yojana in UP",
        "Provides self-employment electrician tool kit"
      ]
    },
    {
      trade: TRADES.find((t) => t.id === "nsqf-009") || TRADES[2],
      score: 72,
      reasons: [
        "Accredited center available within 15 km in Bichpuri/Agra",
        "Self-employment viable in modular wooden interior assembly"
      ]
    }
  ];

  const isCompleted = currentStepIndex === INTERVIEW_STEPS.length - 1;

  return (
    <div className="space-y-6">
      {/* Top Protocol Header */}
      <div className={`rounded-xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              National Council for Vocational Education and Training (NCVET) Protocol
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            PM-AJAY Voice-Assisted Livelihood Assessment
          </h2>
          <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] mt-0.5">
            Stage {currentStepIndex + 1} of {INTERVIEW_STEPS.length}: {step.title} — {step.subtitle}
          </p>
        </div>

        {/* Controls: Audio Mute, Replay, Language */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              audioMuted 
                ? "bg-red-500/10 border-red-500/30 text-red-500" 
                : darkMode 
                  ? "bg-[#16161b] border-[#26262e] text-gray-300 hover:text-white" 
                  : "bg-[#f5f5f4] border-[#d6d3d1] text-stone-700 hover:bg-[#e7e5e4]"
            }`}
          >
            {audioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{audioMuted ? "Audio Muted" : "Voice On"}</span>
          </button>

          <button
            onClick={() => speakQuestion(aiQuestion)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              darkMode 
                ? "bg-[#16161b] border-[#26262e] text-blue-400 hover:text-blue-300" 
                : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <RefreshCw size={12} />
            <span>Repeat Question</span>
          </button>

          <button
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              darkMode 
                ? "bg-[#16161b] border-[#26262e] text-gray-400 hover:text-white" 
                : "bg-[#f5f5f4] border-[#d6d3d1] text-stone-600 hover:text-stone-900"
            }`}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Step Progress Tracker (Clean 8px Grid) */}
      <div className="grid grid-cols-7 gap-1.5">
        {INTERVIEW_STEPS.map((s, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <button
              key={s.phase}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                isDone 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                  : isCurrent 
                    ? "bg-[#0b3822] text-white border-emerald-600 shadow-xs" 
                    : darkMode 
                      ? "bg-[#121215] border-[#202026] text-gray-500 hover:text-gray-300" 
                      : "bg-white border-[#e7e5e4] text-[#78716c] hover:text-[#1c1917]"
              }`}
            >
              <span className="text-[10px] font-mono block opacity-75">0{s.phase + 1}</span>
              <span className="text-[11px] font-bold block truncate leading-tight mt-0.5">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Primary Voice Dialogue Station */}
        <div className={`lg:col-span-8 rounded-xl p-6 border space-y-5 transition-colors ${
          darkMode ? "bg-[#0c0c0f] border-[#202026]" : "bg-white border-[#e7e5e4] shadow-2xs"
        }`}>
          {/* Question Box */}
          <div className={`p-5 rounded-xl border space-y-2 ${
            darkMode ? "bg-[#141418] border-[#24242c]" : "bg-[#fcfaf7] border-[#e7e5e4]"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mic size={14} />
                Virtual Counselor Question
              </span>
              {isSpeaking && (
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Speaking audio out loud...
                </span>
              )}
            </div>

            <p className="text-base sm:text-lg font-semibold leading-relaxed">
              "{aiQuestion}"
            </p>
          </div>

          {/* Soundwave / Status Visualizer */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 h-10 mb-2">
              {[12, 22, 36, 18, 30, 24, 40, 16, 28, 14, 20, 32].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isSpeaking 
                      ? "bg-emerald-500 animate-pulse" 
                      : isListening 
                        ? "bg-orange-500 animate-bounce" 
                        : darkMode ? "bg-gray-700" : "bg-gray-300"
                  }`}
                  style={{
                    height: isSpeaking || isListening ? `${h}px` : "6px",
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] font-medium">
              {isListening 
                ? "Recording native speech..." 
                : isSpeaking 
                  ? "Playing regional audio explanation..." 
                  : "Microphone ready. Tap button below to speak."}
            </p>
          </div>

          {/* Response Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleSimulateVoiceInput}
                disabled={isSubmitting || isListening}
                className={`w-full sm:flex-1 py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isListening
                    ? "bg-orange-600 text-white animate-pulse"
                    : "bg-[#0b3822] hover:bg-[#0e472c] text-white active:scale-[0.99]"
                }`}
              >
                <Mic size={16} className={isListening ? "animate-spin" : ""} />
                <span>{isListening ? "Listening Voice Answer..." : "Speak Answer in Native Voice"}</span>
              </button>

              {/* Quick Submit Sample Button */}
              <button
                type="button"
                onClick={() => handleSubmitTurn(sampleUserAnswer)}
                disabled={isSubmitting}
                className={`w-full sm:w-auto py-3.5 px-4 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  darkMode 
                    ? "bg-[#141418] border-[#27272f] text-gray-200 hover:border-gray-500" 
                    : "bg-gray-50 border-gray-300 text-gray-800 hover:bg-gray-100"
                }`}
              >
                Sample: "{sampleUserAnswer.slice(0, 32)}..."
              </button>
            </div>

            {/* Optional Manual Text Answer */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Or type answer if keyboard preferred..."
                value={userCustomAnswer}
                onChange={(e) => setUserCustomAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && userCustomAnswer) handleSubmitTurn(); }}
                className={`w-full text-xs p-2.5 rounded-lg border outline-none ${
                  darkMode ? "bg-[#141418] border-[#27272f] text-white" : "bg-white border-gray-300"
                }`}
              />
              {userCustomAnswer && (
                <button
                  onClick={() => handleSubmitTurn()}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Send
                </button>
              )}
            </div>
          </div>

          {/* If completed, show celebration banner */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={18} />
                <span>Voice Assessment Complete! 3 Suitable NSQF Trades Identified.</span>
              </div>
              <button
                onClick={onNavigateToCenters}
                className="px-3 py-1.5 rounded-lg bg-[#0b3822] text-white font-bold text-xs"
              >
                View Nearby Centers ↗
              </button>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Live Assessment Snapshot */}
        <div className="lg:col-span-4 space-y-4">
          {/* Beneficiary Assessment Card */}
          <div className={`rounded-xl p-5 border space-y-3 ${
            darkMode ? "bg-[#0c0c0f] border-[#202026]" : "bg-white border-[#e7e5e4] shadow-2xs"
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#78716c] dark:text-[#a1a1aa]">
                Beneficiary Snapshot
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                GIA STIPEND VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-gray-100 dark:divide-gray-800">
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold">{profileData.name} ({profileData.age}y)</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">District</span>
                <span className="font-semibold">{profileData.district}, {profileData.state}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">Education</span>
                <span className="font-semibold">{profileData.education_level}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">Artisan Heritage</span>
                <span className="font-semibold text-amber-500">{profileData.family_traditional_occupation}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">Baseline Earnings</span>
                <span className="font-semibold text-rose-500">{profileData.monthly_income}/mo</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">Goal</span>
                <span className="font-semibold text-blue-500">{profileData.employment_preference}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">Max Travel</span>
                <span className="font-semibold">{profileData.max_travel_km}</span>
              </div>
            </div>
          </div>

          {/* Matched NSQF Trades Preview */}
          <div className={`rounded-xl p-5 border space-y-3 ${
            darkMode ? "bg-[#0c0c0f] border-[#202026]" : "bg-white border-[#e7e5e4] shadow-2xs"
          }`}>
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Award size={14} />
              <span>Matched NSQF Trades</span>
            </h3>

            <div className="space-y-3">
              {matchedTrades.map((item, idx) => {
                const trade = item.trade;
                const isSelected = enrolledTrade === trade.id;

                return (
                  <div
                    key={trade.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500"
                        : darkMode 
                          ? "bg-[#141418] border-[#24242c]" 
                          : "bg-[#fcfaf7] border-[#e7e5e4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          NSQF Level {trade.nsqf_level}, {item.score}% Match
                        </span>
                        <h4 className="font-bold text-xs truncate mt-0.5">{trade.trade_name}</h4>
                      </div>
                      <span className="font-bold text-emerald-500 flex-shrink-0">
                        ₹{(trade.avg_salary_min / 1000).toFixed(0)}k–{(trade.avg_salary_max / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {trade.highlights}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] border-t border-gray-200 dark:border-gray-800">
                      <span className="text-gray-400">{trade.duration_hours}h | {trade.stipend_amount}</span>
                      <button
                        onClick={() => {
                          setEnrolledTrade(trade.id);
                          try { confetti({ particleCount: 40, spread: 50 }); } catch (e) {}
                        }}
                        className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-[#00337a] text-white hover:bg-[#002255]"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Apply GIA"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
