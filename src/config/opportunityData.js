// src/config/opportunityData.js
// Centralized prototype dataset for nearby opportunities.
// All markers are clearly tagged as "prototype" status.

export const PROTOTYPE_OPPORTUNITIES = [
  {
    id: 'opp-iti-barabanki',
    name: 'Government ITI Barabanki',
    type: 'training', // 'training' | 'employer' | 'grant'
    typeLabel: 'Training Center',
    badgeText: 'NSQF Level 4 Certified',
    latitude: 26.9650,
    longitude: 81.1400,
    distanceKm: 8.2,
    description: 'Solar PV Rooftop Installer (NSQF Level 4) training. Includes 100% free tuition, hostel, lunch, and ₹8,000 DBT stipend.',
    stipendOrPay: '100% Govt Sponsored + ₹8,000 DBT Stipend',
    duration: '3 Months (Full-time)',
    skills: ['Solar Mounting', 'Inverter Wiring', 'Safety Protocols'],
    status: 'prototype',
    address: 'Technical Wing, ITI Barabanki Campus, UP',
    seatsAvailable: 32,
    busRoute: 'Bus #14 (Direct from Shivpur)'
  },
  {
    id: 'opp-surya-epc',
    name: 'SuryaUrja EPC Solutions Pvt Ltd',
    type: 'employer',
    typeLabel: 'Verified Employer',
    badgeText: 'Direct Hiring Apprentice',
    latitude: 26.9400,
    longitude: 81.2400,
    distanceKm: 8.0,
    description: 'Immediate on-site joining for rooftop agricultural solar pump installations across Barabanki & Lucknow rural belts.',
    stipendOrPay: '₹12,000 / month + PF & Health Insurance',
    duration: 'Full-time Employment',
    skills: ['Motor Wiring', 'Solar Panel Assembly'],
    status: 'prototype',
    address: 'Industrial Area Phase 2, Barabanki, UP',
    seatsAvailable: 12,
    busRoute: 'Bus #14 (Direct)'
  },
  {
    id: 'opp-haidergarh-poly',
    name: 'Haidergarh Block Development Center',
    type: 'grant',
    typeLabel: 'Apprenticeship & Grant',
    badgeText: 'PM-AJAY Capital Grant',
    latitude: 26.8200,
    longitude: 81.2800,
    distanceKm: 14.0,
    description: 'Agro-Electrical Workshop Grant. ₹50,000 tool kit subsidy + pump rewinding equipment and credit link via Barabanki Gramin Bank.',
    stipendOrPay: '₹50,000 Tool Kit Subsidized Grant',
    duration: 'Pre-Approved Self-Employment',
    skills: ['Pump Rewinding', 'Multimeter Diagnostics'],
    status: 'prototype',
    address: 'Block Office, Haidergarh, Barabanki, UP',
    seatsAvailable: 8,
    busRoute: 'Bus #22 (Connecting Line)'
  },
  {
    id: 'opp-sitapur-agro',
    name: 'Sitapur Agro-Solar Depot',
    type: 'training',
    typeLabel: 'Training Provider',
    badgeText: 'NSQF Level 3 Certified',
    latitude: 27.0500,
    longitude: 81.1700,
    distanceKm: 18.5,
    description: 'Agricultural solar pump installation & maintenance short course. Focuses on PM-KUSUM submersible pump controllers.',
    stipendOrPay: '₹3,000 / month Stipend',
    duration: '2 Months (Part-time)',
    skills: ['Pump Controller', 'Drip System Tie-in'],
    status: 'prototype',
    address: 'Agri-Depot Highway 24, Sitapur Border, UP',
    seatsAvailable: 15,
    busRoute: 'Bus #09 (North Corridor)'
  }
];

export const DEFAULT_BENEFICIARY_LOCATION = {
  name: 'Beneficiary (Shivpur Pin #225001)',
  village: 'Shivpur Village',
  district: 'Barabanki',
  state: 'Uttar Pradesh',
  lat: 26.9248,
  lng: 81.1834,
  mobilityLimitKm: 20
};

// Calculate straight-line approximate distance between two coordinates in km (Haversine formula)
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

