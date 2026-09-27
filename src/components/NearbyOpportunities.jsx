import React, { useState } from "react";
import { Building2, MapPin, Phone, Calendar, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function NearbyOpportunities({ darkMode }) {
  const centers = [
    {
      id: 1,
      name: "Pradhan Mantri Kaushal Kendra (PMKK) — Agra Central",
      address: "Sanjay Place, Commercial Complex, Agra, Uttar Pradesh 282002",
      distance: "4.8 km from Bichpuri",
      contact: "+91 562 245 8891",
      tradesOffered: ["Footwear Upper Stitching (LSC/Q0101)", "Solar Domestic Electrician (ELE/Q3104)"],
      nextBatch: "18 October 2026",
      seatsAvailable: 14,
      stipendStatus: "DBT Direct Linked (₹4,000/mo)",
      isGovtAccredited: true,
    },
    {
      id: 2,
      name: "Central Leather Research Institute (CLRI) Extension Unit",
      address: "Industrial Area, Nunhai, Agra, Uttar Pradesh 282006",
      distance: "8.2 km from Bichpuri",
      contact: "+91 562 228 1140",
      tradesOffered: ["Footwear Pattern Making & CAD (LSC/Q0201)", "Leather Finishing Operator"],
      nextBatch: "25 October 2026",
      seatsAvailable: 8,
      stipendStatus: "DBT Direct Linked (₹4,500/mo)",
      isGovtAccredited: true,
    },
    {
      id: 3,
      name: "District Rural Skill Development Institute",
      address: "Fatehabad Road, Near Sub-Divisional Hospital, Agra 283111",
      distance: "12.5 km from Bichpuri",
      contact: "+91 562 297 3320",
      tradesOffered: ["Solar PV Technician (ELE/Q3104)", "Plumbing & Sanitation (PLU/Q0001)"],
      nextBatch: "02 November 2026",
      seatsAvailable: 22,
      stipendStatus: "DBT Direct Linked (₹3,500/mo)",
      isGovtAccredited: true,
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
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <MapPin size={14} />
              <span>District Agra Training Corridor</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Accredited PM-AJAY Training Centers
            </h2>
            <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] mt-1">
              Showing verified government-supported skilling centers within your 15 km travel radius.
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 self-start md:self-auto">
            3 Active Centers Nearby
          </span>
        </div>
      </div>

      {/* Centers List */}
      <div className="space-y-4">
        {centers.map((center) => (
          <div
            key={center.id}
            className={`rounded-xl p-6 border transition-colors ${
              darkMode ? "bg-[#0f0f12] border-[#222228]" : "bg-white border-[#e7e5e4] shadow-2xs"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={14} />
                    PM-AJAY GIA Accredited
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-blue-500">{center.distance}</span>
                </div>

                <h3 className="font-bold text-base tracking-tight">{center.name}</h3>
                <p className="text-xs text-[#78716c] dark:text-[#a1a1aa] mt-0.5">{center.address}</p>
              </div>

              <div className="text-left md:text-right flex-shrink-0">
                <span className="text-xs font-bold text-amber-500 block">
                  {center.seatsAvailable} Seats Remaining
                </span>
                <span className="text-[11px] text-[#78716c] dark:text-[#a1a1aa]">
                  Next Batch: {center.nextBatch}
                </span>
              </div>
            </div>

            <div className="py-3 border-t border-b border-gray-100 dark:border-gray-800 my-3 space-y-2 text-xs">
              <span className="font-semibold text-gray-500 block text-[11px] uppercase tracking-wider">
                Supported GIA Trades:
              </span>
              <div className="flex flex-wrap gap-2">
                {center.tradesOffered.map((trade, i) => (
                  <span key={i} className={`px-2.5 py-1 rounded-md font-medium text-xs ${
                    darkMode ? "bg-[#18181c] text-gray-200 border border-[#25252d]" : "bg-gray-100 text-gray-800"
                  }`}>
                    {trade}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-4 text-[#78716c] dark:text-[#a1a1aa]">
                <span className="flex items-center gap-1">
                  <Phone size={13} /> {center.contact}
                </span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {center.stipendStatus}
                </span>
              </div>

              <button
                onClick={() => alert(`Seat reservation request sent to ${center.name}. District Skill Counselor will call you at +91 98765 43210.`)}
                className="px-4 py-2 rounded-xl bg-[#0b3822] hover:bg-[#0e472c] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Reserve Seat in Batch</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
