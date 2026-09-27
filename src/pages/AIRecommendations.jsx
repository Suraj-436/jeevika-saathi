import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function hasEnoughData(bp) {
  if (!bp) return false;
  return (Array.isArray(bp.existing_skills) && bp.existing_skills.length > 0)
    || !!bp.current_occupation
    || !!bp.career_aspiration
    || (Array.isArray(bp.interests) && bp.interests.length > 0);
}

function calcMatchScore(bp, weights) {
  // weights: { skillMatch, interestMatch, aspirationMatch, experienceMatch, empPrefMatch, mobilityMatch }
  const expYears = parseInt(bp.years_of_experience) || 0;
  const experienceScore = Math.min(100, 30 + expYears * 10);
  return Math.min(99, Math.round(
    (weights.skillMatch * 0.25) +
    (weights.interestMatch * 0.20) +
    (weights.aspirationMatch * 0.20) +
    (experienceScore * 0.15) +
    (weights.empPrefMatch * 0.10) +
    (weights.mobilityMatch * 0.10)
  ));
}

function generateRecommendations(bp, loginProfile) {
  const skills = Array.isArray(bp.existing_skills) ? bp.existing_skills : [];
  const interests = Array.isArray(bp.interests) ? bp.interests : [];
  const trad = bp.family_occupation || null;
  const occupation = bp.current_occupation || null;
  const aspiration = bp.career_aspiration || null;
  const empPref = bp.employment_preference || null;
  const name = bp.full_name || (loginProfile && loginProfile.name) || 'Beneficiary';
  const district = (loginProfile && loginProfile.district) || bp.location || 'your district';
  const mobilityKm = bp.mobility_limit_km || null;
  const training = bp.training_availability || null;
  const expYears = parseInt(bp.years_of_experience) || 0;

  const allText = [aspiration, occupation, trad, ...skills, ...interests]
    .filter(Boolean).join(' ').toLowerCase();

  const isSelf = empPref && empPref.toLowerCase().includes('self');
  const isWage = empPref && (empPref.toLowerCase().includes('wage') || empPref.toLowerCase().includes('employ'));
  const outcomeStr = isSelf ? 'Self-Employment' : isWage ? 'Formal Employment' : 'Employment / Self-Employment';

  // ── Trade flags ─────────────────────────────────────────────────────────────
  const isCarpentry   = /carpent|wood|furniture|joiner|cabinet/.test(allText);
  const isSolar       = /solar|photovoltaic|pv panel|rooftop/.test(allText);
  const isElectric    = /electric|wiring|circuit|wire/.test(allText) && !isSolar;
  const isLeather     = /leather|shoe|footwear|cobbler|chamar/.test(allText);
  const isTailoring   = /tailor|sewing|stitch|apparel|garment|cloth/.test(allText);
  const isAgriculture = /farm|agri|crop|harvest|kisan|field/.test(allText);
  const isFood        = /food|cook|catering|bakery|processing|preserv/.test(allText);
  const isConstruct   = /mason|brick|construction|plumber|cement|tile/.test(allText);
  const isMechanic    = /mechanic|vehicle|bike|automobile|engine|repair/.test(allText);
  const isBeauty      = /beauty|salon|hair|makeup|cosmetolog/.test(allText);
  const isIT          = /computer|digital|software|data entry|it|coding/.test(allText);

  // ── CARPENTRY ───────────────────────────────────────────────────────────────
  if (isCarpentry) {
    const score1 = calcMatchScore(bp, { skillMatch: 90, interestMatch: 92, aspirationMatch: 95, empPrefMatch: 85, mobilityMatch: 80 });
    const score2 = calcMatchScore(bp, { skillMatch: 75, interestMatch: 80, aspirationMatch: 78, empPrefMatch: 70, mobilityMatch: 75 });
    const score3 = calcMatchScore(bp, { skillMatch: 65, interestMatch: 70, aspirationMatch: 60, empPrefMatch: 80, mobilityMatch: 70 });

    return [
      {
        id: 'carp-1',
        title: 'Advanced Furniture Maker',
        localTitle: 'उन्नत फर्नीचर निर्माता',
        sector: 'Construction & Wood Crafts',
        matchScore: score1,
        whyMatch: `Your ${expYears > 0 ? expYears + '-year' : 'existing'} carpentry experience and skills in ${skills.slice(0, 2).join(', ') || 'wood work'} align strongly with this pathway. ${aspiration ? 'Your stated goal — "' + aspiration + '" — directly maps to this trade.' : ''} ${isSelf ? 'The self-employment pathway supports your goal of independent work.' : ''}`,
        skillGaps: ['Advanced joinery (dovetail, mortise & tenon)', 'Professional wood finishing & polishing', 'Power-tool operation & safety', 'Commercial-grade quality standards'],
        training: { title: 'Advanced Carpentry & Furniture Making', duration: '3 Months', hours: 'Approx. 180 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified (Carpenter job role)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Skill Bridging', 'Training', 'Assessment / RPL', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'Construction & Wood Crafts',
        badge: expYears >= 3 ? 'RPL Fast-Track Eligible' : null,
        interestScore: 92, skillScore: 90, mobilityScore: 80
      },
      {
        id: 'carp-2',
        title: 'Woodworking Workshop Operator',
        localTitle: 'लकड़ी कार्यशाला संचालक',
        sector: 'Construction & Wood Crafts',
        matchScore: score2,
        whyMatch: `With your existing ${skills.length > 0 ? skills.slice(0, 2).join(' and ') : 'carpentry'} skills, you can progress into running a workshop. This pathway suits your preference for ${isSelf ? 'self-employment and independence' : 'stable livelihood work'}.`,
        skillGaps: ['Workshop production planning', 'Power machinery operation', 'Material costing & procurement', 'Customer order management'],
        training: { title: 'Woodworking & Workshop Operations', duration: '60 Days', hours: 'Approx. 120 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Practical Lab', 'Certification', outcomeStr], isFlagship: false },
        sector_tag: 'Construction & Wood Crafts',
        badge: null,
        interestScore: 80, skillScore: 75, mobilityScore: 75
      },
      {
        id: 'carp-3',
        title: 'Interior Wood Finishing Specialist',
        localTitle: 'इंटीरियर वुड फिनिशिंग विशेषज्ञ',
        sector: 'Construction & Wood Crafts',
        matchScore: score3,
        whyMatch: `Your repair and measurement skills from ${occupation || 'your current work'} transfer into interior woodwork. Finishing is a growing urban-linked market, which can support ${isSelf ? 'self-employment contracts' : 'employment with construction firms'}.`,
        skillGaps: ['Surface preparation & priming', 'Modern lacquer & varnish application', 'Interior measurement & fit-out', 'Client specification reading'],
        training: { title: 'Wood Finishing & Interior Carpentry', duration: '45 Days', hours: 'Approx. 90 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: false },
        sector_tag: 'Construction & Wood Crafts',
        badge: null,
        interestScore: 70, skillScore: 65, mobilityScore: 70
      }
    ];
  }

  // ── SOLAR ────────────────────────────────────────────────────────────────────
  if (isSolar) {
    const score1 = calcMatchScore(bp, { skillMatch: 85, interestMatch: 90, aspirationMatch: 92, empPrefMatch: 80, mobilityMatch: 85 });
    const score2 = calcMatchScore(bp, { skillMatch: 70, interestMatch: 75, aspirationMatch: 78, empPrefMatch: 75, mobilityMatch: 80 });
    return [
      {
        id: 'solar-1',
        title: 'Solar PV Technician / Installer',
        localTitle: 'सोलर पीवी तकनीशियन',
        sector: 'Electronics & Solar',
        matchScore: score1,
        whyMatch: `Your interest in solar/electrical work aligns directly with this fast-growing pathway. ${skills.length > 0 ? 'Existing skills — ' + skills.slice(0, 2).join(', ') + ' — form a practical foundation.' : ''} ${aspiration ? 'Your aspiration: "' + aspiration + '" maps to this job role.' : ''}`,
        skillGaps: ['Solar PV panel wiring & string inverters', 'DC circuit theory & meter reading', 'Rooftop safety & mounting', 'Net-metering & grid-tie configuration'],
        training: { title: 'Solar PV Installation & Maintenance', duration: '90 Days', hours: 'Approx. 240 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified (related: ELE/Q3104)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Safety Certification', 'Assessment', outcomeStr], isFlagship: true },
        sector_tag: 'Electronics & Solar',
        badge: 'High National Demand',
        interestScore: 90, skillScore: 85, mobilityScore: 85
      },
      {
        id: 'solar-2',
        title: 'Solar Maintenance & Service Technician',
        localTitle: 'सोलर रखरखाव तकनीशियन',
        sector: 'Electronics & Solar',
        matchScore: score2,
        whyMatch: `Service and maintenance of installed solar systems is a separate, high-frequency job role that works well for ${isSelf ? 'independent service contractors' : 'employment with solar companies'}. Requires less technical depth than installation, with faster entry.`,
        skillGaps: ['Panel cleaning & fault diagnosis', 'Battery health monitoring', 'Inverter troubleshooting', 'Service record management'],
        training: { title: 'Solar O&M (Operation & Maintenance)', duration: '45 Days', hours: 'Approx. 120 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: false },
        sector_tag: 'Electronics & Solar',
        badge: null,
        interestScore: 75, skillScore: 70, mobilityScore: 80
      }
    ];
  }

  // ── ELECTRICAL ───────────────────────────────────────────────────────────────
  if (isElectric) {
    const score1 = calcMatchScore(bp, { skillMatch: 80, interestMatch: 85, aspirationMatch: 88, empPrefMatch: 75, mobilityMatch: 80 });
    return [
      {
        id: 'elec-1',
        title: 'Domestic Electrician',
        localTitle: 'घरेलू इलेक्ट्रीशियन',
        sector: 'Electronics & Solar',
        matchScore: score1,
        whyMatch: `Your interest in electrical work${skills.length > 0 ? ' and existing skills in ' + skills.slice(0, 2).join(', ') : ''} align with this essential trade. ${aspiration ? 'Your aspiration "' + aspiration + '" supports this pathway.' : ''}`,
        skillGaps: ['AC/DC circuit theory & load calculation', 'MCB/RCCB installation & panel wiring', 'Formal electrical safety (IE Rules)', 'Test instrument use (multimeter, clamp meter)'],
        training: { title: 'Domestic Electrical Installation', duration: '90 Days', hours: 'Approx. 180 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified (Domestic Electrician job role)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Safety Certification', 'Assessment', outcomeStr], isFlagship: true },
        sector_tag: 'Electronics & Solar',
        badge: null,
        interestScore: 85, skillScore: 80, mobilityScore: 80
      }
    ];
  }

  // ── LEATHER / FOOTWEAR ───────────────────────────────────────────────────────
  if (isLeather) {
    const hasTrad = !!trad && /leather|shoe|footwear/.test((trad || '').toLowerCase());
    const score1 = calcMatchScore(bp, { skillMatch: hasTrad ? 92 : 75, interestMatch: 88, aspirationMatch: 85, empPrefMatch: 80, mobilityMatch: 75 });
    const score2 = calcMatchScore(bp, { skillMatch: 65, interestMatch: 70, aspirationMatch: 65, empPrefMatch: 75, mobilityMatch: 70 });
    return [
      {
        id: 'leath-1',
        title: 'Footwear Artisan & Manufacturer',
        localTitle: 'जूता शिल्पकार एवं निर्माता',
        sector: 'Leather & Footwear',
        matchScore: score1,
        whyMatch: `${hasTrad ? 'Your family tradition in leather/footwear craft gives you a strong foundation.' : 'Your existing skills align with this pathway.'} ${expYears > 0 ? expYears + ' years of experience may qualify you for RPL certification.' : ''} This pathway suits your ${isSelf ? 'goal of self-employment' : 'livelihood aspirations'}.`,
        skillGaps: ['Modern pattern grading & sizing', 'Industrial stitching machine operation', 'Commercial quality control & finishing', 'Synthetic material handling'],
        training: { title: 'Footwear Manufacturing & Finishing', duration: hasTrad ? '45 Days (RPL Track)' : '3 Months', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: hasTrad ? 'L3 via RPL — to be verified at PMKK' : 'To be verified (Footwear Artisan job role)',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: hasTrad ? ['RPL Assessment', 'Certification', outcomeStr] : ['Training', 'Assessment', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'Leather & Footwear',
        badge: hasTrad ? 'RPL Candidate' : null,
        interestScore: 88, skillScore: hasTrad ? 92 : 75, mobilityScore: 75
      },
      {
        id: 'leath-2',
        title: 'Leather Goods Maker',
        localTitle: 'चमड़ा उत्पाद निर्माता',
        sector: 'Leather & Footwear',
        matchScore: score2,
        whyMatch: `Skills in cutting and stitching transfer well into leather goods production (bags, belts, accessories). This pathway offers ${isSelf ? 'self-employment through direct-to-market sales' : 'employment with leather goods manufacturers'}.`,
        skillGaps: ['Leather goods pattern work', 'Edge finishing & burnishing', 'Hardware attachment (buckles, zippers)', 'Product costing & market linkage'],
        training: { title: 'Leather Goods Production', duration: '60 Days', hours: 'Approx. 120 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: false },
        sector_tag: 'Leather & Footwear',
        badge: null,
        interestScore: 70, skillScore: 65, mobilityScore: 70
      }
    ];
  }

  // ── TAILORING ────────────────────────────────────────────────────────────────
  if (isTailoring) {
    const score1 = calcMatchScore(bp, { skillMatch: 80, interestMatch: 85, aspirationMatch: 88, empPrefMatch: 80, mobilityMatch: 75 });
    const score2 = calcMatchScore(bp, { skillMatch: 65, interestMatch: 70, aspirationMatch: 65, empPrefMatch: 75, mobilityMatch: 70 });
    return [
      {
        id: 'tail-1',
        title: 'Sewing Machine Operator / Tailor',
        localTitle: 'सिलाई मशीन ऑपरेटर / दर्जी',
        sector: 'Apparel & Tailoring',
        matchScore: score1,
        whyMatch: `Your interest in tailoring/apparel${skills.length > 0 ? ' and skills in ' + skills.slice(0, 2).join(', ') : ''} align with this trade. ${aspiration ? '"' + aspiration + '" directly maps to this pathway.' : ''} ${isSelf ? 'The self-employment route supports your goal of independent work.' : ''}`,
        skillGaps: ['Industrial sewing machine operation', 'Precision measurement & cutting', 'Garment assembly & finishing', 'Quality control standards'],
        training: { title: 'Apparel & Industrial Tailoring', duration: '60 Days', hours: 'Approx. 120 hrs — AI Recommendation' },
        nsqfLevel: 'To be verified (Sewing Machine Operator job role)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Assessment', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'Apparel & Tailoring',
        badge: null,
        interestScore: 85, skillScore: 80, mobilityScore: 75
      },
      {
        id: 'tail-2',
        title: isSelf ? 'Boutique / Tailoring Business Owner' : 'Apparel Quality Inspector',
        localTitle: isSelf ? 'बुटीक / दर्जी व्यापार' : 'वस्त्र गुणवत्ता निरीक्षक',
        sector: 'Apparel & Tailoring',
        matchScore: score2,
        whyMatch: isSelf
          ? 'With training, your tailoring skills can support running a boutique or alterations business. Self-employment in tailoring has low capital requirements and high local demand.'
          : 'Quality inspection in garment factories is a separate, stable employment role that draws on measurement and finishing skills.',
        skillGaps: isSelf ? ['Business costing & pricing', 'Customer management', 'Fashion trends & fabric selection'] : ['Defect identification & grading', 'Measurement standardization', 'Rejection reporting'],
        training: { title: isSelf ? 'Tailoring Micro-Enterprise' : 'Apparel Quality Control', duration: '30 Days', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: 'To be verified',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: false },
        sector_tag: 'Apparel & Tailoring',
        badge: null,
        interestScore: 70, skillScore: 65, mobilityScore: 70
      }
    ];
  }

  // ── AGRICULTURE / FOOD PROCESSING ────────────────────────────────────────────
  if (isAgriculture || isFood) {
    const score1 = calcMatchScore(bp, { skillMatch: 80, interestMatch: 85, aspirationMatch: 88, empPrefMatch: 75, mobilityMatch: 80 });
    const score2 = calcMatchScore(bp, { skillMatch: 65, interestMatch: 72, aspirationMatch: 70, empPrefMatch: 70, mobilityMatch: 75 });
    return [
      {
        id: 'agri-1',
        title: isFood ? 'Food Processing Entrepreneur' : 'Skilled Farmer / Agri-Entrepreneur',
        localTitle: isFood ? 'खाद्य प्रसंस्करण उद्यमी' : 'कुशल किसान / कृषि उद्यमी',
        sector: 'Agri & Food Processing',
        matchScore: score1,
        whyMatch: `Your background in ${occupation || 'agricultural/food work'}${skills.length > 0 ? ' and skills in ' + skills.slice(0, 2).join(', ') : ''} form a strong base for this pathway. ${aspiration ? '"' + aspiration + '" aligns with this trade.' : ''} ${isSelf ? 'The self-employment route supports your goal of running your own enterprise.' : ''}`,
        skillGaps: isFood
          ? ['Food safety & hygiene (FSSAI basics)', 'Preservation & packaging techniques', 'Labelling & market linkage', 'Small enterprise management']
          : ['Modern agronomic practices', 'Micro-irrigation & water management', 'Post-harvest storage & grading', 'Agri-market linkage (e-NAM, FPO)'],
        training: { title: isFood ? 'Food Processing & Preservation' : 'Modern Agriculture & Agri-Business', duration: '45-60 Days', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: 'To be verified (Agri/Food Processing job role)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'Agri & Food Processing',
        badge: null,
        interestScore: 85, skillScore: 80, mobilityScore: 80
      },
      {
        id: 'agri-2',
        title: 'Agri Service Provider / Micro-Entrepreneur',
        localTitle: 'कृषि सेवा प्रदाता',
        sector: 'Agri & Food Processing',
        matchScore: score2,
        whyMatch: 'Providing agricultural services (irrigation maintenance, soil testing facilitation, input supply) to other farmers is a growing self-employment pathway that leverages your existing agricultural knowledge.',
        skillGaps: ['Soil health & testing basics', 'Input supply & costing', 'Farmer linkage & service delivery', 'Record keeping & digital tools'],
        training: { title: 'Agri Service Entrepreneur Training', duration: '30 Days', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: 'To be verified',
        giaStatus: 'GIA status — to be verified',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: false },
        sector_tag: 'Agri & Food Processing',
        badge: null,
        interestScore: 72, skillScore: 65, mobilityScore: 75
      }
    ];
  }

  // ── CONSTRUCTION ─────────────────────────────────────────────────────────────
  if (isConstruct) {
    const score1 = calcMatchScore(bp, { skillMatch: 80, interestMatch: 82, aspirationMatch: 85, empPrefMatch: 70, mobilityMatch: 75 });
    return [
      {
        id: 'const-1',
        title: aspiration || 'Skilled Construction Tradesperson',
        localTitle: 'कुशल निर्माण कारीगर',
        sector: 'Construction & Wood Crafts',
        matchScore: score1,
        whyMatch: `Your background in ${occupation || 'construction work'}${skills.length > 0 ? ' and skills in ' + skills.slice(0, 2).join(', ') : ''} align with this pathway. ${aspiration ? '"' + aspiration + '" matches this trade.' : ''} Formal certification can significantly improve earnings and employment quality.`,
        skillGaps: ['Standardized construction techniques', 'BIS/safety compliance on site', 'Drawing reading & estimation', 'Modern material handling'],
        training: { title: 'Construction Trade Certification', duration: '90 Days', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: 'To be verified (Mason L3 / Plumber L4)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Skill Bridging', 'Training', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'Construction & Wood Crafts',
        badge: null,
        interestScore: 82, skillScore: 80, mobilityScore: 75
      }
    ];
  }

  // ── BEAUTY / WELLNESS ─────────────────────────────────────────────────────────
  if (isBeauty) {
    const score1 = calcMatchScore(bp, { skillMatch: 75, interestMatch: 90, aspirationMatch: 88, empPrefMatch: 80, mobilityMatch: 75 });
    return [
      {
        id: 'beauty-1',
        title: 'Beauty Therapist / Salon Professional',
        localTitle: 'ब्यूटी थेरेपिस्ट / सैलून विशेषज्ञ',
        sector: 'Beauty & Wellness',
        matchScore: score1,
        whyMatch: `Your interest in beauty/wellness and aspiration "${aspiration || 'beauty services'}" align with this pathway. ${isSelf ? 'The self-employment route supports your goal of running a salon.' : 'Employment opportunities are strong in urban and semi-urban areas.'}`,
        skillGaps: ['Professional skincare & facial treatments', 'Hair cutting & styling techniques', 'Makeup application & bridal work', 'Salon hygiene & safety standards'],
        training: { title: 'Beauty Therapy & Salon Management', duration: '90 Days', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: 'To be verified (Beauty Therapist job role)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'Beauty & Wellness',
        badge: null,
        interestScore: 90, skillScore: 75, mobilityScore: 75
      }
    ];
  }

  // ── IT / DIGITAL ──────────────────────────────────────────────────────────────
  if (isIT) {
    const score1 = calcMatchScore(bp, { skillMatch: 70, interestMatch: 88, aspirationMatch: 85, empPrefMatch: 75, mobilityMatch: 70 });
    return [
      {
        id: 'it-1',
        title: 'Digital Services & Data Entry Operator',
        localTitle: 'डिजिटल सेवा / डेटा एंट्री ऑपरेटर',
        sector: 'IT & Digital Services',
        matchScore: score1,
        whyMatch: `Your interest in digital/IT work and aspiration "${aspiration || 'digital services'}" align with this pathway. ${isWage ? 'Employment in BPO, government data centers and digital service centers is available.' : 'Self-employment via CSC (Common Service Centre) is a viable route.'}`,
        skillGaps: ['MS Office & spreadsheet proficiency', 'Typing speed & data accuracy', 'Basic internet & email operations', 'Customer-facing digital service delivery'],
        training: { title: 'Digital Literacy & Data Entry Operations', duration: '60 Days', hours: 'AI Recommendation — to be verified' },
        nsqfLevel: 'To be verified (IT-ITES job role)',
        giaStatus: 'GIA status — to be verified at PMKK center',
        localDemand: 'Local demand to be verified',
        pathway: { steps: ['Training', 'Certification', outcomeStr], isFlagship: true },
        sector_tag: 'IT & Digital Services',
        badge: null,
        interestScore: 88, skillScore: 70, mobilityScore: 70
      }
    ];
  }

  // ── GENERIC FALLBACK ──────────────────────────────────────────────────────────
  const targetTrade = aspiration || (interests.length > 0 ? interests[0] : occupation || 'Livelihood Skill Training');
  const score1 = calcMatchScore(bp, { skillMatch: 70, interestMatch: 75, aspirationMatch: 80, empPrefMatch: 70, mobilityMatch: 70 });
  return [
    {
      id: 'gen-1',
      title: targetTrade,
      localTitle: '',
      sector: 'General Livelihood',
      matchScore: score1,
      whyMatch: `Based on your profile${occupation ? ' — current livelihood: ' + occupation : ''}${skills.length > 0 ? ', skills: ' + skills.slice(0, 3).join(', ') : ''}${aspiration ? ' and aspiration: "' + aspiration + '"' : ''} — this pathway has been identified as a starting point. Please complete a more detailed Voice Assessment for a refined recommendation.`,
      skillGaps: skills.length > 0
        ? ['Advanced skills in ' + targetTrade, 'Formal certification', 'Practical applied training']
        : ['Domain foundation training', 'Practical application skills', 'Formal certification'],
      training: { title: 'Skill Training in ' + targetTrade, duration: 'To be determined', hours: 'Duration to be verified at PMKK center' },
      nsqfLevel: 'To be verified at PMKK center',
      giaStatus: 'GIA status — to be verified',
      localDemand: 'Local demand to be verified',
      pathway: { steps: ['Training', 'Assessment', 'Certification', outcomeStr], isFlagship: true },
      sector_tag: 'General Livelihood',
      badge: null,
      interestScore: 75, skillScore: 70, mobilityScore: 70
    }
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI SCORE BAR
// ─────────────────────────────────────────────────────────────────────────────
function ScoreBar({ label, value }) {
  return (
    <div className="p-space-sm rounded-2xl bg-surface-container-low">
      <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">{label}</span>
      <span className="font-headline-sm text-headline-sm text-primary font-bold">{value}%</span>
      <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-2 overflow-hidden">
        <div className="bg-secondary h-full rounded-full" style={{ width: value + '%' }}></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION CARD (secondary)
// ─────────────────────────────────────────────────────────────────────────────
function RecCard({ rec, onViewPathway, onFindTraining, isExpanded, onToggle }) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-md flex flex-col justify-between space-y-space-md hover:-translate-y-1 transition-transform">
      <div className="space-y-space-md">
        <div className="flex items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="px-space-sm py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-bold">
              {rec.nsqfLevel.startsWith('To be') ? 'NSQF — To be verified' : rec.nsqfLevel}
            </span>
            {rec.badge && (
              <span className="px-space-sm py-1 rounded-full bg-tertiary-fixed/70 text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                {rec.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary-container/60 text-on-secondary-container">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">{rec.matchScore}%</span>
            <span className="font-label-sm text-label-sm uppercase font-semibold">AI Match</span>
          </div>
        </div>

        <div>
          <h3 className="font-headline-md text-headline-md text-primary">{rec.title}</h3>
          {rec.localTitle && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{rec.localTitle}</p>}
        </div>

        <div className="grid grid-cols-3 gap-space-xs">
          <ScoreBar label="Skills" value={rec.skillScore} />
          <ScoreBar label="Interest" value={rec.interestScore} />
          <ScoreBar label="Mobility" value={rec.mobilityScore} />
        </div>

        <div>
          <button
            className="flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold py-1 w-full text-left"
            onClick={onToggle}
          >
            <span className="material-symbols-outlined text-sm">{isExpanded ? 'expand_less' : 'expand_more'}</span>
            Why this match?
          </button>
          {isExpanded && (
            <div className="mt-space-xs space-y-space-sm">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{rec.whyMatch}</p>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Skill Gaps Addressed</div>
                <ul className="space-y-0.5">
                  {rec.skillGaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-xs mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Training</div>
                <span className="font-label-md text-label-md font-bold text-primary">{rec.training.title}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant ml-2">• {rec.training.duration}</span>
                <div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 italic">{rec.training.hours}</div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Livelihood Pathway</div>
                <div className="flex flex-wrap items-center gap-1">
                  {rec.pathway.steps.map((step, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="px-space-xs py-0.5 rounded-lg bg-surface-container font-label-sm text-label-sm text-primary font-semibold">{step}</span>
                      {i < rec.pathway.steps.length - 1 && <span className="material-symbols-outlined text-xs text-on-surface-variant">arrow_forward</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-space-xs pt-1">
                <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant italic">{rec.giaStatus}</span>
                <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant italic">{rec.localDemand}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-space-xs pt-space-xs">
        <button
          className="w-full py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold transition-colors flex items-center justify-center gap-space-xs hover:bg-secondary"
          onClick={() => onViewPathway(rec)}
        >
          <span>View Livelihood Pathway</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
        <button
          className="w-full py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-space-xs"
          onClick={onFindTraining}
        >
          <span className="material-symbols-outlined text-sm">school</span>
          Find Training Centers
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLAGSHIP CARD
// ─────────────────────────────────────────────────────────────────────────────
function FlagshipCard({ rec, onViewPathway, onFindTraining }) {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className="relative bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xl">
      <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>
      <div className="relative p-space-lg lg:p-space-xl flex flex-col space-y-space-lg">
        <div className="space-y-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-space-sm py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                Recommended Pathway
              </span>
              {rec.badge && (
                <span className="px-space-sm py-1 rounded-full bg-tertiary-fixed/70 text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                  {rec.badge}
                </span>
              )}
              <span className="px-space-sm py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-semibold">
                {rec.nsqfLevel.startsWith('To be') ? 'NSQF — To be verified' : rec.nsqfLevel}
              </span>
            </div>
            <div className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary-container text-on-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">{rec.matchScore}%</span>
              <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-tight">AI Match</span>
            </div>
          </div>

          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">{rec.title}</h2>
            {rec.localTitle && <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{rec.localTitle}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
            <ScoreBar label="Skills" value={rec.skillScore} />
            <ScoreBar label="Interest" value={rec.interestScore} />
            <ScoreBar label="Mobility" value={rec.mobilityScore} />
            <div className="p-space-sm rounded-2xl bg-surface-container-low">
              <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Duration</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">{rec.training.duration}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mt-0.5">AI Recommendation</span>
            </div>
          </div>

          <div>
            <button
              className="flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold py-1 w-full text-left"
              onClick={() => setIsExpanded(e => !e)}
            >
              <span className="material-symbols-outlined text-sm">{isExpanded ? 'expand_less' : 'expand_more'}</span>
              {isExpanded ? 'Hide details' : 'Why this match?'}
            </button>
            {isExpanded && (
              <div className="mt-space-sm space-y-space-md">
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{rec.whyMatch}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Skill Gaps Addressed</div>
                    <ul className="space-y-1">
                      {rec.skillGaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-body-md text-body-md text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Recommended Training</div>
                    <div className="font-label-lg text-label-lg font-bold text-primary">{rec.training.title}</div>
                    <div className="font-body-md text-body-md text-on-surface-variant mt-1">Duration: {rec.training.duration}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant italic mt-0.5">{rec.training.hours}</div>
                    <div className="flex flex-wrap gap-space-xs mt-space-sm">
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant italic">{rec.giaStatus}</span>
                      <span className="font-label-sm text-label-sm px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant italic">{rec.localDemand}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Livelihood Pathway</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rec.pathway.steps.map((step, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="px-space-sm py-1 rounded-xl bg-surface-container font-label-md text-label-md text-primary font-semibold">{step}</span>
                        {i < rec.pathway.steps.length - 1 && <span className="material-symbols-outlined text-xs text-on-surface-variant">arrow_forward</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
          <button
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:bg-secondary transition-all"
            onClick={() => onViewPathway(rec)}
          >
            <span>View Livelihood Pathway</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold transition-colors"
            onClick={onFindTraining}
          >
            <span className="material-symbols-outlined text-secondary text-base">school</span>
            <span>Find Training Centers</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTOR FILTERS
// ─────────────────────────────────────────────────────────────────────────────
const ALL_SECTORS = [
  'All Sectors', 'Electronics & Solar', 'Leather & Footwear',
  'Agri & Food Processing', 'Apparel & Tailoring', 'IT & Digital Services',
  'Construction & Wood Crafts', 'Beauty & Wellness', 'General Livelihood'
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AIRecommendations({ userProfile, onStartVoice, onNavigateToNearby, onNavigateToRoadmap }) {
  const navigate = useNavigate();
  const { beneficiaryProfile } = useSession();

  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [expandedCards, setExpandedCards] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const combinedProfile = useMemo(() => ({
    ...userProfile,
    ...beneficiaryProfile,
    name: beneficiaryProfile.full_name || (userProfile && userProfile.name) || 'Beneficiary'
  }), [userProfile, beneficiaryProfile]);

  const hasData = useMemo(() => hasEnoughData(beneficiaryProfile), [beneficiaryProfile]);
  const allRecs = useMemo(() => hasData ? generateRecommendations(beneficiaryProfile, userProfile) : [], [beneficiaryProfile, userProfile, hasData]);

  const filteredRecs = useMemo(() => {
    let recs = selectedSector === 'All Sectors' ? allRecs : allRecs.filter(r => r.sector_tag === selectedSector || r.sector === selectedSector);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      recs = recs.filter(r => r.title.toLowerCase().includes(q) || r.sector_tag.toLowerCase().includes(q) || r.skillGaps.some(g => g.toLowerCase().includes(q)));
    }
    return recs;
  }, [allRecs, selectedSector, searchQuery]);

  const flagship = filteredRecs[0] || null;
  const secondary = filteredRecs.slice(1);

  // Profile status
  const profileFilled = hasData;
  const skillAnalysisDone = profileFilled && (Array.isArray(beneficiaryProfile.existing_skills) && beneficiaryProfile.existing_skills.length > 0);

  const primaryInterest = beneficiaryProfile.interests && beneficiaryProfile.interests.length > 0
    ? beneficiaryProfile.interests[0]
    : (beneficiaryProfile.career_aspiration || 'Not provided');

  const handleViewPathway = (rec) => {
    if (onNavigateToRoadmap) onNavigateToRoadmap(rec);
    else navigate('/roadmap');
  };
  const handleFindTraining = () => {
    if (onNavigateToNearby) onNavigateToNearby();
    else navigate('/nearby');
  };
  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  // ── INCOMPLETE STATE ────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="flex flex-col w-full">
        <div className="px-space-md lg:px-space-xl py-space-lg max-w-7xl mx-auto w-full space-y-space-xl">
          <div>
            <h1 className="font-display-hero text-display-hero text-primary tracking-tight">AI Recommendations</h1>
            <p className="font-body-xl text-body-xl text-on-surface-variant leading-relaxed">
              Personalized livelihood and skilling pathways based on your profile, skills, aspirations, and local opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-space-sm">
            <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-sm">cancel</span>
              Profile incomplete
            </span>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-sm">pending</span>
              Skill analysis pending
            </span>
          </div>

          <div className="bg-tertiary-fixed/20 border border-tertiary-container rounded-3xl p-space-xl text-center space-y-space-md">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-headline-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">Complete Your Voice Assessment</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              Complete your Voice Assessment to receive personalized livelihood recommendations. Saathi AI will ask about your skills, experience, and goals to generate pathways tailored specifically for you.
            </p>
            <button
              className="inline-flex items-center gap-space-sm px-space-xl py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:bg-secondary transition-colors"
              onClick={onStartVoice || (() => navigate('/voice'))}
            >
              <span className="material-symbols-outlined text-base">mic</span>
              Continue Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FULL RECOMMENDATIONS VIEW ────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full">
      <div className="px-space-md lg:px-space-xl py-space-lg max-w-7xl mx-auto w-full space-y-space-xl">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="max-w-3xl space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              AI Recommendations Engine • Personalized
            </div>
            <h1 className="font-display-hero text-display-hero text-primary tracking-tight">AI Recommendations</h1>
            <p className="font-body-xl text-body-xl text-on-surface-variant leading-relaxed">
              Personalized livelihood and skilling pathways based on your profile, skills, aspirations, and local opportunities.
            </p>
          </div>
        </div>

        {/* Status strip */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className={`inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold ${profileFilled ? 'bg-secondary-container/60 text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{profileFilled ? 'check_circle' : 'cancel'}</span>
            {profileFilled ? 'Profile analyzed' : 'Profile incomplete'}
          </span>
          <span className={`inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold ${skillAnalysisDone ? 'bg-secondary-container/60 text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{skillAnalysisDone ? 'check_circle' : 'pending'}</span>
            {skillAnalysisDone ? 'Skill analysis completed' : 'Skill analysis pending'}
          </span>
          <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm italic">
            AI-generated recommendations — not official government endorsements
          </span>
        </div>

        {/* Based on your profile */}
        <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-space-sm">Based on your profile:</span>
          <div className="flex flex-wrap gap-space-md">
            {[
              { label: 'Current Livelihood', value: beneficiaryProfile.current_occupation || 'Not provided' },
              { label: 'Primary Interest', value: primaryInterest },
              { label: 'Preference', value: beneficiaryProfile.employment_preference || 'Not provided' },
              { label: 'Mobility', value: beneficiaryProfile.mobility_limit_km ? 'Within ' + beneficiaryProfile.mobility_limit_km + ' km' : 'Not provided' },
              { label: 'Availability', value: beneficiaryProfile.training_availability || 'Not provided' },
            ].map(item => (
              <div key={item.label} className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                <span className="font-label-lg text-label-lg font-bold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector filters */}
        <div className="space-y-space-sm">
          <div className="flex flex-wrap gap-space-xs">
            {ALL_SECTORS.filter(s => s === 'All Sectors' || allRecs.some(r => r.sector_tag === s || r.sector === s)).map(sector => (
              <button
                key={sector}
                className={`px-space-sm py-1.5 rounded-full font-label-md text-label-md font-semibold transition-colors ${selectedSector === sector ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                onClick={() => setSelectedSector(sector)}
              >
                {sector}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
            <input
              type="text"
              placeholder="Search job roles, skills or pathways..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* No results */}
        {filteredRecs.length === 0 && (
          <div className="bg-surface-container rounded-2xl p-space-xl text-center">
            <span className="material-symbols-outlined text-headline-lg text-on-surface-variant">search_off</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm">No recommendations found for this filter. Try "All Sectors" or update your Voice Assessment.</p>
            <button className="mt-space-md px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:bg-secondary transition-colors" onClick={() => { setSelectedSector('All Sectors'); setSearchQuery(''); }}>Show All</button>
          </div>
        )}

        {/* Flagship card */}
        {flagship && (
          <FlagshipCard
            rec={flagship}
            onViewPathway={handleViewPathway}
            onFindTraining={handleFindTraining}
          />
        )}

        {/* Secondary cards */}
        {secondary.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {secondary.map(rec => (
              <RecCard
                key={rec.id}
                rec={rec}
                onViewPathway={handleViewPathway}
                onFindTraining={handleFindTraining}
                isExpanded={!!expandedCards[rec.id]}
                onToggle={() => toggleCard(rec.id)}
              />
            ))}
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="relative bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary rounded-3xl p-space-lg lg:p-space-xl overflow-hidden shadow-xl">
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
            <div className="flex items-start gap-space-md max-w-3xl">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex-shrink-0 flex items-center justify-center text-secondary-fixed">
                <span className="material-symbols-outlined text-headline-md" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-secondary-fixed">Important Notice</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-surface font-semibold leading-snug">
                  These recommendations are AI-generated and personalized to your stated profile.
                </p>
                <p className="font-body-md text-body-md text-primary-fixed-dim/90 pt-1">
                  Match scores, NSQF levels, GIA eligibility and income figures marked "to be verified" must be confirmed at your nearest PMKK (Pradhan Mantri Kaushal Kendra) centre. The AI does not determine government scheme eligibility.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-space-sm w-full md:w-auto">
              <button
                className="w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-surface text-primary font-label-lg text-label-lg font-bold shadow hover:bg-surface-container transition-colors whitespace-nowrap"
                onClick={onStartVoice || (() => navigate('/voice'))}
              >
                Update via Voice Assessment
              </button>
              <button
                className="w-full sm:w-auto px-space-md py-space-sm rounded-xl bg-primary/40 text-on-primary text-center font-label-md text-label-md font-semibold hover:bg-primary/60 transition-colors whitespace-nowrap"
                onClick={handleFindTraining}
              >
                Find Nearby Centers
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
