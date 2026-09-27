import React from "react";
import { User, CheckCircle2, ShieldCheck, MapPin, GraduationCap, Briefcase, IndianRupee, HeartHandshake } from "lucide-react";

export default function LivelihoodProfile({ darkMode, userProfile }) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className={`rounded-xl p-6 border transition-colors ${
        darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#0b3822] text-white font-bold text-xl flex items-center justify-center shadow-sm">
              {userProfile?.initials || "RK"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{userProfile?.name || "Beneficiary"}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  VERIFIED BENEFICIARY
                </span>
              </div>
              <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] mt-0.5">
                PM-AJAY Sovereign ID: <span className="font-mono font-semibold">PMAJAY-2026-UP-8492</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#78716c] dark:text-[#a1a1aa] block">GIA Component Eligibility</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              100% Course Fee Sponsored + DBT Stipend
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Verified Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Section 1: Demographics & Identity */}
        <div className={`rounded-xl p-5 border space-y-3 ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
        }`}>
          <h3 className="font-bold text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck size={16} />
            <span>Identity & Demographics</span>
          </h3>

          <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Full Name</span>
              <span className="font-semibold">{userProfile?.name || "Beneficiary"}</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Age / Gender</span>
              <span className="font-semibold">{userProfile?.age || "28"} Years / Male</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Social Category</span>
              <span className="font-semibold text-amber-500">Scheduled Caste (SC)</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Sub-Community / Caste</span>
              <span className="font-semibold">Chamar (Traditional Leather Artisan)</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Registered Mobile</span>
              <span className="font-semibold font-mono">{userProfile?.phone || "+91 98765 43210"}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Regional & Mobility Constraints */}
        <div className={`rounded-xl p-5 border space-y-3 ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
        }`}>
          <h3 className="font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <MapPin size={16} />
            <span>Region & Travel Radius</span>
          </h3>

          <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">State</span>
              <span className="font-semibold">Uttar Pradesh</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">District</span>
              <span className="font-semibold">Agra</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Block / Panchayat</span>
              <span className="font-semibold">Bichpuri Block</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Maximum Travel Radius</span>
              <span className="font-semibold text-emerald-500">Up to 15 km daily</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Physical Constraints</span>
              <span className="font-semibold">None (Fit for moderate work)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Education & Heritage */}
        <div className={`rounded-xl p-5 border space-y-3 ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
        }`}>
          <h3 className="font-bold text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <GraduationCap size={16} />
            <span>Education & Traditional Occupation</span>
          </h3>

          <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Formal Education Level</span>
              <span className="font-semibold">Class 8 Pass (Upper Primary)</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">NSQF Entry Level Compatibility</span>
              <span className="font-semibold text-blue-500">NSQF Level 1 to Level 4 (with RPL)</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Family Traditional Trade</span>
              <span className="font-semibold text-amber-500">Footwear Stitching & Leather Work</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Informal Apprenticeship</span>
              <span className="font-semibold">5+ Years Family Handcrafted Experience</span>
            </div>
          </div>
        </div>

        {/* Section 4: Livelihood & Economic Reality */}
        <div className={`rounded-xl p-5 border space-y-3 ${
          darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4]"
        }`}>
          <h3 className="font-bold text-sm uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <IndianRupee size={16} />
            <span>Current Work & Economic Baseline</span>
          </h3>

          <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Current Occupation</span>
              <span className="font-semibold">Informal Shoe Repair / Daily Wage Labor</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Current Monthly Earnings</span>
              <span className="font-semibold text-rose-500">₹5,000 – ₹7,000 / month</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Target Post-Skilling Income</span>
              <span className="font-semibold text-emerald-500">₹14,000 – ₹25,000 / month</span>
            </div>
            <div className="flex justify-between pt-1.5">
              <span className="text-[#78716c] dark:text-[#a1a1aa]">Aspiration Goal</span>
              <span className="font-semibold">Self-Employment (Micro-Enterprise Workshop)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

