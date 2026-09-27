import React from "react";
import { ArrowUpRight, Mic, MapPin, Sparkles } from "lucide-react";

export default function HeroStore({ darkMode, onStartInterview, onExploreCenters }) {
  return (
    <section className="pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        {/* Left Big Apple-Style Title */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 border backdrop-blur-md transition-colors bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20 text-blue-400">
            <Sparkles size={13} className="text-blue-400 animate-pulse" />
            <span>AI Voice Engine & NSQF Alignment 2.0</span>
          </div>
          <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] ${
            darkMode ? "text-white" : "text-[#1d1d1f]"
          }`}>
            Assistant.
          </h1>
        </div>

        {/* Right Subtitle & Apple Action Links */}
        <div className="lg:max-w-md flex flex-col gap-3">
          <p className={`text-xl sm:text-2xl font-semibold tracking-tight leading-snug ${
            darkMode ? "text-[#f5f5f7]" : "text-[#1d1d1f]"
          }`}>
            The dignified way to map your livelihood & skilling journey.
          </p>
          <p className={`text-sm leading-relaxed ${
            darkMode ? "text-[#86868b]" : "text-[#6e6e73]"
          }`}>
            No complex paper forms. Speak naturally in Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Odia, or Punjabi to unlock 100% GIA sponsored NSQF trades.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
            <button
              onClick={onStartInterview}
              className="text-[#2997ff] hover:text-[#0077ed] font-medium inline-flex items-center gap-1 group transition-colors cursor-pointer"
            >
              <Mic size={14} className="text-[#2997ff] group-hover:scale-110 transition-transform" />
              <span>Launch Voice Interview</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <span className={darkMode ? "text-[#333338]" : "text-[#d2d2d7]"}>•</span>
            <button
              onClick={onExploreCenters}
              className="text-[#2997ff] hover:text-[#0077ed] font-medium inline-flex items-center gap-1 group transition-colors cursor-pointer"
            >
              <MapPin size={14} className="text-[#2997ff]" />
              <span>Find District Training Partners</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
