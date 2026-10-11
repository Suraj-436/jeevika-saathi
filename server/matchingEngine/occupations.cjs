const { getAllCourses, getVerifiedCourses } = require('./dataLoader.cjs');

/**
 * Standardized Livelihood Occupations aligned with PM-AJAY and NCVET/NIELIT Qualification Framework.
 * Each occupation defines:
 * - occupation_id: unique slug
 * - title: standard job role title
 * - description: practical livelihood overview
 * - sector: Electronics, IT, or Green Tech
 * - nsqf_level: typical NSQF qualification level
 * - required_education_level: minimum ordinal education requirement (0-6)
 * - required_education_label: human readable requirement
 * - relevant_skills: keywords matched against beneficiary skills and interests
 * - target_employment_types: 'Wage Employment', 'Self-Employment', or both
 * - verification_status: 'VERIFIED_MAPPING' or 'PROVISIONAL_PENDING_NCVET'
 * - source_standard: standard qualification document reference
 * - last_verified_date: verification timestamp
 * - course_matcher: logic to link courses from the dataset
 */
const OCCUPATION_DEFINITIONS = [
  {
    occupation_id: 'occ-digital-office-assistant',
    title: 'Digital Office Assistant & CSC Operator',
    description: 'Executes office automation, digital documentation, government portal filings, and citizen service delivery (CSC / Cyber Cafe / PM-AJAY kiosk).',
    sector: 'IT',
    nsqf_level: 3,
    required_education_level: 3, // Class 10th pass
    required_education_label: 'Class 10th Pass',
    relevant_skills: ['computer', 'typing', 'ms office', 'excel', 'data entry', 'internet', 'documentation', 'office automation', 'csc', 'government services'],
    target_employment_types: ['Wage Employment', 'Self-Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Office Automation & Digital Literacy',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Office Automation & Digital Literacy', 'IT Professional/Soft Skills']
  },
  {
    occupation_id: 'occ-electronics-repair-tech',
    title: 'Consumer Electronics & Hardware Maintenance Technician',
    description: 'Repairs, troubleshoots, and services personal computers, mobile devices, audio/video equipment, and home appliances in local service centers or mobile repair shops.',
    sector: 'Electronics',
    nsqf_level: 3,
    required_education_level: 2, // Class 8th or 10th
    required_education_label: 'Class 8th / 10th Pass',
    relevant_skills: ['hardware', 'repair', 'soldering', 'troubleshooting', 'pc assembly', 'electronics', 'circuit', 'mobile repair', 'maintenance', 'tools'],
    target_employment_types: ['Wage Employment', 'Self-Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Hardware Repair & Maintenance',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Hardware Repair & Maintenance', 'General Electronics']
  },
  {
    occupation_id: 'occ-solar-lighting-assembler',
    title: 'Solar-LED Lighting Assembly & Maintenance Technician',
    description: 'Assembles, installs, and maintains rooftop solar panels, solar street lamps, LED luminaires, and decentralized green energy systems for rural and semi-urban communities.',
    sector: 'Electronics',
    nsqf_level: 3,
    required_education_level: 2, // Class 8th or 10th
    required_education_label: 'Class 8th / 10th Pass',
    relevant_skills: ['solar', 'led', 'electrical', 'wiring', 'renewable energy', 'inverter', 'green energy', 'installation', 'battery'],
    target_employment_types: ['Wage Employment', 'Self-Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Renewable Energy (Solar) & LED Assembly',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Renewable Energy (Solar)', 'General Electronics']
  },
  {
    occupation_id: 'occ-drone-service-tech',
    title: 'Drone Maintenance & Agricultural Operations Technician',
    description: 'Assembles, tests, repairs, and operates unmanned aerial vehicles (UAVs / drones) for agricultural spraying, land survey, and local security monitoring.',
    sector: 'Electronics',
    nsqf_level: 4,
    required_education_level: 4, // Class 12th or ITI
    required_education_label: 'Class 12th Pass or ITI Certificate',
    relevant_skills: ['drone', 'uav', 'robotics', 'sensors', 'flight', 'agriculture', 'survey', 'remote pilot', 'mechatronics'],
    target_employment_types: ['Wage Employment', 'Self-Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Drone & Robotics Assembly',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Robotics & Drones']
  },
  {
    occupation_id: 'occ-ewaste-recycler',
    title: 'E-Waste Recovery & Environmental Recycling Assistant',
    description: 'Safely disassembles, segregates, and recycles electronic components and printed circuit boards complying with CPCB green environmental directives.',
    sector: 'Electronics',
    nsqf_level: 3,
    required_education_level: 2, // Class 8th or 10th
    required_education_label: 'Class 8th / 10th Pass',
    relevant_skills: ['recycling', 'ewaste', 'dismantling', 'segregation', 'environmental safety', 'circuits', 'scrap handling'],
    target_employment_types: ['Wage Employment', 'Self-Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - e-Waste Management',
    last_verified_date: '2026-01-15',
    skill_clusters: ['e-Waste Management']
  },
  {
    occupation_id: 'occ-iot-smart-technician',
    title: 'IoT & Smart Device Assembly Operator',
    description: 'Configures, calibrates, and installs IoT sensors, smart home automation modules, industrial telemetry devices, and wireless microcontrollers.',
    sector: 'Electronics',
    nsqf_level: 4,
    required_education_level: 4, // Class 12th / ITI / Polytechnic
    required_education_label: 'Class 12th (Science/Vocational) / ITI',
    relevant_skills: ['iot', 'sensors', 'arduino', 'raspberry pi', 'smart devices', 'automation', 'embedded', 'microcontroller', 'telemetry'],
    target_employment_types: ['Wage Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Internet of Things Assembly',
    last_verified_date: '2026-01-15',
    skill_clusters: ['IoT (Internet of Things)', 'Embedded Systems']
  },
  {
    occupation_id: 'occ-network-support-tech',
    title: 'Network & System Administration Associate',
    description: 'Installs, cables, and configures local area networks (LAN), Wi-Fi routers, network switches, and basic Linux/Windows servers for small institutions and broadband enterprises.',
    sector: 'IT',
    nsqf_level: 4,
    required_education_level: 4, // Class 12th / ITI / Diploma
    required_education_label: 'Class 12th Pass or ITI/Diploma in IT',
    relevant_skills: ['networking', 'lan', 'wifi', 'router', 'ip configuration', 'cabling', 'linux', 'server administration', 'troubleshooting'],
    target_employment_types: ['Wage Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Networking & Systems Administration',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Networking & Systems Administration', 'Core IT Diploma (O/A/B Level)']
  },
  {
    occupation_id: 'occ-web-app-developer',
    title: 'Junior Web & Mobile Application Developer',
    description: 'Builds responsive websites, localized portals, and mobile user interfaces using HTML, CSS, JavaScript, and modern web application frameworks.',
    sector: 'IT',
    nsqf_level: 5,
    required_education_level: 4, // 12th / Diploma / Graduate
    required_education_label: 'Class 12th Pass or Diploma / BCA / Graduate',
    relevant_skills: ['coding', 'web development', 'html', 'css', 'javascript', 'react', 'mobile apps', 'frontend', 'software', 'programming'],
    target_employment_types: ['Wage Employment', 'Self-Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Web & App Development',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Web Development', 'App Development', 'Multimedia & Design']
  },
  {
    occupation_id: 'occ-cloud-cybersecurity-associate',
    title: 'Cloud & Cybersecurity Support Analyst',
    description: 'Monitors cloud workloads, user access credentials, firewall logs, and network security compliance for digital enterprises and IT infrastructure.',
    sector: 'IT',
    nsqf_level: 5,
    required_education_level: 5, // Diploma or Graduate
    required_education_label: 'Diploma or Bachelor Degree (IT/Science/Math)',
    relevant_skills: ['cybersecurity', 'cloud', 'aws', 'azure', 'security monitoring', 'firewall', 'encryption', 'identity management', 'linux'],
    target_employment_types: ['Wage Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Cloud Computing & Cybersecurity',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Cloud Computing', 'Cybersecurity']
  },
  {
    occupation_id: 'occ-data-analyst-associate',
    title: 'Data Operations & Business Analytics Trainee',
    description: 'Extracts, organizes, cleans, and visualizes institutional data, field survey records, and dashboard metrics using spreadsheets, SQL, and data reporting tools.',
    sector: 'IT',
    nsqf_level: 5,
    required_education_level: 5, // Graduate or Diploma
    required_education_label: 'Graduate Degree (B.Sc/B.Com/BCA/B.Tech/Diploma)',
    relevant_skills: ['data analysis', 'sql', 'excel', 'data reporting', 'python', 'analytics', 'statistics', 'charts', 'data entry'],
    target_employment_types: ['Wage Employment'],
    verification_status: 'VERIFIED_MAPPING',
    source_standard: 'NCVET Qualification File - Data Analytics & Engineering',
    last_verified_date: '2026-01-15',
    skill_clusters: ['Data Analytics & Engineering', 'AI & Machine Learning']
  }
];

let cachedOccupations = null;

/**
 * Builds and returns the complete occupation catalog with mapped courses from the verified dataset.
 */
function getOccupations() {
  if (cachedOccupations) return cachedOccupations;

  const courses = getAllCourses();

  const occupations = OCCUPATION_DEFINITIONS.map(occDef => {
    // Match verified courses that belong to any of the occupation's skill clusters
    const matchedCourses = courses.filter(c => {
      // Prioritize verified courses; legacy courses can only be linked with explicit disclaimer
      return occDef.skill_clusters.includes(c.skill_cluster);
    });

    const fullQualifications = matchedCourses.filter(c => !c.is_modular && c.is_verified);
    const modularBridgeCourses = matchedCourses.filter(c => c.is_modular && c.is_verified);
    const legacyCourses = matchedCourses.filter(c => !c.is_verified);

    return {
      occupation_id: occDef.occupation_id,
      title: occDef.title,
      description: occDef.description,
      sector: occDef.sector,
      nsqf_level: occDef.nsqf_level,
      required_education_level: occDef.required_education_level,
      required_education_label: occDef.required_education_label,
      relevant_skills: occDef.relevant_skills,
      target_employment_types: occDef.target_employment_types,
      verification_status: occDef.verification_status,
      source_standard: occDef.source_standard,
      last_verified_date: occDef.last_verified_date,
      skill_clusters: occDef.skill_clusters,
      // Courses categorized by role in training pathway
      primary_qualifications: fullQualifications.map(c => c.course_id),
      modular_bridge_qualifications: modularBridgeCourses.map(c => c.course_id),
      legacy_course_ids: legacyCourses.map(c => c.course_id),
      total_mapped_courses: matchedCourses.length,
      has_verified_training: fullQualifications.length > 0 || modularBridgeCourses.length > 0
    };
  });

  cachedOccupations = occupations;
  return cachedOccupations;
}

/**
 * Find occupation by ID
 */
function getOccupationById(occId) {
  return getOccupations().find(o => o.occupation_id === occId);
}

module.exports = {
  getOccupations,
  getOccupationById,
  OCCUPATION_DEFINITIONS
};
