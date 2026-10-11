import React from "react";
import { 
  Mic, CheckCircle2, Award, Building2, 
  Wallet, FileText, Calendar, Sparkles, ShieldCheck 
} from "lucide-react";

export default function HomeOverview({ darkMode, onStartVoice, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Prime Hero Banner: Voice Assessment Callout */}
      <div className="rounded-2xl p-6 sm:p-8 bg-[#0b3822] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm border border-emerald-600/30">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PM-AJAY Grant-in-Aid (GIA) Component</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            Complete your Voice-Assisted NSQF Assessment
          </h2>

          <p className="text-sm text-emerald-100/85 mt-2 leading-relaxed">
            No complex written forms. Speak naturally in your native language (Hindi, Tamil, Telugu, etc.) to identify NSQF-certified skill courses, monthly stipends, and local enterprise opportunities.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={onStartVoice}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Mic size={16} />
              <span>Start Voice Assessment Now</span>
            </button>

            <span className="text-xs text-emerald-200">
              Average time: 5–7 minutes • 100% Free
            </span>
          </div>
        </div>

        {/* Quick Progress Badge Box */}
        <div className="rounded-xl p-5 bg-white/10 border border-white/15 w-full md:w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-emerald-200 font-medium">Your Profile Status</span>
            <span className="font-bold text-amber-400">Phase 1 of 5</span>
          </div>

          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-amber-400 rounded-full w-1/4" />
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-100">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Identity Verified (Aadhaar)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>SC Category Certified</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <span className="w-3.5 h-3.5 rounded-full border border-amber-400 flex items-center justify-center text-[9px]">3</span>
              <span>Voice Profiling Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Key Operational Pillars (8px Grid, Clean Government Public Service Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Monthly Stipend & DBT */}
        <div className={`rounded-xl p-5 border transition-colors ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Direct Benefit Transfer
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <h3 className="font-bold text-base tracking-tight mb-1">
            ₹3,500 to ₹4,500 / Month
          </h3>
          <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] leading-relaxed">
            Direct monthly stipend during training under PM-AJAY GIA for lodging, transport, and family sustenance.
          </p>
        </div>

        {/* Pillar 2: NSQF Level 1 to 5 Certification */}
        <div className={`rounded-xl p-5 border transition-colors ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Government Certification
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <h3 className="font-bold text-base tracking-tight mb-1">
            Nationally Recognized NSQF
          </h3>
          <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] leading-relaxed">
            Certified qualification packs (QP) under National Skill Development Corporation with direct industry validity.
          </p>
        </div>

        {/* Pillar 3: District Training Partner Centers */}
        <div className={`rounded-xl p-5 border transition-colors ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Local Accessibility
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <h3 className="font-bold text-base tracking-tight mb-1">
            1,420+ Accredited Centers
          </h3>
          <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] leading-relaxed">
            District-level skill institutes and PMKK centers ensuring maximum 15 km travel radius for rural youth.
          </p>
        </div>
      </div>

      {/* Quick Access Action Row */}
      <div className={`rounded-xl p-5 border ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
      }`}>
        <h3 className="font-bold text-sm uppercase tracking-wider text-[#78716c] dark:text-[#a1a1aa] mb-4">
          Quick Navigation
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("livelihood-profile")}
            className={`p-3 rounded-lg border text-left transition-all hover:border-emerald-500 ${
              darkMode ? "bg-[#141418] border-[#27272f]" : "bg-[#fcfaf7] border-[#e7e5e4]"
            }`}
          >
            <span className="font-bold text-xs block mb-0.5">My Profile</span>
            <span className="text-[11px] text-[#78716c] dark:text-[#a1a1aa]">View verified data</span>
          </button>

          <button
            onClick={() => onNavigate("skill-analysis")}
            className={`p-3 rounded-lg border text-left transition-all hover:border-emerald-500 ${
              darkMode ? "bg-[#141418] border-[#27272f]" : "bg-[#fcfaf7] border-[#e7e5e4]"
            }`}
          >
            <span className="font-bold text-xs block mb-0.5">Skill Gap Analysis</span>
            <span className="text-[11px] text-[#78716c] dark:text-[#a1a1aa]">Diagnose capabilities</span>
          </button>

          <button
            onClick={() => onNavigate("recommendations")}
            className={`p-3 rounded-lg border text-left transition-all hover:border-emerald-500 ${
              darkMode ? "bg-[#141418] border-[#27272f]" : "bg-[#fcfaf7] border-[#e7e5e4]"
            }`}
          >
            <span className="font-bold text-xs block mb-0.5">Matched Trades</span>
            <span className="text-[11px] text-[#78716c] dark:text-[#a1a1aa]">Explore 10 NSQF paths</span>
          </button>

          <button
            onClick={() => onNavigate("nearby-opportunities")}
            className={`p-3 rounded-lg border text-left transition-all hover:border-emerald-500 ${
              darkMode ? "bg-[#141418] border-[#27272f]" : "bg-[#fcfaf7] border-[#e7e5e4]"
            }`}
          >
            <span className="font-bold text-xs block mb-0.5">Training Centers</span>
            <span className="text-[11px] text-[#78716c] dark:text-[#a1a1aa]">Agra & district partners</span>
          </button>
        </div>
      </div>
    </div>
  );
}
