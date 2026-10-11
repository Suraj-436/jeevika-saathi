import React, { useState, useEffect } from "react";
import { Mic, Volume2, X, Sparkles, ArrowRight, PhoneCall, HelpCircle, CheckCircle2 } from "lucide-react";

export default function FloatingVoiceAssistant({ darkMode, currentLang, setCurrentLang, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [activePrompt, setActivePrompt] = useState("");

  const greetings = {
    hi: "नमस्ते! मैं आपका जीविका साथी हूँ। आपको लिखने या पढ़ने की कोई ज़रूरत नहीं है। आप सीधे बोलकर कौशल ट्रेनिंग खोज सकते हैं या लॉगिन कर सकते हैं। आप क्या करना चाहते हैं?",
    ta: "வணக்கம்! நான் உங்கள் ஜீவிகா சாதி. படிக்கவோ எழுதவோ தேவையில்லை. பேசி திறன் பயிற்சி கண்டறியலாம் அல்லது உள்நுழையலாம். என்ன செய்ய வேண்டும்?",
    te: "నమస్కారం! నేను మీ జీవికా సాథి. చదవడం, రాయడం అవసరం లేదు. మాట్లాడి శిక్షణ పొందవచ్చు లేదా లాగిన్ అవ్వచ్చు.",
    kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಜೀವಿಕಾ ಸಾಥಿ. ನೀವು ಮಾತನಾಡುತ್ತಲೇ ಕೆಲಸ ಕಲಿಯಲು ತರಬೇತಿ ಹುಡುಕಬಹುದು.",
    mr: "नमस्कार! मी आपला जीविका साथी आहे. लिहायची वाचायची गरज नाही, बोलून लॉगिन करा किंवा कौशल्य शिका.",
    bn: "নমস্কার! আমি জীবিকা সাথী। পড়ে বা লিখে কিছু করতে হবে না, শুধু মুখে বলুন।",
    or: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ଜୀବିକା ସାଥୀ। କେବଳ କହିକି ସବୁ କାମ କରିପାରିବେ।",
    pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਜੀਵਿਕਾ ਸਾਥੀ ਹਾਂ। ਬੋਲ ਕੇ ਸਿਖਲਾਈ ਤੇ ਰੋਜ਼ਗਾਰ ਲੱਭੋ ਜੀ।",
    en: "Hello! I am your Jeevika Saathi voice guide. You do not need to read or write text. You can speak naturally to explore NSQF skill training or sign in."
  };

  const speak = (text, langCode = currentLang) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
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
      console.warn("TTS Error:", e);
      setIsSpeaking(false);
    }
  };

  const openVoiceModal = () => {
    setIsOpen(true);
    const greetingText = greetings[currentLang] || greetings["hi"];
    setActivePrompt(greetingText);
    speak(greetingText, currentLang);
  };

  const closeVoiceModal = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsOpen(false);
    setIsSpeaking(false);
    setListening(false);
  };

  const handleVoiceCommand = (command, responseText, destinationTab = null) => {
    setUserTranscript(command);
    setListening(false);
    setActivePrompt(responseText);
    speak(responseText, currentLang);

    if (destinationTab) {
      setTimeout(() => {
        closeVoiceModal();
        if (onNavigate) onNavigate(destinationTab);
      }, 1600);
    }
  };

  return (
    <>
      {/* Floating Button in Bottom Right Corner (Matching user's Image 3) */}
      <aside aria-label="Voice Assistant Widget" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openVoiceModal}
          title="बोलकर शुरू करें • Start Voice Assessment"
          className="group flex items-center gap-3.5 px-4 py-2.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-emerald-500/30 bg-[#0b3822] hover:bg-[#0e472c] text-white"
          style={{
            boxShadow: "0 12px 35px -5px rgba(11, 56, 34, 0.6), 0 0 20px 2px rgba(48, 209, 88, 0.25)"
          }}
        >
          {/* Circular Orange Mic Icon with pulse rings */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-10 h-10 rounded-full bg-orange-500/40 animate-ping" />
            <div className="relative w-10 h-10 rounded-full bg-[#ea580c] flex items-center justify-center text-white shadow-md group-hover:bg-[#f97316] transition-colors">
              <Mic size={20} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Text Content matching user screenshot */}
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[14px] tracking-tight leading-tight text-white">
                Start Voice Assessment
              </span>
              {/* Soundwave equalizer indicator */}
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-emerald-300 rounded-full animate-wave" style={{ animationDelay: "0.1s" }} />
                <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-wave" style={{ animationDelay: "0.2s" }} />
                <span className="w-0.5 h-1.5 bg-emerald-300 rounded-full animate-wave" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
            <p className="text-[11px] font-medium text-emerald-300/90 leading-tight mt-0.5">
              बोलकर शुरू करें • 100% Free
            </p>
          </div>
        </button>
      </aside>

      {/* Accessible Illiterate-Friendly Voice Dialogue Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-[32px] p-7 border shadow-2xl relative transition-all ${
            darkMode ? "bg-[#09090b] border-[#222228] text-white" : "bg-white border-[#e5e5ea] text-black"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  🎙️
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Jeevika Saathi Voice Assistant</h3>
                  <p className="text-xs text-emerald-500 font-medium">बोलकर निर्देश दें • Illiterate Friendly Mode</p>
                </div>
              </div>

              <button
                onClick={closeVoiceModal}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  darkMode ? "bg-[#18181c] hover:bg-[#222228] text-white" : "bg-[#f0f0f4] hover:bg-[#e4e4e8] text-black"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Speaking / Audio Waveform Visualizer */}
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center mb-3">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 to-orange-500 blur-xl transition-opacity duration-300 ${
                  isSpeaking ? "opacity-70 scale-110 animate-pulse" : "opacity-25"
                }`} />
                <div className="relative w-24 h-24 rounded-full bg-[#0b3822] border-2 border-emerald-400 flex items-center justify-center text-white shadow-xl">
                  <Mic size={36} className="text-orange-400 animate-bounce" />
                </div>
              </div>

              {/* Status Pill */}
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium mb-3">
                {isSpeaking ? "🔊 साथी बोल रहा है (Speaking...)" : "🎤 आपकी आवाज़ सुनी जा रही है"}
              </span>

              {/* Prompt Text Box */}
              <div className={`w-full p-4 rounded-2xl border text-sm text-left mb-4 leading-relaxed ${
                darkMode ? "bg-[#121216] border-[#25252d] text-gray-200" : "bg-[#f5f5f7] border-[#e5e5ea] text-gray-800"
              }`}>
                <p className="font-medium">"{activePrompt}"</p>
                <button
                  onClick={() => speak(activePrompt)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Volume2 size={13} /> दोबारा सुनो (Repeat Audio)
                </button>
              </div>

              {/* Large Illiterate-Friendly Quick Voice Action Buttons */}
              <p className="text-xs text-gray-400 mb-2 font-medium">नीचे दिए बटन दबाएं या बोलें (Tap or Speak):</p>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <button
                  onClick={() => handleVoiceCommand(
                    "मुझे कौशल ट्रेनिंग शुरू करनी है",
                    "बहुत अच्छा! आपको वॉइस इंटरव्यू की ओर ले जा रहा हूँ।",
                    "assistant"
                  )}
                  className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    🎓
                  </div>
                  <div>
                    <p className="font-bold text-[13px]">कौशल ट्रेनिंग शुरू करें</p>
                    <p className="text-[11px] opacity-75">Start Voice Skilling</p>
                  </div>
                </button>

                <button
                  onClick={() => handleVoiceCommand(
                    "मुझे लॉगिन करना है",
                    "ठीक है! लॉगिन पेज खोला जा रहा है। अपना मोबाइल नंबर बोलें।",
                    "login"
                  )}
                  className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-300"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    🔑
                  </div>
                  <div>
                    <p className="font-bold text-[13px]">बोलकर लॉगिन करें</p>
                    <p className="text-[11px] opacity-75">Voice Sign-in</p>
                  </div>
                </button>

                <button
                  onClick={() => handleVoiceCommand(
                    "सरकारी ट्रेड्स की सूची दिखाओ",
                    "सभी सरकारी NSQF ट्रेड्स की सूची खोली जा रही है।",
                    "catalog"
                  )}
                  className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-300"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                    📚
                  </div>
                  <div>
                    <p className="font-bold text-[13px]">सरकारी ट्रेड्स देखें</p>
                    <p className="text-[11px] opacity-75">Explore NSQF Trades</p>
                  </div>
                </button>

                <button
                  onClick={() => handleVoiceCommand(
                    "हेल्पलाइन से बात कराओ",
                    "PM-AJAY हेल्पलाइन 1800-XXX-XXXX पर कॉल कनेक्ट की जा रही है।",
                    null
                  )}
                  className="p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-300"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    📞
                  </div>
                  <div>
                    <p className="font-bold text-[13px]">टोल-फ्री मदद (1800)</p>
                    <p className="text-[11px] opacity-75">Toll-Free Helpline</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
