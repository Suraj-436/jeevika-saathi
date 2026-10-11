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
    tuitionFee: "100% Waived (Zero Course Fee for approved NSQF batches under PM-AJAY GIA)",
    monthlyStipend: "Disbursed via DBT per MSDE Common Norms (Schedule II) and State Action Plan where applicable",
    toolKitAssistance: "Trade starter toolkit assistance subject to approved state annual action plan & trade norms",
    postPlacementTracking: "Post-training monitoring and career retention linkage support"
  },

  eligibilityCriteria: {
    socialCategory: "Scheduled Caste (SC) community verified via Caste Certificate or relevant government verification",
    ageRange: "18 to 45 years (up to 50 years for Recognition of Prior Learning RPL artisan trades)",
    incomeLimit: "Family income up to ₹2.50 Lakh per annum (priority given to BPL and traditional artisan households)",
    educationalQualifications: {
      level2and3: "Class 5 to Class 8 Pass (or informal traditional experience for RPL)",
      level4: "Class 10 Pass or equivalent vocational certificate",
      level5: "Class 12 Pass or ITI qualification"
    }
  },

  disclaimer: "Jeevika Saathi is an AI livelihood demonstrator prototype developed for Smart India Hackathon (SIH 2026), aligned with PM-AJAY Livelihood guidelines. It is not an official government portal. Beneficiary eligibility, stipends, and allowances are subject to official guidelines and verification by respective District Social Welfare authorities and accredited PMKK centers."
};
