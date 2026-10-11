// server/matchingEngine/interestMapping.cjs
// Deterministic Interest-to-Sector & Skill-Cluster Mapping Layer
// Maps user interests (selected or natural language) to NIELIT NSQF dataset sectors,
// skill clusters, and relevant course filters.

const { getAllCourses, normalizeEducationLevel } = require('./dataLoader.cjs');

/**
 * Standard Interest Taxonomy with aliases, skill clusters, keywords, and domain notes.
 */
const INTEREST_DEFINITIONS = {
  it: {
    id: 'it',
    label: 'IT / Information Technology',
    sector: 'IT',
    description: 'Computer systems, software applications, networking, and digital technologies.',
    skillClusters: [
      'Core IT Diploma (O/A/B Level)',
      'Web Development',
      'Networking & Systems Administration',
      'Data Analytics & Engineering',
      'General IT',
      'Cloud Computing',
      'Multimedia & Design',
      'Cybersecurity',
      'AI & Machine Learning',
      'Blockchain',
      'App Development',
      'Office Automation & Digital Literacy',
      'IT Professional/Soft Skills'
    ],
    aliases: [
      'it', 'information technology', 'computer science', 'software', 'computers', 'tech',
      'i want to work in it', 'work in it', 'it sector', 'computer field', 'digital technology'
    ],
    keywords: ['it', 'computer', 'software', 'digital', 'network', 'system', 'cloud', 'cyber', 'data', 'web']
  },

  electronics: {
    id: 'electronics',
    label: 'Electronics',
    sector: 'Electronics',
    description: 'Electronic components, semiconductor devices, circuit design, and hardware fabrication.',
    skillClusters: [
      'IoT (Internet of Things)',
      'Hardware Repair & Maintenance',
      'Embedded Systems',
      'VLSI & Chip Design',
      'General Electronics',
      'Robotics & Drones',
      'e-Waste Management',
      'Renewable Energy (Solar)',
      'Emerging Tech (Quantum)'
    ],
    aliases: [
      'electronics', 'electronic', 'vlsi', 'semiconductor', 'pcb', 'circuits',
      'microcontroller', 'embedded electronics', 'electronics engineering', 'hardware design'
    ],
    keywords: ['electronic', 'electronics', 'circuit', 'vlsi', 'pcb', 'sensor', 'microcontroller', 'hardware']
  },

  electrical: {
    id: 'electrical',
    label: 'Electrical-related interests',
    sector: 'Electronics',
    description: 'Solar PV power electronics, power control systems, and electronics equipment maintenance.',
    distinctionNotice: 'Important Distinction: The NIELIT dataset provides Electronics and Solar Power Electronics qualifications. While it covers micro-circuitry, solar PV installation, power controllers, and consumer equipment maintenance, it is NOT equivalent to industrial or domestic building electrical trades (such as high-voltage substation wiring or house wiring under ITI Electrician/CTS trades). Relevant electronics and solar qualifications are presented below with clear boundaries.',
    skillClusters: [
      'Renewable Energy (Solar)',
      'General Electronics',
      'Hardware Repair & Maintenance'
    ],
    aliases: [
      'electrical', 'electrician', 'wiring', 'electrical work', 'i am interested in electrical work',
      'electric work', 'bijli', 'power electronics', 'solar electrical', 'inverter'
    ],
    keywords: ['solar', 'power electronics', 'automation', 'maintenance', 'repair', 'electric', 'inverter']
  },

  web_development: {
    id: 'web_development',
    label: 'Web Development',
    sector: 'IT',
    description: 'Frontend, backend, responsive web development, and secure web application authoring.',
    skillClusters: [
      'Web Development'
    ],
    aliases: [
      'web development', 'web developer', 'web dev', 'website', 'web design', 'web designing',
      'frontend', 'backend', 'full stack', 'html', 'css', 'javascript', 'web application'
    ],
    keywords: ['web', 'website', 'html', 'css', 'javascript', 'frontend', 'designing', 'portal']
  },

  programming: {
    id: 'programming',
    label: 'Programming',
    sector: 'IT',
    description: 'Computer programming, software logic, Python, C/C++, Java, and algorithms.',
    skillClusters: [
      'Core IT Diploma (O/A/B Level)',
      'Web Development',
      'App Development',
      'AI & Machine Learning'
    ],
    aliases: [
      'programming', 'coding', 'i want to learn computer programming', 'computer programming',
      'learn programming', 'software developer', 'coder', 'python', 'java', 'c++', 'developer'
    ],
    keywords: ['programming', 'program', 'python', 'java', 'coding', 'developer', 'algorithm', 'machine learning']
  },

  computer_repair: {
    id: 'computer_repair',
    label: 'Computer Hardware and Repair',
    sector: 'Electronics',
    description: 'Assembly, troubleshooting, maintenance, and repair of PCs, peripherals, and electronics.',
    skillClusters: [
      'Hardware Repair & Maintenance'
    ],
    aliases: [
      'computer repair', 'computer hardware and repair', 'i want to repair computers', 'repair computers',
      'pc repair', 'hardware repair', 'computer hardware', 'pc assembly', 'laptop repair', 'hardware technician'
    ],
    keywords: ['repair', 'maintenance', 'hardware', 'assembly', 'pc', 'computer', 'technician', 'troubleshooting']
  },

  iot_embedded: {
    id: 'iot_embedded',
    label: 'IoT and Embedded Systems',
    sector: 'Electronics',
    description: 'Smart connected devices, IoT telemetry, microcontrollers, and embedded software.',
    skillClusters: [
      'IoT (Internet of Things)',
      'Embedded Systems'
    ],
    aliases: [
      'iot', 'embedded systems', 'iot and embedded systems', 'internet of things', 'smart devices',
      'embedded', 'arduino', 'raspberry pi', 'sensors', 'embedded development'
    ],
    keywords: ['iot', 'embedded', 'internet of things', 'microcontroller', 'sensors', 'telemetry', 'smart']
  },

  robotics: {
    id: 'robotics',
    label: 'Robotics',
    sector: 'Electronics',
    description: 'Robotic programming, maintenance technician roles, and drone application development.',
    skillClusters: [
      'Robotics & Drones'
    ],
    aliases: [
      'robotics', 'i want to learn robotics', 'learn robotics', 'robot', 'drones', 'uav',
      'robotic programming', 'drone developer', 'automation technician'
    ],
    keywords: ['robotics', 'robot', 'drone', 'uav', 'automation']
  },

  agriculture: {
    id: 'agriculture',
    label: 'Agriculture & Farm Tech',
    sector: 'Electronics',
    description: 'Smart agricultural technology, IoT for farming, and solar-powered irrigation systems.',
    distinctionNotice: 'Sector Scope Notice: The NIELIT dataset provides certified qualifications in Electronics & IT applied to agriculture (such as IoT Application Development for Agriculture and Solar PV pump controllers). Traditional crop cultivation and organic farming trades are governed by the Agriculture Skill Council of India (ASCI). Relevant NIELIT tech qualifications are shown below.',
    skillClusters: [
      'IoT (Internet of Things)',
      'Renewable Energy (Solar)'
    ],
    aliases: [
      'agriculture', 'farming', 'farm tech', 'kheti', 'krishi', 'agri', 'farm technology',
      'i want to work in agriculture', 'smart farming', 'solar pump', 'irrigation'
    ],
    keywords: ['agriculture', 'farm', 'solar', 'iot', 'irrigation', 'pump', 'crop', 'kheti']
  },

  healthcare: {
    id: 'healthcare',
    label: 'Healthcare & Medical Tech',
    sector: 'Electronics',
    description: 'Medical instrumentation maintenance, digital healthcare records, and healthcare IoT devices.',
    distinctionNotice: 'Sector Scope Notice: The NIELIT dataset provides certified qualifications in Electronics & IT applied to healthcare (such as medical electronic equipment maintenance and healthcare IT). Direct nursing and patient bedside care are governed by the Healthcare Sector Skill Council (HSSC). Relevant NIELIT tech qualifications are shown below.',
    skillClusters: [
      'General Electronics',
      'Hardware Repair & Maintenance',
      'Office Automation & Digital Literacy'
    ],
    aliases: [
      'healthcare', 'health', 'medical', 'hospital tech', 'biomedical', 'health tech',
      'i want to work in healthcare', 'medical electronics', 'hospital'
    ],
    keywords: ['health', 'medical', 'electronics', 'hospital', 'instrumentation', 'patient', 'clinical']
  }
};

