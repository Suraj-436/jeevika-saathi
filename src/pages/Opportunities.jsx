import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  MapPin, Search, CheckCircle2, Navigation, Compass, 
  Map, AlertCircle, Building2, BookOpen, ExternalLink, X, Info, Filter, ArrowUpRight
} from "lucide-react";
import { useSession } from "../context/SessionContext";
import { normalizeBeneficiaryProfile } from "../utils/normalizeProfile";

// ─────────────────────────────────────────────────────────────────────────────
// 1. FIXED PROTOTYPE REFERENCE LOCATION: KANDLAKOYA, HYDERABAD, TELANGANA
// ─────────────────────────────────────────────────────────────────────────────
export const KANDLAKOYA_CENTER = {
  name: "Kandlakoya",
  locality: "Kandlakoya, Hyderabad, Telangana, India",
  lat: 17.59568,
  lng: 78.48546,
  defaultRadiusKm: 20
};

// Precise Haversine Distance Formula (km)
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CENTRALIZED DEMO OPPORTUNITY DATASET (8 POINTS ACROSS 4 AREAS IN 20 KM)
// Strictly focused on Carpentry / Woodworking and Electrician / Electrical
// ─────────────────────────────────────────────────────────────────────────────
export const PROTOTYPE_OPPORTUNITIES = [
  // Area 1: Kandlakoya (~0.4 - 0.6 km)
  {
    id: "kandlakoya-carpentry-01",
    name: "Carpentry & Furniture Skills Center",
    category: "Carpentry",
    type: "Training",
    area: "Kandlakoya",
    address: "Kandlakoya Industrial Sector, NH 44, Hyderabad, Telangana 501401",
    lat: 17.5982,
    lng: 78.4875,
    trades: ["Furniture Joinery", "Wood Finishing", "Bench Carpentry"],
    duration: "90 Days Modular Program",
    commute: "5 mins via local transit",
    description: "Prototype vocational training hub for basic and advanced furniture woodwork, joint crafting, and tool safety.",
    isDemo: true
  },
  {
    id: "kandlakoya-electrician-02",
    name: "Residential Electrical Skills Center",
    category: "Electrician",
    type: "Training",
    area: "Kandlakoya",
    address: "Near ORR Junction, Kandlakoya, Hyderabad, Telangana 501401",
    lat: 17.5915,
    lng: 78.4820,
    trades: ["Domestic Electrical Wiring", "Single Phase Circuits", "Home Safety"],
    duration: "90 Days Practical Training",
    commute: "6 mins via local transit",
    description: "Prototype technical skilling center focusing on residential wiring, breaker panels, earthing and electrical maintenance.",
    isDemo: true
  },

  // Area 2: Medchal (~3.8 - 4.4 km)
  {
    id: "medchal-carpentry-01",
    name: "Carpentry & Woodworking Training Hub",
    category: "Carpentry",
    type: "Training",
    area: "Medchal",
    address: "Station Road, Medchal Town, Hyderabad, Telangana 501401",
    lat: 17.6295,
    lng: 78.4822,
    trades: ["Commercial Cabinetry", "Power Tool Handling", "Blueprint Reading"],
    duration: "60 Days Accelerated Course",
    commute: "12 mins via RTC Bus / Auto",
    description: "Demonstration facility offering hands-on machine woodworking, modern composite panels and structural timber framing.",
    isDemo: true
  },
  {
    id: "medchal-electrician-02",
    name: "Electrical Technician Skills Center",
    category: "Electrician",
    type: "Training",
    area: "Medchal",
    address: "NH 44 Highway Junction, Medchal, Hyderabad, Telangana 501401",
    lat: 17.6350,
    lng: 78.4865,
    trades: ["Three-Phase Motor Connections", "Panel Wiring", "Fault Diagnostics"],
    duration: "90 Days Technician Track",
    commute: "15 mins via RTC Bus",
    description: "Prototype technical workshop for electrician trainees focusing on motor control circuits and industrial switchgear fundamentals.",
    isDemo: true
  },

  // Area 3: Kompally (~5.6 - 6.4 km)
  {
    id: "kompally-carpentry-01",
    name: "Furniture & Carpentry Workshop Training",
    category: "Carpentry",
    type: "Apprenticeship",
    area: "Kompally",
    address: "Kompally Main Road, Near Cineplanet, Hyderabad, Telangana 500100",
    lat: 17.5452,
    lng: 78.4895,
    trades: ["Artisan Woodcraft", "Custom Millwork", "Furniture Assembly"],
    duration: "6 Months Practical Apprenticeship",
    commute: "15 mins via Bus Route 229",
    description: "Prototype craft apprenticeship program partnering with local furniture clusters for on-the-job joinery experience.",
    isDemo: true
  },
  {
    id: "kompally-electrician-02",
    name: "Domestic Electrical & Solar Skills Center",
    category: "Electrician",
    type: "Training",
    area: "Kompally",
    address: "Kompally Business Corridor, Medchal-Malkajgiri, Telangana 500100",
    lat: 17.5385,
    lng: 78.4860,
    trades: ["Domestic Electrician", "Rooftop Solar PV Wiring", "Inverter Setup"],
    duration: "90 Days Multi-skill Track",
    commute: "18 mins via City Bus",
    description: "Demonstration training center pairing traditional domestic wireman skills with rooftop solar PV grid connections.",
    isDemo: true
  },

  // Area 4: Suchitra (~10.3 - 11.0 km)
  {
    id: "suchitra-carpentry-01",
    name: "Woodworking & Furniture Apprenticeship Hub",
    category: "Carpentry",
    type: "Apprenticeship",
    area: "Suchitra",
    address: "Suchitra Junction, Quthbullapur Road, Hyderabad, Telangana 500067",
    lat: 17.5035,
    lng: 78.4735,
    trades: ["Modular Kitchen Assembly", "Interior Fit-out Carpentry", "Quality Inspection"],
    duration: "6 Months Apprenticeship",
    commute: "25 mins via Metro feeder / Bus",
    description: "Prototype apprenticeship center training artisans in contemporary modular woodwork, precision laminate application and fittings.",
    isDemo: true
  },
  {
    id: "suchitra-electrician-02",
    name: "Electrical Maintenance Training Center",
    category: "Electrician",
    type: "Training",
    area: "Suchitra",
    address: "Jeedimetla-Suchitra Road, Hyderabad, Telangana 500067",
    lat: 17.4980,
    lng: 78.4680,
    trades: ["Commercial Building Maintenance", "Switchboard Wiring", "Appliance Repair"],
    duration: "60 Days Refresher & Training",
    commute: "28 mins via City Bus",
    description: "Prototype training lab simulating commercial building electrical distribution, safety grounding and circuit diagnostics.",
    isDemo: true
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Opportunities({ userProfile }) {
  const { beneficiaryProfile, selectedRecommendation } = useSession();
  const combinedProfile = { ...userProfile, ...beneficiaryProfile };
  const norm = normalizeBeneficiaryProfile(combinedProfile);

  // States
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all" | "Carpentry" | "Electrician" | "Training" | "Apprenticeship"
  const [areaFilter, setAreaFilter] = useState("all"); // "all" | "Kandlakoya" | "Medchal" | "Kompally" | "Suchitra"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("kandlakoya-carpentry-01");
  const [detailsModalOpp, setDetailsModalOpp] = useState(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletCircleRef = useRef(null);
  const leafletMarkersRef = useRef([]);

  // Check beneficiary target role / aspiration for prioritization
  const aspirationText = (
    selectedRecommendation?.title ||
    beneficiaryProfile?.career_aspiration ||
    norm.aspiration ||
    ""
  ).toLowerCase();

  const isCarpenterAspiration = /carpent|wood|furniture/.test(aspirationText);
  const isElectricianAspiration = /electric|wire|solar/.test(aspirationText);

  // Calculate distances for all opportunities relative to fixed Kandlakoya
  const allOpportunitiesWithDistance = useMemo(() => {
    return PROTOTYPE_OPPORTUNITIES.map(opp => {
      const dist = calculateDistanceKm(
        KANDLAKOYA_CENTER.lat,
        KANDLAKOYA_CENTER.lng,
        opp.lat,
        opp.lng
      );
      return {
        ...opp,
        distanceKm: dist
      };
    });
  }, []);

  // Filtered dataset
  const filteredOpportunities = useMemo(() => {
    return allOpportunitiesWithDistance.filter(opp => {
      // 1. Radius Filter
      if (opp.distanceKm > selectedRadiusKm) return false;

      // 2. Category / Type Filter
      if (categoryFilter === "Carpentry" && opp.category !== "Carpentry") return false;
      if (categoryFilter === "Electrician" && opp.category !== "Electrician") return false;
      if (categoryFilter === "Training" && opp.type !== "Training") return false;
      if (categoryFilter === "Apprenticeship" && opp.type !== "Apprenticeship") return false;

      // 3. Area Filter
      if (areaFilter !== "all" && opp.area !== areaFilter) return false;

      // 4. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = opp.name.toLowerCase().includes(q);
        const matchesCat = opp.category.toLowerCase().includes(q);
        const matchesArea = opp.area.toLowerCase().includes(q);
        const matchesType = opp.type.toLowerCase().includes(q);
        const matchesTrades = opp.trades.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesArea && !matchesType && !matchesTrades) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Prioritize beneficiary's aspirational trade if present
      if (isCarpenterAspiration) {
        if (a.category === "Carpentry" && b.category !== "Carpentry") return -1;
        if (b.category === "Carpentry" && a.category !== "Carpentry") return 1;
      } else if (isElectricianAspiration) {
        if (a.category === "Electrician" && b.category !== "Electrician") return -1;
        if (b.category === "Electrician" && a.category !== "Electrician") return 1;
      }
      return a.distanceKm - b.distanceKm;
    });
  }, [allOpportunitiesWithDistance, selectedRadiusKm, categoryFilter, areaFilter, searchQuery, isCarpenterAspiration, isElectricianAspiration]);

  // Currently selected opportunity
  const selectedOpportunity = useMemo(() => {
    return (
      allOpportunitiesWithDistance.find(o => o.id === selectedOpportunityId) ||
      filteredOpportunities[0] ||
      allOpportunitiesWithDistance[0]
    );
  }, [allOpportunitiesWithDistance, filteredOpportunities, selectedOpportunityId]);

  // ── Load Leaflet dynamically & initialize map ─────────────────────────────
  useEffect(() => {
    // Inject CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject JS
    if (!window.L && !document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        initLeafletMap();
      };
      document.head.appendChild(script);
    } else if (window.L) {
      initLeafletMap();
    }
  }, []);

  // Initialize or re-draw map when filters or selections change
  const initLeafletMap = useCallback(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    // Reset container if needed
    const container = mapContainerRef.current;
    if (container && container._leaflet_id !== undefined && !leafletMapRef.current) {
      container._leaflet_id = null;
    }

    // Create Leaflet instance centered on Kandlakoya
    if (!leafletMapRef.current) {
      const map = L.map(container, {
        center: [KANDLAKOYA_CENTER.lat, KANDLAKOYA_CENTER.lng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Google Maps Standard Basemap tile layer
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // 1. Draw 20 km Search Radius Circle
    if (leafletCircleRef.current) {
      map.removeLayer(leafletCircleRef.current);
    }

    leafletCircleRef.current = L.circle([KANDLAKOYA_CENTER.lat, KANDLAKOYA_CENTER.lng], {
      radius: selectedRadiusKm * 1000,
      color: "#ea580c",
      weight: 2,
      fillColor: "#ea580c",
      fillOpacity: 0.05,
      dashArray: "6, 8"
    }).addTo(map);

    // 2. Clear previous markers
    leafletMarkersRef.current.forEach(m => map.removeLayer(m));
    leafletMarkersRef.current = [];

    // 3. Base Location Pin (Kandlakoya)
    const baseIcon = L.divIcon({
      className: "kandlakoya-base-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #0f382c; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.35); white-space: nowrap; border: 1px solid white;">
            📍 Kandlakoya (Base)
          </div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #ea580c; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [120, 36],
      iconAnchor: [60, 26]
    });

    const baseMarker = L.marker([KANDLAKOYA_CENTER.lat, KANDLAKOYA_CENTER.lng], { icon: baseIcon }).addTo(map);
    baseMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
        <div style="font-weight: 800; color: #0f382c; font-size: 13px;">Kandlakoya Reference Location</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Hyderabad, Telangana 501401</div>
        <div style="color: #ea580c; font-size: 11px; font-weight: 700; margin-top: 4px;">
          ● ${selectedRadiusKm} km Search Radius Active
        </div>
      </div>
    `);
    leafletMarkersRef.current.push(baseMarker);

    // 4. Opportunity Markers
    filteredOpportunities.forEach(opp => {
      const isSelected = opp.id === selectedOpportunityId;
      const isCarpentry = opp.category === "Carpentry";
      const iconColor = isCarpentry ? "#d97706" : "#0284c7"; // Amber for Wood, Blue for Electrical
      const symbol = isCarpentry ? "🪚" : "⚡";

      const oppIcon = L.divIcon({
        className: "opportunity-custom-marker",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s;">
            <div style="background: ${isSelected ? '#0f382c' : '#ffffff'}; color: ${isSelected ? '#ffffff' : '#0f172a'}; border: 2px solid ${iconColor}; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; box-shadow: 0 3px 10px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 2px;">
              ${symbol} ${opp.area} (${opp.distanceKm} km)
            </div>
            <div style="width: ${isSelected ? '34px' : '30px'}; height: ${isSelected ? '34px' : '30px'}; border-radius: 50%; background: ${iconColor}; color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
              ${symbol}
            </div>
          </div>
        `,
        iconSize: [160, 56],
        iconAnchor: [80, 50]
      });

      const marker = L.marker([opp.lat, opp.lng], { icon: oppIcon }).addTo(map);

      // Popup Content per Requirement 5
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: inline-block; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-bottom: 4px;">
            Prototype / Demo Opportunity Data
          </div>
          <div style="font-weight: 800; color: #0b1c34; font-size: 13px; line-height: 1.25; margin-bottom: 4px;">
            ${opp.name}
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; background: #f1f5f9; color: #334155; padding: 1px 6px; border-radius: 4px;">
              ${symbol} ${opp.category}
            </span>
            <span style="font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; padding: 1px 6px; border-radius: 4px;">
              ${opp.type}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">
            <strong>Location:</strong> ${opp.area}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #ea580c;">
            ${opp.distanceKm} km from Kandlakoya
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Open popup automatically if selected
      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
        }, 150);
      }

      // Marker click behavior per Requirement 5
      marker.on("click", () => {
        setSelectedOpportunityId(opp.id);
        map.setView([opp.lat, opp.lng], 13.5, { animate: true });
        const cardEl = document.getElementById(`opp-card-${opp.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      leafletMarkersRef.current.push(marker);
    });
  }, [selectedRadiusKm, filteredOpportunities, selectedOpportunityId]);

  // Handle Card selection
  const handleSelectCard = (opp) => {
    setSelectedOpportunityId(opp.id);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([opp.lat, opp.lng], 13.5, { animate: true });
    }
  };

  // Handle Get Directions via real Google Maps API query
  const handleGetDirections = (opp) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${KANDLAKOYA_CENTER.lat},${KANDLAKOYA_CENTER.lng}&destination=${opp.lat},${opp.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 1. Header Area */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--gov-navy)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Nearby Opportunities <MapPin size={24} style={{ color: "#ea580c" }} />
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px" }}>
            Find training centers and apprenticeships matching your trade pathway in the Kandlakoya corridor.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> Based on your profile
            </span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> Kandlakoya location configured
            </span>
            <span style={{ 
              fontSize: "12px", fontWeight: 600, 
              color: beneficiaryProfile?.existing_skills?.length > 0 ? "#16a34a" : "#64748b", 
              display: "flex", alignItems: "center", gap: "4px" 
            }}>
              <CheckCircle2 size={14} /> {beneficiaryProfile?.existing_skills?.length > 0 ? "Skill analysis completed" : "Skill analysis pending"}
            </span>
          </div>
        </div>
        
        {/* Prototype Zone Badge (Safe label replacing District Admissions Open) */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          backgroundColor: "#fff7ed", color: "#9a3412", border: "1.5px solid #fed7aa",
          padding: "8px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: 800
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ea580c" }}></span>
          20 km Opportunity Zone
        </div>
      </div>

      {/* 2. Personalized Context Strip (Hardcoded to Kandlakoya, Hyderabad, Telangana) */}
      <div style={{
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)", textTransform: "uppercase" }}>
            Your Opportunity Search
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ea580c", backgroundColor: "#ffedd5", padding: "2px 8px", borderRadius: "4px" }}>
            Location Active
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Current Livelihood</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>
              {beneficiaryProfile?.current_occupation || norm.currentLivelihood || "Not provided"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Target Pathway</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>
              {selectedRecommendation?.title || beneficiaryProfile?.career_aspiration || norm.aspiration || "Not provided"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Location (Prototype Fixed)</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)", marginTop: "2px" }}>
              Kandlakoya, Hyderabad, Telangana
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Search Radius</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f766e", marginTop: "2px" }}>
              {selectedRadiusKm} km active
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filters Toolbar */}
      <div style={{ 
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", 
        backgroundColor: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          
          {/* Category / Type Selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ 
              padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", 
              fontSize: "13px", fontWeight: 600, color: "var(--text-dark)", outline: "none", backgroundColor: "#f8fafc" 
            }}
          >
            <option value="all">All Opportunities ({allOpportunitiesWithDistance.length})</option>
            <option value="Carpentry">🪚 Carpentry Only</option>
            <option value="Electrician">⚡ Electrician Only</option>
            <option value="Training">Training Programs</option>
            <option value="Apprenticeship">Apprenticeships</option>
          </select>

          {/* Area Selector (4 Prototype Areas) */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={{ 
              padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "8px", 
              fontSize: "13px", fontWeight: 600, color: "var(--text-dark)", outline: "none", backgroundColor: "#f8fafc" 
            }}
          >
            <option value="all">All 4 Areas (Within 20 km)</option>
            <option value="Kandlakoya">Kandlakoya (~0.5 km)</option>
            <option value="Medchal">Medchal (~4 km)</option>
            <option value="Kompally">Kompally (~6 km)</option>
            <option value="Suchitra">Suchitra (~11 km)</option>
          </select>

          {/* Radius Selector per Requirement 10 (5 km, 10 km, 20 km) */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", padding: "0 6px" }}>Radius:</span>
            {[5, 10, 20].map(rad => (
              <button
                key={rad}
                type="button"
                onClick={() => setSelectedRadiusKm(rad)}
                style={{
                  padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  border: "none",
                  backgroundColor: selectedRadiusKm === rad ? "#0f382c" : "transparent",
                  color: selectedRadiusKm === rad ? "#ffffff" : "#475569"
                }}
              >
                {rad} km
              </button>
            ))}
          </div>

        </div>

        {/* Functional Search Bar */}
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", backgroundColor: "#f8fafc", width: "100%", maxWidth: "320px" }}>
          <Search size={16} style={{ color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search center, village or opportunity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", outline: "none", padding: "0 0 0 8px", fontSize: "13px", width: "100%", backgroundColor: "transparent" }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94a3b8" }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid: Opportunity Cards on Left, Map on Right */}
      <div className="opportunities-grid" style={{ display: "grid", gap: "24px" }}>
        
        {/* Left Column: Opportunity Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
                Nearby Opportunities
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                Showing {filteredOpportunities.length} prototype opportunities within {selectedRadiusKm} km of Kandlakoya.
              </p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
              Carpentry & Electrician
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOpportunityId === opp.id;
              const isCarpentry = opp.category === "Carpentry";
              const categoryBadgeColor = isCarpentry ? "#d97706" : "#0284c7";
              const isRecommended = (isCarpenterAspiration && isCarpentry) || (isElectricianAspiration && !isCarpentry);

              return (
                <div 
                  id={`opp-card-${opp.id}`}
                  key={opp.id} 
                  onClick={() => handleSelectCard(opp)}
                  style={{
                    backgroundColor: "#ffffff",
                    border: isSelected ? "2.5px solid #0f382c" : "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                    boxShadow: isSelected ? "0 6px 18px rgba(15, 56, 44, 0.12)" : "var(--shadow-sm)",
                    position: "relative",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                >
                  {/* Top Badges Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{
                      backgroundColor: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa",
                      padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase"
                    }}>
                      Prototype / Demo Opportunity Data
                    </span>

                    {isRecommended && (
                      <span style={{
                        backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                        padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px"
                      }}>
                        ★ Aligns with your aspiration
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }} className="opt-card-grid">
                    
                    {/* Details Column */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--gov-navy)", margin: "0 0 6px 0", lineHeight: 1.25 }}>
                        {opp.name}
                      </h4>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px",
                          backgroundColor: isCarpentry ? "#fef3c7" : "#e0f2fe",
                          color: categoryBadgeColor,
                          border: `1px solid ${isCarpentry ? '#fde68a' : '#bae6fd'}`
                        }}>
                          {isCarpentry ? "🪚 Carpentry" : "⚡ Electrician"}
                        </span>

                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px",
                          backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0"
                        }}>
                          {opp.type}
                        </span>

                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} style={{ color: "#ea580c" }} /> {opp.area} <strong>({opp.distanceKm} km from Kandlakoya)</strong>
                        </span>
                      </div>
                      
                      {/* Trades Tags */}
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ fontWeight: 700, color: "#64748b", minWidth: "55px", fontSize: "11px", textTransform: "uppercase" }}>Trades:</span>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {opp.trades.map((t, i) => (
                              <span key={i} style={{ backgroundColor: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "4px", fontWeight: 600, fontSize: "11.5px" }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: 700, color: "#64748b", minWidth: "55px", fontSize: "11px", textTransform: "uppercase" }}>Duration:</span>
                          <span style={{ fontWeight: 600, color: "var(--gov-navy)", fontSize: "12px" }}>{opp.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", minWidth: "150px" }}>
                      
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Commute Estimate</span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--gov-navy)" }}>{opp.commute}</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCard(opp);
                          }}
                          style={{
                            padding: "7px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                            backgroundColor: isSelected ? "#0f382c" : "#ffffff", 
                            border: `1px solid ${isSelected ? '#0f382c' : '#cbd5e1'}`, 
                            color: isSelected ? "#ffffff" : "var(--gov-navy)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", width: "100%"
                          }}
                        >
                          <Map size={13} /> {isSelected ? "Active on Map" : "View on Map"}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsModalOpp(opp);
                          }}
                          style={{
                            padding: "7px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                            backgroundColor: "#f8fafc", border: "1px solid var(--border)", color: "#334155",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", width: "100%"
                          }}
                        >
                          <Info size={13} /> View Details
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOpportunities.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--gov-navy)" }}>No prototype opportunities match your filter</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Try switching the radius to 20 km or resetting the trade category filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("all");
                    setAreaFilter("all");
                    setSelectedRadiusKm(20);
                    setSearchQuery("");
                  }}
                  style={{
                    marginTop: "12px", padding: "8px 16px", borderRadius: "6px", backgroundColor: "#0f382c",
                    color: "#ffffff", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer"
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--gov-navy)", margin: 0 }}>
              Opportunities Around You
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Explore available opportunities around Kandlakoya within {selectedRadiusKm} km.
            </p>
          </div>

          <div style={{ 
            backgroundColor: "#ffffff", border: "1px solid var(--border)", borderRadius: "12px", 
            overflow: "hidden", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", position: "sticky", top: "24px" 
          }}>
            
            {/* Active Selected Location Strip */}
            <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--gov-navy)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Navigation size={16} style={{ color: "#ea580c" }} /> {selectedOpportunity.name}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                    {selectedOpportunity.area} • <strong>{selectedOpportunity.distanceKm} km from Kandlakoya</strong> • {selectedOpportunity.commute}
                  </p>
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px",
                  backgroundColor: selectedOpportunity.category === "Carpentry" ? "#fef3c7" : "#e0f2fe",
                  color: selectedOpportunity.category === "Carpentry" ? "#d97706" : "#0284c7"
                }}>
                  {selectedOpportunity.category === "Carpentry" ? "🪚 Carpentry" : "⚡ Electrician"}
                </span>
              </div>
            </div>
            
            {/* Real Interactive Map via Leaflet with Google Maps basemap */}
            <div style={{ height: "380px", width: "100%", backgroundColor: "#e2e8f0", position: "relative" }}>
              
              {/* Prototype Label */}
              <div style={{ 
                position: "absolute", top: "10px", left: "10px", 
                backgroundColor: "rgba(15, 56, 44, 0.9)", color: "#fff", 
                padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, zIndex: 999 
              }}>
                Prototype / Demo Map Data
              </div>

              {/* Map Legend per Requirement 17 */}
              <div style={{
                position: "absolute", bottom: "10px", left: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.94)", backdropFilter: "blur(4px)",
                border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 10px",
                fontSize: "11px", fontWeight: 700, color: "#334155", zIndex: 999,
                display: "flex", gap: "10px", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                <span>🪚 Carpentry</span>
                <span>⚡ Electrician</span>
                <span style={{ color: "#ea580c" }}>○ {selectedRadiusKm} km Radius</span>
              </div>

              {/* Leaflet DOM container */}
              <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
            </div>

            {/* Opportunity Details & Action */}
            <div style={{ padding: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ fontSize: "12.5px", color: "var(--text-dark)", lineHeight: 1.5 }}>
                <strong style={{ color: "#64748b", textTransform: "uppercase", fontSize: "10.5px" }}>Approximate Address:</strong><br/> 
                {selectedOpportunity.address}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => handleGetDirections(selectedOpportunity)}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    backgroundColor: "#0f382c", border: "none", color: "#ffffff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: "0 2px 8px rgba(15, 56, 44, 0.25)"
                  }}
                >
                  <Navigation size={15} /> Get Directions <ArrowUpRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsModalOpp(selectedOpportunity)}
                  style={{
                    padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                    backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "var(--gov-navy)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                  }}
                >
                  <Info size={15} /> Details
                </button>
              </div>

              <div style={{ marginTop: "10px", fontSize: "11px", color: "#94a3b8", textAlign: "center" }}>
                * Directions calculate route from Kandlakoya to this prototype location in Google Maps.
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. VIEW DETAILS MODAL (per Requirement 16) */}
      {detailsModalOpp && (
        <div 
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
          }}
          onClick={() => setDetailsModalOpp(null)}
        >
          <div 
            style={{
              backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px",
              maxWidth: "500px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              border: "1px solid var(--border)", position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{
                  backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa",
                  padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase"
                }}>
                  Prototype / Demo Opportunity Data
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--gov-navy)", margin: "8px 0 0 0" }}>
                  {detailsModalOpp.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpp(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Category:</span>
                <span style={{ fontWeight: 700, color: "var(--gov-navy)" }}>
                  {detailsModalOpp.category === "Carpentry" ? "🪚 Carpentry" : "⚡ Electrician"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Opportunity Type:</span>
                <span style={{ fontWeight: 700, color: "var(--gov-navy)" }}>{detailsModalOpp.type}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Area:</span>
                <span style={{ fontWeight: 700, color: "var(--gov-navy)" }}>{detailsModalOpp.area}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Distance from Kandlakoya:</span>
                <span style={{ fontWeight: 700, color: "#ea580c" }}>{detailsModalOpp.distanceKm} km</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Estimated Commute:</span>
                <span style={{ fontWeight: 700, color: "var(--gov-navy)" }}>{detailsModalOpp.commute}</span>
              </div>

              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "4px" }}>Relevant Trades:</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {detailsModalOpp.trades.map((t, i) => (
                    <span key={i} style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "2px" }}>Location Address:</span>
                <span style={{ color: "var(--text-dark)", lineHeight: 1.4 }}>{detailsModalOpp.address}</span>
              </div>

              <div style={{ backgroundColor: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                <Info size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", color: "#0284c7" }} />
                {detailsModalOpp.description}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => handleGetDirections(detailsModalOpp)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "8px", backgroundColor: "#0f382c",
                  color: "#ffffff", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                }}
              >
                <Navigation size={15} /> Get Directions in Google Maps
              </button>
              <button
                type="button"
                onClick={() => setDetailsModalOpp(null)}
                style={{
                  padding: "10px 16px", borderRadius: "8px", backgroundColor: "#f1f5f9",
                  color: "#475569", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 700, cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        .opportunities-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 992px) {
          .opportunities-grid {
            grid-template-columns: 1.3fr 1fr;
          }
        }
        
        .opt-card-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 600px) {
          .opt-card-grid {
            grid-template-columns: 1fr auto;
          }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </div>
  );
}
