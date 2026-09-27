/**
 * Verified NSQF (National Skills Qualifications Framework) Knowledge Base
 * NCVET / NSDC / Ministry of Skill Development and Entrepreneurship
 */

export const NSQF_KNOWLEDGE = {
  frameworkName: "National Skills Qualifications Framework (NSQF)",
  regulator: "National Council for Vocational Education and Training (NCVET) & NSDC",
  description: "A competency-based framework that organizes qualifications according to levels of knowledge, skills, and aptitude from Level 1 to Level 10.",
  
  levelsOverview: [
    {
      level: 1,
      descriptor: "Entry-level helper; basic work and general awareness.",
      entryReq: "No formal schooling required"
    },
    {
      level: 2,
      descriptor: "Elementary artisan / assistant; familiar repetitive tasks.",
      entryReq: "Class 5 Pass or literacy equivalent"
    },
    {
      level: 3,
      descriptor: "Semi-skilled worker; standard domain skills and basic tools handling (e.g. Solar Domestic Electrician, Footwear Stitcher).",
      entryReq: "Class 8 Pass or informal RPL experience"
    },
    {
      level: 4,
      descriptor: "Skilled worker / technician; independent operation and problem solving (e.g. BPO Executive, CAD Pattern Maker).",
      entryReq: "Class 10 Pass"
    },
    {
      level: 5,
      descriptor: "Master technician / supervisor; theoretical knowledge and team coordination.",
      entryReq: "Class 12 / ITI diploma"
    }
  ],

  rplOverview: {
    term: "Recognition of Prior Learning (RPL)",
    meaning: "Formal assessment and certification of informal traditional skills acquired on-the-job or through hereditary artisan heritage.",
    benefit: "Grants NSQF Level 3 or 4 certificate in 12-80 hours orientation without undergoing months of classroom study."
  },

  supportedTrades: [
    {
      qpCode: "ELE/Q3104",
      tradeName: "Solar & Domestic Electrician",
      sector: "Electronics & Solar Power",
      nsqfLevel: 3,
      duration: "200 Hours (approx 7-8 weeks)",
      minEducation: "Class 8 Pass",
      stipend: "₹3,000 - ₹4,000 / month DBT",
      outcomes: "Solar rooftop installer, home wiring technician, self-employed repair shop"
    },
    {
      qpCode: "LSC/Q0101",
      tradeName: "Footwear Upper Stitcher & Leather Artisan",
      sector: "Leather & Footwear Products",
      nsqfLevel: 3,
      duration: "240 Hours (approx 8 weeks)",
      minEducation: "Class 5 Pass / RPL Eligible",
      stipend: "₹3,500 - ₹4,500 / month DBT",
      outcomes: "Industrial footwear operator, bespoke leather artisan, export cluster worker"
    },
    {
      qpCode: "CSC/Q0101",
      tradeName: "Customer Service Executive",
      sector: "IT & ITeS / Telecom",
      nsqfLevel: 4,
      duration: "300 Hours (approx 10-12 weeks)",
      minEducation: "Class 10 Pass",
      stipend: "₹3,500 / month DBT",
      outcomes: "BPO voice/non-voice agent, digital helpdesk operator"
    },
    {
      qpCode: "PLU/Q0001",
      tradeName: "Plumber General & Smart Sanitation",
      sector: "Plumbing & Construction",
      nsqfLevel: 3,
      duration: "200 Hours (approx 7 weeks)",
      minEducation: "Class 8 Pass",
      stipend: "₹3,500 / month DBT",
      outcomes: "Sanitary installer, Jal Jeevan Mission pipe mechanic, private contractor"
    }
  ],

  disclaimer: "NSQF credentials are recognized by all central and state government departments and empanelled industrial employers across India."
};
