import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MatchExplanation() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md lg:px-space-xl py-space-lg max-w-7xl mx-auto w-full space-y-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="max-w-3xl space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              Explainable AI Transparency Engine • Model v4.8
            </div>
            <h1 className="font-display-hero text-display-hero text-primary tracking-tight">Match Explanation Breakdown</h1>
            <p className="font-body-xl text-body-xl text-on-surface-variant leading-relaxed">
              Transparent, multi-dimensional reasoning behind why <strong>Solar PV Rooftop Installer (NSQF Level 4)</strong> was assigned a <strong>94% Fit Score</strong> for Beneficiary.
            </p>
          </div>
          <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-2xl shadow-sm">
            <button 
              className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              onClick={() => navigate('/voice')}
            >
              <span className="material-symbols-outlined text-headline-sm">volume_up</span>
            </button>
            <div className="flex flex-col pr-space-sm">
              <span className="font-label-md text-label-md text-primary font-bold">Listen in Hindi</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Tap to play audio reasoning</span>
            </div>
          </div>
        </div>

        {/* Beneficiary Snapshot */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-md p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/20">
          <div className="flex items-center gap-space-md">
            <img 
              className="w-16 h-16 rounded-xl object-cover shadow-sm" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATLHy2_wDTne7E49M6dthK_Hsb6GOtEPBy9kZus8lm73QtpiPfEmD-YZX88fnG9OdhGDLg62O0zv3QSn73YhvtGF2Sk1t2O3iPJ1mLoVl7U5G7I2QRZt46ePC4tm88XkzX9mKM3j6l0pVeIKwEDRNGNbXtj7FcwX4dMtSdfMDr1Nif1GSYKOtccDoZcNiJhHvo7-vrso7UoCSYxHA6dNkHF69ZoFOxxfZXB4o73XpyMQTPBNBeoMFS" 
              alt="Beneficiary"
            />
            <div>
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Beneficiary</h2>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">94% Fit</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">Shivpur, Barabanki • Age 23 • 12th Pass Verified</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-space-xs">
            <span className="px-space-sm py-space-xs rounded-xl bg-surface-container-low font-label-md text-label-md text-primary font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-secondary text-base">verified</span> Prior Wiring Skills</span>
            <span className="px-space-sm py-space-xs rounded-xl bg-surface-container-low font-label-md text-label-md text-primary font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-secondary text-base">near_me</span> 8.2 km Commute</span>
            <span className="px-space-sm py-space-xs rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-bold flex items-center gap-1"><span className="material-symbols-outlined text-base">payments</span> ₹8,000 Stipend</span>
          </div>
        </div>

        {/* 4 Core Pillars of AI Decision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <div className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-10 h-10 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">1</span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">Skill Congruence</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-xs">Verified Baseline Alignment (94%)</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                Beneficiary holds prior informal experience in domestic household wiring and appliance repair. Solar PV string inverter diagnosis requires only <strong>18% net delta training</strong>, minimizing learning friction.
              </p>
            </div>
            <div className="w-full bg-surface-container-low rounded-xl p-space-sm">
              <div className="flex justify-between font-label-sm text-label-sm mb-1"><span className="text-primary font-bold">Transferable Knowledge</span><span className="text-secondary font-bold">82% Baseline</span></div>
              <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: '82%' }}></div></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-10 h-10 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-lg">2</span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">Market Absorption</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-xs">Surya Ghar District Demand (4.2x Deficit)</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                PM Surya Ghar has sanctioned 1,420 rooftop solar installations across Barabanki district for Q3–Q4. Local certified technicians currently face a <strong>4.2x demand deficit</strong> in the Shivpur cluster.
              </p>
            </div>
            <div className="w-full bg-surface-container-low rounded-xl p-space-sm">
              <div className="flex justify-between font-label-sm text-label-sm mb-1"><span className="text-primary font-bold">Barabanki Sanctioned Units</span><span className="text-on-tertiary-container font-bold">1,420 Rooftops</span></div>
              <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-on-tertiary-container rounded-full" style={{ width: '92%' }}></div></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-10 h-10 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">3</span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary-container text-on-primary font-bold">Transit & Mobility</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-xs">Commute Resilience (8.2 km)</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                The training center at ITI Barabanki (Naka Satrikh Road) connects directly via UPSRTC Rural Route 14. Daily transit cost is ₹12, fully covered under the <strong>PM-AJAY ₹8,000 monthly stipend</strong>.
              </p>
            </div>
            <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between">
              <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-secondary text-sm">directions_bus</span> UPSRTC Route 14</span>
              <span className="font-label-sm text-label-sm text-secondary font-bold">25 min travel time</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-lg">4</span>
                <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">Economic Outcome</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold mb-space-xs">Financial Trajectory & Placement</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                Guaranteed ₹8,000/month stipend during 60-day NSQF Level 4 training, followed by verified placement with an expected income of <strong>₹18,500/month</strong> in renewable energy maintenance.
              </p>
            </div>
            <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between">
              <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-secondary text-sm">trending_up</span> Expected Starting Wage</span>
              <span className="font-label-md text-label-md text-primary font-bold">₹18,500 / month</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-space-md bg-primary-container text-on-primary p-space-lg rounded-3xl shadow-md">
          <div className="flex items-center gap-space-md">
            <span className="material-symbols-outlined text-3xl text-tertiary-fixed">verified</span>
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-surface">Ready to proceed with this pathway?</h4>
              <p className="font-body-md text-body-md text-primary-fixed-dim">Follow The beneficiary's step-by-step 60-day roadmap to certification.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button 
              className="px-space-lg py-space-sm rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg font-bold hover:bg-tertiary-fixed-dim transition-colors shadow"
              onClick={() => navigate('/roadmap')}
            >
              View Livelihood Roadmap
            </button>
            <button 
              className="px-space-md py-space-sm rounded-xl bg-surface-container-lowest/20 text-surface hover:bg-surface-container-lowest/30 transition-colors font-label-md text-label-md font-semibold"
              onClick={() => navigate('/recommendations')}
            >
              Back to Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

