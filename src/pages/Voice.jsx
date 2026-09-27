import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, formatFieldValue, countFilledSteps } from '../context/SessionContext';
import {
  DEMO_CONVERSATION_SCRIPT,
  ASSESSMENT_FIELDS,
  REQUIRED_STEPS,
  INITIAL_QUESTION
} from '../config/demoData';

// ── Language config ───────────────────────────────────────────
const LANGUAGES = [
  { code: 'en-IN', label: 'English', short: 'EN' },
  { code: 'hi-IN', label: 'हिंदी', short: 'HI' },
  { code: 'mr-IN', label: 'मराठी', short: 'MR' }
];

export default function Voice() {
  const navigate = useNavigate();
  
  // ── Session Context (In-Memory Only) ─────────────────────────
  const {
    sessionId,
    isDemoMode,
    messages,
    messagesRef,
    addMessage,
    addMessages,
    setMessages,
    assessmentStatus,
    setAssessmentStatus,
    beneficiaryProfile,
    updateProfile,
    confidence,
    setConfidence,
    startNewSession,
    setIsDemoMode
  } = useSession();

  // ── UI State ──────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState('idle'); // idle|listening|processing|speaking
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micError, setMicError] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ── Refs ──────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');       
  const hasSubmittedRef = useRef(false);       
  const isProcessingRef = useRef(false);
  const selectedLanguageRef = useRef('en-IN');
  const messagesEndRef = useRef(null);
  // Auto-mic: after AI finishes speaking, start mic automatically
  const shouldAutoMicRef = useRef(false);
  const handleMicToggleRef = useRef(null); // filled in after handleMicToggle is defined

  // Keep refs in sync
  useEffect(() => { selectedLanguageRef.current = selectedLanguage; }, [selectedLanguage]);

  // Scroll only the chat container — NOT the page
  const chatScrollRef = useRef(null);
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // ── Computed ──────────────────────────────────────────────────
  const filledSteps = countFilledSteps(beneficiaryProfile, REQUIRED_STEPS);
  const totalSteps = REQUIRED_STEPS.length;
  const langKey = { 'en-IN': 'en', 'hi-IN': 'hi', 'mr-IN': 'mr' }[selectedLanguage] || 'en';
  const shortSessionId = sessionId;
  const lastAssistantMsg = [...messages].reverse().find(m => m.speaker === 'assistant');

  // ── SpeechSynthesis ───────────────────────────────────────────
  const speakText = useCallback((text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();
    const lang = selectedLanguageRef.current;

    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      utt.rate = 0.92;
      utt.pitch = 1;
      utt.volume = 1;

      setIsSpeaking(true);
      setVoiceState('speaking');

      utt.onend = () => {
        setIsSpeaking(false);
        setVoiceState('idle');
      };
      utt.onerror = (e) => {
        if (e.error !== 'interrupted') {
          console.warn('Speech error:', e.error);
        }
        setIsSpeaking(false);
        setVoiceState('idle');
      };

      synth.speak(utt);

      const nudge = setInterval(() => {
        if (!synth.speaking) { clearInterval(nudge); return; }
        synth.pause();
        synth.resume();
      }, 10000);

      utt.onend = () => {
        clearInterval(nudge);
        setIsSpeaking(false);
        setVoiceState('idle');
        // Auto-start mic after AI finishes speaking
        if (shouldAutoMicRef.current) {
          shouldAutoMicRef.current = false;
          setTimeout(() => {
            handleMicToggleRef.current?.();
          }, 600); // 600ms pause so it feels natural
        }
      };
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => { synth.onvoiceschanged = null; doSpeak(); };
    } else {
      setTimeout(doSpeak, 80);
    }
  }, []);

  const handleReplay = () => {
    if (lastAssistantMsg?.text) {
      setIsReplaying(true);
      setTimeout(() => setIsReplaying(false), 3000);
      speakText(lastAssistantMsg.text);
    }
  };

  // ── Send to AI backend ────────────────────────────────────────
  const sendToAI = useCallback(async (userText, allMessages) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setVoiceState('processing');
    setApiError(false);

    const MAX_RETRIES = 2;
    let lastError = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      // Back-off: 0ms, 1500ms, 3000ms
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, attempt * 1500));
      }

      try {
        const controller = new AbortController();
        // Abort the fetch if the server takes longer than 20 seconds
        const timeout = setTimeout(() => controller.abort(), 20000);

        const messagesToSend = allMessages.map(m => ({ speaker: m.speaker, text: m.text }));
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesToSend, language: selectedLanguageRef.current }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // If backend returned a hard fallback, retry
        if (data.fallback) throw new Error('Fallback triggered');

        const assistantText = data.assistant_message;

        // Save extracted data first, then check completion
        if (data.extracted_data && Object.keys(data.extracted_data).length > 0) {
          updateProfile(data.extracted_data);
        }

        if (data.confidence != null) setConfidence(data.confidence);

        if (data.is_complete) {
          setAssessmentStatus('completed');
        } else {
          addMessage({ speaker: 'assistant', text: assistantText, language: selectedLanguageRef.current });
          // Auto-mic will fire after AI finishes speaking
          shouldAutoMicRef.current = true;
          setTimeout(() => speakText(assistantText), 100);
        }

        setVoiceState('idle');
        isProcessingRef.current = false;
        return; // ✅ success — exit loop

      } catch (err) {
        lastError = err;
        const isAbort = err.name === 'AbortError';
        console.warn(`AI fetch attempt ${attempt + 1} failed (${isAbort ? 'timeout' : err.message})`);
        // If it's not a retriable network/timeout error, don't bother retrying
        if (!isAbort && !err.message.includes('HTTP 5') && !err.message.includes('Fallback')) {
          break;
        }
      }
    }

    // All retries exhausted
    console.error('AI fetch failed after retries:', lastError?.message);
    setApiError(true);
    setVoiceState('idle');
    isProcessingRef.current = false;
  }, [updateProfile, setConfidence, setAssessmentStatus, addMessage, speakText]);

  // ── Handle final user response ────────────────────────────────
  const handleUserResponse = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLiveTranscript('');

    const userMsg = { speaker: 'user', text: trimmed, language: selectedLanguageRef.current };
    
    // addMessage does not return the updated array immediately, so we pass messagesRef manually
    addMessage(userMsg);
    
    await new Promise(r => setTimeout(r, 50));
    await sendToAI(trimmed, messagesRef.current);
  }, [addMessage, sendToAI, messagesRef]);

  // ── SpeechRecognition ─────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  const handleMicToggle = useCallback(() => {
    if (voiceState === 'processing' || voiceState === 'speaking') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('unsupported');
      return;
    }

    if (voiceState === 'listening') {
      stopRecognition();
      setVoiceState('idle');
      setLiveTranscript('');
      return;
    }

    finalTranscriptRef.current = '';
    hasSubmittedRef.current = false;

    const rec = new SpeechRecognition();
    rec.lang = selectedLanguageRef.current;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    recognitionRef.current = rec;

    rec.onstart = () => {
      setVoiceState('listening');
      setMicError(null);
      setApiError(false);
    };

    rec.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current += ' ' + finalText;
        finalTranscriptRef.current = finalTranscriptRef.current.trim();
      }

      setLiveTranscript(interimText || finalTranscriptRef.current);
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech') {
        setLiveTranscript('');
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setMicError('denied');
      }
      setVoiceState('idle');
      stopRecognition();
    };

    rec.onend = () => {
      const collectedText = finalTranscriptRef.current.trim();

      if (collectedText && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        setVoiceState('idle');
        setLiveTranscript('');
        recognitionRef.current = null;
        handleUserResponse(collectedText);
      } else {
        setVoiceState('idle');
        setLiveTranscript('');
        recognitionRef.current = null;
      }
    };

    try {
      rec.start();
    } catch (err) {
      console.error('Could not start recognition:', err);
      setMicError('unsupported');
    }
  }, [voiceState, stopRecognition, handleUserResponse]);

  useEffect(() => () => { stopRecognition(); window.speechSynthesis?.cancel(); }, [stopRecognition]);

  // Keep handleMicToggleRef in sync so speakText (empty deps) can call it
  useEffect(() => { handleMicToggleRef.current = handleMicToggle; }, [handleMicToggle]);

  // ── Begin fresh assessment ────────────────────────────────────
  const handleStartAssessment = async () => {
    startNewSession(false);
    setMicError(null);
    setApiError(false);
    
    setAssessmentStatus('active');

    const q = INITIAL_QUESTION[langKey];
    addMessage({ speaker: 'assistant', text: q, language: selectedLanguage });
    shouldAutoMicRef.current = true;
    setTimeout(() => speakText(q), 200);
  };

  // ── Text input ────────────────────────────────────────────────
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessingRef.current) return;
    const text = textInput.trim();
    setTextInput('');
    setShowTextInput(false);
    await handleUserResponse(text);
  };

  // ── Demo Mode ─────────────────────────────────────────────────
  const handleStartDemo = async () => {
    startNewSession(true);
    setMicError(null);
    setApiError(false);
    setDemoStep(0);
    setAssessmentStatus('active');

    const q = DEMO_CONVERSATION_SCRIPT[0].assistant;
    addMessage({ speaker: 'assistant', text: q, language: selectedLanguage });
    shouldAutoMicRef.current = true;
    setTimeout(() => speakText(q), 200);
  };

  const runDemoStep = async (step) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setVoiceState('processing');
    const script = DEMO_CONVERSATION_SCRIPT[step];
    if (!script) { isProcessingRef.current = false; setVoiceState('idle'); return; }

    await new Promise(r => setTimeout(r, 800));
    addMessage({ speaker: 'user', text: script.user, language: selectedLanguage });

    await new Promise(r => setTimeout(r, 600));
    
    if (script.extractedData && Object.keys(script.extractedData).length > 0) {
      updateProfile(script.extractedData);
    }

    const newStep = step + 1;
    setDemoStep(newStep);
    setVoiceState('idle');
    isProcessingRef.current = false;

    if (newStep >= DEMO_CONVERSATION_SCRIPT.length) {
      setAssessmentStatus('completed');
    } else {
      const nextScript = DEMO_CONVERSATION_SCRIPT[newStep];
      const assistantText = nextScript.assistant;
      addMessage({ speaker: 'assistant', text: assistantText, language: selectedLanguage });
      shouldAutoMicRef.current = true;
      setTimeout(() => speakText(assistantText), 150);
    }
  };

  // ── Language switch ───────────────────────────────────────────
  const handleLanguageSwitch = (code) => {
    if (voiceState === 'listening') { stopRecognition(); setVoiceState('idle'); }
    window.speechSynthesis?.cancel();
    setSelectedLanguage(code);
    setIsSpeaking(false);
  };

  // ── Field rendering helpers ───────────────────────────────────
  const isFieldDetected = (key) => {
    const v = beneficiaryProfile[key];
    return v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '');
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full">
      <div className="w-full px-space-md lg:px-space-xl py-space-md max-w-[1440px] mx-auto space-y-space-md">

        {/* HEADER */}
        <header className="bg-surface-container rounded-2xl p-space-md lg:p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined text-xs">record_voice_over</span>
              </span>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary">AI Voice Assessment</span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                {sessionId ? `Session #${shortSessionId}` : 'No active session'}
              </span>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-sm text-label-sm font-bold uppercase tracking-wider border border-amber-300">Demo Mode</span>
              )}
            </div>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Let's find the right opportunities for you.</h1>
          </div>

          <div className="flex flex-wrap items-center gap-space-md">
            {assessmentStatus !== 'idle' && (
              <button 
                onClick={() => startNewSession(false)}
                className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold rounded-xl shadow-sm text-sm flex items-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Start New Assessment
              </button>
            )}

            {assessmentStatus === 'active' && (
              <div className="flex flex-col gap-1.5 bg-surface-container-low px-space-md py-space-xs rounded-xl shadow-sm">
                <div className="flex items-center justify-between gap-space-md">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                    Step {Math.min(filledSteps + 1, totalSteps)} of {totalSteps}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">
                    {filledSteps >= totalSteps ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 w-48">
                  {REQUIRED_STEPS.map((step, i) => (
                    <div key={step} className={`h-1.5 flex-1 rounded-full transition-all ${isFieldDetected(step) ? 'bg-primary' : i === filledSteps ? 'bg-on-tertiary-container animate-pulse' : 'bg-surface-container-highest'}`} />
                  ))}
                </div>
              </div>
            )}

            <div className="inline-flex items-center p-1 rounded-xl bg-surface-container-low shadow-sm">
              {LANGUAGES.map(lang => (
                <button key={lang.code}
                  className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${selectedLanguage === lang.code ? 'bg-primary-container text-on-primary-container font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => handleLanguageSwitch(lang.code)} type="button">
                  {selectedLanguage === lang.code && <span className="material-symbols-outlined text-xs">volume_up</span>}
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* IDLE */}
        {assessmentStatus === 'idle' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 py-12">
            <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold mb-2">Start Your Voice Assessment</h2>
              <p className="font-body-xl text-body-xl text-on-surface-variant max-w-lg mx-auto">
                Speak naturally about your work, skills, and aspirations. Saathi AI will understand and build your livelihood profile.
              </p>
              <p className="font-label-sm text-label-sm text-outline mt-3">Your conversation is securely stored for this session.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:opacity-90 transition flex items-center gap-2" onClick={handleStartAssessment}>
                <span className="material-symbols-outlined">mic</span>Begin Assessment
              </button>
              <button className="px-8 py-3 rounded-xl bg-amber-100 text-amber-900 font-bold border border-amber-300 hover:bg-amber-200 transition flex items-center gap-2" onClick={handleStartDemo}>
                <span className="material-symbols-outlined text-base">play_circle</span>Run Demo Mode
              </button>
            </div>
          </div>
        )}

        {/* COMPLETED */}
        {assessmentStatus === 'completed' && (
          <div className="bg-surface-container rounded-3xl p-10 flex flex-col items-center text-center gap-6 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Assessment Complete!</h2>
            <p className="text-on-surface-variant max-w-md">Your livelihood profile has been created from your conversation.</p>
            <div className="flex gap-4 flex-wrap justify-center">
              <button className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:opacity-90 transition" onClick={() => navigate('/profile')}>
                View My Livelihood Profile <span className="material-symbols-outlined ml-1 text-base align-middle">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE */}
        {assessmentStatus === 'active' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">

            {/* LEFT COLUMN */}
            <section className="lg:col-span-7 flex flex-col gap-space-lg">

              {/* Error banners */}
              {micError === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="material-symbols-outlined">mic_off</span>
                    <span className="font-semibold text-sm">Microphone access is required. Please allow it in your browser settings.</span>
                  </div>
                  <button onClick={() => { setMicError(null); handleMicToggle(); }} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold">Try Again</button>
                </div>
              )}
              {micError === 'unsupported' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <span className="material-symbols-outlined">warning</span>
                    <span className="font-semibold text-sm">Voice recognition unavailable in this browser. Use text input or Demo Mode.</span>
                  </div>
                  <button onClick={() => setShowTextInput(true)} className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-bold">Type Answer</button>
                </div>
              )}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-2 text-red-700">
                    <span className="material-symbols-outlined mt-0.5">cloud_off</span>
                    <div>
                      <p className="font-semibold text-sm">AI response timed out or failed.</p>
                      <p className="text-xs text-red-600 mt-0.5">This is usually a temporary issue with the AI service. Your response was recorded — you can retry.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setApiError(false);
                        // Re-send the last user message from the conversation
                        const lastUser = [...messagesRef.current].reverse().find(m => m.speaker === 'user');
                        if (lastUser) {
                          sendToAI(lastUser.text, messagesRef.current);
                        }
                      }}
                      className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Retry
                    </button>
                    <button onClick={() => setApiError(false)} className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Conversation thread */}
              <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm space-y-space-md relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-56 h-56 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
                <div ref={chatScrollRef} className="space-y-space-md max-h-[45vh] overflow-y-auto pr-1">
                  {messages.map((msg, idx) =>
                    msg.speaker === 'assistant' ? (
                      <div key={idx} className="flex items-start gap-space-sm max-w-xl">
                        <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-secondary shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                        </div>
                        <div className="flex-1 bg-surface-container rounded-2xl rounded-tl-sm p-space-md shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-space-xs">
                              <span className="font-label-sm text-label-sm font-bold text-primary">Saathi AI</span>
                              <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Spoken Voice</span>
                            </div>
                            {idx === messages.length - 1 && (
                              <button className="flex items-center gap-1 text-secondary hover:text-primary font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded hover:bg-surface-container-high transition-colors" onClick={handleReplay} type="button">
                                {isReplaying || isSpeaking
                                  ? <><span className="material-symbols-outlined text-sm animate-spin">refresh</span><span>Playing…</span></>
                                  : <><span className="material-symbols-outlined text-sm">replay</span><span>Replay Audio</span></>}
                              </button>
                            )}
                          </div>
                          <p className="font-body-xl text-body-xl text-primary font-medium leading-relaxed">"{msg.text}"</p>
                        </div>
                      </div>
                    ) : (
                      <div key={idx} className="flex items-start justify-end gap-space-sm pl-12">
                        <div className="max-w-lg bg-primary-container rounded-2xl rounded-tr-sm p-space-md shadow-md">
                          <div className="flex items-center justify-between gap-space-lg text-primary-fixed mb-1">
                            <span className="font-label-sm text-label-sm font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">mic</span>
                              {isDemoMode ? 'Demo User' : 'You'}
                            </span>
                            <span className="font-label-sm text-label-sm opacity-70 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">check</span>Recorded
                            </span>
                          </div>
                          <p className="font-headline-sm text-headline-sm text-white font-medium">"{msg.text}"</p>
                        </div>
                      </div>
                    )
                  )}

                  {/* Live interim transcript */}
                  {liveTranscript && (
                    <div className="flex items-start justify-end gap-space-sm pl-12">
                      <div className="max-w-lg bg-primary-container/40 rounded-2xl p-space-md border border-primary/20">
                        <p className="text-primary font-medium italic text-sm">{liveTranscript}…</p>
                      </div>
                    </div>
                  )}

                  {/* Processing indicator */}
                  {voiceState === 'processing' && (
                    <div className="flex items-start gap-space-sm max-w-xs">
                      <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-secondary shrink-0">
                        <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                      </div>
                      <div className="bg-surface-container rounded-2xl p-space-md shadow-sm">
                        <p className="font-label-md text-label-md text-on-surface-variant italic">Understanding you…</p>
                        <div className="flex gap-1 mt-2">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mic Controller */}
              <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tertiary-fixed/5 to-transparent pointer-events-none"></div>

                <div className="relative flex items-center justify-center my-space-md">
                  {voiceState === 'listening' && (
                    <>
                      <div className="absolute w-36 h-36 rounded-full bg-on-tertiary-container/10 animate-ping pointer-events-none"></div>
                      <div className="absolute w-28 h-28 rounded-full bg-on-tertiary-container/20 animate-pulse pointer-events-none"></div>
                    </>
                  )}
                  <button
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
                      voiceState === 'listening' ? 'bg-red-500 scale-110 cursor-pointer' :
                      voiceState === 'processing' ? 'bg-surface-container-high opacity-50 cursor-not-allowed' :
                      voiceState === 'speaking' ? 'bg-secondary opacity-80 cursor-not-allowed' :
                      isDemoMode ? 'bg-amber-500 hover:scale-105 cursor-pointer' :
                      'bg-primary-container hover:scale-105 cursor-pointer active:scale-95'
                    } text-surface-container-lowest`}
                    onClick={isDemoMode
                      ? () => runDemoStep(demoStep)
                      : handleMicToggle}
                    disabled={voiceState === 'processing' || voiceState === 'speaking'}
                    type="button"
                    title={voiceState === 'listening' ? 'Tap to stop' : isDemoMode ? 'Tap to advance' : 'Tap to speak'}
                  >
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {voiceState === 'listening' ? 'stop_circle' :
                       voiceState === 'processing' ? 'hourglass_top' :
                       voiceState === 'speaking' ? 'volume_up' :
                       isDemoMode ? 'play_arrow' : 'mic'}
                    </span>
                    <span className="absolute inset-0 rounded-full shadow-[0_0_24px_rgba(19,62,43,0.3)]"></span>
                  </button>
                </div>

                {/* Sound bars */}
                <div className={`flex items-center justify-center gap-1 h-9 my-space-xs transition-opacity ${voiceState === 'listening' ? 'opacity-100' : 'opacity-20'}`}>
                  {[3, 6, 8, 4, 7, 5, 2, 9, 4].map((h, i) => (
                    <span key={i} className={`w-1.5 bg-on-tertiary-container rounded-full ${voiceState === 'listening' ? 'animate-bounce' : ''}`}
                      style={{ height: `${h * 4}px`, animationDelay: `${i * 0.07}s` }}></span>
                  ))}
                </div>

                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md font-bold shadow-sm ${
                    voiceState === 'listening' ? 'bg-red-100 text-red-800' :
                    voiceState === 'processing' ? 'bg-surface-container text-on-surface-variant' :
                    voiceState === 'speaking' ? 'bg-secondary-container text-on-secondary-container' :
                    'bg-tertiary-fixed text-on-tertiary-fixed'
                  }`}>
                    {voiceState === 'listening' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>}
                    <span>
                      {isDemoMode ? (demoStep < DEMO_CONVERSATION_SCRIPT.length ? 'Tap play to advance demo' : 'Demo complete') :
                       voiceState === 'listening' ? 'Listening… tap stop when done' :
                       voiceState === 'processing' ? 'Understanding your response…' :
                       voiceState === 'speaking' ? 'Saathi AI is speaking…' :
                       'Tap microphone to speak'}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {LANGUAGES.find(l => l.code === selectedLanguage)?.label} selected • Your conversation is securely stored.
                  </p>
                </div>

                {/* Text input area */}
                {!isDemoMode && (
                  <div className="mt-space-md w-full max-w-md">
                    {showTextInput ? (
                      <form onSubmit={handleTextSubmit} className="flex gap-2 w-full">
                        <input
                          type="text"
                          className="flex-1 bg-surface-container p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm border border-outline-variant/30"
                          placeholder="Type your answer here…"
                          value={textInput}
                          onChange={e => setTextInput(e.target.value)}
                          autoFocus
                          disabled={voiceState === 'processing'}
                        />
                        <button type="submit" className="bg-primary text-on-primary px-4 rounded-xl font-bold text-sm disabled:opacity-50" disabled={voiceState === 'processing' || !textInput.trim()}>Send</button>
                        <button type="button" className="bg-surface-container-high px-3 rounded-xl text-sm" onClick={() => { setShowTextInput(false); setTextInput(''); }}>✕</button>
                      </form>
                    ) : (
                      <button type="button" className="text-secondary font-label-sm text-label-sm font-semibold underline underline-offset-2 hover:text-primary" onClick={() => setShowTextInput(true)}>
                        Prefer typing? Click here
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Opportunity placeholder */}
              <div className="bg-surface-container rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <span className="material-symbols-outlined text-xl">map</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-primary font-bold">Local Opportunity Matching</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">Local opportunity matching will appear after your profile is complete.</p>
                </div>
              </div>
            </section>

            {/* RIGHT: AI Understanding Panel */}
            <aside className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm space-y-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-8 h-8 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-base">psychology</span>
                    </span>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary leading-snug">AI is Understanding You</h3>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Real-time structured profile synthesis</span>
                    </div>
                  </div>
                  {voiceState === 'processing' && <span className="material-symbols-outlined text-secondary animate-spin text-lg">sync</span>}
                </div>

                <div className="space-y-space-sm">
                  {ASSESSMENT_FIELDS.map(({ key, label, icon }) => {
                    const detected = isFieldDetected(key);
                    const value = formatFieldValue(key, beneficiaryProfile[key]);
                    return (
                      <div key={key} className={`p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm transition-all ${detected ? 'bg-surface-container-lowest' : 'bg-surface-container opacity-60'}`}>
                        <div className="flex items-center gap-space-sm min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${detected ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-outline'}`}>
                            <span className="material-symbols-outlined text-base">{icon}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{label}</div>
                            <div className={`font-label-md text-label-md font-bold truncate ${detected ? 'text-on-surface' : 'text-outline italic'}`}>
                              {detected ? value : 'Not yet detected'}
                            </div>
                          </div>
                        </div>
                        <span className={`px-space-xs py-0.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-0.5 shrink-0 ${detected ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">{detected ? 'check_circle' : 'radio_button_unchecked'}</span>
                          <span>{detected ? 'Detected' : 'Pending'}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-outline-variant/30 pt-space-xs">
                  <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <span>Profile Confidence</span>
                    {confidence !== null
                      ? <span className="font-bold text-secondary">{Math.round(confidence * 100)}% Verified</span>
                      : <span className="italic text-outline">Pending analysis</span>}
                  </div>
                  {confidence !== null ? (
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${Math.round(confidence * 100)}%` }}></div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-outline mt-1">Profile confidence will appear as responses are analyzed.</p>
                  )}
                </div>
              </div>

              <div className="bg-surface-container p-space-md rounded-2xl shadow-sm space-y-space-xs">
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-lg">info</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-primary">How this works</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      As you speak, Saathi AI extracts structured information and builds your livelihood profile in real time. Your profile page reflects everything you share here.
                    </p>
                  </div>
                </div>
                <div className="pt-space-xs flex items-center justify-between font-label-sm text-label-sm text-outline">
                  <span>DeepSeek V4 Flash via OpenRouter</span>
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs text-secondary">lock</span> Encrypted
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}

      </div>
    </div>
  );
}
