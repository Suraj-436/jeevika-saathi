import React, { useState, useEffect, useRef } from "react";
import { 
  User, Building2, Smartphone, Fingerprint, CreditCard, ArrowRight, 
  Mic, Volume2, ShieldCheck, Check, Scan, Lock, X,
  MapPin, FileText, HelpCircle, Briefcase, GraduationCap, TrendingUp, Users
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { parseSpokenPhoneNumber } from "../utils/phoneNormalizer";
import JeevikaLogo from "./JeevikaLogo";

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const { language, setLanguage } = useLanguage();
  
  // Navigation helper
  const handleNav = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  // Beneficiary Auth Mode: "mobile" | "aadhaar" | "ration"
  const [authMode, setAuthMode] = useState("mobile");

  // Form states
  const [mobileNumber, setMobileNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [rationNumber, setRationNumber] = useState("");

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Interactive Voice & Biometric States
  const [isListening, setIsListening] = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); // "idle" | "listening" | "confirming" | "recognized"
  const [voiceError, setVoiceError] = useState(null);
  const [voiceSuccessMsg, setVoiceSuccessMsg] = useState(null);
  const [showConfirmNumber, setShowConfirmNumber] = useState(false);
  const [faceRDScanning, setFaceRDScanning] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [loginAlert, setLoginAlert] = useState(null);

  // Registration modal states
  const [regName, setRegName] = useState("Beneficiary User");
  const [regMobile, setRegMobile] = useState("9876543210");
  const [regDistrict, setRegDistrict] = useState("Agra, Uttar Pradesh");

  const recognitionRef = useRef(null);

  // Reset OTP state when switching tabs
  useEffect(() => {
    setOtpSent(false);
    setOtp(["", "", "", ""]);
    setGeneratedOtp("");
    setTimer(30);
    setCanResend(false);
    setOtpError(null);
    setOtpSuccess(null);
    setShowConfirmNumber(false);
    setVoiceError(null);
    setVoiceSuccessMsg(null);
    setVoiceState("idle");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
  }, [authMode]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0 && otpSent) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent]);

  // Handle OTP digit inputs
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal && value !== "") return;
    
    // Support pasting 4 digits
    if (cleanVal.length >= 4) {
      const pasted = cleanVal.slice(0, 4).split("");
      setOtp(pasted);
      setOtpError(null);
      otpInputRefs[3].current?.focus();
      return;
    }

    const digit = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError(null);

    // Auto move to next input
    if (digit && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpInputRefs[index - 1].current?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4).split("");
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.forEach((digit, i) => {
        if (i < 4) newOtp[i] = digit;
      });
      setOtp(newOtp);
      setOtpError(null);
      const nextIndex = Math.min(pastedData.length, 3);
      otpInputRefs[nextIndex].current?.focus();
    }
  };

  // Real Web Speech API Voice Login
  const handleVoiceLogin = async () => {
    setAuthMode("mobile");
    setVoiceError(null);
    setVoiceSuccessMsg(null);
    setLoginAlert(null);
    setShowConfirmNumber(false);
    setOtpSent(false);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // 1. Request microphone permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn("Microphone access error:", err);
      setVoiceError("Microphone access is required for Voice Login. Please allow microphone access and try again.");
      setIsListening(false);
      setVoiceState("idle");
      return;
    }

    // 2. Abort previous instance if any
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    // 3. Configure and start recognition
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      let accumulatedTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState("listening");
        setVoiceError(null);
      };

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        accumulatedTranscript = (final || interim).trim();
      };

      recognition.onerror = (event) => {
        console.warn("[SpeechRecognition] error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceError("Microphone access is required for Voice Login. Please allow microphone access and try again.");
          setVoiceState("idle");
        } else if (event.error === "no-speech") {
          setVoiceError("No mobile number detected. Please try again.");
          setVoiceState("idle");
        } else {
          setVoiceError(`Recognition error (${event.error}). Please try again.`);
          setVoiceState("idle");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (accumulatedTranscript) {
          processSpokenNumber(accumulatedTranscript);
        } else if (voiceState === "listening") {
          setVoiceState("idle");
          setVoiceError("No mobile number detected. Please try again.");
        }
      };

      recognition.start();
    } catch (err) {
      console.error("SpeechRecognition start failed:", err);
      setIsListening(false);
      setVoiceState("idle");
      setVoiceError("Could not start speech recognition. Please try again.");
    }
  };

  const processSpokenNumber = (transcript) => {
    const result = parseSpokenPhoneNumber(transcript);
    if (result.success && result.number) {
      setMobileNumber(result.number);
      setRegMobile(result.number);
      setVoiceState("confirming");
      setShowConfirmNumber(true);
      setVoiceError(null);
      setVoiceSuccessMsg(`Voice recognized: ${result.number}`);
    } else {
      setVoiceState("idle");
      setShowConfirmNumber(false);
      setVoiceError(result.error || "We couldn't recognize a valid 10-digit mobile number.");
    }
  };

  const handleConfirmNumber = () => {
    setShowConfirmNumber(false);
    setVoiceState("recognized");
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(generated);
    setOtpSent(true);
    setOtp(["", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    setOtpError(null);
    setOtpSuccess(null);
    setTimeout(() => {
      if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
    }, 150);
  };

  const handleSpeakAgain = () => {
    setMobileNumber("");
    setShowConfirmNumber(false);
    setVoiceSuccessMsg(null);
    setVoiceError(null);
    handleVoiceLogin();
  };

  const handleSendOtp = (e) => {
    if (authMode === "ration") {
      handleBeneficiaryLogin(e);
      return;
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      setVoiceError("Please enter a valid 10-digit mobile number.");
      return;
    }
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(generated);
    setOtpSent(true);
    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    setOtpError(null);
    setOtpSuccess(null);
    setTimeout(() => {
      if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
    }, 150);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setTimer(30);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    setOtpError(null);
    setOtpSuccess(null);
    setLoginAlert("New OTP sent");
    setTimeout(() => setLoginAlert(null), 3000);
    setTimeout(() => {
      if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
    }, 100);
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    const entered = otp.join("");
    if (entered.length !== 4) {
      setOtpError("Please enter the complete 4-digit OTP.");
      return;
    }

    if (generatedOtp && entered !== generatedOtp) {
      setOtpError("Incorrect OTP. Please try again.");
      setOtp(["", "", "", ""]);
      setTimeout(() => {
        if (otpInputRefs[0].current) otpInputRefs[0].current.focus();
      }, 50);
      return;
    }

    setOtpError(null);
    setOtpSuccess("Mobile number verified successfully.");

    try {
      sessionStorage.setItem("user_phone", mobileNumber);
      sessionStorage.setItem("voice_login_user", JSON.stringify({
        phone: mobileNumber,
        verified: true,
        verifiedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.warn("sessionStorage save error:", err);
    }

    setTimeout(() => {
      onLoginSuccess({
        district: "Agra, Uttar Pradesh",
        phone: `+91 ${mobileNumber || "98765 43210"}`,
        verified: true,
        method: authMode === "aadhaar" ? "Aadhaar e-KYC Verified" : "Voice Login Verified"
      });
    }, 800);
  };

  const handleRegisterSubmit = () => {
    try {
      const registeredUsers = JSON.parse(sessionStorage.getItem("registered_users") || "[]");
      if (!registeredUsers.includes(regMobile)) {
        registeredUsers.push(regMobile);
        sessionStorage.setItem("registered_users", JSON.stringify(registeredUsers));
      }
      sessionStorage.setItem("user_phone", regMobile);
    } catch (err) {
      console.warn("sessionStorage error:", err);
    }
    setShowRegModal(false);
    onLoginSuccess({
      name: regName || "Beneficiary User",
      district: regDistrict || "Agra, Uttar Pradesh",
      phone: `+91 ${regMobile || "98765 43210"}`,
      verified: true,
      method: "New Beneficiary Profile Created"
    });
  };

  // Aadhaar FaceRD Biometric scan simulation
  const handleFaceRDScan = () => {
    setFaceRDScanning(true);
    setTimeout(() => {
      setFaceRDScanning(false);
      onLoginSuccess({
        district: "Agra, UP",
        phone: "+91 98765 43210",
        verified: true,
        method: "Aadhaar FaceRD Biometric"
      });
    }, 1800);
  };

  const handleBeneficiaryLogin = (e) => {
    if (e) e.preventDefault();
    
    // Beneficiary Login without hardcoded name
    onLoginSuccess({
      district: "Agra, Uttar Pradesh",
      phone: `+91 ${mobileNumber || "98765 43210"}`,
      verified: true,
      method: authMode === "aadhaar" ? "Aadhaar e-KYC Verified" : "Mobile OTP Verified"
    });
  };

  const handleOfficialLogin = () => {
    onLoginSuccess({
      name: "Dr. S. K. Verma",
      initials: "SK",
      district: "State Nodal Mission",
      phone: "+91 11 2338 4500",
      verified: true,
      method: "PM-AJAY Nodal Admin Official"
    });
  };

  return (
    <div style={{ width: "100%", backgroundColor: "#f8fafc", fontFamily: "'Noto Sans', Arial, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes voicePulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          70% { transform: scale(1.06); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>
      
      {/* ── TOP GOVERNMENT HEADER ── */}
      <div style={{ backgroundColor: "#020617", color: "#f8fafc", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", fontWeight: 600 }}>
          <img src="/emblem.png" alt="Emblem" style={{ height: "20px" }} onError={(e) => e.target.style.display='none'} />
          <span>Government of India | Ministry of Social Justice & Empowerment</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Accessibility Controls (Visual representation) */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 6px", cursor: "pointer", fontFamily: "inherit", border: "1px solid #334155", borderRadius: "4px" }}>A-</span>
            <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 6px", cursor: "pointer", fontFamily: "inherit", border: "1px solid #334155", borderRadius: "4px" }}>A</span>
            <span style={{ fontSize: "13px", fontWeight: 700, padding: "2px 6px", cursor: "pointer", fontFamily: "inherit", border: "1px solid #334155", borderRadius: "4px" }}>A+</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", border: "1px solid #334155", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>
            <Volume2 size={14} />
            <span style={{ fontWeight: 600 }}>Screen Reader</span>
          </div>

          <div style={{ display: "flex", border: "1px solid #334155", borderRadius: "4px", overflow: "hidden" }}>
            <span 
              onClick={() => setLanguage("en")}
              style={{ 
                padding: "4px 10px", 
                fontSize: "12px", 
                fontWeight: 700, 
                backgroundColor: language === "en" ? "#ffffff" : "transparent", 
                color: language === "en" ? "#020617" : "#f8fafc", 
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              English
            </span>
            <span 
              onClick={() => setLanguage("hi")}
              style={{ 
                padding: "4px 10px", 
                fontSize: "12px", 
                fontWeight: 700, 
                backgroundColor: language === "hi" ? "#ffffff" : "transparent", 
                color: language === "hi" ? "#020617" : "#f8fafc", 
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              हिन्दी
            </span>
          </div>

          {/* Official Login Button */}
          <button 
            onClick={handleOfficialLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "transparent",
              color: "#fbbf24",
              border: "1px solid #fbbf24",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#fbbf24"; e.currentTarget.style.color = "#020617"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#fbbf24"; }}
          >
            <Lock size={14} />
            <span>Official / Officer Login</span>
          </button>
        </div>
      </div>

      {/* ── HERO SECTION & LOGIN CARD ── */}
      <section
        style={{
          position: "relative",
          background: "radial-gradient(ellipse at 60% 40%, #0c2d5e 0%, #051a37 60%, #031227 100%)",
          color: "#ffffff",
          overflow: "hidden",
          borderTop: "3px solid transparent",
          borderImage: "linear-gradient(to right, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%) 3",
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Subtle Map / Grid Watermark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            pointerEvents: "none"
          }}
        />

        {/* Central Visual */}
        <div
          style={{
            position: "absolute",
            right: "340px",
            top: "10px",
            bottom: "75px",
            width: "560px",
            pointerEvents: "none",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.95
          }}
        >
          <img
            src="/hero-modi-youth.jpg"
            alt="Hero Banner"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{
              maxHeight: "92%",
              maxWidth: "100%",
              objectFit: "contain",
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 80%)",
              filter: "contrast(1.04) brightness(1.02)"
            }}
          />
        </div>

        {/* Main Hero Container */}
        <div
          style={{
            maxWidth: "1280px",
            width: "100%",
            margin: "auto",
            padding: "48px 32px",
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "48px",
            alignItems: "center",
            position: "relative",
            zIndex: 10
          }}
        >
          {/* Left Column: National Brand & Headlines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* National Portal Badge & Official Brand Logo */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
              <JeevikaLogo size={42} border="#f59e0b" />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "8px",
                    borderRadius: "2px",
                    background: "linear-gradient(to right, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)"
                  }}
                />
                <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  NATIONAL PORTAL
                </span>
              </div>
            </div>

            {/* Monumental Headline */}
            <div>
              <h1 style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1.15, margin: 0, color: "#ffffff", letterSpacing: "-0.5px" }}>
                Jeevika Saathi
                <br />
                Skills for a
                <br />
                <span style={{ color: "#f59e0b", background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Stronger Tomorrow
                </span>
              </h1>
              
              <p style={{ marginTop: "16px", fontSize: "16px", color: "#cbd5e1", lineHeight: 1.6, maxWidth: "520px" }}>
                AI-Driven Livelihood Mapping & NSQF-Aligned Skilling for Scheduled Caste Communities under PM-AJAY.
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", maxWidth: "560px" }}>
              {[
                { label: "Skill Development", icon: GraduationCap },
                { label: "Employment Opportunities", icon: Briefcase },
                { label: "Inclusive Growth", icon: Users },
                { label: "Stronger Communities", icon: TrendingUp }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255, 255, 255, 0.07)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      borderRadius: "12px",
                      padding: "12px 10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: "8px"
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#93c5fd" }}>
                      <IconComponent size={20} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.25 }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* PM Narendra Modi Quote Card */}
            <div style={{ background: "rgba(2, 19, 44, 0.72)", backdropFilter: "blur(10px)", borderLeft: "4px solid #10b981", borderRadius: "0 12px 12px 0", padding: "16px 20px", maxWidth: "520px", marginTop: "8px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", lineHeight: "1", color: "#10b981", fontWeight: 900 }}>❝</span>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#f8fafc", fontStyle: "italic", lineHeight: 1.5 }}>
                    "When the last person in society progresses, the nation moves forward."
                  </p>
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    <span style={{ fontWeight: 800, color: "#fde68a" }}>— Narendra Modi</span>
                    <span style={{ color: "#94a3b8" }}>Hon'ble Prime Minister of India</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: The Single-Panel Login Card */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "440px",
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 22px 50px -10px rgba(0, 0, 0, 0.35)",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                display: "flex",
                flexDirection: "column"
              }}
            >
              
              {/* Card Header */}
              <div style={{ padding: "32px 32px 24px", textAlign: "center", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
                  <JeevikaLogo size={48} />
                  <span style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#00337a" }}>Beneficiary Login</span>
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Welcome to Jeevika Saathi
                </h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.5 }}>
                  Sign in to continue your livelihood journey under PM-AJAY.
                </p>
              </div>

              {/* Login Card Body */}
              <div style={{ padding: "24px 32px 32px" }}>
                
                {/* Method Selector Tabs: Mobile Number | Aadhaar | Ration Card */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode("mobile")}
                    style={{
                      flex: 1.2,
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: authMode === "mobile" ? "1.5px solid #00337a" : "1px solid #cbd5e1",
                      background: authMode === "mobile" ? "#00337a" : "#ffffff",
                      color: authMode === "mobile" ? "#ffffff" : "#475569",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Smartphone size={14} />
                    <span>Mobile Number</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode("aadhaar")}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: authMode === "aadhaar" ? "1.5px solid #00337a" : "1px solid #cbd5e1",
                      background: authMode === "aadhaar" ? "#00337a" : "#ffffff",
                      color: authMode === "aadhaar" ? "#ffffff" : "#475569",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Fingerprint size={14} />
                    <span>Aadhaar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode("ration")}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: authMode === "ration" ? "1.5px solid #00337a" : "1px solid #cbd5e1",
                      background: authMode === "ration" ? "#00337a" : "#ffffff",
                      color: authMode === "ration" ? "#ffffff" : "#475569",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <CreditCard size={14} />
                    <span>Ration Card</span>
                  </button>
                </div>

                {/* Mode Specific Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Noto Sans', Arial, sans-serif" }}>
                  
                  {/* Global Alerts / Messages */}
                  {loginAlert && (
                    <div style={{ padding: "8px 12px", borderRadius: "6px", backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", fontSize: "12px", fontWeight: 700 }}>
                      {loginAlert}
                    </div>
                  )}

                  {/* ── MOBILE AUTH MODE: INPUT & CONFIRMATION ── */}
                  {authMode === "mobile" && !otpSent && (
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", fontFamily: "inherit" }}>
                        Mobile Number
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "0 12px",
                          backgroundColor: "#ffffff",
                          overflow: "hidden"
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", paddingRight: "10px", borderRight: "1px solid #e2e8f0" }}>
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => {
                            setMobileNumber(e.target.value.replace(/\D/g, ""));
                            setShowConfirmNumber(false);
                            setVoiceError(null);
                          }}
                          placeholder="Enter 10-digit mobile number"
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100%",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0f172a",
                            padding: "12px 10px",
                            fontFamily: "inherit"
                          }}
                        />
                      </div>

                      {/* Small Voice Confirmation Label */}
                      {voiceSuccessMsg && !showConfirmNumber && (
                        <div style={{ fontSize: "11.5px", color: "#166534", fontWeight: 700, marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Check size={13} color="#16a34a" />
                          <span>{voiceSuccessMsg}</span>
                        </div>
                      )}

                      {/* Pre-OTP Confirmation Dialog */}
                      {showConfirmNumber && (
                        <div
                          style={{
                            backgroundColor: "#f0fdf4",
                            border: "1.5px solid #86efac",
                            borderRadius: "10px",
                            padding: "16px",
                            marginTop: "12px",
                            boxShadow: "0 4px 12px rgba(22, 101, 52, 0.08)",
                            animation: "fadeIn 0.2s ease-out"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <Check size={16} color="#16a34a" />
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>
                              Voice recognized: {mobileNumber}
                            </span>
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginTop: "6px" }}>
                            Is this your mobile number?
                          </div>
                          <div style={{ fontSize: "18px", fontWeight: 900, color: "#00337a", letterSpacing: "1px", margin: "6px 0 14px" }}>
                            +91 {mobileNumber}
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              type="button"
                              onClick={handleConfirmNumber}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                background: "#00337a",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                transition: "background 0.15s"
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.background = "#002354")}
                              onMouseOut={(e) => (e.currentTarget.style.background = "#00337a")}
                            >
                              <Check size={15} />
                              <span>Confirm</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSpeakAgain}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                background: "#ffffff",
                                color: "#b91c1c",
                                border: "1.5px solid #f87171",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                transition: "all 0.15s"
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.background = "#fef2f2")}
                              onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
                            >
                              <Mic size={15} />
                              <span>Speak Again</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Manual Send OTP button when not in confirmation prompt */}
                      {!showConfirmNumber && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={mobileNumber.length !== 10}
                          style={{
                            width: "100%",
                            padding: "14px",
                            background: mobileNumber.length === 10 ? "#00337a" : "#94a3b8",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 700,
                            cursor: mobileNumber.length === 10 ? "pointer" : "not-allowed",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            marginTop: "12px",
                            boxShadow: mobileNumber.length === 10 ? "0 4px 12px rgba(0, 51, 122, 0.25)" : "none",
                            transition: "background 0.15s ease"
                          }}
                          onMouseOver={(e) => {
                            if (mobileNumber.length === 10) e.currentTarget.style.background = "#002354";
                          }}
                          onMouseOut={(e) => {
                            if (mobileNumber.length === 10) e.currentTarget.style.background = "#00337a";
                          }}
                        >
                          <span>Send OTP</span>
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── AADHAAR AUTH MODE ── */}
                  {authMode === "aadhaar" && !otpSent && (
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", fontFamily: "inherit" }}>
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 12-digit Aadhaar number"
                        style={{
                          width: "100%",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#0f172a",
                          padding: "12px 14px",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit"
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={aadhaarNumber.length !== 12}
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: aadhaarNumber.length === 12 ? "#00337a" : "#94a3b8",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: aadhaarNumber.length === 12 ? "pointer" : "not-allowed",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          marginTop: "12px"
                        }}
                      >
                        <span>Send OTP</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* ── RATION CARD AUTH MODE ── */}
                  {authMode === "ration" && !otpSent && (
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px", fontFamily: "inherit" }}>
                        Ration Card Number
                      </label>
                      <input
                        type="text"
                        value={rationNumber}
                        onChange={(e) => setRationNumber(e.target.value.toUpperCase())}
                        placeholder="Enter Ration card number"
                        style={{
                          width: "100%",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#0f172a",
                          padding: "12px 14px",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit"
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleBeneficiaryLogin}
                        disabled={!rationNumber}
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: rationNumber ? "#00337a" : "#94a3b8",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: rationNumber ? "pointer" : "not-allowed",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          marginTop: "12px"
                        }}
                      >
                        <span>Continue / Verify</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* ── OTP INTERFACE (REPLACES INPUT FORM) ── */}
                  {otpSent && authMode !== "ration" && (
                    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                      
                      {/* Prototype / Demo OTP Banner */}
                      {generatedOtp && (
                        <div
                          style={{
                            backgroundColor: "#eff6ff",
                            border: "1.5px dashed #3b82f6",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                backgroundColor: "#dbeafe",
                                color: "#1d4ed8",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                letterSpacing: "0.5px"
                              }}
                            >
                              DEV PROTOTYPE
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af" }}>
                              Demo OTP: <strong style={{ fontSize: "14px", color: "#1d4ed8", letterSpacing: "1px" }}>{generatedOtp}</strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOtp(generatedOtp.split(""));
                              setOtpError(null);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#2563eb",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline",
                              padding: 0
                            }}
                          >
                            Auto-fill OTP
                          </button>
                        </div>
                      )}

                      {/* Header & Resend */}
                      <div style={{ marginBottom: "6px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                          Enter the 4-digit OTP
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                          OTP sent to +91 {mobileNumber || aadhaarNumber}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                        <button
                          type="button"
                          disabled={!canResend}
                          onClick={handleResendOtp}
                          style={{
                            background: "none",
                            border: "none",
                            color: canResend ? "#0284c7" : "#94a3b8",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: canResend ? "pointer" : "default",
                            fontFamily: "inherit",
                            padding: 0
                          }}
                        >
                          {canResend ? "Resend OTP" : `Resend OTP in 00:${timer < 10 ? '0'+timer : timer}`}
                        </button>
                      </div>

                      {/* 4 OTP Input Boxes */}
                      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            ref={otpInputRefs[idx]}
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={otp[idx]}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            style={{
                              width: "56px",
                              height: "56px",
                              flexShrink: 0,
                              textAlign: "center",
                              fontSize: "24px",
                              fontWeight: 800,
                              border: otp[idx] ? "2px solid #00337a" : "1.5px solid #cbd5e1",
                              borderRadius: "8px",
                              outline: "none",
                              backgroundColor: "#ffffff",
                              color: "#00337a",
                              fontFamily: "inherit",
                              transition: "all 0.15s ease",
                              boxShadow: otp[idx] ? "0 2px 6px rgba(0, 51, 122, 0.1)" : "none"
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#00337a";
                              e.target.style.boxShadow = "0 0 0 3px rgba(0, 51, 122, 0.15)";
                              e.target.style.transform = "scale(1.02)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = otp[idx] ? "#00337a" : "#cbd5e1";
                              e.target.style.boxShadow = otp[idx] ? "0 2px 6px rgba(0, 51, 122, 0.1)" : "none";
                              e.target.style.transform = "scale(1)";
                            }}
                          />
                        ))}
                      </div>

                      {/* OTP Error message */}
                      {otpError && (
                        <div
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fca5a5",
                            color: "#991b1b",
                            fontSize: "12px",
                            fontWeight: 700,
                            marginBottom: "12px",
                            textAlign: "center"
                          }}
                        >
                          {otpError}
                        </div>
                      )}

                      {/* OTP Success message */}
                      {otpSuccess && (
                        <div
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #86efac",
                            color: "#166534",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            marginBottom: "12px",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          <Check size={16} />
                          <span>{otpSuccess}</span>
                        </div>
                      )}

                      {/* Verify OTP Button */}
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otp.join("").length !== 4}
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: otp.join("").length === 4 ? "#00337a" : "#94a3b8",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: otp.join("").length === 4 ? "pointer" : "not-allowed",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: otp.join("").length === 4 ? "0 4px 12px rgba(0, 51, 122, 0.25)" : "none",
                          transition: "background 0.2s ease, box-shadow 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                          if (otp.join("").length === 4) e.currentTarget.style.background = "#002354";
                        }}
                        onMouseOut={(e) => {
                          if (otp.join("").length === 4) e.currentTarget.style.background = "#00337a";
                        }}
                      >
                        <span>Verify OTP</span>
                        <ArrowRight size={16} />
                      </button>

                      {/* Back / Change Number */}
                      <div style={{ textAlign: "center", marginTop: "12px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp(["", "", "", ""]);
                            setOtpError(null);
                            setOtpSuccess(null);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#64748b",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textDecoration: "underline"
                          }}
                        >
                          ← Change mobile number
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* ── OR DIVIDER & VOICE LOGIN BUTTON (ONLY WHEN NOT IN OTP MODE) ── */}
                {!otpSent && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                      <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
                      <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>OR</span>
                      <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
                    </div>

                    {/* Inline Voice Error Message */}
                    {voiceError && (
                      <div
                        style={{
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fca5a5",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          marginBottom: "12px",
                          fontSize: "12px",
                          color: "#991b1b",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px"
                        }}
                      >
                        <span>{voiceError}</span>
                        <button
                          type="button"
                          onClick={() => setVoiceError(null)}
                          style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", padding: "2px" }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Voice Login Button */}
                    <button
                      type="button"
                      onClick={handleVoiceLogin}
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        background: isListening
                          ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
                          : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                        border: "2px solid #f59e0b",
                        outline: "2px solid #fbbf24",
                        outlineOffset: "2px",
                        borderRadius: "10px",
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        textAlign: "left",
                        boxShadow: isListening 
                          ? "0 0 24px rgba(245, 158, 11, 0.75), 0 4px 18px rgba(220, 38, 38, 0.6)" 
                          : "0 0 16px rgba(245, 158, 11, 0.45), 0 4px 14px rgba(220, 38, 38, 0.4)",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 0 22px rgba(245, 158, 11, 0.7), 0 6px 18px rgba(220, 38, 38, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = isListening
                          ? "0 0 24px rgba(245, 158, 11, 0.75), 0 4px 18px rgba(220, 38, 38, 0.6)"
                          : "0 0 16px rgba(245, 158, 11, 0.45), 0 4px 14px rgba(220, 38, 38, 0.4)";
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          background: isListening ? "#fef08a" : "#fef3c7",
                          color: "#b91c1c",
                          border: "1.5px solid #f59e0b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          animation: isListening ? "voicePulse 1.2s infinite ease-in-out" : "none"
                        }}
                      >
                        <Mic size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.2px" }}>
                          {isListening
                            ? "Listening..."
                            : voiceState === "recognized" || voiceState === "confirming"
                            ? "Number detected ✓"
                            : "Use Voice Login"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#fef3c7", fontWeight: 600, marginTop: "2px" }}>
                          {isListening
                            ? (language === "hi" ? "अपना मोबाइल नंबर बोलें" : "Speak your mobile number")
                            : voiceState === "recognized" || voiceState === "confirming"
                            ? `+91 ${mobileNumber}`
                            : "Tap to speak your mobile number"}
                        </div>
                      </div>
                    </button>
                  </>
                )}

                {/* New User Link */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>New to Jeevika Saathi? </span>
                  <button
                    type="button"
                    onClick={() => setShowRegModal(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0284c7",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      padding: 0
                    }}
                  >
                    Create a new account →
                  </button>
                </div>

                {/* DPDP Act 2023 Security Notice */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f1f5f9",
                    fontSize: "11px",
                    color: "#94a3b8",
                    lineHeight: 1.4
                  }}
                >
                  <ShieldCheck size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>
                    Your information is protected under the Digital Personal Data Protection (DPDP) Act 2023. 100% Secure & Confidential.
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Live Statistics Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            background: "rgba(2, 16, 36, 0.8)",
            backdropFilter: "blur(8px)",
            padding: "16px 32px",
            position: "relative",
            zIndex: 10,
            marginTop: "auto"
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "16px",
              textAlign: "center"
            }}
          >
            {[
              { num: "14,821+", label: "Beneficiaries Profiled" },
              { num: "5,731+", label: "Accredited Centers" },
              { num: "2,329+", label: "Gram Panchayats" },
              { num: "3,990+", label: "Placed in 90 Days" },
              { num: "1,287+", label: "Active Batches" },
              { num: "18+", label: "Skilling Sectors" }
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  borderRight: i < 5 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                  padding: "0 8px"
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.2px" }}>
                  {stat.num}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── Registration Modal (when 'Create a new account' clicked) ── */}
      {showRegModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  New Beneficiary Registration
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Register under PM-AJAY for skill training & ₹1,500/month stipend
                </p>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Enter full name"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10-digit mobile number"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  District & State
                </label>
                <input
                  type="text"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                  placeholder="Enter district & state"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                />
              </div>

              <button
                type="button"
                onClick={handleRegisterSubmit}
                style={{
                  marginTop: "6px",
                  padding: "11px",
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "background 0.15s ease"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#15803d")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#16a34a")}
              >
                <Check size={16} />
                <span>Register & Access Jeevika Saathi Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


