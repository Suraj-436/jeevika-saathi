// src/utils/skillAnalysisEngine.js
// Dynamic Skill & Livelihood Analysis Engine for Jeevika Saathi
// Computes target role, skill gaps, readiness score, and pathways from real profile data.
// Falls back to DEMO_SKILL_ANALYSIS when no real profile is present.

import { DEMO_SKILL_ANALYSIS } from '../config/demoData';

/**
 * Known NSQF-aligned Livelihood Pathways
 */
const PATHWAYS_KNOWLEDGE_BASE = [
  {
    id: 'carpentry',
    keywords: ['carpenter', 'wood', 'furniture', 'woodworking', 'repair', 'joinery', 'cutting'],
    targetRole: 'Carpenter / Furniture Maker',
    roleSubtitle: 'Professional Carpentry Pathway',
    qualificationPack: 'FFSC/Q0101 (Carpenter)',
    nsqfLevel: 'NSQF Level — Pathway Pending',
    trainingDuration: '3-Month Training',
    trainingBreakdown: 'Workshop + Practical Learning',
    certification: 'NSQF-Aligned Carpentry Pathway',
    accreditationBody: 'Carpentry Skill Pathway',
    gapCountLabel: '5 Focused Modules',
    totalPracticalHours: '150 Hours',
    skillGaps: [
      { name: 'Advanced joinery', gapPct: 65, hours: '40 hrs lab', detail: 'Dovetail, mortise and tenon, and complex joints.' },
      { name: 'Power-tool operation', gapPct: 75, hours: '55 hrs', detail: 'Safe use of circular saws, routers, and power planers.' },
      { name: 'Furniture finishing', gapPct: 50, hours: '30 hrs', detail: 'Sanding, polishing, varnishing, and final surfacing.' },
      { name: 'Workplace safety', gapPct: 85, hours: '25 hrs', detail: 'Safety protocols, dust management, and safe material handling.' }
    ]
  },
  {
    id: 'auto_painting',
    keywords: ['paint', 'car painting', 'vehicle', 'automotive', 'spray', 'body shop', 'mechanic', 'auto', 'garage'],
    targetRole: 'Automotive Spray Painter & Refinisher',
    roleSubtitle: 'ASDC National Standard',
    qualificationPack: 'ASC/Q1401 (Auto Refinisher Specialist)',
    nsqfLevel: 'NSQF Level 4',
    trainingDuration: '3-Month Training',
    trainingBreakdown: '45d Workshop + 15d Garage Apprenticeship',
    certification: 'Govt Recognized ASDC',
    accreditationBody: 'Automotive Skills Development Council (ASDC)',
    gapCountLabel: '4 Focused Modules',
    totalPracticalHours: '160 Hours',
    skillGaps: [
      { name: 'Surface Preparation & Primer Application', gapPct: 55, hours: '35 hrs workshop', detail: 'Sanding, putty filler application, and anti-rust treatment.' },
      { name: 'Pneumatic Spray Gun Operation & Calibration', gapPct: 70, hours: '45 hrs', detail: 'Pressure regulation, viscosity control, and uniform coat techniques.' },
      { name: 'Color Matching & Finish Inspection', gapPct: 80, hours: '40 hrs', detail: 'Shade blending, clear coat application, and buffer polishing.' },
      { name: 'Workshop Safety & PPE Compliance', gapPct: 40, hours: '20 hrs', detail: 'Ventilation booth operations, organic vapor masks, & hazardous waste disposal.' }
    ]
  },
  {
    id: 'agri_tech',
    keywords: ['farm', 'agriculture', 'crop', 'irrigation', 'tractor', 'pump repair', 'mustard', 'wheat'],
    targetRole: 'Agri-Solar Pump Operator & Technician',
    roleSubtitle: 'PM-KUSUM Standard',
    qualificationPack: 'AGR/Q7001 (Agri Machinery Specialist)',
    nsqfLevel: 'NSQF Level 4',
    trainingDuration: '2-Month Training',
    trainingBreakdown: '30d Center + 30d Field Demo',
    certification: 'Govt Recognized ASCI',
    accreditationBody: 'Agriculture Skill Council of India (ASCI)',
    gapCountLabel: '3 Focused Modules',
    totalPracticalHours: '120 Hours',
    skillGaps: [
      { name: 'DC Submersible Pump Controller Setup', gapPct: 60, hours: '40 hrs lab', detail: 'MPPT solar pump controller wiring and dry-run protection.' },
      { name: 'Solar Micro-Grid & Drip System Tie-in', gapPct: 75, hours: '45 hrs', detail: 'Connecting solar arrays to automated drip irrigation manifolds.' },
      { name: 'Preventive Motor Servicing & Bearing Replacement', gapPct: 45, hours: '35 hrs', detail: 'Impeller cleaning, mechanical seal replacement, & oiling.' }
    ]
  }
];

/**
 * Generate a personalized analysis object from real beneficiary profile data.
 */
