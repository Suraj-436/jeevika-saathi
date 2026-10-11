// src/utils/skillAnalysisEngine.js
// Dynamic Skill & Livelihood Analysis Engine for Jeevika Saathi
// Computes target role, skill gaps, readiness score, and pathways from real profile data.
// Strictly aligns with verified NSQF job roles and distinguishes self-reported vs verified skills.

import { DEMO_SKILL_ANALYSIS } from '../config/demoData';

/**
 * Known NSQF-aligned Livelihood Pathways
 */
const PATHWAYS_KNOWLEDGE_BASE = [
  {
    id: 'carpentry',
    keywords: ['carpenter', 'wood', 'furniture', 'woodworking', 'repair', 'joinery', 'cutting'],
    targetRole: 'Carpenter / Furniture Maker',
    roleSubtitle: 'FFSC National Occupational Standard',
    qualificationPack: 'FFSC/Q0101 (Carpenter General)',
    nsqfLevel: 'NSQF Level 3',
    trainingDuration: '3-Month Training',
    trainingBreakdown: 'Workshop + Practical Joinery Lab',
    certification: 'Govt Recognized FFSC',
    accreditationBody: 'Furniture & Fittings Skill Council (FFSC)',
    gapCountLabel: '4 Focused Modules',
    totalPracticalHours: '150 Hours',
    skillGaps: [
      { name: 'Advanced joinery', gapPct: 65, hours: '40 hrs lab', detail: 'Dovetail, mortise and tenon, and complex joints.' },
      { name: 'Power-tool operation', gapPct: 75, hours: '55 hrs', detail: 'Safe use of circular saws, routers, and power planers.' },
      { name: 'Furniture finishing', gapPct: 50, hours: '30 hrs', detail: 'Sanding, polishing, varnishing, and final surfacing.' },
      { name: 'Workplace safety', gapPct: 85, hours: '25 hrs', detail: 'Safety protocols, dust management, and safe material handling.' }
    ]
  },
  {
    id: 'electrician',
    keywords: ['electrician', 'electric', 'wiring', 'switchboard', 'mcb', 'fuse', 'power', 'current', 'motor'],
    targetRole: 'Domestic & Commercial Electrician',
    roleSubtitle: 'ESSCI National Standard',
    qualificationPack: 'ELE/Q3104 (Domestic Electrician)',
    nsqfLevel: 'NSQF Level 3',
    trainingDuration: '3-Month Training',
    trainingBreakdown: 'Practical Lab + Wiring Safety Attachment',
    certification: 'Govt Recognized ESSCI',
    accreditationBody: 'Electronic Sector Skills Council of India (ESSCI)',
    gapCountLabel: '4 Focused Modules',
    totalPracticalHours: '160 Hours',
    skillGaps: [
      { name: 'Concealed & Conduit Wiring Systems', gapPct: 60, hours: '45 hrs lab', detail: 'PVC conduit layout, channel cutting, and wire pulling.' },
      { name: 'Distribution Board & MCB Installation', gapPct: 70, hours: '40 hrs', detail: 'Single phase and 3-phase DB wiring, earthing verification.' },
      { name: 'Domestic Inverter & Battery Tie-in', gapPct: 55, hours: '35 hrs', detail: 'Inverter capacity sizing, backup wiring, and safety isolators.' },
      { name: 'Electrical Safety & PPE Compliance', gapPct: 75, hours: '40 hrs', detail: 'Lockout/tagout procedures, insulated tool protocols, and shock recovery.' }
    ]
  },
  {
    id: 'plumbing',
    keywords: ['plumber', 'pipe', 'leak', 'fitting', 'sanitary', 'valve', 'tap', 'water supply'],
    targetRole: 'Plumber General',
    roleSubtitle: 'IPSC National Standard',
    qualificationPack: 'PSC/Q0104 (Plumber General)',
    nsqfLevel: 'NSQF Level 3',
    trainingDuration: '2-Month Training',
    trainingBreakdown: 'Pipe Fitting Lab + On-Site Apprenticeship',
    certification: 'Govt Recognized IPSC',
    accreditationBody: 'Indian Plumbing Skills Council (IPSC)',
    gapCountLabel: '3 Focused Modules',
    totalPracticalHours: '120 Hours',
    skillGaps: [
      { name: 'CPVC & GI Pipe Jointing Techniques', gapPct: 65, hours: '40 hrs lab', detail: 'Thread cutting, solvent cementing, and pressure leak testing.' },
      { name: 'Modern Bathroom & Sanitaryware Installation', gapPct: 70, hours: '50 hrs', detail: 'Concealed cisterns, diverters, and drainage traps.' },
      { name: 'Overhead Tank & Float Valve Maintenance', gapPct: 50, hours: '30 hrs', detail: 'Booster pump connections and rainwater harvesting tie-in.' }
    ]
  },
  {
    id: 'tailoring',
    keywords: ['tailor', 'sewing', 'stitch', 'garment', 'cloth', 'fabric', 'apparel', 'dress'],
    targetRole: 'Self-Employed Tailor & Apparel Artisan',
    roleSubtitle: 'AMHSSC National Standard',
    qualificationPack: 'AMH/Q1947 (Sewing Machine Operator)',
    nsqfLevel: 'NSQF Level 3',
    trainingDuration: '2-Month Training',
    trainingBreakdown: 'Design Studio + Industrial Machine Workshop',
    certification: 'Govt Recognized AMHSSC',
    accreditationBody: 'Apparel, Made-Ups & Home Furnishing SSC (AMHSSC)',
    gapCountLabel: '3 Focused Modules',
    totalPracticalHours: '130 Hours',
    skillGaps: [
      { name: 'Motorized Single Needle Lockstitch Machine', gapPct: 55, hours: '45 hrs lab', detail: 'High-speed speed regulation, tension adjustment, and maintenance.' },
      { name: 'Garment Pattern Drafting & Grading', gapPct: 70, hours: '50 hrs', detail: 'Standard Indian body measurements, darts, and seam allowances.' },
      { name: 'Finishing, Hemming & Quality Inspection', gapPct: 50, hours: '35 hrs', detail: 'Interlocking, buttonholing, pressing, and defect identification.' }
    ]
  },
  {
    id: 'masonry',
    keywords: ['mason', 'brick', 'cement', 'plaster', 'construction', 'mortar', 'concrete', 'tile'],
    targetRole: 'Mason General & Tiling Specialist',
    roleSubtitle: 'CSDCI National Standard',
    qualificationPack: 'CON/Q0102 (Mason General)',
    nsqfLevel: 'NSQF Level 3',
    trainingDuration: '3-Month Training',
    trainingBreakdown: 'Construction Yard + Scaffold Practice',
    certification: 'Govt Recognized CSDCI',
    accreditationBody: 'Construction Skill Development Council (CSDCI)',
    gapCountLabel: '3 Focused Modules',
    totalPracticalHours: '140 Hours',
    skillGaps: [
      { name: 'Brick Bond Layout & Plumb Line Alignment', gapPct: 60, hours: '50 hrs yard', detail: 'English and Flemish bonds, corner leveling with spirit level.' },
      { name: 'Cement Plastering & Surface Smoothing', gapPct: 65, hours: '50 hrs', detail: 'Two-coat plastering, float finishing, and water curing schedules.' },
      { name: 'Scaffold Safety & Fall Protection Protocols', gapPct: 75, hours: '40 hrs', detail: 'Modular steel scaffolding setup and PPE harness compliance.' }
    ]
  },
  {
    id: 'allied_agri',
    keywords: ['dairy', 'milk', 'cow', 'buffalo', 'cattle', 'vermicompost', 'poultry', 'livestock', 'organic', 'compost', 'allied', 'landless', 'dairy farm'],
    targetRole: 'Dairy & Allied Livestock Entrepreneur',
    roleSubtitle: 'Rural Allied Agriculture Pathway (Landless / Smallholder Friendly)',
    qualificationPack: 'AGR/Q4101 (Dairy Farm Worker & Allied Specialist)',
    nsqfLevel: 'NSQF Level 3',
    trainingDuration: '2-Month Training',
    trainingBreakdown: 'Krishi Vigyan Kendra (KVK) + Dairy Unit Practical',
    certification: 'Govt Recognized ASCI',
    accreditationBody: 'Agriculture Skill Council of India (ASCI)',
    gapCountLabel: '3 Focused Modules',
    totalPracticalHours: '110 Hours',
    skillGaps: [
      { name: 'Scientific Cattle Nutrition & Fodder Management', gapPct: 60, hours: '40 hrs field', detail: 'Silage making, balanced cattle feed ratios, and mineral supplementation.' },
      { name: 'Hygienic Milking & Bulk Cooler Storage Protocols', gapPct: 70, hours: '35 hrs', detail: 'Machine milking techniques, fat testing, and milk preservation.' },
      { name: 'Organic Vermicompost Bed Setup & Marketing', gapPct: 55, hours: '35 hrs', detail: 'Earthworm culture (Eisenia fetida), pit preparation, and bagged bio-fertilizer sales.' }
    ]
  },
  {
    id: 'agri_tech',
    keywords: ['farm', 'agriculture', 'crop', 'irrigation', 'tractor', 'pump repair', 'mustard', 'wheat', 'solar pump'],
    targetRole: 'Agri-Solar Pump Operator & Technician',
    roleSubtitle: 'PM-KUSUM Aligned Agricultural Standard',
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

  // Fallback if no specific keyword matched (uses transparent pathway wording without fake QP numbers)
  if (!matchedPathway) {
    const customRole = profile.career_aspiration || 
      (profile.interests && profile.interests[0]) || 
      profile.current_occupation || 
      'Livelihood Specialist';

    matchedPathway = {
      id: 'custom',
      targetRole: customRole,
      roleSubtitle: 'Suggested Vocational Livelihood Pathway',
      qualificationPack: 'NSQF Pathway Alignment (Under Evaluation)',
      nsqfLevel: 'NSQF Level 3-4',
      trainingDuration: profile.training_availability_duration || profile.training_availability || '2 to 3 Months Training',
      trainingBreakdown: 'Practical Lab + Field Apprenticeship',
      certification: 'Course Completion Certificate upon verified assessment',
      accreditationBody: 'National Skill Development Corporation (NSDC)',
      gapCountLabel: '3 Core Modules',
      totalPracticalHours: '120 Hours',
      skillGaps: [
        { name: 'Core Vocational Trade Operations', gapPct: 60, hours: '45 hrs lab', detail: `Hands-on practical fundamentals for ${customRole}.` },
        { name: 'Tool Handling, Testing & Work Quality', gapPct: 70, hours: '45 hrs', detail: 'Safety protocols, equipment calibration, and quality standards.' },
        { name: 'Workplace Safety & First Aid Compliance', gapPct: 45, hours: '30 hrs', detail: 'Standard PPE usage, emergency response, and hazard avoidance.' }
      ]
    };
  }

  // Extract skills (distinguish self-reported from formally verified)
  const declaredSkills = [
    ...(profile.existing_skills || []),
    ...(profile.traditional_skills || [])
  ];

  const currentSkillsList = declaredSkills.length > 0
    ? declaredSkills.map((skill, idx) => ({
        name: skill,
        pct: Math.min(92, 70 + ((idx * 7) % 20)),
        detail: `Self-reported from voice conversation: "${skill}"`
      }))
    : [];

  const currentSkillsLabel = declaredSkills.length > 0 
    ? `${declaredSkills.length} Stated Skills (Self-Reported)` 
    : 'Skills not yet captured';

  // Calculate Readiness Score
  const expYears = parseFloat(profile.years_of_experience) || 1;
  const skillsBonus = declaredSkills.length * 8;
  const expBonus = Math.min(20, expYears * 5);
  const baseScore = declaredSkills.length > 0 ? 50 : 30;
  const calculatedScore = Math.min(94, Math.max(35, Math.round(baseScore + skillsBonus + expBonus)));

  let readinessLabel = 'Standard Track Ready';
  if (calculatedScore >= 65) readinessLabel = 'Fast-Track Ready';
  else if (calculatedScore < 40) readinessLabel = 'Foundation Track Required';

  const readinessTrajectory = [
    { label: 'Current Level', score: calculatedScore },
    { label: 'Post Foundation Lab', score: Math.min(98, calculatedScore + 18) },
    { label: 'Post Field Apprenticeship', score: Math.min(99, calculatedScore + 32) }
  ];

  const targetRoleTitle = matchedPathway.targetRole;
  const targetRoleSubtitle = matchedPathway.roleSubtitle;

  return {
    isPersonalized: true,
    targetRole: {
      title: targetRoleTitle,
      subtitle: targetRoleSubtitle,
      qualificationPack: matchedPathway.qualificationPack,
      nsqfLevel: matchedPathway.nsqfLevel,
      trainingDuration: matchedPathway.trainingDuration,
      trainingBreakdown: matchedPathway.trainingBreakdown,
      certification: matchedPathway.certification,
      accreditationBody: matchedPathway.accreditationBody,
      skillsCountLabel: currentSkillsLabel,
      gapCountLabel: matchedPathway.gapCountLabel,
      totalPracticalHours: matchedPathway.totalPracticalHours
    },
    currentSkills: currentSkillsList,
    skillGaps: matchedPathway.skillGaps,
    readinessScore: {
      score: calculatedScore,
      label: readinessLabel,
      trajectory: readinessTrajectory
    }
  };
}
