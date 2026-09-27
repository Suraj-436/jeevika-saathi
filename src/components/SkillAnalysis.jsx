import React from "react";
import { Award, CheckCircle2, AlertCircle, TrendingUp, Sparkles, BarChart2 } from "lucide-react";

export default function SkillAnalysis({ darkMode, onStartVoice }) {
  const competencies = [
    { title: "Manual Leather Cutting & Stitching", level: "Experienced (Informal)", score: 85, status: "RPL Eligible" },
    { title: "Modern Pattern Grading & CAD/CAM", level: "Skill Gap (Zero Exposure)", score: 15, status: "Priority Training" },
    { title: "Basic Electrical Tool Usage", level: "Basic Familiarity", score: 40, status: "Foundation Ready" },
    { title: "Solar Inverter & Wiring Safety", level: "Skill Gap (Zero Exposure)", score: 10, status: "Priority Training" },
    { title: "Digital Payments & UPI Accounting", level: "Functional Literacy", score: 65, status: "Enterprise Ready" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className={`rounded-xl p-6 border transition-colors ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Diagnostic Assessment
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              Skill Gap & RPL Diagnostic Report
            </h2>
            <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] mt-1">
              Comparing beneficiary's informal artisan heritage against NSQF National Occupational Standards (NOS).
            </p>
          </div>

          <button
            onClick={onStartVoice}
            className="px-4 py-2.5 rounded-xl bg-[#0b3822] hover:bg-[#0e472c] text-white text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
          >
            Re-run Voice Diagnostic
          </button>
        </div>
      </div>

      {/* Competency Gap Breakdown */}
      <div className={`rounded-xl p-6 border space-y-4 ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
      }`}>
        <h3 className="font-bold text-sm uppercase tracking-wider text-[#78716c] dark:text-[#a1a1aa]">
          Competency Gap Evaluation
        </h3>

        <div className="space-y-4">
          {competencies.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{c.title}</span>
                  <span className="text-[11px] text-[#78716c] dark:text-[#a1a1aa]">({c.level})</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.status === "RPL Eligible" 
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                    : c.status === "Enterprise Ready"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}>
                  {c.status}
                </span>
              </div>

              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    c.score > 70 
                      ? "bg-emerald-500" 
                      : c.score > 35 
                        ? "bg-blue-500" 
                        : "bg-amber-500"
                  }`} 
                  style={{ width: `${c.score}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2 Outcome Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className={`rounded-xl p-5 border space-y-2 ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
        }`}>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={16} />
            <span>High Recognition of Prior Learning (RPL)</span>
          </div>
          <p className="text-[#78716c] dark:text-[#a1a1aa] leading-relaxed">
            Beneficiary's 5+ years of family handcrafted shoe experience allows fast-track 160-hour certification in Footwear Upper Stitching rather than a full 600-hour novice course.
          </p>
        </div>

        <div className={`rounded-xl p-5 border space-y-2 ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
        }`}>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <TrendingUp size={16} />
            <span>Economic Mobility Pathway</span>
          </div>
          <p className="text-[#78716c] dark:text-[#a1a1aa] leading-relaxed">
            Bridging the gap in mechanized stitching & solar electricals increases projected monthly income from ₹6,000 to ₹18,000+ with micro-enterprise toolkit support.
          </p>
        </div>
      </div>
    </div>
  );
}