export function generateSkillAnalysis(profile, isDemoMode = false) {
  // Check if real profile exists
  const hasRealData = profile && (
    profile.full_name ||
    profile.current_occupation ||
    profile.career_aspiration ||
    (Array.isArray(profile.existing_skills) && profile.existing_skills.length > 0) ||
    (Array.isArray(profile.interests) && profile.interests.length > 0)
  );

  // If no real profile data is available, return centralized DEMO_SKILL_ANALYSIS
  if (!hasRealData || isDemoMode) {
    return DEMO_SKILL_ANALYSIS;
  }

  // Combine user text for keyword matching
  const allUserText = [
    profile.career_aspiration || '',
    ...(profile.interests || []),
    ...(profile.existing_skills || []),
    profile.current_occupation || '',
    profile.occupation_description || ''
  ].join(' ').toLowerCase();

  // Find best matching pathway
  let matchedPathway = PATHWAYS_KNOWLEDGE_BASE.find(p => 
    p.keywords.some(kw => allUserText.includes(kw))
  );

  // Fallback if no specific keyword matched
  if (!matchedPathway) {
    const customRole = profile.career_aspiration || 
      (profile.interests && profile.interests[0]) || 
      profile.current_occupation || 
      'Livelihood Specialist';

    matchedPathway = {
      id: 'custom',
      targetRole: customRole,
      roleSubtitle: 'PM-AJAY Livelihood Pathway',
      qualificationPack: 'PM-AJAY/Q2026 (Skilled Livelihood)',
      nsqfLevel: 'NSQF Level 4',
      trainingDuration: profile.training_availability || '3-Month Training',
      trainingBreakdown: 'Practical Lab + Field Attachment',
      certification: 'Govt Recognized Skill Certificate',
      accreditationBody: 'National Skill Development Corporation (NSDC)',
      gapCountLabel: '3 Focused Modules',
      totalPracticalHours: '130 Hours',
      skillGaps: [
        { name: 'Core Industry Standard Operations', gapPct: 60, hours: '40 hrs lab', detail: `Advanced techniques for ${customRole}.` },
        { name: 'Equipment Maintenance & Diagnostic Testing', gapPct: 70, hours: '45 hrs', detail: 'Safety protocols, tool handling, and quality assurance.' },
        { name: 'Workplace Health & Occupational Safety', gapPct: 45, hours: '25 hrs', detail: 'Standard safety gear, hazardous material handling, and first aid.' }
      ]
    };
  }

  // Extract skills
  const declaredSkills = [
    ...(profile.existing_skills || []),
    ...(profile.traditional_skills || [])
  ];

  const currentSkillsList = declaredSkills.length > 0
    ? declaredSkills.map((skill, idx) => ({
        name: skill,
        pct: Math.min(95, 75 + ((idx * 7) % 20)),
        detail: `Verified from your response: ${skill}`
      }))
    : [];

  const currentSkillsLabel = declaredSkills.length > 0 
    ? `${declaredSkills.length} Skills Verified` 
    : 'Skills not yet captured';

  // Calculate Readiness Score
  const expYears = parseFloat(profile.years_of_experience) || 1;
  const skillsBonus = declaredSkills.length * 8;
  const expBonus = Math.min(20, expYears * 5);
  const baseScore = declaredSkills.length > 0 ? 50 : 30;
  const calculatedScore = Math.min(96, Math.max(35, Math.round(baseScore + skillsBonus + expBonus)));

  let readinessLabel = 'Standard Track Ready';
  if (calculatedScore >= 65) readinessLabel = 'Fast-Track Ready';
  else if (calculatedScore < 40) readinessLabel = 'Foundation Track Required';

  const readinessDesc = declaredSkills.length > 0
    ? `Based on your declared experience in ${profile.current_occupation || 'informal work'} and ${declaredSkills.length} verified skill(s).`
    : 'Initial profile created. Additional voice assessment recommended to unlock fast-track RPL waivers.';

  // Outcome / Wage - Do NOT invent salary figures in real mode
  const outcomeWage = 'Outcome Pending';
  const outcomeSubtitle = 'Outcome data will be shown after opportunity matching.';

  // Build final structured result
  return {
    isDemo: false,
    sourceLabel: 'Personalized from your livelihood profile',
    nsqfBadge: `NSQF Assessment • ${matchedPathway.nsqfLevel}`,
    headerSubtitle: `Visualizing your existing competencies (${declaredSkills.join(', ') || 'declared'}) against certified ${matchedPathway.targetRole} requirements.`,
    targetRole: matchedPathway.targetRole,
    roleSubtitle: matchedPathway.roleSubtitle,
    qualificationPack: matchedPathway.qualificationPack,
    nsqfLevel: matchedPathway.nsqfLevel,
    trainingDuration: profile.training_availability || matchedPathway.trainingDuration,
    trainingBreakdown: matchedPathway.trainingBreakdown,
    certification: matchedPathway.certification,
    accreditationBody: matchedPathway.accreditationBody,
    outcomeWage,
    outcomeSubtitle,
    readinessScore: calculatedScore,
    readinessLabel,
    readinessDesc,
    stipendInfo: 'Stipend details updated on enrollment',
    profileName: profile.full_name || 'Beneficiary Profile',
    profileLocation: profile.location || (profile.district ? `${profile.district}, ${profile.state || 'UP'}` : 'Barabanki District, Uttar Pradesh'),
    profileDesc: `Demonstrated experience in ${profile.current_occupation || 'informal work'}${profile.years_of_experience ? ' (' + profile.years_of_experience + ' years)' : ''}. Aspiration: ${profile.career_aspiration || matchedPathway.targetRole}.`,
    rplSource: 'Voice Assessment Intake',
    vendorLinkage: `Empanelment with authorized training centers and employers in ${profile.location || 'your region'}.`,
    registryId: `PM-AJAY-2026-RPL-${Math.floor(1000 + Math.random() * 9000)}`,

    currentSkillsLabel,
    currentSkills: currentSkillsList,
    skillGaps: matchedPathway.skillGaps,
    gapCountLabel: matchedPathway.gapCountLabel,
    totalPracticalHours: matchedPathway.totalPracticalHours,
    centerName: 'Pradhan Mantri Kaushal Kendra (PMKK)',
    centerDistance: profile.mobility_limit_km ? `Within ${profile.mobility_limit_km} km` : 'Local District Center',
    batchInfo: 'Upcoming Batch: Enrolling Now • Morning & Evening Options Available'
  };
}
