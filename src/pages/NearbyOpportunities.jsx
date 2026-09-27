import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { PROTOTYPE_OPPORTUNITIES, DEFAULT_BENEFICIARY_LOCATION, calculateDistanceKm } from '../config/opportunityData';

export default function NearbyOpportunities() {
  const navigate = useNavigate();
  const { beneficiaryProfile, isDemoMode } = useSession();

  // State
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(20);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const [isGpsSyncing, setIsGpsSyncing] = useState(false);
  const [customGpsCoords, setCustomGpsCoords] = useState(null);

  // Map instance refs
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletCircleRef = useRef(null);
  const leafletMarkersRef = useRef([]);

  // Derive beneficiary location
  const beneficiaryLocation = useMemo(() => {
    if (customGpsCoords) {
      return {
        name: 'My Current Location (GPS)',
        village: 'GPS Location',
        district: 'Current District',
        state: '',
        lat: customGpsCoords.lat,
        lng: customGpsCoords.lng,
        mobilityLimitKm: beneficiaryProfile?.mobility_limit_km || 20
      };
    }

    const hasProfileLocation = !!(beneficiaryProfile?.location || beneficiaryProfile?.district);

    if (hasProfileLocation && !isDemoMode) {
      return {
        name: beneficiaryProfile.full_name ? `${beneficiaryProfile.full_name}'s Location` : 'Beneficiary Location',
        village: beneficiaryProfile.village || 'Village',
        district: beneficiaryProfile.district || beneficiaryProfile.location || 'Barabanki',
        state: beneficiaryProfile.state || 'Uttar Pradesh',
        lat: 26.9248,
        lng: 81.1834,
        mobilityLimitKm: beneficiaryProfile.mobility_limit_km || 20
      };
    }

    // Default demo location (Beneficiary - Shivpur, Barabanki)
    return DEFAULT_BENEFICIARY_LOCATION;
  }, [beneficiaryProfile, isDemoMode, customGpsCoords]);

  // Compute opportunities with distances
  const opportunitiesWithDistance = useMemo(() => {
    return PROTOTYPE_OPPORTUNITIES.map(opp => {
      const dist = calculateDistanceKm(
        beneficiaryLocation.lat,
        beneficiaryLocation.lng,
        opp.latitude,
        opp.longitude
      );
      return {
        ...opp,
        calculatedDistanceKm: dist
      };
    });
  }, [beneficiaryLocation]);

  // Filter opportunities by radius, category, and search query
  const filteredOpportunities = useMemo(() => {
    return opportunitiesWithDistance.filter(opp => {
      // Radius filter
      if (opp.calculatedDistanceKm > selectedRadiusKm) return false;

      // Category filter
      if (activeCategory === 'Training' && opp.type !== 'training') return false;
      if (activeCategory === 'Employers' && opp.type !== 'employer') return false;
      if (activeCategory === 'Grants' && opp.type !== 'grant') return false;

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = opp.name.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesSkill = opp.skills.some(s => s.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesSkill) return false;
      }

      return true;
    });
  }, [opportunitiesWithDistance, selectedRadiusKm, activeCategory, searchQuery]);

  // ── Load Leaflet CSS & JS Dynamically ────────────────────────────────────
  useEffect(() => {
    // Inject CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject JS
    if (!window.L && !document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        initLeafletMap();
      };
      document.head.appendChild(script);
    } else if (window.L) {
      initLeafletMap();
    }
  }, []);

  // Initialize or re-render Leaflet Map
  const initLeafletMap = useCallback(() => {
    if (!window.L || !mapContainerRef.current) return;
    const L = window.L;

    // Create map instance if not initialized
    if (!leafletMapRef.current) {
      // Prevent Strict Mode crash if container was dirty
      const container = mapContainerRef.current;
      if (container && container._leaflet_id !== undefined) {
        container._leaflet_id = null;
      }

      const map = L.map(container, {
        center: [beneficiaryLocation.lat, beneficiaryLocation.lng],
        zoom: 11,
        zoomControl: true,
      });

      // CartoDB Voyager basemap tiles (looks like Google Maps Light mode, zero API key required)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      leafletMapRef.current = map;
    } else {
      leafletMapRef.current.setView([beneficiaryLocation.lat, beneficiaryLocation.lng]);
    }

    const map = leafletMapRef.current;

    // Radius Circle
    if (leafletCircleRef.current) {
      map.removeLayer(leafletCircleRef.current);
    }

    leafletCircleRef.current = L.circle([beneficiaryLocation.lat, beneficiaryLocation.lng], {
      radius: selectedRadiusKm * 1000,
      color: '#0F5233',
      weight: 2,
      fillColor: '#133E2B',
      fillOpacity: 0.08
    }).addTo(map);

    // Clear old markers
    leafletMarkersRef.current.forEach(m => map.removeLayer(m));
    leafletMarkersRef.current = [];

    // Beneficiary Home Marker (Green Pin)
    const homeIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #0F5233; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
            <span class="material-symbols-outlined" style="font-size: 18px;">home</span>
          </div>
          <div style="background: #0F5233; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            ${beneficiaryLocation.name}
          </div>
        </div>
      `,
      iconSize: [120, 50],
      iconAnchor: [60, 25]
    });

    const homeMarker = L.marker([beneficiaryLocation.lat, beneficiaryLocation.lng], { icon: homeIcon }).addTo(map);
    homeMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; padding: 4px;">
        <div style="font-weight: 700; color: #133E2B; font-size: 13px;">${beneficiaryLocation.name}</div>
        <div style="color: #555; font-size: 11px; margin-top: 2px;">${beneficiaryLocation.village}, ${beneficiaryLocation.district}</div>
        <div style="color: #0F5233; font-size: 11px; font-weight: 600; margin-top: 4px;">Transit Corridor: ${selectedRadiusKm} km radius</div>
      </div>
    `);
    leafletMarkersRef.current.push(homeMarker);

    // Opportunity Markers
    filteredOpportunities.forEach(opp => {
      let iconColor = '#0D9488'; // Teal
      let iconSymbol = 'school';
      if (opp.type === 'employer') { iconColor = '#D97706'; iconSymbol = 'business_center'; }
      if (opp.type === 'grant') { iconColor = '#0284C7'; iconSymbol = 'handshake'; }

      const oppIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: white; border: 1.5px solid ${iconColor}; color: #133E2B; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); white-space: nowrap; margin-bottom: 2px;">
              ${opp.name} (${opp.calculatedDistanceKm} km)
            </div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${iconColor}; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid white;">
              <span class="material-symbols-outlined" style="font-size: 16px;">${iconSymbol}</span>
            </div>
          </div>
        `,
        iconSize: [160, 50],
        iconAnchor: [80, 45]
      });

      const marker = L.marker([opp.latitude, opp.longitude], { icon: oppIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; max-width: 220px; padding: 4px;">
          <div style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px;">PROTOTYPE OPPORTUNITY</div>
          <div style="font-weight: 700; color: #133E2B; font-size: 13px;">${opp.name}</div>
          <div style="color: #0F5233; font-size: 11px; font-weight: 600; margin-top: 2px;">${opp.typeLabel} • ${opp.calculatedDistanceKm} km away</div>
          <div style="color: #555; font-size: 11px; margin-top: 4px;">${opp.stipendOrPay}</div>
        </div>
      `);

      marker.on('click', () => {
        setHighlightedId(opp.id);
        const cardEl = document.getElementById(opp.id);
        if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      leafletMarkersRef.current.push(marker);
    });
  }, [beneficiaryLocation, selectedRadiusKm, filteredOpportunities]);

  // Update map whenever location, radius, or filters change
  useEffect(() => {
    if (window.L) {
      initLeafletMap();
    }
  }, [initLeafletMap]);

  // Cleanup Leaflet map on unmount to prevent React Strict Mode crashes
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Focus marker from card click
  const focusOpportunity = (opp) => {
    setHighlightedId(opp.id);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([opp.latitude, opp.longitude], 13);
    }
  };

  // Live GPS Sync handler
  const handleGpsSync = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGpsSyncing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsSyncing(false);
        setCustomGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setIsGpsSyncing(false);
        alert(`Location permission denied or unavailable (${err.message}). Defaulting to profile location.`);
      },
      { timeout: 10000 }
    );
  };

  // Voice Read Aloud
  const handleVoiceRead = () => {
    const speechText = `नमस्ते. आपके ${beneficiaryLocation.district} क्षेत्र में ${selectedRadiusKm} किलोमीटर के दायरे में कुल ${filteredOpportunities.length} अवसर उपलब्ध हैं.`;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-space-lg lg:p-space-xl max-w-7xl mx-auto w-full space-y-space-lg">

        {/* Top Source Bar */}
        <div className="flex items-center justify-between px-space-md py-space-xs rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-semibold">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-on-surface-variant">Interactive Map Basemap • Prototype Opportunity Dataset</span>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant">
            <span>Center: <strong>{beneficiaryLocation.district}</strong></span>
            <span>•</span>
            <span>Corridor: <strong>{selectedRadiusKm} km</strong></span>
          </div>
        </div>

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-2xs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold tracking-wide">
              <span className="material-symbols-outlined text-sm">hub</span>
              Prototype Dataset • PM-AJAY Cluster #{beneficiaryLocation.district}
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Opportunities Near You</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Geotagged NSQF training centers, certified employers, and micro-apprenticeships within your {selectedRadiusKm} km transit corridor.
            </p>
          </div>

          <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-xs rounded-xl shadow-sm self-start md:self-auto flex-wrap">
            <button 
              className="flex items-center gap-space-xs text-secondary hover:text-primary transition-colors font-label-md text-label-md"
              onClick={handleVoiceRead}
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
              <span>Read map aloud (Hindi)</span>
            </button>
            <span className="h-4 w-px bg-outline-variant hidden sm:inline"></span>
            <button 
              onClick={handleGpsSync}
              disabled={isGpsSyncing}
              className="font-label-sm text-label-sm text-on-surface hover:text-primary flex items-center gap-1 font-bold"
            >
              <span className={`material-symbols-outlined text-sm text-secondary ${isGpsSyncing ? 'animate-spin' : ''}`}>my_location</span>
              <span>{isGpsSyncing ? 'Locating...' : 'Use My Current Location'}</span>
            </button>
          </div>
        </div>

        {/* Map Canvas Container */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-low shadow-md">
          
          {/* Top HUD Stats Overlay */}
          <div className="absolute top-space-md left-space-md z-[400] flex flex-wrap items-center gap-space-xs bg-surface/95 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-md border border-outline-variant/30">
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-primary font-bold">
              <span className="material-symbols-outlined text-base text-secondary">explore</span>
              {filteredOpportunities.length} Prototype Opportunities ({selectedRadiusKm} km)
            </div>
            <span className="text-outline-variant">•</span>
            <span className="px-space-xs py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
              Prototype Data
            </span>
          </div>

          {/* Top Right Radius Selector */}
          <div className="absolute top-space-md right-space-md z-[400] flex items-center gap-1 bg-surface/95 backdrop-blur-md p-1 rounded-xl shadow-md font-label-sm text-label-sm border border-outline-variant/30">
            {[20, 10, 5].map(radius => (
              <button 
                key={radius}
                onClick={() => setSelectedRadiusKm(radius)}
                className={`px-space-sm py-1 rounded-lg font-bold transition-all ${
                  selectedRadiusKm === radius
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {radius} km Radius
              </button>
            ))}
          </div>

          {/* Interactive Basemap container */}
          <div ref={mapContainerRef} className="w-full h-[440px] lg:h-[500px] z-10"></div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-xs">
          {/* Categories */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 max-w-full">
            {['All', 'Training', 'Employers', 'Grants'].map((category) => (
              <button 
                key={category}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-primary-container text-on-primary shadow-sm' 
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category === 'All' ? `All Matches (${filteredOpportunities.length})` : category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              type="text"
              placeholder="Search by name, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface-container border border-outline-variant/40 font-label-sm text-label-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Opportunity Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map(opp => (
              <div 
                key={opp.id}
                id={opp.id}
                className={`flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-all duration-200 border border-outline-variant/20 ${
                  highlightedId === opp.id ? 'ring-4 ring-secondary scale-[1.02] shadow-md' : 'hover:shadow-md'
                }`}
              >
                <div className="space-y-space-md">
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-bold text-secondary uppercase tracking-wider">
                        <span className="material-symbols-outlined text-sm">
                          {opp.type === 'training' ? 'school' : opp.type === 'employer' ? 'business_center' : 'handshake'}
                        </span>
                        {opp.badgeText}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-primary mt-1">{opp.name}</h3>
                    </div>
                    <span className="px-space-xs py-1 rounded-lg bg-surface-container font-label-sm text-label-sm font-bold text-on-surface whitespace-nowrap">
                      {opp.calculatedDistanceKm} km away
                    </span>
                  </div>

                  <div className="flex items-center gap-space-xs text-on-surface-variant font-body-md text-body-md">
                    <span className="material-symbols-outlined text-lg text-secondary">location_on</span>
                    <span>{opp.address}</span>
                  </div>

                  <div className="p-space-sm rounded-xl bg-surface-container-low space-y-space-xs">
                    <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-primary font-bold">
                      <span className="material-symbols-outlined text-base text-secondary">paid</span>
                      <span>{opp.stipendOrPay}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {opp.description}
                    </p>
                    <div className="flex items-center gap-space-sm pt-1 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-outline">schedule</span>
                        {opp.duration}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-on-tertiary-container font-bold">
                        <span className="material-symbols-outlined text-xs">directions_bus</span>
                        {opp.busRoute}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-space-lg pt-space-md border-t border-outline-variant/20 space-y-space-xs">
                  <div className="flex items-center justify-between gap-2">
                    <button 
                      className="flex-1 h-11 rounded-xl bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs shadow-sm transition-colors"
                      onClick={() => navigate('/roadmap')}
                    >
                      <span className="material-symbols-outlined text-base">mic</span>
                      1-Click Apply
                    </button>
                    <button 
                      onClick={() => focusOpportunity(opp)}
                      className="px-3 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-sm font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Focus on Map"
                    >
                      <span className="material-symbols-outlined text-base">my_location</span>
                      Focus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-3 p-space-xl rounded-2xl bg-surface-container-lowest text-center space-y-2">
              <span className="material-symbols-outlined text-outline text-4xl">travel_explore</span>
              <p className="font-headline-sm text-headline-sm text-primary font-bold">No opportunities found in this radius</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Try expanding your transit corridor radius (e.g. 20 km) or selecting a different category filter.</p>
              <button 
                onClick={() => setSelectedRadiusKm(20)}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold"
              >
                Expand to 20 km Radius
              </button>
            </div>
          )}
        </div>

        {/* Transit Corridor Advisory Bar */}
        <div className="rounded-2xl bg-surface-container p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-2xl">departure_board</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-sm text-headline-sm text-primary">Rural Transit Pass Integration Active</h2>
                <span className="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">Free Trainee Travel</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Under PM-AJAY Section 4B, your transit travel across {beneficiaryLocation.district} corridor is 100% reimbursed through your Aadhaar-linked DBT account.
              </p>
            </div>
          </div>
          <button className="px-space-md py-space-xs rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container-high font-label-md text-label-md font-bold whitespace-nowrap shadow-sm transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-secondary">qr_code_2</span>
            Show DBT Travel Pass
          </button>
        </div>
      </div>
    </div>
  );
}

