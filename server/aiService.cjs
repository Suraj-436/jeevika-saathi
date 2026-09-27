// server/aiService.cjs
// Server-side AI service — reads OPENROUTER_API_KEY from process.env
// NEVER exposes key to frontend

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Build the system prompt for Jeevika Saathi voice assessment.
 */
function buildSystemPrompt(language = 'en-IN') {
  const langName = { 'en-IN': 'English', 'hi-IN': 'Hindi', 'mr-IN': 'Marathi' }[language] || 'English';

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
  // DeepSeek can be slow — 30 seconds
  const serverTimeout = setTimeout(() => controller.abort(), 30000);

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
        max_tokens: 1000
      }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(serverTimeout);
    if (fetchErr.name === 'AbortError') {
      throw new Error('AI service timed out. Please try again.');
    }
    throw fetchErr;
  }

  clearTimeout(serverTimeout);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('[OpenRouter] API error:', response.status, errorText.slice(0, 500));
    throw new Error(`AI service error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    console.error('[OpenRouter] Empty response. Full data:', JSON.stringify(data).slice(0, 500));
    throw new Error('AI service returned empty response');
  }

  console.log('[OpenRouter] Raw response:', rawContent.slice(0, 500));
  return parseStructuredResponse(rawContent);
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

module.exports = { callOpenRouter, buildSystemPrompt };
