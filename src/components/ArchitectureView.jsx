import React from "react";
import { Phone, MessageSquare, Smartphone, Monitor, Cpu, Network, ShieldCheck, Database } from "lucide-react";

export default function ArchitectureView({ darkMode }) {
  const channels = [
    { title: "IVR Feature Phone", icon: Phone, color: "text-blue-400", desc: "Toll-free 1800 number with DTMF backup for basic non-smartphones in deep rural blocks." },
    { title: "WhatsApp Voice Notes", icon: MessageSquare, color: "text-emerald-400", desc: "Meta Cloud API v19.0. Users send simple voice notes in regional dialects and receive voice responses." },
    { title: "Lightweight Android PWA", icon: Smartphone, color: "text-purple-400", desc: "Under 15MB footprint optimized for ₹3,000 low-cost handsets with offline-first voice caching." },
    { title: "CSC / Kiosk Portal", icon: Monitor, color: "text-amber-400", desc: "Facilitated mode for Village Level Entrepreneurs (VLEs) at Common Service Centers." },
  ];

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Full System Blueprint
        </span>
        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mt-1 ${
          darkMode ? "text-white" : "text-[#1d1d1f]"
        }`}>
          Architected for Inclusivity.
        </h2>
        <p className={`text-sm mt-1 max-w-2xl ${
          darkMode ? "text-[#86868b]" : "text-[#6e6e73]"
        }`}>
          Solving ground-level digital literacy barriers through natural speech, edge resilience, and transparent MIS tracking.
        </p>
      </div>

      {/* 4 Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {channels.map((ch, idx) => {
          const IconComponent = ch.icon;

          return (
            <div
              key={idx}
              className={`rounded-[26px] p-6 border transition-all ${
                darkMode ? "bg-[#0c0c0f] border-[#222228] text-white" : "bg-white border-[#e5e5ea] text-[#1d1d1f] shadow-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <IconComponent size={20} className={ch.color} />
              </div>
              <h3 className="font-bold text-base tracking-tight mb-1.5">{ch.title}</h3>
              <p className={`text-xs leading-relaxed ${darkMode ? "text-[#86868b]" : "text-[#6e6e73]"}`}>
                {ch.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Core AI Pipeline */}
      <div className={`rounded-[32px] p-8 border ${
        darkMode ? "bg-[#0a0a0d] border-[#222228] text-white" : "bg-white border-[#e5e5ea] text-black shadow-sm"
      }`}>
        <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <Cpu size={20} className="text-blue-500" />
          Multi-Stage AI Reasoning Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${darkMode ? "bg-[#121216] border-[#25252d]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">STAGE 1</span>
            <h4 className="font-bold text-sm mt-2 mb-1">Acoustic STT</h4>
            <p className="text-xs opacity-70">Whisper large-v3 fine-tuned on IndicASR with Bhojpuri, Bundeli & Chhattisgarhi dialect models.</p>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? "bg-[#121216] border-[#25252d]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold">STAGE 2</span>
            <h4 className="font-bold text-sm mt-2 mb-1">Empathetic NLU</h4>
            <p className="text-xs opacity-70">Extracts traditional caste heritage, current income strain, and education without bureaucratic friction.</p>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? "bg-[#121216] border-[#25252d]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">STAGE 3</span>
            <h4 className="font-bold text-sm mt-2 mb-1">6-Factor NSQF Match</h4>
            <p className="text-xs opacity-70">Weighted scoring linking candidate constraints to district labor demand, stipend viability, and self-employment.</p>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? "bg-[#121216] border-[#25252d]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">STAGE 4</span>
            <h4 className="font-bold text-sm mt-2 mb-1">Neural Regional TTS</h4>
            <p className="text-xs opacity-70">High-prosody natural voice synthesis in Hindi, Tamil, Telugu, Marathi, etc. with telephony optimization.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
