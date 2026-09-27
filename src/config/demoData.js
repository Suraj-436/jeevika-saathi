// src/config/demoData.js
// Demo Mode configuration — all demo data lives here, never in visual components.
// Demo Mode uses this data to simulate a complete voice assessment conversation.

export const DEMO_PERSONA = {
  name: 'Demo User',
  shortName: 'User'
};

export const DEMO_CONVERSATION_SCRIPT = [
  {
    step: 'livelihood',
    assistant: 'Welcome! I am Saathi AI. To find the best opportunities for you, could you tell me about your current work and your family\'s work?',
    user: 'I currently work as a carpenter and woodworking assistant. My family has been doing basic furniture and wood repair.',
    extractedData: {
      current_occupation: 'Carpenter / Woodworking Assistant',
      family_occupation: 'Basic Furniture and Wood Repair',
    }
  },
  {
    step: 'skills',
    assistant: 'Thank you. Do you have any other skills or hands-on experience — like repairing equipment, construction, or anything technical?',
    user: 'Yes, I know basic wood cutting, measuring, hand-tool handling, and furniture repair.',
    extractedData: {
      existing_skills: ['Wood cutting', 'Measuring', 'Hand-tool handling', 'Furniture repair']
    }
  },
  {
    step: 'interests',
    assistant: 'That\'s great experience! What kind of work are you most interested in learning or moving into?',
    user: 'I am very interested in furniture making. I think it has good future and income.',
    extractedData: {
      interests: ['Furniture making'],
      career_aspiration: 'Professional carpenter / self-employment'
    }
  },
  {
    step: 'mobility',
    assistant: 'Good to know. How far are you willing to travel for training or work each day?',
    user: 'I can travel up to around 20 kilometres from my village.',
    extractedData: {
      mobility_limit_km: 20
    }
  },
  {
    step: 'employment',
    assistant: 'Would you prefer working for someone else as a wage employee, or would you eventually like to work independently or run your own small business?',
    user: 'I would like to eventually work in self-employment.',
    extractedData: {
      employment_preference: 'Self-employment'
    }
  },
  {
    step: 'training',
    assistant: 'Excellent. How long can you dedicate to full-time training, and when would you be available — mornings, evenings, or weekends?',
    user: 'I can do training on weekends. For about 3 months.',
    extractedData: {
      training_availability: 'Weekends / approximately 3 months'
    }
  }
];

// Fields we track across the assessment
export const ASSESSMENT_FIELDS = [
  { key: 'current_occupation',    label: 'Current Occupation',      icon: 'work' },
  { key: 'family_occupation',     label: 'Family Occupation',       icon: 'family_history' },
  { key: 'existing_skills',       label: 'Existing Skills',         icon: 'psychology' },
  { key: 'interests',             label: 'Areas of Interest',       icon: 'star' },
  { key: 'career_aspiration',     label: 'Career Aspiration',       icon: 'trending_up' },
  { key: 'employment_preference', label: 'Employment Preference',   icon: 'work_outline' },
  { key: 'mobility_limit_km',     label: 'Mobility',                icon: 'commute' },
  { key: 'training_availability', label: 'Training Availability',   icon: 'school' }
];

// Required fields to consider assessment complete
export const REQUIRED_STEPS = [
  'current_occupation',
  'family_occupation',
  'existing_skills',
  'interests',
  'career_aspiration',
  'employment_preference',
  'mobility_limit_km',
  'training_availability'
];

// Initial AI greeting question
export const INITIAL_QUESTION = {
  en: 'Welcome! I am Saathi AI. To help find the best livelihood opportunities for you, could you start by telling me about your current work — what do you do for income, and what does your family do?',
  hi: 'नमस्ते! मैं साथी AI हूँ। आपके लिए सबसे अच्छे अवसर खोजने के लिए, क्या आप मुझे अपने वर्तमान काम के बारे में बता सकते हैं?',
  mr: 'नमस्कार! मी साथी AI आहे. आपल्यासाठी सर्वोत्तम संधी शोधण्यासाठी, आपण सध्या कोणते काम करता ते सांगू शकाल का?'
};

