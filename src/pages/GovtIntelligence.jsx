import React, { useState } from 'react';

export default function GovtIntelligence() {
  const [activeTab, setActiveTab] = useState('dialect');

  return (
    <div className="flex flex-col w-full">
      {/* Telemetry Header */}
      <div className="w-full bg-primary text-on-primary px-space-lg lg:px-space-xl py-space-sm flex flex-col md:flex-row md:items-center md:justify-between gap-space-xs shadow-md">
        <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-label-sm font-label-sm tracking-wide">
          <span className="flex items-center gap-1.5 text-secondary-fixed">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
            <span className="font-bold">LIVE TELEMETRY</span>
          </span>
          <span className="text-outline-variant/60">•</span>
          <span className="text-on-primary/90"><strong className="text-on-primary">District:</strong> Barabanki, Uttar Pradesh</span>
          <span className="text-outline-variant/60">•</span>
          <span className="text-on-primary/90"><strong class="text-on-primary">Cluster:</strong> Awadh Central</span>
          <span className="text-outline-variant/60">•</span>
          <span className="text-on-primary/75">Data Sync: Live (Updated 4 mins ago)</span>
        </div>
        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <span className="bg-tertiary-container/80 text-on-tertiary-container px-space-xs py-0.5 rounded text-label-sm font-label-sm font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">shield</span>
            SIH 2026 Sandbox • PM-AJAY Cell
          </span>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="w-full px-space-lg lg:px-space-xl py-space-xl flex flex-col gap-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-space-xs text-secondary mb-1">
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest font-bold">Policy & Executive Oversight Portal</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">PM-AJAY Livelihood Intelligence</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Real-time administrative telemetry on beneficiary voice assessments, NSQF training pipelines, and sustainable placement outcomes across Uttar Pradesh rural clusters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="relative inline-flex items-center bg-surface-container rounded-xl p-1 shadow-sm">
              <button 
                className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg text-label-md font-label-md transition-all ${
                  activeTab === 'dialect' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant'
                }`}
                onClick={() => setActiveTab('dialect')}
              >
                <span className="material-symbols-outlined text-sm text-secondary">record_voice_over</span>
                <span>Dialect Telemetry</span>
              </button>
              <button 
                className={`flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg text-label-md font-label-md transition-all ${
                  activeTab === 'components' ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant'
                }`}
                onClick={() => setActiveTab('components')}
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Sub-Components</span>
              </button>
            </div>
            <div className="flex items-center gap-space-xs">
              <button className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-md transition-all">
                <span className="material-symbols-outlined text-base">download</span>
                <span>Export Report (PDF/CSV)</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Assessed</span>
              <span className="p-1 rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-base">mic</span>
              </span>
            </div>
            <div className="my-space-xs">
              <div className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">12,450</div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Beneficiaries via Voice AI</p>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+18.4% this month</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Enrolled</span>
              <span className="p-1 rounded-lg bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-base">how_to_reg</span>
              </span>
            </div>
            <div className="my-space-xs">
              <div className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">8,320</div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">NSQF Cohort Intake</p>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              <span>66.8% intake rate</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Certified</span>
              <span className="p-1 rounded-lg bg-surface-container text-primary-container">
                <span className="material-symbols-outlined text-base">workspace_premium</span>
              </span>
            </div>
            <div className="my-space-xs">
              <div className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">6,940</div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Assessed & Passed</p>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>83.4% completion</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Placed</span>
              <span className="p-1 rounded-lg bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-base">work</span>
              </span>
            </div>
            <div className="my-space-xs">
              <div className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">5,180</div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Wage Employment</p>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>74.6% placement</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Enterprises</span>
              <span className="p-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed">
                <span className="material-symbols-outlined text-base">storefront</span>
              </span>
            </div>
            <div className="my-space-xs">
              <div className="font-display-hero-mobile text-display-hero-mobile text-primary font-bold tracking-tight">1,240</div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">PMEGP Seed Linked</p>
            </div>
            <div className="flex items-center gap-1 text-on-tertiary-container font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-sm">currency_rupee</span>
              <span>₹3.4 Cr Disbursed</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">Dropout Rate</span>
              <span className="p-1 rounded-lg bg-surface-container-high text-primary">
                <span className="material-symbols-outlined text-base">trending_down</span>
              </span>
            </div>
            <div className="my-space-xs">
              <div className="font-display-hero-mobile text-display-hero-mobile text-secondary font-bold tracking-tight">11.4%</div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Down from 24.2%</p>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-sm">shield_with_heart</span>
              <span>-12.8% pre-voice AI</span>
            </div>
          </div>
        </div>

        {/* Funnel Box */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">account_tree</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">Sovereign Intake & Placement Conversion Funnel</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Live beneficiary progression through PM-AJAY skill verification milestone gates</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-space-sm relative">
            <div className="bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>STAGE 01</span>
                <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">100%</span>
              </div>
              <div className="my-space-md">
                <span className="font-label-md text-label-md font-bold text-primary block">Voice Assessment</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">12,450</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>STAGE 02</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold">87.5%</span>
              </div>
              <div className="my-space-md">
                <span className="font-label-md text-label-md font-bold text-primary block">Skill Mapped</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">10,890</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>STAGE 03</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold">66.8%</span>
              </div>
              <div className="my-space-md">
                <span className="font-label-md text-label-md font-bold text-primary block">Cohort Enrolled</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">8,320</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
                <span>STAGE 04</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold">55.7%</span>
              </div>
              <div className="my-space-md">
                <span className="font-label-md text-label-md font-bold text-primary block">Certified Passed</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">6,940</span>
              </div>
            </div>

            <div className="bg-primary-container text-on-primary rounded-xl p-space-md">
              <div className="flex items-center justify-between text-label-sm font-label-sm text-primary-fixed">
                <span className="uppercase tracking-wider font-bold">SUCCESS STAGE</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold">51.6%</span>
              </div>
              <div className="my-space-md">
                <span className="font-label-md text-label-md font-bold text-surface-bright block">Sustained Livelihood</span>
                <span className="font-headline-md text-headline-md text-surface-bright font-bold">6,420</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
