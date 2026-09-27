import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import JeevikaLogo from '../components/JeevikaLogo';

// Government & Partner Portal login page
export default function Authlog() {
  const navigate = useNavigate();
  const { login } = usePortal();

  // 'govt' | 'partner'
  const [role, setRole] = useState('govt');

  // 'login' | 'register' (partner sub-tab)
  const [partnerTab, setPartnerTab] = useState('login');

  // Govt form state
  const [govtEmail, setGovtEmail] = useState('');
  const [govtPassword, setGovtPassword] = useState('');
  const [govtDistrict, setGovtDistrict] = useState('');
  const [twoFA, setTwoFA] = useState(true);

  // Partner login state
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerTaxId, setPartnerTaxId] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');

  // Partner registration state
  const [regCompany, setRegCompany] = useState('');
  const [regSector, setRegSector] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGstin, setRegGstin] = useState('');
  const [regDistrict, setRegDistrict] = useState('');

  function handleGovtLogin(e) {
    e.preventDefault();
    if (!govtEmail || !govtPassword) {
      alert('Please enter your official email and password.');
      return;
    }
    login('govt');
    navigate('/outcomes');
  }

  function handlePartnerLogin(e) {
    e.preventDefault();
    if (!partnerEmail || !partnerPassword) {
      alert('Please enter your corporate email and password.');
      return;
    }
    login('govt');
    navigate('/outcomes');
  }

  function handlePartnerRegister(e) {
    e.preventDefault();
    if (!regCompany || !regContact || !regPhone) {
      alert('Please fill in all required fields.');
      return;
    }
    alert('✅ Application submitted! Your district collector will review within 5 working days.');
  }

  const jurisdictions = [
    'Select your jurisdiction / district',
    'Barabanki (Uttar Pradesh)',
    'Sitapur (Uttar Pradesh)',
    'Lucknow Central Taskforce',
    'Ministry Central HQ - New Delhi',
    'Other',
  ];

  const sectors = [
    'Renewable Energy & Solar PV',
    'Agro-Engineering & Irrigation',
    'Electric Vehicle / Battery Maintenance',
    'Rural Cold Chain & Logistics',
    'Construction & Infrastructure',
    'Healthcare & Paramedical',
    'Other',
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fef9f0', color: '#1a2e26', fontFamily: "'Noto Sans', Arial, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className="w-full border-b sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(254,249,240,0.97)', borderColor: '#ebdcc8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <JeevikaLogo size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight" style={{ color: '#133e2b' }}>Jeevika Saathi</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider" style={{ backgroundColor: '#133e2b', color: '#fff' }}>Govt &amp; Partner</span>
            </div>
            <p className="text-[11px] font-medium hidden sm:block" style={{ color: '#0e6b68' }}>PM-AJAY GIA Telemetry &amp; Sovereign Opportunity Exchange</p>
          </div>
        </div>

        {/* Right nav items */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ backgroundColor: 'rgba(251,191,36,0.08)', borderColor: 'rgba(217,119,6,0.25)', color: '#78350f' }}>
            <svg className="w-3.5 h-3.5" style={{ color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Nodal Officer Helpdesk: <span className="font-bold">1800-11-2026</span> (Ext: 4)</span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="group flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            style={{ backgroundColor: '#fff', borderColor: 'rgba(43,93,70,0.3)', color: '#133e2b' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#133e2b'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#133e2b'; }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center transition" style={{ backgroundColor: '#e7f2ec' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-[11px] sm:text-xs font-bold tracking-tight leading-tight">Beneficiary Portal</span>
              <span className="block text-[9px] font-normal leading-none hidden lg:block" style={{ color: '#78716c' }}>Direct Access Gateway</span>
            </div>
            <svg className="w-3.5 h-3.5 ml-0.5" style={{ color: '#a8a29e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex items-center justify-center">
        <section className="bg-white rounded-3xl p-6 sm:p-9 shadow-lg border transition-all duration-300" style={{ maxWidth: 640, borderColor: '#e8ded0', width: '100%' }}>

          {/* Card header — mirrors /login card header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase mb-2" style={{ backgroundColor: '#e3efe8', color: '#133e2b', borderColor: '#bcdbc8' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Authorized Access Gateway
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#133e2b' }}>
                {role === 'govt' ? 'Authorized Official Sign-In' : 'Opportunity Partner Portal'}
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: '#57534e' }}>
                {role === 'govt'
                  ? 'Secure sign-in for government officials and PM-AJAY taskforce members.'
                  : 'Sign in or apply to post NSQF-certified vacancies and manage apprenticeship batches.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ml-3" style={{ backgroundColor: '#e7f3ec', color: '#0e6b68', borderColor: '#bfe2d1' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
              </svg>
              {role === 'govt' ? '2FA · Jan Parichay' : 'DPI Verified'}
            </span>
          </div>

          {/* Role selector — compact pill, matches Userlog tab style */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl text-xs font-bold mb-5 border" style={{ backgroundColor: '#f1ebe0', borderColor: '#e2d4c0' }}>
            <button
              onClick={() => setRole('govt')}
              className="py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
              style={role === 'govt' ? { backgroundColor: '#133e2b', color: '#fff', boxShadow: '0 4px 12px rgba(19,62,43,0.15)' } : { color: '#57534e' }}
            >
              Govt &amp; Taskforce
            </button>
            <button
              onClick={() => setRole('partner')}
              className="py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
              style={role === 'partner' ? { backgroundColor: '#133e2b', color: '#fff', boxShadow: '0 4px 12px rgba(19,62,43,0.15)' } : { color: '#57534e' }}
            >
              Opportunity Partner
            </button>
          </div>

          {/* ── GOVT VIEW ── */}
          {role === 'govt' && (
            <div className="space-y-5">
              <form className="space-y-4" onSubmit={handleGovtLogin}>
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#1c1917' }}>
                    Government Official Email / Officer ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#a8a29e' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={govtEmail}
                      onChange={e => setGovtEmail(e.target.value)}
                      placeholder="e.g. collector.district@nic.in"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition font-medium"
                      style={{ borderColor: '#d6d3d1', backgroundColor: 'rgba(250,250,249,0.5)', color: '#1c1917' }}
                    />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: '#78716c' }}>Requires official domain e.g., @nic.in, @gov.in, or state nodal credentials.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#1c1917' }}>Password</label>
                      <a href="#" className="text-[11px] font-semibold hover:underline" style={{ color: '#0e6b68' }}>Forgot?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#a8a29e' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={govtPassword}
                        onChange={e => setGovtPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 transition"
                        style={{ borderColor: '#d6d3d1', backgroundColor: 'rgba(250,250,249,0.5)', color: '#1c1917' }}
                      />
                    </div>
                  </div>

                  {/* Jurisdiction */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#1c1917' }}>Jurisdiction / District</label>
                    <select
                      value={govtDistrict}
                      onChange={e => setGovtDistrict(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition font-medium"
                      style={{ borderColor: '#d6d3d1', backgroundColor: 'rgba(250,250,249,0.5)', color: govtDistrict ? '#1c1917' : '#a8a29e' }}
                    >
                      {jurisdictions.map((j, i) => (
                        <option key={j} value={i === 0 ? '' : j} disabled={i === 0}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2FA checkbox */}
                <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'rgba(254,243,199,0.6)', borderColor: 'rgba(252,211,77,0.5)' }}>
                  <div className="flex items-center gap-2.5">
                    <input
                      id="twoFactorGovt"
                      type="checkbox"
                      checked={twoFA}
                      onChange={e => setTwoFA(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300"
                      style={{ accentColor: '#133e2b' }}
                    />
                    <label htmlFor="twoFactorGovt" className="text-xs font-medium" style={{ color: '#451a03' }}>
                      Enforce Hardware Token / Aadhaar OTP 2FA
                    </label>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ color: '#92400e', backgroundColor: 'rgba(252,211,77,0.5)' }}>MANDATORY</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#133e2b' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0c281c'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#133e2b'}
                >
                  <svg className="w-4 h-4" style={{ color: '#6ee7b7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Authenticate &amp; Access PM-AJAY Telemetry</span>
                </button>
              </form>

              <div className="text-center pt-1">
                <p className="text-xs" style={{ color: '#78716c' }}>
                  Designated nodal officer without credentials?{' '}
                  <a href="#" className="font-bold hover:underline" style={{ color: '#0e6b68' }}>Request District Onboarding &amp; NIC Whitelist</a>
                </p>
              </div>
            </div>
          )}

          {/* ── PARTNER VIEW ── */}
          {role === 'partner' && (
            <div className="space-y-6">

              {/* Partner sub-tabs */}
              <div className="flex border-b" style={{ borderColor: '#e7e5e4' }}>
                <button
                  onClick={() => setPartnerTab('login')}
                  className="pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition"
                  style={partnerTab === 'login' ? { borderColor: '#133e2b', color: '#133e2b' } : { borderColor: 'transparent', color: '#78716c' }}
                >
                  Registered Partner Sign-in
                </button>
                <button
                  onClick={() => setPartnerTab('register')}
                  className="pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition"
                  style={partnerTab === 'register' ? { borderColor: '#133e2b', color: '#133e2b' } : { borderColor: 'transparent', color: '#78716c' }}
                >
                  New Partner Empanelment
                </button>
              </div>

              {/* Partner Login */}
              {partnerTab === 'login' && (
                <form className="space-y-4" onSubmit={handlePartnerLogin}>
                  {/* Corporate email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#1c1917' }}>Corporate / Organization Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#a8a29e' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={partnerEmail}
                        onChange={e => setPartnerEmail(e.target.value)}
                        placeholder="e.g. nodal.hr@yourcompany.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition font-medium"
                        style={{ borderColor: '#d6d3d1', backgroundColor: 'rgba(250,250,249,0.5)', color: '#1c1917' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* TAN / GSTIN */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#1c1917' }}>Corporate TAN / GSTIN / CIN</label>
                      <input
                        type="text"
                        value={partnerTaxId}
                        onChange={e => setPartnerTaxId(e.target.value)}
                        placeholder="e.g. 09AAACS0000A1Z2"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition font-mono font-medium"
                        style={{ borderColor: '#d6d3d1', backgroundColor: 'rgba(250,250,249,0.5)', color: '#1c1917' }}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: '#1c1917' }}>Partner Password</label>
                        <a href="#" className="text-[11px] font-semibold hover:underline" style={{ color: '#0e6b68' }}>Forgot?</a>
                      </div>
                      <input
                        type="password"
                        value={partnerPassword}
                        onChange={e => setPartnerPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition"
                        style={{ borderColor: '#d6d3d1', backgroundColor: 'rgba(250,250,249,0.5)', color: '#1c1917' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#0e6b68' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#094d4b'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0e6b68'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign in to Partner Opportunity Console</span>
                  </button>
                </form>
              )}

              {/* Partner Register */}
              {partnerTab === 'register' && (
                <form className="space-y-4" onSubmit={handlePartnerRegister}>
                  {/* Progress steps */}
                  <div className="p-4 rounded-xl border" style={{ backgroundColor: '#f9fafb', borderColor: '#e7e5e4' }}>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#133e2b' }}>4-Stage Verification Process</h4>
                    <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-center">
                      <div className="p-1.5 rounded" style={{ backgroundColor: '#133e2b', color: '#fff' }}>1. Form Submit</div>
                      <div className="p-1.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>2. District Audit</div>
                      <div className="p-1.5 rounded" style={{ backgroundColor: '#e7e5e4', color: '#57534e' }}>3. MoU Sign</div>
                      <div className="p-1.5 rounded" style={{ backgroundColor: '#e7e5e4', color: '#57534e' }}>4. Post Jobs</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1" style={{ color: '#44403c' }}>Company / Entity Name *</label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={e => setRegCompany(e.target.value)}
                        placeholder="e.g. Sunrise Solar Agro Ltd"
                        required
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                        style={{ borderColor: '#d6d3d1' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1" style={{ color: '#44403c' }}>Sector / Industry</label>
                      <select
                        value={regSector}
                        onChange={e => setRegSector(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                        style={{ borderColor: '#d6d3d1' }}
                      >
                        {sectors.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1" style={{ color: '#44403c' }}>Contact Person &amp; Designation *</label>
                      <input
                        type="text"
                        value={regContact}
                        onChange={e => setRegContact(e.target.value)}
                        placeholder="e.g. Anil Mehrotra, HR VP"
                        required
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                        style={{ borderColor: '#d6d3d1' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1" style={{ color: '#44403c' }}>Official Contact Phone *</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="+91 98XXXXXXXX"
                        required
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                        style={{ borderColor: '#d6d3d1' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1" style={{ color: '#44403c' }}>GSTIN / Registration Number</label>
                      <input
                        type="text"
                        value={regGstin}
                        onChange={e => setRegGstin(e.target.value)}
                        placeholder="15-digit valid GSTIN"
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none font-mono"
                        style={{ borderColor: '#d6d3d1' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1" style={{ color: '#44403c' }}>Target Hiring District</label>
                      <input
                        type="text"
                        value={regDistrict}
                        onChange={e => setRegDistrict(e.target.value)}
                        placeholder="e.g. Barabanki, Lucknow"
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                        style={{ borderColor: '#d6d3d1' }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] leading-snug" style={{ color: '#78716c' }}>
                    By submitting, your organization agrees to comply with NSQF Level 3–5 wage guidelines (min ₹15,000/mo) and PM-AJAY affirmative action guidelines.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow transition"
                    style={{ backgroundColor: '#d97706' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#b45309'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#d97706'}
                  >
                    Submit Application for District Collector Verification
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer security bar */}
          <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs" style={{ borderColor: '#e7e5e4', color: '#78716c' }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" style={{ color: '#15803d' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-Bit SHA Encrypted Sovereign Session</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <a href="#" className="hover:underline" style={{ color: '#78716c' }}>Standard Operating Protocol (SOP)</a>
              <a href="#" className="hover:underline" style={{ color: '#78716c' }}>Privacy Framework</a>
              <a href="#" className="hover:underline" style={{ color: '#78716c' }}>Audit Trail Logs</a>
            </div>
          </div>

        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t py-6 px-6 sm:px-12 text-center text-xs" style={{ backgroundColor: '#f6efe4', borderColor: '#ebdcc8', color: '#57534e' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: '#133e2b' }}>Jeevika Saathi Sovereign Gateway</span>
            <span style={{ color: '#d6d3d1' }}>•</span>
            <span>SIH 2026 Problem Statement 26097</span>
          </div>
          <p className="text-[11px]" style={{ color: '#78716c' }}>
            Under PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana) • Ministry of Social Justice &amp; Empowerment, Govt. of India
          </p>
        </div>
      </footer>

    </div>
  );
}
