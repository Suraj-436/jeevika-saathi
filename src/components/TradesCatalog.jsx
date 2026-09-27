import React, { useState } from "react";
import { Search, Filter, Zap, Award, Check, Sparkles, Building2, MapPin } from "lucide-react";
import { TRADES, CATEGORIES } from "../data/trades";

export default function TradesCatalog({ darkMode, selectedCategory, onSelectCategory }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedTradeModal, setSelectedTradeModal] = useState(null);

  const filteredTrades = TRADES.filter((trade) => {
    const matchesCat = selectedCategory === "all" || trade.sector_category === selectedCategory;
    const matchesSearch = 
      trade.trade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.qualification_pack_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trade.trade_name_hi && trade.trade_name_hi.includes(searchQuery));
    const matchesLevel = levelFilter === "all" || trade.nsqf_level.toString() === levelFilter;

    return matchesCat && matchesSearch && matchesLevel;
  });

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              National Skills Qualifications Framework
            </span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            darkMode ? "text-white" : "text-[#1d1d1f]"
          }`}>
            NSQF Aligned Trades Catalog
          </h2>
          <p className={`text-sm mt-1 ${
            darkMode ? "text-[#86868b]" : "text-[#6e6e73]"
          }`}>
            Curated job roles under the PM-AJAY GIA component with wage and micro-enterprise pathways.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all ${
            darkMode 
              ? "bg-[#111114] border-[#222228] text-white focus-within:border-[#2997ff]" 
              : "bg-white border-[#e5e5ea] text-black focus-within:border-blue-500"
          }`}>
            <Search size={15} className="opacity-50" />
            <input
              type="text"
              placeholder="Search trade, sector, QP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-500 w-40 sm:w-60"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className={`px-3 py-2 rounded-2xl text-xs font-medium border outline-none cursor-pointer transition-colors ${
              darkMode 
                ? "bg-[#111114] border-[#222228] text-white" 
                : "bg-white border-[#e5e5ea] text-black"
            }`}
          >
            <option value="all">All Levels</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
          </select>
        </div>
      </div>

      {/* Grid of Apple Store Product-Style Trade Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrades.map((trade) => (
          <div
            key={trade.id}
            onClick={() => setSelectedTradeModal(trade)}
            className={`rounded-[26px] p-6 border transition-all duration-300 hover:scale-[1.015] hover:shadow-xl cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
              darkMode 
                ? "bg-[#0c0c0f] border-[#202026] text-white hover:border-[#353540]" 
                : "bg-white border-[#e5e5ea] text-[#1d1d1f] hover:border-[#c7c7cc] shadow-sm"
            }`}
          >
            {/* Top info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${trade.gradient_tag}`}>
                  {trade.badge}
                </span>
                <span className="text-xs font-mono font-semibold opacity-60">
                  NSQF L{trade.nsqf_level}
                </span>
              </div>

              <h3 className="text-xl font-bold tracking-tight leading-snug group-hover:text-[#2997ff] transition-colors mb-1">
                {trade.trade_name}
              </h3>

              <p className="text-xs font-medium text-gray-400 mb-3">
                {trade.trade_name_hi}
              </p>

              <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${
                darkMode ? "text-[#86868b]" : "text-[#6e6e73]"
              }`}>
                {trade.highlights}
              </p>
            </div>

            {/* Bottom Specs */}
            <div className="pt-4 border-t border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={darkMode ? "text-[#666]" : "text-[#888]"}>Duration & Entry</span>
                <span className="font-medium">{trade.duration_hours}h, {trade.entry_qualification}</span>
              </div>

              <div className="flex justify-between">
                <span className={darkMode ? "text-[#666]" : "text-[#888]"}>Average Monthly Income</span>
                <span className="font-semibold text-emerald-400">
                  ₹{(trade.avg_salary_min / 1000).toFixed(0)}k – ₹{(trade.avg_salary_max / 1000).toFixed(0)}k
                </span>
              </div>

              <div className="flex justify-between">
                <span className={darkMode ? "text-[#666]" : "text-[#888]"}>Type</span>
                <span className="font-medium">
                  {trade.self_employment_viable ? "🏪 Self-Emp + Wage" : "🏢 Wage Employment"}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#00337a] inline-flex items-center gap-1">
                  <span>View Details</span>
                </span>

                <span className="text-[10px] opacity-60">
                  {trade.qualification_pack_id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrades.length === 0 && (
        <div className="text-center py-16">
          <p className="text-base text-gray-500">No trades match your search criteria.</p>
          <button
            onClick={() => { setSearchQuery(""); setLevelFilter("all"); onSelectCategory("all"); }}
            className="mt-3 text-xs text-blue-500 font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Trade Detail Modal (Apple Sheet Style) */}
      {selectedTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className={`w-full max-w-xl rounded-lg p-7 border shadow-lg relative animate-in fade-in zoom-in-95 duration-200 ${
            darkMode 
              ? "bg-[#0f0f13] border-[#2d2d38] text-white" 
              : "bg-white border-[#e5e5ea] text-black"
          }`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 font-semibold">
                  QP: {selectedTradeModal.qualification_pack_id}
                </span>
                <h3 className="text-2xl font-bold tracking-tight mt-1.5">
                  {selectedTradeModal.trade_name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedTradeModal.sector}, NSQF Level {selectedTradeModal.nsqf_level}</p>
              </div>

              <button
                onClick={() => setSelectedTradeModal(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  darkMode ? "bg-[#222228] hover:bg-[#33333d] text-white" : "bg-[#f0f0f4] hover:bg-[#e4e4e8] text-black"
                }`}
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed mb-4 opacity-80">
              {selectedTradeModal.highlights}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className={`p-3 rounded-2xl border ${darkMode ? "bg-[#141419] border-[#22222a]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
                <span className="opacity-60 block">Monthly Earnings</span>
                <span className="font-semibold text-emerald-400 text-sm">
                  ₹{selectedTradeModal.avg_salary_min.toLocaleString("en-IN")} – ₹{selectedTradeModal.avg_salary_max.toLocaleString("en-IN")}
                </span>
              </div>

              <div className={`p-3 rounded-2xl border ${darkMode ? "bg-[#141419] border-[#22222a]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
                <span className="opacity-60 block">Course Duration</span>
                <span className="font-semibold text-sm">{selectedTradeModal.duration_hours} Hours (100% GIA Sponsored)</span>
              </div>

              <div className={`p-3 rounded-2xl border ${darkMode ? "bg-[#141419] border-[#22222a]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
                <span className="opacity-60 block">Eligibility</span>
                <span className="font-semibold text-sm">{selectedTradeModal.entry_qualification}</span>
              </div>

              <div className={`p-3 rounded-2xl border ${darkMode ? "bg-[#141419] border-[#22222a]" : "bg-[#f5f5f7] border-[#e5e5ea]"}`}>
                <span className="opacity-60 block">Stipend Allowance</span>
                <span className="font-semibold text-sm text-blue-400">{selectedTradeModal.stipend_amount}</span>
              </div>
            </div>

            <div className="mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70 mb-1.5">
                Key Job Roles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTradeModal.job_roles.map((role, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                    darkMode ? "bg-[#22222a] text-white" : "bg-[#e5e5ea] text-black"
                  }`}>
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedTradeModal(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold ${
                  darkMode ? "bg-[#222228] text-white" : "bg-[#e5e5ea] text-black"
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Enrollment interest registered for ${selectedTradeModal.trade_name}. District officer will contact within 24 hours.`);
                  setSelectedTradeModal(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white"
              >
                Enroll via PM-AJAY GIA ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
