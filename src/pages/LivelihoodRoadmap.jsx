import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function LivelihoodRoadmap() {
  const navigate = useNavigate();
  const { beneficiaryProfile, isDemoMode } = useSession();
  const [showVoiceToast, setShowVoiceToast] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    kyc: true,
    passbook: false,
    gear: false,
  });

  const handleCheckboxChange = (key) => {
    setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVoiceEnroll = () => {
    setShowVoiceToast(true);
    setTimeout(() => {
      setShowVoiceToast(false);
    }, 4000);
  };

  // ── Dynamic data from session / fallback to demo values ───────────────────
  const hasProfile = !!(beneficiaryProfile && !isDemoMode);

  const beneficiaryName    = hasProfile ? (beneficiaryProfile.full_name  || 'Beneficiary') : 'Beneficiary';
  const district           = hasProfile ? (beneficiaryProfile.district   || 'Barabanki')   : 'Barabanki';
  const mobilityKm         = hasProfile ? (beneficiaryProfile.mobility_limit_km || 20)     : 20;
  const beneficiaryId      = hasProfile ? (beneficiaryProfile.beneficiary_id || 'UP-BRB-2026-8841') : 'UP-BRB-2026-8841';

  // Pathway — driven by beneficiaryProfile
  const userAvailDur = hasProfile ? (beneficiaryProfile.trainingAvailabilityDuration || beneficiaryProfile.training_availability_duration || '3-Month Skill Training') : '3-Month Skill Training';
  const PATHWAY = {
    currentSkill:    'Carpentry / Woodworking',
    targetRole:      'Carpenter / Furniture Maker',
    bridgingGap:     'Advanced carpentry & finishing',
    duration:        userAvailDur,
    certification:   'NSQF-Aligned Carpentry Pathway',
    outcome:         'Employment / Self-Employment',
    trainingCenter:  hasProfile ? 'Training center will be assigned after matching.' : `ITI Barabanki, Dewa Road (8.4 km)`,
    batchInfo:       '14 days until next subsidized batch starts',
    seatsLeft:       '6 of 30 seats remaining',
    stipend:         '₹8,000/month',
    stipendTotal:    '₹16,000 total',
    placedWage:      '₹15,000/mo',
    placementRatio:  '91% in UP',
    employer:        'Avadh Furniture Works',
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md lg:px-space-xl py-space-lg space-y-space-xl max-w-7xl mx-auto w-full">

        {/* Top Context & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Active Trajectory
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">• Updated via Voice AI</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Your Livelihood Roadmap</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              A step-by-step pathway from your existing woodworking experience to skilled carpentry employment or self-employment.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container px-space-md py-space-xs rounded-xl">
            <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Beneficiary ID</span>
              <span className="font-label-md text-label-md font-bold text-primary">{beneficiaryId}</span>
            </div>
          </div>
        </div>

        {/* Pathway Pipeline Banner */}
        <div className="flex flex-wrap items-center justify-center gap-1 bg-surface-container-low px-space-md py-space-sm rounded-2xl text-sm overflow-x-auto">
          {[
            { icon: 'handyman',           label: PATHWAY.currentSkill },
            { icon: 'arrow_forward',       label: null },
            { icon: 'business_center',    label: PATHWAY.targetRole },
            { icon: 'arrow_forward',       label: null },
            { icon: 'build',              label: PATHWAY.bridgingGap },
            { icon: 'arrow_forward',       label: null },
            { icon: 'schedule',           label: PATHWAY.duration },
            { icon: 'arrow_forward',       label: null },
            { icon: 'workspace_premium',  label: PATHWAY.certification },
            { icon: 'arrow_forward',       label: null },
            { icon: 'emoji_events',       label: PATHWAY.outcome },
          ].map((item, i) =>
            item.label === null ? (
              <span key={i} className="material-symbols-outlined text-outline-variant text-lg">arrow_forward</span>
            ) : (
              <span key={i} className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container font-label-sm text-label-sm text-primary font-semibold whitespace-nowrap">
                <span className="material-symbols-outlined text-secondary text-base">{item.icon}</span>
                {item.label}
              </span>
            )
          )}
        </div>

        {/* Highlighted Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-primary text-on-primary shadow-xl p-space-lg lg:p-space-xl">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-secondary opacity-30 blur-3xl pointer-events-none"></div>
          <div className="absolute right-1/4 -top-16 w-64 h-64 rounded-full bg-tertiary-fixed-dim opacity-10 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="space-y-space-sm max-w-3xl">
              <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold tracking-wide">
                <span className="material-symbols-outlined text-sm">bolt</span>
                IMMEDIATE ACTION REQUIRED
              </div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-primary leading-tight">
                Your Next Best Action: Reserve Seat for Carpentry Training
              </h2>
              <p className="font-body-lg text-body-lg text-surface-container-high leading-relaxed">
                {PATHWAY.batchInfo} • <strong className="text-tertiary-fixed font-bold">{PATHWAY.seatsLeft}</strong> • Direct Benefit Transfer <span className="underline decoration-tertiary-fixed decoration-2 underline-offset-4">{PATHWAY.stipend}</span> activated upon enrollment.
              </p>
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs font-label-md text-label-md text-primary-fixed">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {PATHWAY.trainingCenter}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  Morning Shift: 08:30 AM – 01:30 PM
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  100% Free Training (Govt Funded)
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-space-sm shrink-0 w-full sm:w-auto lg:w-72">
              <button
                className="flex items-center justify-center gap-2 px-space-lg py-space-md rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg font-bold shadow-lg hover:bg-tertiary-fixed-dim transition-all active:scale-95 group"
                onClick={handleVoiceEnroll}
              >
                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">mic</span>
                <span>Confirm with Voice</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-space-md py-space-md rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold hover:bg-primary-container/80 transition-all">
                <span className="material-symbols-outlined text-lg">download</span>
                <span>Download Checklist (PDF)</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-lg pt-space-md bg-black/20 rounded-xl p-space-sm">
            <div className="px-space-xs">
              <span className="font-label-sm text-label-sm text-surface-container-high block">Stipend Entitlement</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-primary">{PATHWAY.stipendTotal}</span>
            </div>
            <div className="px-space-xs">
              <span className="font-label-sm text-label-sm text-surface-container-high block">Duration</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-primary">90 Days Training</span>
            </div>
            <div className="px-space-xs">
              <span className="font-label-sm text-label-sm text-surface-container-high block">Target Starting Wage</span>
              <span className="font-headline-sm text-headline-sm font-bold text-tertiary-fixed">{PATHWAY.placedWage}</span>
            </div>
            <div className="px-space-xs">
              <span className="font-label-sm text-label-sm text-surface-container-high block">Placement Ratio</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-primary">{PATHWAY.placementRatio}</span>
            </div>
          </div>
        </div>

        {/* Timeline + Right Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-8 space-y-space-md">
            <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary">alt_route</span>
                <span className="font-label-lg text-label-lg font-bold text-primary">Trajectory Progression</span>
              </div>
              <span className="font-label-md text-label-md font-semibold text-secondary">Step 2 of 7 Active</span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-space-lg">
              <div className="absolute left-3.5 sm:left-4 top-4 bottom-4 w-1 bg-surface-container-highest -translate-x-1/2"></div>
              <div className="absolute left-3.5 sm:left-4 top-4 h-24 w-1 bg-secondary -translate-x-1/2"></div>

              {/* STAGE 1 — Skill Assessment */}
              <div className="relative flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm transition-all hover:shadow-md">
                <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">TODAY • STAGE 1</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    COMPLETED
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Carpentry Skill Assessment</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Your existing carpentry experience is assessed to identify skills you already possess and areas that can be upgraded.
                </p>
                <div className="mt-space-xs grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                  <div className="bg-surface-container p-space-sm rounded-xl space-y-1">
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase block">Skills Confirmed ✓</span>
                    {['Basic wood cutting', 'Measuring and marking', 'Hand tool handling'].map(s => (
                      <div key={s} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-xs">check_circle</span>{s}
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface-container p-space-sm rounded-xl space-y-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase block">Skill Gaps Identified ○</span>
                    {['Advanced joinery', 'Machine/tool operation', 'Furniture finishing', 'Workplace safety', 'Cost estimation'].map(s => (
                      <div key={s} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-outline text-xs">radio_button_unchecked</span>{s}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-space-xs flex flex-wrap gap-2 pt-space-xs">
                  <span className="px-space-sm py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">mic</span> Voice Intake #{beneficiaryId.split('-').pop()}
                  </span>
                  <span className="px-space-sm py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">near_me</span> Radius: {mobilityKm}km
                  </span>
                  <span className="px-space-sm py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">military_tech</span> Prior Learning Acknowledged
                  </span>
                </div>
              </div>

              {/* STAGE 2 — Training Enrollment */}
              <div className="relative flex flex-col gap-space-sm bg-surface-container-low p-space-lg rounded-2xl shadow-md ring-2 ring-tertiary-fixed">
                <div className="absolute -left-6 sm:-left-8 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-lg animate-pulse">
                  <span className="material-symbols-outlined text-sm font-bold">pending_actions</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-tertiary-container tracking-wider">WEEK 1 • STAGE 2</span>
                  <span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    ACTION REQUIRED
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Training Enrollment & Batch Induction</h3>
                <p className="font-body-md text-body-md text-on-surface">
                  Complete enrollment and verification before starting the carpentry skill-upgradation programme.
                </p>
                <div className="bg-surface-container-lowest p-space-md rounded-xl space-y-space-xs mt-space-xs">
                  <label className="flex items-start gap-space-sm cursor-pointer p-space-xs rounded-lg hover:bg-surface-container transition-colors">
                    <input
                      type="checkbox"
                      checked={checkboxes.kyc}
                      onChange={() => handleCheckboxChange('kyc')}
                      className="mt-1 w-5 h-5 rounded text-primary focus:ring-secondary accent-primary"
                    />
                    <div>
                      <span className="font-label-md text-label-md font-bold text-primary block">Complete beneficiary verification</span>
                      <span className="font-label-sm text-label-sm text-secondary">Verified digitally via DigiLocker</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-space-sm cursor-pointer p-space-xs rounded-lg hover:bg-surface-container transition-colors">
                    <input
                      type="checkbox"
                      checked={checkboxes.passbook}
                      onChange={() => handleCheckboxChange('passbook')}
                      className="mt-1 w-5 h-5 rounded text-primary focus:ring-secondary accent-primary"
                    />
                    <div>
                      <span className="font-label-md text-label-md font-bold text-on-surface block">Submit required documents</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">For DBT Stipend & ID</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-space-sm cursor-pointer p-space-xs rounded-lg hover:bg-surface-container transition-colors">
                    <input
                      type="checkbox"
                      checked={checkboxes.gear}
                      onChange={() => handleCheckboxChange('gear')}
                      className="mt-1 w-5 h-5 rounded text-primary focus:ring-secondary accent-primary"
                    />
                    <div>
                      <span className="font-label-md text-label-md font-bold text-on-surface block">Receive training schedule / materials</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Provided at orientation</span>
                    </div>
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                    <span className="material-symbols-outlined text-base text-secondary">pin_drop</span>
                    {PATHWAY.trainingCenter}
                  </div>
                  <button className="px-space-md py-space-xs rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors">
                    Upload Missing Documents
                  </button>
                </div>
              </div>

              {/* STAGE 3 — Core Carpentry Training */}
              <div className="relative flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm opacity-95">
                <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-bold">3</div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider">MONTH 1–2 • STAGE 3</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">UPCOMING</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Carpentry & Woodworking Skill Training</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Build practical skills required for professional carpentry and furniture-related work.
                </p>
                <div className="mt-space-xs grid grid-cols-1 sm:grid-cols-2 gap-1 pt-space-xs">
                  {[
                    'Wood measurement & cutting',
                    'Hand and power tools',
                    'Joinery techniques',
                    'Furniture assembly',
                    'Surface preparation & finishing',
                    'Workplace safety',
                    'Material estimation',
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs text-outline">radio_button_unchecked</span>{m}
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 4 — Advanced Skill Development */}
              <div className="relative flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm opacity-95">
                <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-bold">4</div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider">MONTH 2–3 • STAGE 4</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">UPCOMING</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Advanced Carpentry & Finishing</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Develop higher-value skills that improve employability and support future self-employment.
                </p>
                <div className="mt-space-xs grid grid-cols-1 sm:grid-cols-2 gap-1 pt-space-xs">
                  {[
                    'Modular furniture basics',
                    'Advanced joinery',
                    'Polishing and finishing',
                    'Basic design interpretation',
                    'Material estimation',
                    'Customer requirement understanding',
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs text-outline">radio_button_unchecked</span>{m}
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 5 — Certification */}
              <div className="relative flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm opacity-95">
                <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-bold">5</div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider">UPCOMING • STAGE 5</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">UPCOMING</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Assessment & Certification</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Complete practical and theoretical assessment for the selected carpentry pathway.
                </p>
                <div className="mt-space-xs grid grid-cols-1 sm:grid-cols-2 gap-1 pt-space-xs">
                  {['Practical assessment', 'Theory assessment', 'Certification', 'Update skill profile'].map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs text-outline">radio_button_unchecked</span>{m}
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 6 — Employment / Self-Employment */}
              <div className="relative flex flex-col gap-space-sm bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-highest p-space-lg rounded-2xl shadow-md">
                <div className="absolute -left-6 sm:-left-8 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-sm font-bold">workspace_premium</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">UPCOMING • STAGE 6</span>
                  <span className="px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">shield</span>
                    UPCOMING
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Employment & Livelihood Transition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                  <div className="bg-surface-container-lowest p-space-md rounded-xl space-y-1">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Employment</span>
                    {['Furniture workshop', 'Construction/interior contractor', 'Carpenter job', 'Manufacturing unit'].map((o, i) => (
                      <div key={i} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface">
                        <span className="material-symbols-outlined text-xs text-secondary">arrow_right</span>{o}
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface-container-lowest p-space-md rounded-xl space-y-1">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant">Self-Employment</span>
                    {['Local carpentry service', 'Furniture repair', 'Custom furniture', 'Small carpentry workshop'].map((o, i) => (
                      <div key={i} className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface">
                        <span className="material-symbols-outlined text-xs text-secondary">arrow_right</span>{o}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STAGE 7 — Follow-up */}
              <div className="relative flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-2xl shadow-sm opacity-90">
                <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md text-label-md font-bold">7</div>
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant tracking-wider">ONGOING • STAGE 7</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">FOLLOW-UP</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Livelihood Follow-up</h3>
                <div className="mt-space-xs flex flex-wrap gap-2 pt-space-xs">
                  {['Employment status', 'Monthly income', 'Self-employment status', 'Customer/work activity', 'Additional training needs'].map((t, i) => (
                    <span key={i} className="px-space-sm py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-space-md">

            {/* Pathway Info Card */}
            <div className="bg-surface-container-low p-space-lg rounded-2xl shadow-sm space-y-space-md">
              <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wide">Pathway Summary</span>
              <div className="space-y-space-sm">
                {[
                  { label: 'Current Skill Area',  value: PATHWAY.currentSkill,  icon: 'handyman' },
                  { label: 'Target Pathway',       value: PATHWAY.targetRole,    icon: 'business_center' },
                  { label: 'Skill Gap',            value: 'Advanced joinery, Finishing, Power-tool operation', icon: 'build' },
                  { label: 'Training',             value: '3 Months',            icon: 'schedule' },
                  { label: 'Next Action',          value: 'Confirm training enrollment', icon: 'pending_actions' },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-base mt-0.5">{row.icon}</span>
                    <div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block">{row.label}</span>
                      <span className="font-label-md text-label-md font-bold text-primary">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Officer */}
            <div className="bg-surface-container-low p-space-lg rounded-2xl shadow-sm space-y-space-md">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wide">Dedicated Support</span>
                <span className="flex items-center gap-1 font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> District Cell
                </span>
              </div>
              <div className="flex items-start gap-space-sm">
                <img
                  className="w-14 h-14 rounded-full object-cover shadow-sm shrink-0"
                  alt="Manoj Verma"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAclLtcq2iQuUDUD4hnx9kOcGA6dJzROFVmOtHGhLnbpyEEBfTB7QDySJwKrb7tWD-zVu-a-emcubSsHOvCpEnMph69P8DAsmvO0FsV4Y_OcmB7fETnNeymXBHr0GaFTXcMkc1dJBPxjitnKrvvjPZ7hB1lny1d9P7PX4XHGThZ3qomGwcj3xyn2LH7Q1QkCer1n__C2O3Uw6ZRoQTi_9RrIxiO-Semgr07Eiv7GWjlWjq4GcCtC_Lx"
                />
                <div className="space-y-0.5">
                  <h4 className="font-headline-sm text-headline-sm text-primary">Manoj Verma</h4>
                  <p className="font-label-md text-label-md text-on-surface-variant">District Livelihood Field Officer</p>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">PM-AJAY Taskforce, {district}</span>
                </div>
              </div>
              <div className="bg-surface-container p-space-sm rounded-xl space-y-space-xs text-on-surface font-label-md text-label-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-base">call</span>
                  <span>+91 94158 XXXXX</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-base">calendar_month</span>
                  <span>Available: Gram Panchayat {district} on Tuesdays</span>
                </div>
              </div>
              <div className="flex gap-space-sm">
                <button className="flex-1 py-space-sm rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-base">call</span> Call Officer
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Voice Toast */}
      {showVoiceToast && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-primary text-on-primary p-space-md rounded-2xl shadow-2xl z-50 flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 animate-pulse">
            <span className="material-symbols-outlined text-lg">mic</span>
          </div>
          <div className="flex-1">
            <span className="font-label-md text-label-md font-bold block">Listening in Hindi / Awadhi...</span>
            <span className="font-label-sm text-label-sm text-surface-container-high">"Bol kar apna seat confirm karein"</span>
          </div>
          <button className="p-1 text-surface-container-high hover:text-on-primary" onClick={() => setShowVoiceToast(false)}>
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
