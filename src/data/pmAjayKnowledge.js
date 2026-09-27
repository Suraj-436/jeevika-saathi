/**
 * Verified PM-AJAY Knowledge Base
 * Ministry of Social Justice & Empowerment, Government of India
 */

export const PM_AJAY_KNOWLEDGE = {
  schemeName: "Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)",
  ministry: "Ministry of Social Justice & Empowerment, Government of India",
  classification: "Centrally Sponsored Scheme (Merged initiative of SCA to SCSP, PMAGY, and Babu Jagjivan Ram Chhatrawas Yojana)",
  
  coreComponents: [
    {
      id: "adarsh-gram",
      name: "Adarsh Gram Component",
      nameHi: "आदर्श ग्राम घटक",
      description: "Integrated socio-economic development of villages with over 50% Scheduled Caste population, ensuring all basic infrastructure and public services."
    },
    {
      id: "grants-in-aid",
      name: "Grants-in-Aid (GIA) Component for Skilling & Livelihoods",
      nameHi: "कौशल व आजीविका हेतु सहायता अनुदान (GIA) घटक",
      description: "100% government-funded skill development training, stipend allowances, toolkits, and micro-enterprise development for SC beneficiaries."
    },
    {
      id: "hostels",
      name: "Hostel Construction Component",
      nameHi: "छात्रावास निर्माण घटक",
      description: "Construction and upkeep of residential hostels for SC students enrolled in secondary and higher education institutions."
    }
  ],

  skillingBenefits: {
    tuitionFee: "100% Waived (Zero Course Fee for approved NSQF batches)",
    monthlyStipend: "₹3,000 to ₹4,500 per month disbursed directly via DBT into Aadhaar-seeded bank accounts",
    toolKitAssistance: "Free starter toolkits (valued up to ₹8,000 - ₹10,000) upon certified completion",
    postPlacementTracking: "Mandatory 12-month post-training monitoring for career retention and enterprise stabilization"
  },

  eligibilityCriteria: {
    socialCategory: "Scheduled Caste (SC) community verified via Caste Certificate or Aadhaar social profile",
    ageRange: "18 to 45 years (up to 50 years for Recognition of Prior Learning RPL artisan trades)",
    incomeLimit: "Family income up to ₹2.50 Lakh per annum (priority given to BPL and traditional artisan households)",
    educationalQualifications: {
      level2and3: "Class 5 to Class 8 Pass (or informal traditional experience for RPL)",
      level4: "Class 10 Pass or equivalent vocational certificate",
      level5: "Class 12 Pass or ITI qualification"
    }
  },

  disclaimer: "Based on official PM-AJAY Guidelines. Please verify the latest eligibility notifications with your District Social Welfare Office or empanelled PMKK center."
};
