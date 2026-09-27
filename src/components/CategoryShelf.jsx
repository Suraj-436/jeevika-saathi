import React, { useRef } from "react";
import { 
  Layers, Laptop, Zap, Footprints, Scissors, 
  HeartPulse, Sparkles, Sprout, Flame, Hammer, Wrench,
  ChevronLeft, ChevronRight 
} from "lucide-react";

const ICON_MAP = {
  Layers,
  Laptop,
  Zap,
  Footprints,
  Scissors,
  HeartPulse,
  Sparkles,
  Sprout,
  Flame,
  Hammer,
  Wrench
};

export default function CategoryShelf({ darkMode, categories, selectedCategory, onSelectCategory }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative group">
      {/* Scroll Navigation Buttons (Apple style floating chevron buttons) */}
      <button 
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 ${
          darkMode 
            ? "bg-[#1d1d20] border border-[#2d2d34] text-white hover:bg-[#28282e]" 
            : "bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
        }`}
      >
        <ChevronLeft size={18} />
      </button>

      <button 
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 ${
          darkMode 
            ? "bg-[#1d1d20] border border-[#2d2d34] text-white hover:bg-[#28282e]" 
            : "bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
        }`}
      >
        <ChevronRight size={18} />
      </button>

      {/* Horizontal Category Shelf */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto scrollbar-none py-2 px-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || Layers;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center gap-2 group/item min-w-[76px] transition-all cursor-pointer"
            >
              {/* Clean Apple Product-style rounded square */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isSelected
                  ? darkMode
                    ? "bg-white text-black shadow-lg shadow-white/10 scale-105"
                    : "bg-[#1d1d1f] text-white shadow-lg shadow-black/10 scale-105"
                  : darkMode
                    ? "bg-[#111114] border border-[#202026] text-[#86868b] hover:text-white hover:border-[#33333d] hover:bg-[#16161b]"
                    : "bg-white border border-[#e5e5ea] text-[#6e6e73] hover:text-[#1d1d1f] hover:border-[#c7c7cc] hover:bg-[#fafafa]"
              }`}>
                <IconComp size={22} className="transition-transform group-hover/item:scale-110" />
              </div>

              {/* Title label */}
              <span className={`text-[12px] font-medium tracking-tight whitespace-nowrap text-center transition-colors ${
                isSelected
                  ? darkMode ? "text-white font-semibold" : "text-[#1d1d1f] font-semibold"
                  : darkMode ? "text-[#86868b] group-hover/item:text-white" : "text-[#6e6e73] group-hover/item:text-[#1d1d1f]"
              }`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