/**
 * Clean & normalize a text string for matching
 */
function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match a raw user interest string (e.g. from dropdown or voice/text input)
 * against our deterministic taxonomy.
 */
function resolveInterest(rawInterest) {
  if (!rawInterest) {
    return null;
  }

  const clean = normalizeText(rawInterest);
  if (!clean) return null;

  // 1. Direct ID match
  if (INTEREST_DEFINITIONS[clean]) {
    return INTEREST_DEFINITIONS[clean];
  }

  // 2. Direct exact alias match
  for (const [key, def] of Object.entries(INTEREST_DEFINITIONS)) {
    if (def.aliases.some(alias => clean === normalizeText(alias))) {
      return def;
    }
  }

  // 3. Substring alias match using word boundaries (e.g. "I want to work in IT" or "I want to learn computer programming")
  const paddedClean = ` ${clean} `;
  for (const [key, def] of Object.entries(INTEREST_DEFINITIONS)) {
    if (def.aliases.some(alias => {
      const normAlias = normalizeText(alias);
      if (!normAlias || normAlias.length < 2) return false;
      return paddedClean.includes(` ${normAlias} `);
    })) {
      return def;
    }
  }

  // 4. Keyword token matching
  const STOP_WORDS = new Set(['interest', 'interested', 'interests', 'want', 'like', 'learn', 'work', 'field', 'job', 'good', 'need', 'career']);
  const tokens = clean.split(/\s+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
  let bestDef = null;
  let maxScore = 0;

  for (const [key, def] of Object.entries(INTEREST_DEFINITIONS)) {
    let score = 0;
    for (const token of tokens) {
      if (def.keywords.includes(token)) {
        score += 2;
      }
      if (def.aliases.some(a => {
        const aTokens = normalizeText(a).split(/\s+/);
        return aTokens.includes(token);
      })) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestDef = def;
    }
  }

  if (maxScore >= 2) {
    return bestDef;
  }

  // 5. Check if matches any dataset skill cluster directly
  const allCourses = getAllCourses();
  const clusters = Array.from(new Set(allCourses.map(c => c.skill_cluster)));
  const matchedCluster = clusters.find(c => {
    const normC = normalizeText(c);
    return normC === clean || (clean.length > 4 && normC.includes(clean));
  });
  if (matchedCluster) {
    const sampleCourse = allCourses.find(c => c.skill_cluster === matchedCluster);
    return {
      id: normalizeText(matchedCluster).replace(/\s+/g, '_'),
      label: matchedCluster,
      sector: sampleCourse ? sampleCourse.sector : 'IT',
      description: `Qualifications in ${matchedCluster}`,
      skillClusters: [matchedCluster],
      aliases: [matchedCluster.toLowerCase()],
      keywords: matchedCluster.toLowerCase().split(/\s+/)
    };
  }

  return null;
}

/**
 * Get available interest choices for UI selection (Feature 1)
 */
function getAvailableInterests() {
  return Object.values(INTEREST_DEFINITIONS).map(def => ({
    id: def.id,
    label: def.label,
    sector: def.sector,
    description: def.description,
    hasDistinctionNotice: !!def.distinctionNotice
  }));
}

module.exports = {
  INTEREST_DEFINITIONS,
  resolveInterest,
  getAvailableInterests,
  normalizeText
};