// Centralized Demo Beneficiary Profile (Beneficiary)
export const DEMO_BENEFICIARY_PROFILE = {
  full_name: 'Beneficiary',
  age: 23,
  education: 'Class 12 Pass',
  preferred_language: 'Hindi & Awadhi dialect support',
  location: 'Barabanki District, Uttar Pradesh',
  family_occupation: 'Basic Furniture and Wood Repair',
  current_occupation: 'Carpenter / Woodworking Assistant',
  occupation_description: '3.5 years of informal woodworking experience including measuring, basic wood cutting, and furniture repair.',
  years_of_experience: 3.5,
  existing_skills: ['Wood cutting', 'Measuring', 'Hand-tool handling', 'Furniture repair'],
  traditional_skills: ['Basic Woodworking'],
  interests: ['Furniture making'],
  career_aspiration: 'Professional carpenter / self-employment',
  employment_preference: 'Self-employment',
  mobility_limit_km: 20,
  training_availability: 'Weekends / approximately 3 months',
  constraints: 'Can travel up to 20km daily'
};

// Centralized Demo Skill Analysis (Beneficiary baseline)
export const DEMO_SKILL_ANALYSIS = {
  isDemo: true,
  sourceLabel: 'Demo Analysis',
  nsqfBadge: 'NSQF Assessment • Pathway Pending',
  headerSubtitle: 'Visualizing your existing woodworking competencies against the requirements of a professional Carpenter / Furniture Maker pathway.',
  targetRole: 'Carpenter / Furniture Maker',
  roleSubtitle: 'Professional Carpentry Pathway',
  qualificationPack: 'FFSC/Q0101 (Carpenter)',
  nsqfLevel: 'NSQF Level — Pathway Pending',
  trainingDuration: '3-Month Training',
  trainingBreakdown: 'Workshop + Practical Learning',
  certification: 'NSQF-Aligned Carpentry Pathway',
  outcomeWage: 'Outcome data available after opportunity matching',
  outcomeSubtitle: 'Skilled Carpentry Livelihood',
  readinessScore: 68,
  readinessLabel: 'RPL Assessment Recommended',
  readinessDesc: 'Based on demonstrated woodworking experience, existing tool-handling ability and alignment with the selected carpentry pathway.',
  stipendInfo: '₹3,000 / month',
  profileName: 'Beneficiary',
  profileLocation: 'Barabanki District, Uttar Pradesh',
  profileDesc: 'Demonstrated hands-on carpentry and woodworking experience, including basic wood cutting, measuring, hand-tool use and furniture repair.',
  rplSource: 'Village CSC Center + Audio Vetting',
  accreditationBody: 'Carpentry Skill Pathway',
  vendorLinkage: 'Training and certification pathway aligned with the selected carpentry job role and applicable skill-development standards.',
  registryId: 'UP-BBK-2026-RPL-0941',

  currentSkills: [
    { name: 'Basic wood cutting', pct: 88, detail: 'Familiarity with hand saws and basic cutting techniques.' },
    { name: 'Measuring and marking', pct: 92, detail: 'Accurate measurement and dimensioning of wood materials.' },
    { name: 'Hand tool handling', pct: 74, detail: 'Experience with chisels, planes, and basic hand tools.' },
    { name: 'Furniture repair', pct: 80, detail: 'Ability to fix joints and repair basic wooden structures.' },
  ],

  skillGaps: [
    { name: 'Advanced joinery', gapPct: 65, hours: '40 hrs lab', detail: 'Dovetail, mortise and tenon, and complex joints.' },
    { name: 'Power-tool operation', gapPct: 75, hours: '55 hrs', detail: 'Safe use of circular saws, routers, and power planers.' },
    { name: 'Furniture finishing', gapPct: 50, hours: '30 hrs', detail: 'Sanding, polishing, varnishing, and final surfacing.' },
    { name: 'Workplace safety', gapPct: 85, hours: '25 hrs', detail: 'Safety protocols, dust management, and safe material handling.' },
  ],
  gapCountLabel: '5 Focused Modules',
  totalPracticalHours: '150 Hours',
  centerName: 'Pradhan Mantri Kaushal Kendra (PMKK), Barabanki',
  centerDistance: '7.2 km from Shivpur',
  batchInfo: 'Batch Starts: 12 April 2026 • Morning Shift (09:00 AM - 01:00 PM)'
};


