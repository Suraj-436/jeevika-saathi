// server/aiService.cjs
// Server-side AI service — reads OPENROUTER_API_KEY from process.env
// NEVER exposes key to frontend

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Build the system prompt for Jeevika Saathi voice assessment.
 */
function buildSystemPrompt(language = 'en-IN') {
  const langName = {
    'en-IN': 'English',
    'en': 'English',
    'hi-IN': 'Hindi',
    'hi': 'Hindi',
    'te-IN': 'Telugu',
    'te': 'Telugu',
    'ta-IN': 'Tamil',
    'ta': 'Tamil',
    'kn-IN': 'Kannada',
    'kn': 'Kannada',
    'ml-IN': 'Malayalam',
    'ml': 'Malayalam',
    'mr-IN': 'Marathi',
    'mr': 'Marathi'
  }[language] || 'English';

  return `You are Saathi AI, a compassionate livelihood counselor for the PM-AJAY Jeevika Saathi program in India. You conduct a warm, conversational assessment to understand a beneficiary's background, skills, aspirations, and constraints.

You MUST always respond in ${langName} ONLY.

════════════════════════════════════════════════
YOUR TASK AT EVERY TURN:
════════════════════════════════════════════════
1. READ the user's message carefully.
2. EXTRACT all information mentioned — be generous in extraction. Do NOT treat an option as the user's answer until the user actually selects/confirms it.
3. IDENTIFY what important information is still missing. Do NOT ask for information that has already been provided.
4. ASK exactly ONE warm, simple follow-up question for the most important missing field.

════════════════════════════════════════════════
QUESTIONING & OPTIONS (CRITICAL BEHAVIOR):
════════════════════════════════════════════════
- Evaluate whether giving options/examples would make it easier for the beneficiary to answer (e.g., choosing between job/business, types of work, travel distances).
- IF HELPFUL: Ask the question naturally and provide 3-5 simple, relevant options. 
  - ALWAYS use context-aware options based on previous answers (e.g., if they are a carpenter, offer carpentry-related training options, not farming).
  - ALWAYS include an "Other" or "Something else" option.
  - DO NOT force selection. Tell them: "If it's easier, you can choose from these... Or you can simply tell me in your own words."
- IF NOT HELPFUL (e.g., free-form past experience): Ask naturally without options.
- IF USER EXPLICITLY ASKS FOR OPTIONS (e.g., "I don't know", "What are the choices?"): Provide 3-5 clear, simple options relevant to the CURRENT question.
- CONVERSATIONAL TONE: You are a voice assistant. Keep options very short and simple. Do NOT use long paragraphs or sound like a government form. Avoid terms like "Input your response" or "Select one". Use "Some examples are..." or "You can choose from..."

════════════════════════════════════════════════
EXTRACTION RULES (CRITICAL):
════════════════════════════════════════════════
- Accept both exact option matches AND free-form natural responses. Map them to the correct fields.
- Multiple options can be selected (e.g., "I measure wood and do polishing" -> extract both).
- If user says "I make doors and furniture" → existing_skills = ["door making", "furniture making"]
- If user says "I have been a carpenter for 4 years" → current_occupation = "Carpenter", existing_skills = ["carpentry"]
- If user says "my family does carpentry" → family_occupation = "Carpentry"
- If user says "I want my own shop" or "Self employment" → employment_preference = "Self-employment", career_aspiration = "Own workshop"
- If user says "I can travel 20 km" or "20 kilometres" → mobility_limit_km = 20

TRAINING AVAILABILITY & DURATION EXTRACTION RULES:
- When asking about Training Availability, ask:
  "How much time can you give for training? For example, would you be able to train for 1 month, 2 months, 3 months, or longer?"
  And provide options naturally:
  "You can say: Less than 1 month, 1 month, 2 months, 3 months, 4–6 months, More than 6 months, or I'm not sure yet. Or you can tell me in your own words."
- Separate duration, schedule, and availability into distinct fields:
  * "I can give 2 months" → training_availability_duration = "2 months", training_availability = "Available"
  * "I can only attend for one month" → training_availability_duration = "1 month", training_availability = "Available"
  * "I have around three months available" → training_availability_duration = "3 months", training_availability = "Available"
  * "I can train on weekends for about 3 months" → training_availability_duration = "3 months", training_schedule = "Weekends", training_availability = "Available"
  * "I can attend for 2 months, preferably in the evenings" → training_availability_duration = "2 months", training_schedule = "Evenings", training_availability = "Available"
  * "I can train for 2 months after 6 PM" → training_availability_duration = "2 months", training_schedule = "After 6 PM", training_availability = "Available"
  * "I don't know yet" / "I'm not sure" → training_availability_duration = "Not decided", training_availability = "Not decided"
- Do NOT leave existing_skills empty if the user mentioned ANY hands-on activity.

════════════════════════════════════════════════
FIELDS TO COLLECT (priority order):
════════════════════════════════════════════════
1. full_name                      — Beneficiary's full name (MANDATORY FIRST QUESTION)
2. current_occupation             — what they currently do for income
3. family_occupation              — what their family does / did
4. existing_skills                — hands-on skills, activities, things they make/do
5. interests                      — what they want to learn or new areas of interest
6. career_aspiration              — their goal (job, self-employment, specific role)
7. employment_preference          — "wage employment", "self-employment", or "both"
8. mobility_limit_km              — how far they can travel (numeric km)
9. training_availability_duration — how long they can commit ("1 month", "2 months", "3 months", "4–6 months", "More than 6 months", "Not decided")
10. training_schedule             — schedule/timing ("Weekends", "Evenings", "After 6 PM", "Full-time")
11. training_availability         — general status ("Available", "Available for training", "Not decided")

*IMPORTANT NAME RULE*: If full_name is null, you MUST ask "Before we begin, may I know your name?" (in ${langName}). Do NOT ask any livelihood questions until full_name is collected. Once they provide it, confirm it naturally: "Thank you, [Name]. Let's begin..."

*IMPORTANT TRAINING COMPLETION RULE*: The assessment must NOT be marked complete until Training Availability has been properly handled (must have either a valid training duration or an explicit "not decided / not sure").

════════════════════════════════════════════════
RESPONSE FORMAT — RETURN ONLY THIS JSON:
════════════════════════════════════════════════
{
  "assistant_message": "Your next warm question in ${langName}",
  "extracted_data": {
    "full_name": null,
    "current_occupation": null,
    "family_occupation": null,
    "existing_skills": [],
    "interests": [],
    "career_aspiration": null,
    "employment_preference": null,
    "mobility_limit_km": null,
    "training_availability": null,
    "training_availability_duration": null,
    "training_schedule": null
  },
  "next_step": "one of: name|livelihood|skills|interests|aspiration|employment|mobility|training|complete",
  "confidence": 0.0,
  "is_complete": false
}

IMPORTANT:
- extracted_data must only contain fields newly mentioned or confirmed IN THIS USER MESSAGE.
- Set is_complete = true ONLY when all required fields have values across the FULL conversation: full_name, current_occupation, existing_skills, career_aspiration, employment_preference, mobility_limit_km, and training_availability_duration.
- confidence is 0.0 to 1.0 reflecting clarity of THIS extraction.
- Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;
}

/**
 * Call OpenRouter API with the conversation history.
 */
async function callOpenRouter(conversationMessages, language = 'en-IN') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured on the server');
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt(language) },
    ...conversationMessages.map(m => ({
      role: m.speaker === 'assistant' ? 'assistant' : 'user',
      content: m.text
    }))
  ];

  const controller = new AbortController();
  // 20s timeout before engaging local smart counseling fallback
  const serverTimeout = setTimeout(() => controller.abort(), 20000);

  let response;
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jeevika-saathi.gov.in',
        'X-Title': 'Jeevika Saathi - PM-AJAY'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        max_tokens: 800,
        reasoning: { effort: 'none' }
      }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(serverTimeout);
    console.warn('[OpenRouter] Fetch failed or timed out:', fetchErr.message, '— engaging smart counseling fallback.');
    return getFallbackCounselingResponse(conversationMessages, language);
  }

  clearTimeout(serverTimeout);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.warn('[OpenRouter] API error:', response.status, errorText.slice(0, 300), '— engaging smart counseling fallback.');
    return getFallbackCounselingResponse(conversationMessages, language);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    console.warn('[OpenRouter] Empty content (finish_reason:', data.choices?.[0]?.finish_reason, ') — engaging smart counseling fallback.');
    return getFallbackCounselingResponse(conversationMessages, language);
  }

  console.log('[OpenRouter] Raw response:', rawContent.slice(0, 500));
  try {
    return parseStructuredResponse(rawContent);
  } catch (parseErr) {
    console.warn('[OpenRouter] JSON parse failed, engaging smart counseling fallback:', parseErr.message);
    return getFallbackCounselingResponse(conversationMessages, language);
  }
}

/**
 * Parse and validate the structured JSON response from the AI.
 */
function parseStructuredResponse(rawContent) {
  try {
    // Strip markdown code fences if present
    let jsonStr = rawContent.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }
    // Also handle cases where the model adds text before/after the JSON object
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonStr = objMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Extract full_name
    const fullName = parsed.extracted_data?.full_name || parsed.extracted_data?.fullName || null;

    // Normalize training fields
    let trainingDuration = parsed.extracted_data?.training_availability_duration || parsed.extracted_data?.trainingAvailabilityDuration || null;
    let trainingSchedule = parsed.extracted_data?.training_schedule || parsed.extracted_data?.trainingSchedule || null;
    let trainingAvailability = parsed.extracted_data?.training_availability || parsed.extracted_data?.trainingAvailability || null;

    if (trainingAvailability && typeof trainingAvailability === 'object') {
      if (!trainingSchedule && trainingAvailability.schedule) trainingSchedule = trainingAvailability.schedule;
      if (!trainingDuration && trainingAvailability.duration) trainingDuration = trainingAvailability.duration;
      trainingAvailability = trainingAvailability.status || (trainingDuration ? "Available" : null);
    } else if (typeof trainingAvailability === 'string') {
      // If AI packed duration or schedule into string like "3 months" or "Weekends • 3 months"
      if (!trainingDuration) {
        const durMatch = trainingAvailability.match(/(\d+\s*(?:to|-)?\s*\d*\s*months?|less than 1 month|more than \d+ months?|not decided|not sure)/i);
        if (durMatch) trainingDuration = durMatch[0];
      }
      if (!trainingSchedule) {
        const schedMatch = trainingAvailability.match(/(weekends?|evenings?|after \d+\s*(?:pm|am)|full[\s-]time|daytime)/i);
        if (schedMatch) trainingSchedule = schedMatch[0];
      }
    }

    if (trainingDuration && !trainingAvailability) {
      trainingAvailability = trainingDuration.toLowerCase().includes("not") ? "Not decided" : "Available";
    }

    // Normalize existing_skills — ensure it's an array
    const skillsRaw = parsed.extracted_data?.existing_skills || parsed.extracted_data?.existingSkills;
    const skills = Array.isArray(skillsRaw)
      ? skillsRaw.filter(s => typeof s === 'string' && s.trim())
      : (typeof skillsRaw === 'string' && skillsRaw.trim() ? [skillsRaw.trim()] : []);

    // Normalize interests
    const interestsRaw = parsed.extracted_data?.interests ?? parsed.extracted_data?.areas_of_interest ?? parsed.extracted_data?.areasOfInterest;
    const interests = Array.isArray(interestsRaw)
      ? interestsRaw.filter(s => typeof s === 'string' && s.trim())
      : (typeof interestsRaw === 'string' && interestsRaw.trim() ? [interestsRaw.trim()] : []);

    // Normalize mobility_limit_km — can be string like "20 km" or number 20
    let mobilityKm = parsed.extracted_data?.mobility_limit_km ?? parsed.extracted_data?.mobilityLimitKm;
    if (typeof mobilityKm === 'string') {
      const num = parseInt(mobilityKm.replace(/[^0-9]/g, ''), 10);
      mobilityKm = isNaN(num) ? null : num;
    }

    return {
      assistant_message: (parsed.assistant_message || 'Could you tell me a bit more about yourself?').trim(),
      extracted_data: {
        full_name: fullName,
        fullName: fullName,
        current_occupation: parsed.extracted_data?.current_occupation || parsed.extracted_data?.currentOccupation || null,
        currentOccupation: parsed.extracted_data?.current_occupation || parsed.extracted_data?.currentOccupation || null,
        family_occupation: parsed.extracted_data?.family_occupation || parsed.extracted_data?.familyOccupation || null,
        familyOccupation: parsed.extracted_data?.family_occupation || parsed.extracted_data?.familyOccupation || null,
        existing_skills: skills,
        existingSkills: skills,
        interests: interests,
        career_aspiration: parsed.extracted_data?.career_aspiration || parsed.extracted_data?.careerAspiration || null,
        careerAspiration: parsed.extracted_data?.career_aspiration || parsed.extracted_data?.careerAspiration || null,
        employment_preference: parsed.extracted_data?.employment_preference || parsed.extracted_data?.employmentPreference || null,
        employmentPreference: parsed.extracted_data?.employment_preference || parsed.extracted_data?.employmentPreference || null,
        mobility_limit_km: typeof mobilityKm === 'number' && !isNaN(mobilityKm) ? mobilityKm : null,
        mobilityLimitKm: typeof mobilityKm === 'number' && !isNaN(mobilityKm) ? mobilityKm : null,
        training_availability: trainingAvailability || (trainingDuration ? "Available" : null),
        trainingAvailability: trainingAvailability || (trainingDuration ? "Available" : null),
        training_availability_duration: trainingDuration,
        trainingAvailabilityDuration: trainingDuration,
        training_schedule: trainingSchedule,
        trainingSchedule: trainingSchedule,
      },
      next_step: parsed.next_step || 'livelihood',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      is_complete: parsed.is_complete === true,
    };
  } catch (err) {
    console.error('[OpenRouter] Failed to parse AI response:', err.message);
    console.error('[OpenRouter] Raw content was:', rawContent.slice(0, 500));
    // Re-throw so the caller can return a proper error to the client
    throw new Error('AI returned malformed response');
  }
}

/**
 * Deterministic Fallback Counselor
 * Seamlessly continues the assessment conversation if OpenRouter experiences timeouts or network errors.
 */
function getFallbackCounselingResponse(conversationMessages = [], language = 'en-IN') {
  const userMessages = conversationMessages.filter(m => m.speaker === 'user');
  const latestUserMsg = (userMessages[userMessages.length - 1]?.text || '').trim();
  const allUserText = userMessages.map(m => m.text).join(' ').toLowerCase();
  const latestLower = latestUserMsg.toLowerCase();
  const assistantMessages = conversationMessages.filter(m => m.speaker === 'assistant');
  const lastAssistantMsg = (assistantMessages[assistantMessages.length - 1]?.text || '').toLowerCase();

  // 1. Name Extraction
  let extractedName = null;
  const namePatterns = [
    /(?:my name is|i am|mera naam|na peru|call me|myself)\s+([A-Za-z]+)/i,
    /^(?:i am\s+)?([A-Z][a-z]+)$/
  ];
  for (const pat of namePatterns) {
    const match = latestUserMsg.match(pat);
    if (match && match[1]) {
      extractedName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      break;
    }
  }
  // If last assistant asked for name and user gave 1-3 words
  if (!extractedName && (lastAssistantMsg.includes('your name') || lastAssistantMsg.includes('know your name') || lastAssistantMsg.includes('aapka naam'))) {
    const cleanTokens = latestUserMsg.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
    if (cleanTokens.length > 0 && cleanTokens.length <= 3 && !['hello', 'hi', 'yes', 'no'].includes(cleanTokens[0].toLowerCase())) {
      extractedName = cleanTokens[0].charAt(0).toUpperCase() + cleanTokens[0].slice(1).toLowerCase();
    }
  }

  // 2. Current Occupation Extraction
  let currentOcc = null;
  if (/carpent|wood/.test(allUserText)) currentOcc = 'Carpenter';
  else if (/electri|wiring|circuit/.test(allUserText)) currentOcc = 'Electrician';
  else if (/plumb|pipe/.test(allUserText)) currentOcc = 'Plumber';
  else if (/solar/.test(allUserText)) currentOcc = 'Solar Technician';
  else if (/tailor|sew|stitch/.test(allUserText)) currentOcc = 'Tailor';
  else if (/farm|kisan|agri/.test(allUserText)) currentOcc = 'Farmer / Agriculture';
  else if (/labour|labor|helper|mazdoor|daily wage/.test(allUserText)) currentOcc = 'Labour';
  else if (/driver/.test(allUserText)) currentOcc = 'Driver';
  else if (/computer|data entry|typing/.test(allUserText)) currentOcc = 'Data Entry Operator';

  // 3. Skills Extraction
  const skills = [];
  if (/carpent|wood|furniture/.test(allUserText)) skills.push('woodworking', 'measuring');
  if (/soldering|circuit|wire|wiring/.test(allUserText)) skills.push('wiring', 'circuit repair');
  if (/mason|brick|cement|plaster/.test(allUserText)) skills.push('masonry', 'brick work');
  if (/stitch|sew|cloth|cutting/.test(allUserText)) skills.push('stitching', 'cutting');
  if (/load|carrying|mixing|heavy|digging/.test(allUserText)) skills.push('manual labor', 'material handling');
  if (/drive|driving/.test(allUserText)) skills.push('vehicle driving');
  if (/typing|excel|word|computer/.test(allUserText)) skills.push('computer typing', 'data entry');

  // 4. Employment Preference
  let empPref = null;
  if (/self|own shop|business|dukaan|enterprise|independent/.test(allUserText)) empPref = 'Self-employment';
  else if (/wage|job|company|factory|salary|naukri/.test(allUserText)) empPref = 'Wage employment';

  // 5. Training Duration
  let duration = null;
  if (/1 month|one month|30 day/.test(allUserText)) duration = '1 month';
  else if (/2 month|two month|60 day/.test(allUserText)) duration = '2 months';
  else if (/3 month|three month|90 day/.test(allUserText)) duration = '3 months';
  else if (/6 month|half year/.test(allUserText)) duration = '4–6 months';
  else if (/not sure|don't know|not decide/.test(allUserText)) duration = 'Not decided';

  // Determine next question
  let nextStep = 'livelihood';
  const nameToUse = extractedName || (language.startsWith('te') ? 'మిత్రమా' : language.startsWith('hi') ? 'दोस्त' : 'friend');

  if (lastAssistantMsg.includes('your name') || extractedName) {
    nextStep = 'skills';
  } else if (!skills || skills.length === 0) {
    nextStep = 'interests';
  } else if (!empPref) {
    nextStep = 'employment';
  } else if (!duration) {
    nextStep = 'training';
  } else {
    nextStep = 'complete';
  }

  const cleanLang = (language || 'en').toLowerCase().split('-')[0];
  const MESSAGES_BY_LANG = {
    te: {
      skills: `ధన్యవాదాలు, ${nameToUse}! మీరు ${currentOcc || 'మీ పని'} లో అనుభవం ఉన్నట్లు చెప్పారు. మీరు చేసిన నిర్దిష్ట పనులు లేదా ఉపయోగించిన ఉపకరణాల గురించి చెప్పగలరా? ఉదాహరణకు: భవన నిర్మాణం, వ్యవసాయం, విద్యుత్ మరమ్మత్తు, లేదా ఇతర పనులు?`,
      interests: `మీ అనుభవం తెలిపినందుకు ధన్యవాదాలు. పీఎం-అజయ్ పథకం కింద మీరు ఏ విధమైన సాంకేతిక నైపుణ్యాలు లేదా పనులు నేర్చుకోవాలనుకుంటున్నారు? ఉదాహరణకు: సోలార్ ప్యానెల్, మొబైల్ రిపేర్, కంప్యూటర్ లేదా వర్క్‌షాప్ నైపుణ్యాలు?`,
      employment: `చాలా మంచిది. మీ ప్రధాన లక్ష్యం ఏమిటి? మీరు ఒక కంపెనీలో స్థిరమైన ఉద్యోగం కోరుకుంటున్నారా, లేదా స్వంత వ్యాపారం / దుకాణం ప్రారంభించాలనుకుంటున్నారా?`,
      training: `చక్కటి నిర్ణయం! శిక్షణ కోసం మీరు ఎంత సమయం కేటాయించగలరు? ఉదాహరణకు: 1 నెల, 2 నెలలు, 3 నెలలు లేదా ఇంకా నిర్ణయించుకోలేదా?`,
      complete: `చాలా ధన్యవాదాలు, ${nameToUse}! మీ వివరాలు, నైపుణ్యాలు మరియు ప్రాధాన్యతలు నమోదు చేయబడ్డాయి. మీ ప్రొఫైల్ పూర్తయింది, సిఫార్సుల పేజీలో మీ కోర్సులు సిద్ధంగా ఉన్నాయి!`
    },
    hi: {
      skills: `धन्यवाद, ${nameToUse}! आपने ${currentOcc || 'अपने काम'} का अनुभव बताया। क्या आप मुझे बता सकते हैं कि आपने कौन-से विशिष्ट कार्य किए हैं या किन औजारों का उपयोग किया है? जैसे: निर्माण कार्य, खेती, बिजली मरम्मत, या सिलाई?`,
      interests: `यह साझा करने के लिए धन्यवाद। पीएम-अजय के तहत आप किस प्रकार के तकनीकी कौशल सीखना चाहेंगे? जैसे: सोलर पैनल, मोबाइल रिपेयर, डिजिटल कंप्यूटर, या कोई अन्य कार्य?`,
      employment: `यह जानकर बहुत अच्छा लगा। आपका मुख्य लक्ष्य क्या है? क्या आप किसी कंपनी में नियमित नौकरी करना चाहते हैं, या सरकारी सहायता से अपना खुद का व्यवसाय/दुकान शुरू करना चाहते हैं?`,
      training: `बहुत बढ़िया! आप प्रशिक्षण के लिए कितना समय दे सकते हैं? जैसे: 1 महीना, 2 महीने, 3 महीने, या अभी तय नहीं किया है?`,
      complete: `बहुत-बहुत धन्यवाद, ${nameToUse}! आपके सभी विवरण, कौशल और समय उपलब्धता दर्ज कर लिए गए हैं। आपका मूल्यांकन पूरा हो गया है, सिफारिशें पेज पर आपके लिए प्रशिक्षण मार्ग तैयार हैं!`
    },
    en: {
      skills: `Thank you, ${nameToUse}! Let's begin. You mentioned you have experience in ${currentOcc || 'your current work'}. Could you tell me what specific hands-on tasks or tools you have worked with? For example: construction masonry, farm operations, electrical repair, or manual loading? Or you can describe in your own words.`,
      interests: `Thank you for sharing that. What kind of tools or technical skills would you like to learn under PM-AJAY? For example: solar panel installation, mobile & electronics repair, digital office computers, or workshop crafts?`,
      employment: `That is very helpful to know. Looking ahead, what is your primary goal? Would you prefer a stable wage job with an established company, or starting your own independent service shop/micro-enterprise with government credit support?`,
      training: `Great! How much time would you be able to dedicate to training? For example: 1 month, 2 months, 3 months, or are you not sure yet?`,
      complete: `Thank you so much, ${nameToUse}! I have noted all your background details, skills, and availability. Your profile is complete, and your personalized NSQF training pathways are ready on the Recommendations page!`
    }
  };

  const localizedPack = MESSAGES_BY_LANG[cleanLang] || MESSAGES_BY_LANG.en;
  const nextMsg = localizedPack[nextStep] || localizedPack.skills;

  return {
    assistant_message: nextMsg,
    extracted_data: {
      full_name: extractedName,
      fullName: extractedName,
      current_occupation: currentOcc,
      currentOccupation: currentOcc,
      family_occupation: null,
      familyOccupation: null,
      existing_skills: skills,
      existingSkills: skills,
      interests: [],
      career_aspiration: empPref ? `${empPref} in ${currentOcc || 'Skilled Trade'}` : null,
      careerAspiration: empPref ? `${empPref} in ${currentOcc || 'Skilled Trade'}` : null,
      employment_preference: empPref,
      employmentPreference: empPref,
      mobility_limit_km: 25,
      mobilityLimitKm: 25,
      training_availability: duration ? 'Available' : null,
      trainingAvailability: duration ? 'Available' : null,
      training_availability_duration: duration,
      trainingAvailabilityDuration: duration,
      training_schedule: 'Full-time',
      trainingSchedule: 'Full-time'
    },
    next_step: nextStep,
    confidence: 0.85,
    is_complete: nextStep === 'complete'
  };
}

module.exports = { callOpenRouter, buildSystemPrompt, getFallbackCounselingResponse };

