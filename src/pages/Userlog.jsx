import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import JeevikaLogo from '../components/JeevikaLogo';

export default function Userlog() {
  const navigate = useNavigate();
  const { login } = usePortal();

  // Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Language dropdown
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const langRef = useRef(null);

  // Login form state
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    // Auto-focus next box
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  function handleLogin() {
    if (!mobile || otp.some(d => d === '')) {
      alert('Please enter your mobile number and 4-digit OTP.');
      return;
    }
    login('beneficiary');
    navigate('/');
  }

  function handleRegister(e) {
    e.preventDefault();
    if (!regName || !regMobile) {
      alert('Please fill in all required fields.');
      return;
    }
    login('beneficiary');
    navigate('/');
  }

  const languages = ['English', 'हिन्दी (Hindi)', 'मराठी (Marathi)', 'বাংলা (Bengali)'];

  return (
    <div className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: '#fef9f0', color: '#1a221e', fontFamily: "'Noto Sans', Arial, sans-serif" }}>

      {/* ── TOP HEADER ── */}
      <header className="w-full border-b sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(252,248,240,0.97)', borderColor: '#ebdcca' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <JeevikaLogo size={40} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight leading-none" style={{ color: '#133e2b' }}>Jeevika Saathi</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase" style={{ backgroundColor: '#e3efe8', color: '#133e2b', borderColor: '#bcdbc8' }}>PM-AJAY DPI</span>
              </div>
              <p className="text-xs font-medium tracking-wide mt-0.5 hidden sm:block" style={{ color: '#78716c' }}>
                Your Voice. Your Skills. Your Livelihood.
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(v => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition shadow-sm"
                style={{ backgroundColor: '#fff', borderColor: '#dfd5c5', color: '#44403c' }}
              >
                <svg className="w-3.5 h-3.5" style={{ color: '#133e2b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{selectedLang.split(' ')[0]}</span>
                <svg className="w-3 h-3" style={{ color: '#a8a29e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white shadow-xl border border-stone-200 py-1.5 z-50 text-xs font-medium text-stone-700">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center justify-between"
                      style={{ color: selectedLang === lang ? '#133e2b' : undefined, fontWeight: selectedLang === lang ? 700 : undefined }}
                    >
                      {lang} {selectedLang === lang && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Govt / Partner Portal Button */}
            <button
              onClick={() => navigate('/auth')}
              className="group flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              style={{ backgroundColor: '#fff', borderColor: 'rgba(43,93,70,0.3)', color: '#133e2b' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#133e2b'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#133e2b'; }}
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center transition" style={{ backgroundColor: '#e7f2ec' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-[11px] sm:text-xs font-bold tracking-tight leading-tight">Govt / Partner Portal</span>
                <span className="block text-[9px] font-normal leading-none hidden lg:block" style={{ color: '#78716c' }}>Authorized Access Gateway</span>
              </div>
              <svg className="w-3.5 h-3.5 ml-0.5" style={{ color: '#a8a29e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch" style={{ minHeight: 640 }}>

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl text-white p-7 sm:p-9 relative overflow-hidden shadow-xl border" style={{ background: 'linear-gradient(135deg, #133e2b 0%, #103827 60%, #0a2318 100%)', borderColor: '#24583f' }}>
            {/* Decorative blobs */}
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(24,134,130,0.2)', filter: 'blur(60px)' }} />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(226,135,35,0.15)', filter: 'blur(60px)' }} />
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            {/* Top content */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#a9dfbf' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PM-AJAY Livelihood Corridor
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                From aspiration<br />
                <span style={{ backgroundImage: 'linear-gradient(to right, #e28723, #f7b05b, #fce4a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>to opportunity.</span>
              </h1>

              <p className="mt-3.5 text-sm leading-relaxed max-w-md font-normal" style={{ color: '#e7e5e4' }}>
                Jeevika Saathi empowers rural youth and beneficiaries through native voice recognition — unlocking NSQF-certified skills, direct stipends, and dignified employment without complex forms.
              </p>

              {/* Feature card */}
              <div className="mt-6 p-4 rounded-2xl border flex items-center gap-4 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 shadow-md" style={{ borderColor: 'rgba(226,135,35,0.6)' }}>
                  <img
                    src="https://lh3.googleusercontent.com/aida/AEtjO1Vzu7PKyTevDtB2ywiTJkZhMXSbS053UcHHesUb9pdSBRw5LLu8UxKZ5j7a07hHPkfMO-OZzOkDhtpFUOkip5XQ1c9x43VKRY-TIcJutetA210Hg7lrN6qFaq9hoh_lpvYeMei7TrJ4rSicE5U2Jx9p2qxdb7w5Qs_U5stVx2NneeNRQvt9XuQdg4xt1tCEFhuo18ZqCAqZbpsb2qeD5Avu1p14Hx_lR0YKQ-fnwvXOcFXpSdRbnJqFRyY"
                    alt="Beneficiary story"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">Rural Youth Beneficiary</span>
                    <span className="px-1.5 text-[9px] font-bold rounded border" style={{ backgroundColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7', borderColor: 'rgba(52,211,153,0.4)' }}>Verified</span>
                  </div>
                  <p className="text-[11px] mt-0.5 line-clamp-2 italic" style={{ color: '#d6d3d1' }}>
                    "Spoke in my native language on my phone. In minutes I was enrolled in solar training."
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] font-semibold" style={{ color: '#e28723' }}>
                    <span>Stipend: ₹8,000/mo DBT</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                    <span>Placement: ₹10,000/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline flow */}
            <div className="relative z-10 my-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center justify-between" style={{ color: 'rgba(167,243,208,0.9)' }}>
                <span>Sovereign Journey Pipeline</span>
                <span className="text-[10px] font-normal" style={{ color: '#d6d3d1' }}>100% Zero Paperwork</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {['Voice Intake', 'Skill Gap', 'NSQF Lab', 'Job Link'].map((label, i) => (
                  <div key={label} className="p-2 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1" style={{ backgroundColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>{i + 1}</div>
                    <span className="text-[10px] font-semibold block leading-tight" style={{ color: '#e7e5e4' }}>{label}</span>
                  </div>
                ))}
                <div className="p-2 rounded-xl text-white font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #e28723, #d97706)' }}>
                  <div className="w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>5</div>
                  <span className="text-[10px] block leading-tight">Livelihood</span>
                </div>
              </div>
            </div>

            {/* Footer trust bar */}
            <div className="relative z-10 pt-4 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#d6d3d1' }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                <span>Ministry of Social Justice &amp; Empowerment</span>
              </div>
              <span className="font-mono text-[10px]" style={{ color: '#a8a29e' }}>SIH 2026 #26097</span>
            </div>
          </div>

          {/* ── RIGHT AUTH CARD ── */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-lg border transition-all duration-300" style={{ borderColor: '#e8ded0' }}>

              {/* Card header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase mb-2" style={{ backgroundColor: '#e3efe8', color: '#133e2b', borderColor: '#bcdbc8' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Direct Access Gateway
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#133e2b' }}>
                    {activeTab === 'login' ? 'Welcome back' : 'Create Account'}
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: '#57534e' }}>
                    {activeTab === 'login'
                      ? 'Sign in to continue your livelihood journey under PM-AJAY.'
                      : 'Register in under 1 minute. Zero paperwork required.'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border" style={{ backgroundColor: '#e7f3ec', color: '#0e6b68', borderColor: '#bfe2d1' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  OTP &amp; Voice First
                </span>
              </div>

              {/* Tab toggle */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl text-xs font-bold mb-5" style={{ backgroundColor: '#f1ebe0' }}>
                <button
                  onClick={() => setActiveTab('login')}
                  className="py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                  style={activeTab === 'login' ? { backgroundColor: '#133e2b', color: '#fff', boxShadow: '0 4px 12px rgba(19,62,43,0.15)' } : { color: '#57534e' }}
                >
                  Beneficiary Login
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                  style={activeTab === 'register' ? { backgroundColor: '#133e2b', color: '#fff', boxShadow: '0 4px 12px rgba(19,62,43,0.15)' } : { color: '#57534e' }}
                >
                  Create New Account
                </button>
              </div>

              {/* ── LOGIN VIEW ── */}
              {activeTab === 'login' && (
                <>
                  {/* Voice banner */}
                  <div className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 mb-5 shadow-sm" style={{ background: 'linear-gradient(to right, #f7f2ea, #eef6f1)', borderColor: '#d8e8dc' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: '#133e2b', color: '#fff' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: '#133e2b' }}>Voice-Assisted Quick Sign-in</span>
                          <span className="flex gap-0.5 items-center">
                            {[2, 3.5, 1.5].map((h, i) => (
                              <span key={i} className="w-1 rounded-full animate-pulse bg-emerald-600" style={{ height: `${h * 4}px` }} />
                            ))}
                          </span>
                        </div>
                        <span className="block text-[11px] truncate" style={{ color: '#57534e' }}>Tap to speak your mobile number in your language</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('🎙️ Voice Biometric Engine: Speak your 10-digit mobile number.')}
                      className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      style={{ backgroundColor: '#fff', borderColor: 'rgba(43,93,70,0.3)', color: '#133e2b' }}
                    >
                      🎙️ Tap &amp; Speak
                    </button>
                  </div>

                  {/* Mobile input */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-center">
                      <label htmlFor="mobileInput" className="text-xs font-bold" style={{ color: '#44403c' }}>Mobile Number (Linked to Aadhaar / Ration Card)</label>
                      <span className="text-[11px] font-medium" style={{ color: '#78716c' }}>100% Zero Paperwork</span>
                    </div>
                    <div className="relative flex rounded-xl border overflow-hidden transition focus-within:ring-2" style={{ borderColor: '#d6d3d1', backgroundColor: '#faf8f4' }}>
                      <span className="inline-flex items-center px-3.5 border-r text-sm font-bold" style={{ borderColor: '#e7e5e4', backgroundColor: '#f1ebe0', color: '#44403c' }}>+91</span>
                      <input
                        type="tel"
                        id="mobileInput"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/, ''))}
                        className="w-full px-3.5 py-3 bg-transparent text-sm font-semibold tracking-wider placeholder:text-stone-400 focus:outline-none"
                        style={{ color: '#1c1917' }}
                      />
                      <button
                        type="button"
                        onClick={() => alert('🎙️ Voice input activated.')}
                        className="px-3 transition hover:text-stone-700"
                        style={{ color: '#a8a29e' }}
                        title="Voice dictation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* OTP */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold" style={{ color: '#44403c' }}>Enter 4-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => alert('OTP resent via SMS and Voice Call.')}
                        className="text-[11px] font-semibold hover:underline"
                        style={{ color: '#0e6b68' }}
                      >
                        Resend OTP (सुनो OTP)
                      </button>
                    </div>
                    <div className="flex gap-3">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className="w-12 h-12 text-center text-lg font-extrabold rounded-xl border focus:outline-none focus:ring-2"
                          style={{ borderColor: '#d6d3d1', backgroundColor: '#faf8f4', color: '#1c1917' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2.5 mb-4">
                    <button
                      onClick={handleLogin}
                      className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: '#133e2b' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0c271b'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#133e2b'}
                    >
                      <span>Continue with OTP</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Triggering voice call OTP in your preferred language.')}
                      className="w-full py-2.5 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: '#eef6f1', borderColor: '#bcdbc8', color: '#133e2b' }}
                    >
                      <span>🔊</span>
                      <span>Get Voice Call OTP (सुनो OTP)</span>
                    </button>
                  </div>

                  {/* Biometric option */}
                  <div className="p-3 rounded-2xl border flex items-center justify-between mb-4" style={{ backgroundColor: '#faf8f4', borderColor: '#e8ded0' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(14,107,104,0.1)', color: '#0e6b68' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-xs font-bold" style={{ color: '#1c1917' }}>Aadhaar FaceRD / Biometric Sign-in</span>
                        <span className="block text-[10px]" style={{ color: '#78716c' }}>Fast verification with camera or finger sensor</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Initiating Aadhaar FaceRD biometric camera scan...')}
                      className="px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-sm"
                      style={{ backgroundColor: '#fff', borderColor: '#d6d3d1', color: '#44403c' }}
                    >
                      Scan Face
                    </button>
                  </div>

                  {/* Switch to register */}
                  <div className="pb-4 flex items-center justify-between text-xs">
                    <span className="font-medium" style={{ color: '#57534e' }}>New to Jeevika Saathi?</span>
                    <button
                      onClick={() => setActiveTab('register')}
                      className="font-extrabold hover:underline underline-offset-2 transition"
                      style={{ color: '#0e6b68' }}
                    >
                      Create an account →
                    </button>
                  </div>
                </>
              )}

              {/* ── REGISTER VIEW ── */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#44403c' }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Devi"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition"
                      style={{ borderColor: '#d6d3d1', backgroundColor: '#faf8f4', color: '#1c1917' }}
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#44403c' }}>Mobile Number</label>
                    <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: '#d6d3d1', backgroundColor: '#faf8f4' }}>
                      <span className="inline-flex items-center px-3.5 border-r text-sm font-bold" style={{ borderColor: '#e7e5e4', backgroundColor: '#f1ebe0', color: '#44403c' }}>+91</span>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={regMobile}
                        onChange={e => setRegMobile(e.target.value.replace(/\D/, ''))}
                        required
                        className="w-full px-3.5 py-2.5 bg-transparent text-sm font-semibold tracking-wider placeholder:text-stone-400 focus:outline-none"
                        style={{ color: '#1c1917' }}
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#44403c' }}>District / Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Barabanki, Uttar Pradesh"
                      value={regDistrict}
                      onChange={e => setRegDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition"
                      style={{ borderColor: '#d6d3d1', backgroundColor: '#faf8f4', color: '#1c1917' }}
                    />
                  </div>

                  {/* Aadhaar (optional) */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#44403c' }}>
                      Aadhaar Number <span className="font-normal text-stone-400">(optional, for faster verification)</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14}
                      value={regAadhaar}
                      onChange={e => setRegAadhaar(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 transition"
                      style={{ borderColor: '#d6d3d1', backgroundColor: '#faf8f4', color: '#1c1917' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: '#133e2b' }}
                  >
                    <span>Create Account &amp; Start Journey</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <div className="text-center text-xs">
                    <span style={{ color: '#57534e' }}>Already registered? </span>
                    <button type="button" onClick={() => setActiveTab('login')} className="font-extrabold hover:underline" style={{ color: '#0e6b68' }}>
                      Sign in →
                    </button>
                  </div>
                </form>
              )}

              {/* Card footer */}
              <div className="pt-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]" style={{ borderColor: '#e7e5e4', color: '#78716c' }}>
                <div className="flex items-center gap-1.5 font-medium">
                  <span>🔒 Protected under <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>. 100% Zero Paperwork.</span>
                </div>
                <div className="flex items-center gap-3">
                  <a href="#" className="hover:underline transition" style={{ color: '#78716c' }}>Privacy Protocol</a>
                  <span style={{ color: '#d6d3d1' }}>•</span>
                  <a href="#" className="hover:underline transition" style={{ color: '#78716c' }}>Terms of Sovereign Access</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t py-3.5 mt-auto" style={{ backgroundColor: '#f6eee2', borderColor: '#e2d5c3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#57534e' }}>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold" style={{ backgroundColor: '#fff', color: '#133e2b', borderColor: '#d6d3d1' }}>24x7 Sovereign Citizen Helpline</span>
            <span className="font-bold" style={{ color: '#1c1917' }}>📞 1800-11-2026 (Toll Free)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Aadhaar PFMS DBT Linked</span>
            <span style={{ color: '#d6d3d1' }}>|</span>
            <span>DigiLocker &amp; APAAR Synchronized</span>
            <span style={{ color: '#d6d3d1' }}>|</span>
            <span className="font-bold" style={{ color: '#133e2b' }}>National Skill Development Mission</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
