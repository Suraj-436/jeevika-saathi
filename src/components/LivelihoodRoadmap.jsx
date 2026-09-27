import React from "react";
import { Mic, Award, Building2, Briefcase, IndianRupee, CheckCircle2 } from "lucide-react";

export default function LivelihoodRoadmap({ darkMode, onStartVoice }) {
  const steps = [
    {
      step: 1,
      title: "Voice Intake & Heritage Mapping",
      subtitle: "Conversational intake in 8 Indian regional languages",
      status: "In Progress",
      details: "Captures traditional artisan background, education level, location, and aspirations without requiring paperwork.",
      icon: Mic,
      color: "border-blue-500 text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      step: 2,
      title: "Skill Gap & Diagnostics",
      subtitle: "RPL recognition and competency gap analysis",
      status: "Next Step",
      details: "Evaluates prior informal knowledge against National Occupational Standards (NOS) for fast-track certification.",
      icon: Award,
      color: "border-purple-500 text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      step: 3,
      title: "NSQF Lab Practical Skilling",
      subtitle: "Hands-on training with ₹3,500–₹4,500/mo DBT stipend",
      status: "Upcoming",
      details: "Full tuition sponsorship under PM-AJAY GIA at accredited district centers with industrial machinery.",
      icon: Building2,
      color: "border-emerald-500 text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      step: 4,
      title: "Job Link & Micro-Enterprise Toolkit",
      subtitle: "Guaranteed placement or tool kit capital",
      status: "Milestone",
      details: "Direct connection with industry employers or Mudra micro-loans to establish local service workshops.",
      icon: Briefcase,
      color: "border-amber-500 text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      step: 5,
      title: "Dignified Sustainable Livelihood",
      subtitle: "Tripling baseline monthly earnings",
      status: "Goal",
      details: "Transition from ₹5,000–₹7,000 informal daily labor to ₹15,000–₹25,000/month stable dignified family income.",
      icon: IndianRupee,
      color: "border-orange-500 text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl p-6 border transition-colors ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Sovereign Journey Pipeline
            </span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              5-Stage Livelihood Escalation Roadmap
            </h2>
            <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] mt-1">
              Guaranteed escalation pathway under the Grant-in-Aid component of PM-AJAY.
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 self-start md:self-auto">
            100% Zero Paperwork
          </span>
        </div>
      </div>

      {/* Steps Timeline Card */}
      <div className={`rounded-xl p-6 border space-y-6 ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
      }`}>
        <div className="relative border-l-2 border-emerald-500/30 ml-4 space-y-8 pl-6">
          {steps.map((st) => {
            const Icon = st.icon;

            return (
              <div key={st.step} className="relative group">
                {/* Step Circle on line */}
                <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-2 bg-[#0b3822] text-white flex items-center justify-center font-bold text-xs shadow-sm ${st.color}`}>
                  {st.step}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base tracking-tight">{st.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {st.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {st.subtitle}
                  </p>
                  <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] leading-relaxed pt-1">
                    {st.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onStartVoice}
            className="px-5 py-2.5 rounded bg-[#00337a] hover:bg-[#002255] text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed with Voice Intake</span>
          </button>
        </div>
      </div>
    </div>
  );
}
