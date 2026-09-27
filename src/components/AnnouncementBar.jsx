import React from "react";
import { ChevronRight, ArrowUpRight } from "lucide-react";

export default function AnnouncementBar({ darkMode, onCtaClick }) {
  return (
    <div className={`py-2 px-4 text-center text-xs tracking-tight transition-colors border-b ${
      darkMode 
        ? "bg-[#0a0a0c] text-[#a1a1a6] border-[#1c1c20]" 
        : "bg-[#f5f5f7] text-[#424245] border-[#e5e5ea]"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
        <span className="font-semibold text-blue-500 uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10">
          PM-AJAY GIA
        </span>
        <span>
          100% Grant-in-Aid sponsored skill training, monthly stipends, and enterprise support for SC community beneficiaries.
        </span>
        <button 
          onClick={onCtaClick}
          className="text-blue-500 hover:text-blue-400 font-medium inline-flex items-center gap-0.5 ml-1 transition-colors"
        >
          Explore guidelines <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
