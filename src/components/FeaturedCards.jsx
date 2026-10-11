import React from "react";
import { ArrowUpRight, Zap, ShieldCheck, Award, TrendingUp } from "lucide-react";

export default function FeaturedCards({ darkMode, onSelectTrade }) {
  const cards = [
    {
      id: "nsqf-002",
      badge: "HIGH REGIONAL DEMAND",
      badgeColor: "text-amber-400",
      title: "Solar & Domestic Electrician",
      tagline: "Empowering 50,000 SC youth under PM Surya Ghar Muft Bijli Yojana.",
      duration: "200 Hours • NSQF Level 3",
      stipend: "100% GIA Sponsored + ₹3,000/mo allowance",
      earning: "₹15,000 – ₹28,000/mo",
      theme: "dark", // Always bold dark card like Apple
      bgStyle: darkMode 
        ? "bg-[#0b0b0e] border-[#222228]" 
        : "bg-[#111114] border-black text-white",
      gradientBlob: "from-amber-500/20 via-orange-500/10 to-transparent",
      icon: Zap
    },
    {
      id: "nsqf-003",
      badge: "HERITAGE TRANSFORMATION",
      badgeColor: darkMode ? "text-orange-400" : "text-orange-600",
      title: "Footwear & Leather Artisan 2.0",
      tagline: "Mechanized CAD/CAM pattern design for traditional leather artisans.",
      duration: "160 Hours • NSQF Level 3",
      stipend: "Tool Kit + ₹4,000/mo sustenance",
      earning: "₹14,000 – ₹26,000/mo",
      theme: "adaptive",
      bgStyle: darkMode 
        ? "bg-[#0b0b0e] border-[#222228] text-white" 
        : "bg-white border-[#e5e5ea] text-[#1d1d1f] shadow-sm",
      gradientBlob: "from-orange-500/15 via-pink-500/10 to-transparent",
      icon: Award
    },
    {
      id: "nsqf-005",
      badge: "GUARANTEED PLACEMENT",
      badgeColor: "text-emerald-400",
      title: "General Duty Assistant (Healthcare)",
      tagline: "Direct recruitment pathways in district hospitals & diagnostics.",
      duration: "360 Hours • NSQF Level 4",
      stipend: "Uniform & ₹4,500/mo hospital stipend",
      earning: "₹15,000 – ₹28,000/mo",
      theme: "dark",
      bgStyle: darkMode 
        ? "bg-[#0b0b0e] border-[#222228]" 
        : "bg-[#111114] border-black text-white",
      gradientBlob: "from-emerald-500/20 via-teal-500/10 to-transparent",
      icon: ShieldCheck
    }
  ];

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Apple-style section header: "The latest. Take a look at what's new." */}
      <div className="mb-6 flex items-baseline gap-2">
        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
          darkMode ? "text-white" : "text-[#1d1d1f]"
        }`}>
          The latest.
        </h2>
        <span className={`text-lg sm:text-2xl font-normal tracking-tight ${
          darkMode ? "text-[#86868b]" : "text-[#6e6e73]"
        }`}>
          Take a look at high-impact GIA trades.
        </span>
      </div>

      {/* 3 Large Apple Editorial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const IconComponent = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => onSelectTrade(card.id)}
              className={`rounded-[28px] p-7 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl cursor-pointer group min-h-[380px] ${card.bgStyle}`}
            >
              {/* Subtle background gradient glow */}
              <div className={`absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br ${card.gradientBlob} blur-2xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-60`} />

              {/* Top: Pill Badge & Headline */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold tracking-wider uppercase ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <IconComponent size={16} className={card.badgeColor} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold tracking-tight leading-snug mb-2">
                  {card.title}
                </h3>

                <p className={`text-sm leading-relaxed mb-4 ${
                  card.theme === "dark" || darkMode ? "text-[#a1a1a6]" : "text-[#6e6e73]"
                }`}>
                  {card.tagline}
                </p>
              </div>

              {/* Bottom Specs & CTA */}
              <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={card.theme === "dark" || darkMode ? "text-[#777]" : "text-[#888]"}>
                    Duration
                  </span>
                  <span className="font-medium">{card.duration}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={card.theme === "dark" || darkMode ? "text-[#777]" : "text-[#888]"}>
                    Average Income
                  </span>
                  <span className="font-semibold text-emerald-400">{card.earning}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={card.theme === "dark" || darkMode ? "text-[#777]" : "text-[#888]"}>
                    Support
                  </span>
                  <span className="font-medium truncate max-w-[180px] text-right">{card.stipend}</span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2997ff] group-hover:text-[#0077ed] inline-flex items-center gap-1">
                    <span>Explore Pathway</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                    GIA Component
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
