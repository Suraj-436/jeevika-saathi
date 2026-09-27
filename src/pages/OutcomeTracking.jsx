import React from 'react';

export default function OutcomeTracking() {
  const triggerVoiceAssistance = () => {
    alert("Playing audio progress overview for Beneficiary...");
  };

  const downloadTranscript = () => {
    alert("Downloading Sovereign Transcript (PDF)...");
  };

  const copyAuditHash = () => {
    navigator.clipboard.writeText("8F2A-UPBRB-9082-2026");
    alert("Audit Hash copied to clipboard!");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden px-space-lg lg:px-space-xl py-space-lg flex flex-col gap-space-xl">
        <div className="absolute -top-32 right-12 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="absolute top-96 left-4 w-80 h-80 rounded-full bg-tertiary-fixed/25 blur-3xl pointer-events-none"></div>

        {/* Beneficiary Status Bar */}
        <section className="relative z-10 w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-md lg:p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="relative">
              <img 
                className="w-16 h-16 rounded-xl object-cover shadow-sm" 
                alt="Beneficiary"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOF5QpfsmF-MRFIqwGxnA8gIns-v3MZ59xbj3-BqWbrp1O5e1aYrOc_ld5lzaUUyp-iXfz8LBKoksjMKr6XZrpeepfJdklPnRnuKta0COphvjoCkMdmvZIASfGdXgeJDNESMBeXxBRS18z7ULE-pTy6YUpgnHMBxVeL2RzVkSMHa56nB8bQuOaSqhpTG4R0ZXMYot1yU6-QcBkrMzaSGYxSZmuLXx03RiQs9vrfmaGBITydjfybW7W"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold shadow-sm">✓</span>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-primary">Beneficiary</span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono">ID: UP-BRB-2026-9082A</span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary-container text-on-primary font-bold">Stage 4 Active</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                ITI Barabanki Centre • PM-AJAY Livelihood Corridor • Solar PV Rooftop Specialist
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex flex-col bg-surface-container-low px-space-md py-space-xs rounded-xl">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Aadhaar Linked DBT</span>
              <span className="font-label-lg text-label-lg text-secondary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-base">check_circle</span> PFMS Verified
              </span>
            </div>
            <div className="flex flex-col bg-surface-container-low px-space-md py-space-xs rounded-xl">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Attendance Index</span>
              <span className="font-label-lg text-label-lg text-primary font-bold">96.4% <span className="font-label-sm text-label-sm text-secondary font-medium">(Day 22/60)</span></span>
            </div>
            <button 
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-all" 
              onClick={triggerVoiceAssistance}
            >
              <span className="material-symbols-outlined text-tertiary-container text-lg">record_voice_over</span>
              <span>Suno (Listen Progress)</span>
            </button>
          </div>
        </section>

        {/* Header & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Longitudinal Trajectory Tracker</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Real-time PM-AJAY Integration</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Livelihood Outcome Lifecycle</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-1">
              Longitudinal tracking of beneficiary training completion, certification credentials, wage progression, and sustained economic stability.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button 
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm hover:bg-surface-container transition-colors" 
              onClick={downloadTranscript}
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span>Sovereign Transcript</span>
            </button>
          </div>
        </div>

        {/* Milestones Pipeline */}
        <section className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-lg flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-2xl">timeline</span>
              <h2 className="font-headline-sm text-headline-sm text-primary">Outcome Milestones & Verification Gateway</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-space-sm relative">
            <div className="flex flex-col bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-secondary font-bold">STAGE 01</span>
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">Profile Synthesized</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">Awadhi voice intake completed. 91% neural confidence score verified.</p>
            </div>

            <div className="flex flex-col bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-secondary font-bold">STAGE 02</span>
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">Pathway Matched</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">Solar PV Rooftop Specialist with 92% local demand alignment.</p>
            </div>

            <div className="flex flex-col bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-secondary font-bold">STAGE 03</span>
                <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">Training Enrolled</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">ITI Barabanki, Batch #2026-UP-09. ₹8,000/mo DBT grant authorized.</p>
            </div>

            <div className="flex flex-col bg-primary text-on-primary rounded-xl p-space-md shadow-md ring-2 ring-secondary">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-secondary-fixed font-bold uppercase tracking-wider">STAGE 04 • LIVE</span>
                <span className="material-symbols-outlined text-secondary-fixed text-xl animate-pulse">autorenew</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-on-primary font-bold">Practical Lab Training</h3>
              <p className="font-body-md text-body-md text-primary-fixed text-xs mt-1">Day 22 of 60 in progress. Lab attendance 96.4%, practical rubric cleared.</p>
            </div>

            <div className="flex flex-col bg-surface-container rounded-xl p-space-md opacity-90">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-on-surface-variant font-bold">STAGE 05</span>
                <span className="material-symbols-outlined text-outline text-xl">event_available</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">NSQF Certified</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">Scheduled: 15 May 2026. Automated DigiLocker credential issuance.</p>
            </div>

            <div className="flex flex-col bg-surface-container rounded-xl p-space-md opacity-90">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-tertiary-container font-bold">STAGE 06</span>
                <span className="material-symbols-outlined text-on-tertiary-container text-xl">handshake</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">Placed / Self-Employed</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">Pre-secured offer with SuryaUrja EPC. ₹18,500/mo + PF/ESI benefits.</p>
            </div>

            <div className="flex flex-col bg-surface-container rounded-xl p-space-md opacity-80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm font-mono text-outline font-bold">STAGE 07</span>
                <span className="material-symbols-outlined text-outline text-xl">verified_user</span>
              </div>
              <h3 className="font-label-lg text-label-lg text-primary font-bold">180-Day Retention</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">Sustained life-coaching, wage audits, and Mudra Shishu loan linkage.</p>
            </div>
          </div>
        </section>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <section className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-2xl">account_balance_wallet</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">DBT Stipend Disbursement Ledger</h3>
                </div>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">Scheme Code: AJAY-STP-26</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Under PM-AJAY skill assistance guidelines, monthly sustenance stipends are deposited directly into Aadhaar-seeded Jan Dhan accounts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col bg-surface-container-low rounded-xl p-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-primary">Month 1 Stipend</span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">done_all</span> Credited
                    </span>
                  </div>
                  <div className="my-2">
                    <span className="font-headline-md text-headline-md text-primary font-bold">₹8,000.00</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mt-0.5">PFMS UTR: 994028114092 • 01 Apr 2026</span>
                  </div>
                  <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-sm">verified</span> Verified via Barabanki Gramin Bank
                  </div>
                </div>

                <div className="flex flex-col bg-surface-container rounded-xl p-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-primary">Month 2 Stipend</span>
                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">hourglass_top</span> Scheduled
                    </span>
                  </div>
                  <div className="my-2">
                    <span className="font-headline-md text-headline-md text-primary font-bold">₹8,000.00</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mt-0.5">Auto-disbursement on 01 May 2026</span>
                  </div>
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-sm">event_repeat</span> Condition: 85%+ biometric attendance (Current: 96.4%)
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-2xl">precision_manufacturing</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Lab Competency & Practical Evaluations</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-md text-body-md">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
                    <tr>
                      <th className="py-2.5 px-space-md rounded-l-lg">Skill Domain</th>
                      <th className="py-2.5 px-space-md">Mastery Level</th>
                      <th className="py-2.5 px-space-md">Instructor Assessment</th>
                      <th className="py-2.5 px-space-md rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    <tr className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-space-md font-bold text-primary">PV Module Stringing & Mounting</td>
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-secondary h-full w-[95%]"></div>
                          </div>
                          <span className="font-label-sm text-label-sm font-semibold">95%</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md text-on-surface-variant text-xs">Exemplary structural alignment on tilted roofs</td>
                      <td className="py-3 px-space-md">
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">Proficient</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-space-md font-bold text-primary">Grid Inverter Earthing & Cable Laying</td>
                      <td className="py-3 px-space-md">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-secondary h-full w-[70%]"></div>
                          </div>
                          <span className="font-label-sm text-label-sm font-semibold">70%</span>
                        </div>
                      </td>
                      <td className="py-3 px-space-md text-on-surface-variant text-xs">Dual grounding connections practiced; final signoff pending</td>
                      <td className="py-3 px-space-md">
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">In Training</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-lg flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-2xl">trending_up</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Wage Uplift Trajectory</h3>
                </div>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">3.2× Multiplier</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Documented baseline casual income versus guaranteed formal industry remuneration and self-employment ceilings.
              </p>

              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm">
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                  <span>Earnings Progression (INR / Month)</span>
                  <span className="text-secondary font-bold">Projected 3-Year Horizon</span>
                </div>
                <svg className="w-full h-36" viewBox="0 0 380 140" fill="none">
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.08" x1="10" x2="370" y1="20" y2="20"></line>
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.08" x1="10" x2="370" y1="60" y2="60"></line>
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.08" x1="10" x2="370" y1="100" y2="100"></line>
                  <path d="M 30 110 L 160 85 L 280 45 L 350 22 L 350 130 L 30 130 Z" fill="url(#incomeGrad)"></path>
                  <path d="M 30 110 L 160 85 L 280 45 L 350 22" stroke="#0a6a67" strokeLinecap="round" strokeWidth="3.5"></path>
                  <circle cx="30" cy="110" fill="#717973" r="5"></circle>
                  <circle cx="160" cy="85" fill="#133e2b" r="5"></circle>
                  <circle cx="280" cy="45" fill="#0a6a67" r="5"></circle>
                  <circle cx="350" cy="22" fill="#ec861d" r="6"></circle>
                  <text fill="#717973" fontSize="10" fontWeight="700" x="32" y="102">₹6,500</text>
                  <text fill="#133e2b" fontSize="10" fontWeight="700" x="145" y="75">₹8,000</text>
                  <text fill="#0a6a67" fontSize="11" fontWeight="700" x="250" y="38">₹18,500</text>
                  <text fill="#572c00" fontSize="11" fontWeight="800" x="295" y="18">₹32,000</text>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a2f0ec" stopOpacity="0.45"></stop>
                      <stop offset="100%" stopColor="#f8f3ea" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="space-y-space-sm mt-1">
                <div className="p-space-sm bg-surface-container rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-full bg-outline"></span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Pre-Program Baseline</h4>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Casual day laborer</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-lg text-label-lg font-bold text-on-surface">₹250/day</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">~₹6,500 / mo</span>
                  </div>
                </div>

                <div className="p-space-sm bg-secondary-container/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-secondary-container">Starting Placement Wage</h4>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">SuryaUrja EPC Tech</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-lg text-label-lg font-bold text-secondary">₹18,500 / mo</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">+ ESI / PF</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-2xl shadow-md p-space-lg flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
                <h4 className="font-headline-sm text-headline-sm text-primary">Assigned Saathi Facilitator</h4>
              </div>
              <div className="flex items-center gap-space-md pt-1">
                <img 
                  className="w-12 h-12 rounded-full object-cover" 
                  alt="Meera Devi"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfB-EH9Hjaz0gD37Cb4A6ScypSICoqb7IFTDSYk9Ffhb-R_GUAFklf7_-Kq4K_ZIZrpuewLZCQeeCxBwhkilayIlyURtVR4pq7z0USB8RKDB8mkxmSY6xDX8urp9ItQd5L7lhxwUbnezuwOfd6DN4kCwleIUlaMwKuHC3vONVeAQ2IlSgX6tk2l35xdSJxWPz5aqz7VKkvHP3IUQ02RP62VPHWEfaqLKNpEdCsX3GhmbTM0Vh1CJnP"
                />
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg font-bold text-primary">Meera Devi</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">District Field Coordinator, Barabanki</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="w-full bg-surface-container rounded-2xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-xl text-primary">assured_workload</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-primary font-bold">PM-AJAY Sovereign Guarantee Protocol</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Audited under Section 14 of the National Social Welfare Tracking Framework</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <span className="font-label-sm text-label-sm text-outline font-mono">HASH: 8F2A-UPBRB-9082-2026</span>
            <button className="font-label-sm text-label-sm px-space-xs py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold flex items-center gap-1" onClick={copyAuditHash}>
              <span className="material-symbols-outlined text-xs">content_copy</span> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

