// src/data/skillAssessmentQuestions.js
/**
 * Centralized Competency Assessment Question Bank for Jeevika Saathi.
 * Designed for low-literacy beneficiaries with multilingual support,
 * visual choices, voice playback texts, and safety constraints.
 *
 * Supported Languages:
 * English (en), Hindi (hi), Telugu (te), Kannada (kn), Tamil (ta), Marathi (mr)
 *
 * Competency Categories:
 * - toolRecognition
 * - basicKnowledge
 * - safetyAwareness
 * - scenarioUnderstanding
 */

export const TRADE_DEFINITIONS = {
  "plumbing": {
    "id": "plumbing",
    "name": {
      "en": "Plumbing",
      "hi": "नलसाजी (Plumbing)",
      "te": "ప్లంబింగ్ (Plumbing)",
      "kn": "ಪ್ಲಂಬಿಂಗ್ (Plumbing / ನೀರು ಕೊಳವೆ ಕೆಲಸ)",
      "ta": "குழாய் பொருத்துநர் (Plumbing)",
      "mr": "प्लंबिंग / नळ कारागीर (Plumbing)"
    },
    "icon": "Wrench",
    "passScore": 70,
    "description": {
      "en": "Water pipe connections, leakage repairs, fittings and valve maintenance.",
      "hi": "पानी के पाइप कनेक्शन, रिसाव मरम्मत, फिटिंग और वाल्व रखरखाव।",
      "te": "నీటి పైపు కనెక్షన్లు, లీకేజీ మరమ్మతులు, ఫిట్టింగ్‌లు మరియు వాల్వ్ నిర్వహణ.",
      "kn": "ನೀರಿನ ಪೈಪ್ ಸಂಪರ್ಕಗಳು, ಸೋರಿಕೆ ದುರಸ್ತಿ, ಫಿಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ವಾಲ್ವ್ ನಿರ್ವಹಣೆ.",
      "ta": "நீர் குழாய் இணைப்புகள், கசிவு பழுதுபார்ப்பு, பொருத்துதல்கள் மற்றும் வால்வு பராமரிப்பு.",
      "mr": "पाण्याचे पाईप जोडणी, गळती दुरुस्ती, फिटिंग्ज आणि व्हॉल्व्ह देखभाल."
    }
  },
  "electrician": {
    "id": "electrician",
    "name": {
      "en": "Electrician",
      "hi": "इलेक्ट्रीशियन (Electrician)",
      "te": "ఎలక్ట్రీషియన్ (Electrician)",
      "kn": "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ (Electrician / ವಿದ್ಯುತ್ ಕೆಲಸ)",
      "ta": "மின்சார வல்லுநர் (Electrician)",
      "mr": "इलेक्ट्रिशियन (Electrician / विद्युत कामगार)"
    },
    "icon": "Zap",
    "passScore": 75,
    "safetyCritical": true,
    "description": {
      "en": "Safe domestic wiring, switchboards, MCB, fuses, and electrical repairs.",
      "hi": "सुरक्षित घरेलू वायरिंग, स्विचबोर्ड, एमसीबी, फ्यूज और विद्युत मरम्मत।",
      "te": "సురక్షితమైన గృహ వైరింగ్, స్విచ్‌బోర్డులు, ఎంసీబీ, ఫ్యూజులు మరియు విద్యుత్ మరమ్మతులు.",
      "kn": "ಸುರಕ್ಷಿತ ಮನೆ ವೈರಿಂಗ್, ಸ್ವಿಚ್‌ಬೋರ್ಡ್‌ಗಳು, ಎಂಸಿಬಿ, ಫ್ಯೂಸ್‌ಗಳು ಮತ್ತು ವಿದ್ಯುತ್ ದುರಸ್ತಿ.",
      "ta": "பாதுகாப்பான வீட்டு வயரிங், சுவிட்ச்போர்டுகள், எம்சிபி, ஃப்யூஸ்கள் மற்றும் மின் பழுதுபார்ப்பு.",
      "mr": "सुरक्षित घरगुती वायरिंग, स्विचबोर्ड, एमसीबी, फ्यूज आणि विजेची दुरुस्ती."
    }
  },
  "carpentry": {
    "id": "carpentry",
    "name": {
      "en": "Carpentry",
      "hi": "बढ़ईगीरी (Carpentry)",
      "te": "వడ్రంగి పని (Carpentry)",
      "kn": "ಬಡಗಿ ಕೆಲಸ (Carpentry / ಮರಗೆಲಸ)",
      "ta": "தச்சு வேலை (Carpentry)",
      "mr": "सुतारकाम (Carpentry / लाकडी काम)"
    },
    "icon": "Hammer",
    "passScore": 70,
    "description": {
      "en": "Wood measuring, cutting, basic joinery, furniture repairs and finishing.",
      "hi": "लकड़ी की माप, कटाई, बुनियादी जोड़, फर्नीचर मरम्मत और फिनिशिंग।",
      "te": "చెక్క కొలతలు, కోయడం, ప్రాథమిక కీళ్ళు, ఫర్నిచర్ మరమ్మతులు మరియు ఫినిషింగ్.",
      "kn": "ಮರದ ಅಳತೆ, ಕತ್ತರಿಸುವುದು, ಮೂಲ ಜೋಡಣೆ, ಪೀಠೋಪಕರಣ ದುರಸ್ತಿ ಮತ್ತು ಫಿನಿಶಿಂಗ್.",
      "ta": "மர அளவீடு, வெட்டுதல், அடிப்படை இணைப்பு, தளபாடங்கள் பழுதுபார்ப்பு மற்றும் பூச்சு.",
      "mr": "लाकडाचे मोजमाप, कटाई, मूलभूत जोडणी, फर्निचर दुरुस्ती आणि फिनिशिंग."
    }
  },
  "tailoring": {
    "id": "tailoring",
    "name": {
      "en": "Tailoring & Apparel",
      "hi": "सिलाई एवं परिधान (Tailoring)",
      "te": "టైలరింగ్ & దుస్తుల తయారీ",
      "kn": "ಹೊಲಿಗೆ ಮತ್ತು ಉಡುಪು ತಯಾರಿಕೆ (Tailoring)",
      "ta": "தையல் மற்றும் ஆடை தயாரிப்பு (Tailoring)",
      "mr": "शिलाई आणि वस्त्रनिर्मिती (Tailoring)"
    },
    "icon": "Scissors",
    "passScore": 70,
    "description": {
      "en": "Fabric measurement, pattern cutting, machine stitching and garment repair.",
      "hi": "कपड़े की माप, पैटर्न कटाई, मशीन सिलाई और परिधान मरम्मत।",
      "te": "బట్ట కొలతలు, నమూనా కటింగ్, మెషిన్ కుట్టు మరియు వస్త్ర మరమ్మతులు.",
      "kn": "ಬಟ್ಟೆ ಅಳತೆ, ಪ್ಯಾಟರ್ನ್ ಕತ್ತರಿಸುವುದು, ಯಂತ್ರದ ಹೊಲಿಗೆ ಮತ್ತು ಉಡುಪು ದುರಸ್ತಿ.",
      "ta": "துணி அளவீடு, முறை வெட்டுதல், தையல் இயந்திர பயன்பாடு மற்றும் ஆடை பழுதுபார்ப்பு.",
      "mr": "कापड मोजमाप, पॅटर्न कटिंग, मशीन शिलाई आणि कपडे दुरुस्ती."
    }
  },
  "masonry": {
    "id": "masonry",
    "name": {
      "en": "Masonry",
      "hi": "राजमिस्त्री (Masonry)",
      "te": "మేస్త్రీ పని (రాతి పని)",
      "kn": "ಮೇಸ್ತ್ರಿ ಕೆಲಸ (Masonry / ಗಾರೆ ಕೆಲಸ)",
      "ta": "கொத்தனார் வேலை (Masonry)",
      "mr": "गवंडी काम (Masonry / बांधकाम)"
    },
    "icon": "Building",
    "passScore": 70,
    "description": {
      "en": "Brick laying, mortar preparation, plumb line leveling and basic plastering.",
      "hi": "ईंट चिनाई, मसाला तैयार करना, साहुल लेवलिंग और बुनियादी प्लास्टर।",
      "te": "ఇటుక పని, మోర్టార్ తయారీ, ప్లంబ్‌లైన్ లెవలింగ్ మరియు ప్రాథమిక ప్లాస్టరింగ్.",
      "kn": "ಇಟ್ಟಿಗೆ ಕಟ್ಟುವುದು, ಗಾರೆ ತಯಾರಿಕೆ, ಸಾಹುಲ್ ತೂಕ ಲೈನ್ ಮತ್ತು ಮೂಲ ಪ್ಲಾಸ್ಟರಿಂಗ್.",
      "ta": "செங்கல் அடுக்குதல், கலவை தயாரித்தல், தூக்குநூல் அளவு மற்றும் பூச்சு வேலை.",
      "mr": "वीट बांधकाम, सिमेंट मसाला तयार करणे, साहुलीद्वारे समतोल साधणे आणि मूलभूत गिलावा."
    }
  },
  "farming": {
    "id": "farming",
    "name": {
      "en": "Farming / Agriculture",
      "hi": "कृषि एवं बागवानी (Farming)",
      "te": "వ్యవసాయం & పంటల సాగు",
      "kn": "ಕೃಷಿ ಮತ್ತು ಬೆಳೆ ನಿರ್ವಹಣೆ (Farming)",
      "ta": "விவசாயம் மற்றும் பயிர் சாகுபடி (Farming)",
      "mr": "शेती आणि पीक लागवड (Farming)"
    },
    "icon": "Sprout",
    "passScore": 70,
    "description": {
      "en": "Crop cultivation, basic soil preparation, irrigation, farm tools, crop care and agricultural safety.",
      "hi": "फसल की खेती, बुनियादी मिट्टी की तैयारी, सिंचाई, कृषि उपकरण, फसल देखभाल और कृषि सुरक्षा।",
      "te": "పంటల సాగు, ప్రాథమిక నేల తయారీ, నీటిపారుదల, వ్యవసాయ పరికరాలు, పంట రక్షణ మరియు భద్రత.",
      "kn": "ಬೆಳೆ ಕೃಷಿ, ಮೂಲ ಮಣ್ಣು ಸಿದ್ಧತೆ, ನೀರಾವರಿ, ಕೃಷಿ ಉಪಕರಣಗಳು ಮತ್ತು ಬೆಳೆ ಸುರಕ್ಷತೆ.",
      "ta": "பயிர் சாகுபடி, அடிப்படை நிலத் தயாரிப்பு, பாசனம், பண்ணைக் கருவிகள் மற்றும் விவசாய பாதுகாப்பு.",
      "mr": "पीक लागवड, मूलभूत जमिनीची मशागत, सिंचन, शेतीची अवजारे, पीक संरक्षण आणि सुरक्षितता."
    }
  }
};

export const ASSESSMENT_QUESTIONS = [
  {
    "id": "plumb_q1",
    "trade": "plumbing",
    "competency": "toolRecognition",
    "type": "visual_mcq",
    "question": {
      "en": "Which tool is commonly used to grip and tighten a round metal pipe fitting?",
      "hi": "गोल धातु के पाइप फिटिंग को पकड़ने और कसने के लिए आमतौर पर किस उपकरण का उपयोग किया जाता है?",
      "te": "గుండ్రని లోహపు పైపు ఫిట్టింగ్‌ను పట్టుకుని బిగించడానికి సాధారణంగా ఏ సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ದುಂಡಗಿನ ಲೋಹದ ಪೈಪ್ ಫಿಟ್ಟಿಂಗ್ ಅನ್ನು ಹಿಡಿದು ಬಿಗಿಗೊಳಿಸಲು ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "வட்ட வடிவ உலோக குழாய் பொருத்துதலைப் பிடித்து இறுக்க பொதுவாக எந்தக் கருவி பயன்படுத்தப்படுகிறது?",
      "mr": "गोलाकार धातूच्या पाईपचे फिटिंग पकडण्यासाठी आणि घट्ट आवळण्यासाठी सामान्यतः कोणते साधन वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which tool is used to tighten a pipe fitting?",
      "hi": "पाइप फिटिंग कसने के लिए कौन सा उपकरण इस्तेमाल होता है?",
      "te": "పైపు ఫిట్టింగ్ బిగించడానికి ఏ సాధనం ఉపయోగిస్తారు?",
      "kn": "ಪೈಪ್ ಫಿಟ್ಟಿಂಗ್ ಬಿಗಿಗೊಳಿಸಲು ಯಾವ ಉಪಕರಣ ಬಳಸುತ್ತಾರೆ?",
      "ta": "குழாய் பொருத்துதலை இறுக்க எந்தக் கருவி பயன்படுகிறது?",
      "mr": "पाईप फिटिंग आवळण्यासाठी कोणते साधन वापरतात?"
    },
    "options": [
      {
        "id": "pipe_wrench",
        "text": {
          "en": "Pipe Wrench",
          "hi": "पाइप रिंच",
          "te": "పైపు రెంచ్",
          "kn": "ಪೈಪ್ ವ್ರೆಂಚ್",
          "ta": "பைப் ரெஞ்ச்",
          "mr": "पाईप रिंच"
        },
        "icon": "wrench",
        "isCorrect": true
      },
      {
        "id": "claw_hammer",
        "text": {
          "en": "Claw Hammer",
          "hi": "हथौड़ा",
          "te": "సుత్తి",
          "kn": "ಸುತ್ತಿಗೆ (Hammer)",
          "ta": "சுத்தியல் (Hammer)",
          "mr": "हातोडी (Hammer)"
        },
        "icon": "hammer",
        "isCorrect": false
      },
      {
        "id": "hand_saw",
        "text": {
          "en": "Wood Hand Saw",
          "hi": "आरी",
          "te": "రంపం",
          "kn": "ಮರದ ಗರಗಸ (Hand Saw)",
          "ta": "கை வாள் (Hand Saw)",
          "mr": "हात करवत (Hand Saw)"
        },
        "icon": "saw",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "plumb_q2",
    "trade": "plumbing",
    "competency": "scenarioUnderstanding",
    "type": "scenario",
    "question": {
      "en": "A kitchen pipe connection is leaking water under the sink. What should you do first before repairing?",
      "hi": "रसोई के सिंक के नीचे से पानी का पाइप लीक हो रहा है। मरम्मत शुरू करने से पहले आपको सबसे पहले क्या करना चाहिए?",
      "te": "సింక్ కింద ఉన్న నీటి పైపు కనెక్షన్ లీక్ అవుతోంది. మరమ్మత్తు ప్రారంభించడానికి ముందు మీరు మొదట ఏమి చేయాలి?",
      "kn": "ಸಿಂಕ್ ಅಡಿಯಲ್ಲಿ ಅಡುಗೆಮನೆಯ ಪೈಪ್ ಸಂಪರ್ಕದಿಂದ ನೀರು ಸೋರುತ್ತಿದೆ. ದುರಸ್ತಿ ಮಾಡುವ ಮೊದಲು ನೀವು ಮೊದಲು ಏನು ಮಾಡಬೇಕು?",
      "ta": "சமையலறை தொட்டியின் அடியில் உள்ள குழாய் இணைப்பில் நீர் கசிகிறது. பழுதுபார்க்கும் முன் நீங்கள் முதலில் என்ன செய்ய வேண்டும்?",
      "mr": "किचन सिंकखालील पाण्याच्या पाईप जोडणीतून गळती होत आहे. दुरुस्ती सुरू करण्यापूर्वी सर्वप्रथम तुम्ही काय केले पाहिजे?"
    },
    "audioPrompt": {
      "en": "A pipe is leaking. What is the very first step?",
      "hi": "पाइप लीक हो रहा है, सबसे पहले क्या करेंगे?",
      "te": "పైపు లీక్ అవుతోంది, మొదట ఏం చేయాలి?",
      "kn": "ಪೈಪ್ ಸೋರುತ್ತಿದ್ದರೆ ಮೊದಲು ಏನು ಮಾಡಬೇಕು?",
      "ta": "குழாய் கசிந்தால் முதலில் என்ன செய்ய வேண்டும்?",
      "mr": "पाईप गळत असल्यास सर्वप्रथम काय करावे?"
    },
    "options": [
      {
        "id": "shut_main_valve",
        "text": {
          "en": "Shut off the main stopcock valve",
          "hi": "मुख्य पानी का वाल्व बंद करें",
          "te": "ప్రధాన నీటి వాల్వ్ ఆపివేయండి",
          "kn": "ಮುಖ್ಯ ನೀರಿನ ವಾಲ್ವ್ ಆಫ್ ಮಾಡಿ",
          "ta": "முதன்மை நீர் வால்வை மூடவும்",
          "mr": "मुख्य पाण्याचा व्हॉल्व्ह बंद करा"
        },
        "icon": "shield",
        "isCorrect": true
      },
      {
        "id": "start_unscrewing",
        "text": {
          "en": "Immediately unscrew the pipe while flowing",
          "hi": "बहते पानी में तुरंत पाइप खोलें",
          "te": "నీరు ప్రవహిస్తుండగానే వెంటనే విప్పండి",
          "kn": "ನೀರು ಹರಿಯುತ್ತಿರುವಾಗಲೇ ತಕ್ಷಣ ಪೈಪ್ ಬಿಚ್ಚಿ",
          "ta": "தண்ணீர் பாயும் போதே உடனே கழற்றவும்",
          "mr": "पाणी वाहत असतानाच ताबडतोब पाईप उघडा"
        },
        "icon": "alert",
        "isCorrect": false
      },
      {
        "id": "apply_cloth",
        "text": {
          "en": "Wrap a dry cloth and leave it",
          "hi": "कपड़ा बांधकर छोड़ दें",
          "te": "పొడి గుడ్డ చుట్టి వదిలేయండి",
          "kn": "ಒಣ ಬಟ್ಟೆಯನ್ನು ಸುತ್ತಿ ಹಾಗೆಯೇ ಬಿಡಿ",
          "ta": "உலர்ந்த துணியைக் கட்டி அப்படியே விடவும்",
          "mr": "कोरडा कापड गुंडाळून तसेच ठेवा"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "plumb_q3",
    "trade": "plumbing",
    "competency": "basicKnowledge",
    "type": "visual_mcq",
    "question": {
      "en": "What material is wrapped around pipe threads to prevent water leakage between fittings?",
      "hi": "पाइप के जोड़ों से पानी का रिसाव रोकने के लिए चूड़ियों (थ्रेड्स) पर क्या लपेटा जाता है?",
      "te": "పైపు జాయింట్ల నుండి నీటి లీకేజీని నివారించడానికి థ్రెడ్స్‌పై ఏ పదార్థాన్ని చుడతారు?",
      "kn": "ಫಿಟ್ಟಿಂಗ್‌ಗಳ ನಡುವೆ ನೀರಿನ ಸೋರಿಕೆಯನ್ನು ತಡೆಗಟ್ಟಲು ಪೈಪ್ ಥ್ರೆಡ್‌ಗಳ ಮೇಲೆ ಯಾವ ವಸ್ತುವನ್ನು ಸುತ್ತಲಾಗುತ್ತದೆ?",
      "ta": "பொருத்துதல்களுக்கு இடையே நீர் கசிவைத் தடுக்க குழாய் திரிகளில் எந்தப் பொருள் சுற்றப்படுகிறது?",
      "mr": "फिटिंग्जमधील पाण्याची गळती रोखण्यासाठी पाईपच्या थ्रेड्सवर (चूडीवर) कोणते साहित्य गुंडाळले जाते?"
    },
    "audioPrompt": {
      "en": "What tape prevents water leakage on pipe threads?",
      "hi": "पाइप की चूड़ियों पर रिसाव रोकने वाला टेप कौन सा है?",
      "te": "పైపు థ్రెడ్స్‌పై లీకేజీని ఆపే టేప్ ఏది?",
      "kn": "ಪೈಪ್ ಥ್ರೆಡ್‌ಗಳ ಮೇಲೆ ಸೋರಿಕೆ ತಡೆಯುವ ಟೇಪ್ ಯಾವುದು?",
      "ta": "குழாய் திரிகளில் கசிவைத் தடுக்கும் டேப் எது?",
      "mr": "पाईपच्या थ्रेड्सवर गळती रोखणारी टेप कोणती?"
    },
    "options": [
      {
        "id": "teflon_tape",
        "text": {
          "en": "Teflon (PTFE) Thread Seal Tape",
          "hi": "टेफ्लॉन धागा सील टेप",
          "te": "టెఫ్లాన్ సీల్ టేప్",
          "kn": "ಟೆಫ್ಲಾನ್ (PTFE) ಥ್ರೆಡ್ ಸೀಲ್ ಟೇಪ್",
          "ta": "டெஃப்லான் (PTFE) த்ரெட் சீல் டேப்",
          "mr": "टेफ्लॉन (PTFE) थ्रेड सील टेप"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "paper_tape",
        "text": {
          "en": "Paper Masking Tape",
          "hi": "कागज का टेप",
          "te": "కాగితం టేప్",
          "kn": "ಕಾಗದದ ಮಾಸ್ಕಿಂಗ್ ಟೇಪ್",
          "ta": "காகித டேப்",
          "mr": "कागदी मास्किंग टेप"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "cloth_strip",
        "text": {
          "en": "Cotton Cloth Strip",
          "hi": "सूती कपड़ा",
          "te": "నూలు గుడ్డ",
          "kn": "ಹತ್ತಿ ಬಟ್ಟೆಯ ಪಟ್ಟಿ",
          "ta": "பருத்தி துணி துண்டு",
          "mr": "सुती कापडाची पट्टी"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "plumb_q4",
    "trade": "plumbing",
    "competency": "safetyAwareness",
    "type": "scenario",
    "question": {
      "en": "Which safety action is crucial when working inside an underground drainage trench or pit?",
      "hi": "भूमिगत जल निकासी गड्ढे या नाले में काम करते समय कौन सी सुरक्षा सावधानी सबसे आवश्यक है?",
      "te": "భూగర్భ డ్రైనేజీ గుంతలో పనిచేసేటప్పుడు ఏ భద్రతా చర్య అత్యంత ముఖ్యమైనది?",
      "kn": "ಭೂಗತ ಒಳಚರಂಡಿ ಕಾಲುವೆ ಅಥವಾ ಗುಂಡಿಯೊಳಗೆ ಕೆಲಸ ಮಾಡುವಾಗ ಯಾವ ಸುರಕ್ಷತಾ ಕ್ರಮವು ಅತ್ಯಗತ್ಯ?",
      "ta": "நிலத்தடி வடிகால் குழிக்குள் வேலை செய்யும் போது எந்த பாதுகாப்பு நடவடிக்கை மிக முக்கியமானது?",
      "mr": "भूमिगत सांडपाणी गटार किंवा खड्ड्यात काम करताना कोणती सुरक्षितता खबरदारी अत्यंत आवश्यक आहे?"
    },
    "audioPrompt": {
      "en": "What safety step is required inside a drain pit?",
      "hi": "गंदे पानी के गड्ढे में काम करते समय क्या सावधानी चाहिए?",
      "te": "డ్రైనేజీ గుంతలో పనిచేసేటప్పుడు ఏ జాగ్రత్త అవసరం?",
      "kn": "ಚರಂಡಿ ಗುಂಡಿಯೊಳಗೆ ಯಾವ ಸುರಕ್ಷತಾ ಕ್ರಮ ಅಗತ್ಯ?",
      "ta": "வடிகால் குழியில் என்ன பாதுகாப்பு தேவை?",
      "mr": "सांडपाण्याच्या खड्ड्यात कोणती सुरक्षा आवश्यक आहे?"
    },
    "options": [
      {
        "id": "wear_gloves_boots",
        "text": {
          "en": "Wear heavy rubber gloves and safety boots",
          "hi": "रबर के दस्ताने और सुरक्षा जूते पहनें",
          "te": "రబ్బరు గ్లౌజులు & సేఫ్టీ బూట్లు ధరించండి",
          "kn": "ಭಾರೀ ರಬ್ಬರ್ ಕೈಗವಸುಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಬೂಟುಗಳನ್ನು ಧರಿಸಿ",
          "ta": "கனரக ரப்பர் கையுறைகள் மற்றும் பாதுகாப்பு பூட்ஸ் அணியுங்கள்",
          "mr": "जाड रबरी हातमोजे आणि सुरक्षित बूट वापरा"
        },
        "icon": "shield",
        "isCorrect": true
      },
      {
        "id": "bare_hands",
        "text": {
          "en": "Work barehanded for faster speed",
          "hi": "तेजी के लिए नंगे हाथ काम करें",
          "te": "వేగం కోసం ఒట్టి చేతులతో పని చేయండి",
          "kn": "ವೇಗಕ್ಕಾಗಿ ಬರಿಗೈಯಿಂದ ಕೆಲಸ ಮಾಡಿ",
          "ta": "வேகமாக வேலை செய்ய வெற்று கைகளால் செய்யுங்கள்",
          "mr": "कामाच्या गतीसाठी उघड्या हातांनी काम करा"
        },
        "icon": "alert",
        "isCorrect": false
      },
      {
        "id": "flip_flops",
        "text": {
          "en": "Wear ordinary bathroom slippers",
          "hi": "साधारण चप्पल पहनें",
          "te": "సాధారణ చెప్పులు ధరించండి",
          "kn": "ಸಾಮಾನ್ಯ ಬಾತ್‌ರೂಮ್ ಚಪ್ಪಲಿಗಳನ್ನು ಧರಿಸಿ",
          "ta": "சாதாரண செருப்புகளை அணியுங்கள்",
          "mr": "सामान्य घरगुती चप्पल वापरा"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "elec_q1",
    "trade": "electrician",
    "competency": "safetyAwareness",
    "type": "scenario",
    "question": {
      "en": "What is the mandatory first safety rule before inspecting or repairing any home switchboard or wiring?",
      "hi": "किसी भी घरेलू स्विचबोर्ड या वायरिंग की मरम्मत से पहले अनिवार्य पहला सुरक्षा नियम क्या है?",
      "te": "ఏదైనా గృహ స్విచ్‌బోర్డు లేదా వైరింగ్ మరమ్మతు చేయడానికి ముందు తప్పనిసరిగా చేయవలసిన మొదటి భద్రతా నియమం ఏమిటి?",
      "kn": "ಯಾವುದೇ ಮನೆಯ ಸ್ವಿಚ್‌ಬೋರ್ಡ್ ಅಥವಾ ವೈರಿಂಗ್ ದುರಸ್ತಿ ಮಾಡುವ ಮೊದಲು ಕಡ್ಡಾಯವಾಗಿ ಮಾಡಬೇಕಾದ ಮೊದಲ ಸುರಕ್ಷತಾ ನಿಯಮ ಯಾವುದು?",
      "ta": "வீட்டு சுவிட்ச்போர்டு அல்லது வயரிங் பழுதுபார்க்கும் முன் கட்டாயமாக செய்ய வேண்டிய முதல் பாதுகாப்பு விதி என்ன?",
      "mr": "कोणत्याही घरगुती स्विचबोर्ड किंवा वायरिंग दुरुस्ती सुरू करण्यापूर्वी पाळावयाचा पहिला अनिवार्य सुरक्षा नियम कोणता?"
    },
    "audioPrompt": {
      "en": "What is the very first rule before touching electrical wiring?",
      "hi": "बिजली का काम शुरू करने से पहले सबसे पहला काम क्या है?",
      "te": "కరెంట్ పని మొదలుపెట్టే ముందు మొదటి నియమం ఏమిటి?",
      "kn": "ವಿದ್ಯುತ್ ಕೆಲಸ ಆರಂಭಿಸುವ ಮುನ್ನ ಮೊದಲ ನಿಯಮ ಏನು?",
      "ta": "மின் வேலையைத் தொடங்கும் முன் முதல் விதி என்ன?",
      "mr": "विजेचे काम सुरू करण्यापूर्वी पहिला नियम कोणता?"
    },
    "options": [
      {
        "id": "switch_off_mcb",
        "text": {
          "en": "Switch off main MCB power supply and test with tester",
          "hi": "मेन एमसीबी बंद करें और टेस्टर से जांचें",
          "te": "మెయిన్ ఎంసీబీ స్విచ్ ఆఫ్ చేసి టెస్టర్‌తో తనిఖీ చేయండి"
        },
        "icon": "shield",
        "isCorrect": true
      },
      {
        "id": "touch_live_wire",
        "text": {
          "en": "Touch the wire to check if current is flowing",
          "hi": "तार छूकर देखें कि करंट है या नहीं",
          "te": "కరెంట్ వస్తుందో లేదో చూడటానికి వైర్ తాకండి"
        },
        "icon": "alert",
        "isCorrect": false
      },
      {
        "id": "pour_water",
        "text": {
          "en": "Wash the board with water first",
          "hi": "पहले पानी से बोर्ड धोएं",
          "te": "బోర్డును నీటితో కడగండి"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "elec_q2",
    "trade": "electrician",
    "competency": "toolRecognition",
    "type": "visual_mcq",
    "question": {
      "en": "Which tool is used to safely detect whether voltage/current is present in an electrical socket?",
      "hi": "बिजली के सॉकेट में करंट मौजूद है या नहीं, यह सुरक्षित रूप से जांचने के लिए किस उपकरण का उपयोग किया जाता है?",
      "te": "ఎలక్ట్రికల్ సాకెట్‌లో కరెంట్ ఉందో లేదో సురక్షితంగా తనిఖీ చేయడానికి ఏ సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ವಿದ್ಯುತ್ ಸಾಕೆಟ್‌ನಲ್ಲಿ ಕರೆಂಟ್ ಇದೆಯೇ ಎಂದು ಸುರಕ್ಷಿತವಾಗಿ ಪರಿಶೀಲಿಸಲು ಯಾವ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "மின் சாக்கெட்டில் மின்சாரம் உள்ளதா என்பதை பாதுகாப்பாக சோதிக்க எந்தக் கருவி பயன்படுகிறது?",
      "mr": "इलेक्ट्रिकल सॉकेटमध्ये विद्युत प्रवाह (फेस) आहे की नाही हे सुरक्षितपणे तपासण्यासाठी कोणते साधन वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which tool detects voltage in a socket?",
      "hi": "सॉकेट में बिजली जांचने का उपकरण कौन सा है?",
      "te": "కరెంట్ ఉందో లేదో చూసే సాధనం ఏది?",
      "kn": "ಕರೆಂಟ್ ಇದೆಯೇ ಎಂದು ನೋಡುವ ಸಾಧನ ಯಾವುದು?",
      "ta": "மின்சாரம் உள்ளதா என சோதிக்கும் கருவி எது?",
      "mr": "विद्युत प्रवाह तपासण्याचे साधन कोणते?"
    },
    "options": [
      {
        "id": "neon_tester",
        "text": {
          "en": "Insulated Neon Phase Tester",
          "hi": "इंसुलेटेड नियॉन फेज़ टेस्टर",
          "te": "నియాన్ ఫేజ్ టెస్టర్"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "metal_nail",
        "text": {
          "en": "Iron Nail",
          "hi": "लोहे की कील",
          "te": "ఇనుప మేకు"
        },
        "icon": "alert",
        "isCorrect": false
      },
      {
        "id": "wood_stick",
        "text": {
          "en": "Wooden stick",
          "hi": "लकड़ी की तीली",
          "te": "చెక్క పుల్ల"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "elec_q3",
    "trade": "electrician",
    "competency": "basicKnowledge",
    "type": "visual_mcq",
    "question": {
      "en": "In standard domestic single-phase wiring in India, what color is typically used for the Earth wire?",
      "hi": "भारत में मानक घरेलू वायरिंग में आमतौर पर अर्थिंग (Earth) तार के लिए कौन सा रंग उपयोग किया जाता है?",
      "te": "భారతదేశంలో ప్రామాణిక గృహ వైరింగ్‌లో ఎర్తింగ్ (Earth) వైర్ కోసం సాధారణంగా ఏ రంగును ఉపయోగిస్తారు?",
      "kn": "ಭಾರತದಲ್ಲಿ ಪ್ರಮಾಣಿತ ಗೃಹ ವೈರಿಂಗ್‌ನಲ್ಲಿ ಅರ್ಥಿಂಗ್ (Earth) ವೈರ್‌ಗಾಗಿ ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ಬಣ್ಣವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "இந்தியாவில் நிலையான வீட்டு வயரிங்கில் எர்த்திங் (Earth) கம்பிக்கு பொதுவாக எந்த நிறம் பயன்படுத்தப்படுகிறது?",
      "mr": "भारतात प्रमाणित घरगुती वायरिंगमध्ये अर्थिंग (Earth) वायरसाठी सामान्यतः कोणता रंग वापरला जातो?"
    },
    "audioPrompt": {
      "en": "What color is standard earthing wire?",
      "hi": "अर्थिंग तार का मानक रंग कौन सा है?",
      "te": "ఎర్తింగ్ వైర్ రంగు ఏది?",
      "kn": "ಅರ್ಥಿಂಗ್ ವೈರ್‌ನ ಬಣ್ಣ ಯಾವುದು?",
      "ta": "எர்த்திங் கம்பியின் நிறம் எது?",
      "mr": "अर्थिंग वायरचा रंग कोणता असतो?"
    },
    "options": [
      {
        "id": "green_yellow",
        "text": {
          "en": "Green or Green-Yellow",
          "hi": "हरा या हरा-पीला",
          "te": "ఆకుపచ్చ లేదా ఆకుపచ్చ-పసుపు",
          "kn": "ಹಸಿರು ಅಥವಾ ಹಸಿರು-ಹಳದಿ",
          "ta": "பச்சை அல்லது பச்சை-மஞ்சள்",
          "mr": "हिरवा किंवा पिवळा-हिरवा"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "red",
        "text": {
          "en": "Red (Phase)",
          "hi": "लाल (फेज़)",
          "te": "ఎరుపు (ఫేజ్)"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "black",
        "text": {
          "en": "Black (Neutral)",
          "hi": "काला (न्यूट्रल)",
          "te": "నలుపు (న్యూట్రల్)"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "elec_q4",
    "trade": "electrician",
    "competency": "scenarioUnderstanding",
    "type": "scenario",
    "question": {
      "en": "If an electric appliance repeatedly trips the MCB circuit breaker, what does it signify?",
      "hi": "यदि कोई उपकरण बार-बार एमसीबी (MCB) को ट्रिप कर रहा है, तो इसका क्या अर्थ है?",
      "te": "ఏదైనా ఎలక్ట్రికల్ పరికరం పదే పదే ఎంసీబీ (MCB) ట్రిప్ చేస్తుంటే, దాని అర్థం ఏమిటి?",
      "kn": "ಯಾವುದೇ ವಿದ್ಯುತ್ ಉಪಕರಣವು ಪದೇ ಪದೇ MCB ಟ್ರಿಪ್ ಮಾಡುತ್ತಿದ್ದರೆ, ಅದರ ಅರ್ಥವೇನು?",
      "ta": "ஒரு மின் சாதனம் மீண்டும் மீண்டும் MCB-ஐ ட்ரிப் செய்தால் அதன் பொருள் என்ன?",
      "mr": "एखादे विद्युत उपकरण वारंवार एमसीबी (MCB) ट्रिप करत असल्यास त्याचा काय अर्थ होतो?"
    },
    "audioPrompt": {
      "en": "Why does the MCB trip repeatedly?",
      "hi": "एमसीबी बार-बार ट्रिप क्यों होती है?",
      "te": "ఎంసీబీ పదే పదే ఎందుకు ట్రిప్ అవుతుంది?",
      "kn": "MCB ಪದೇ ಪದೇ ಏಕೆ ಟ್ರಿಪ್ ಆಗುತ್ತದೆ?",
      "ta": "MCB ஏன் மீண்டும் மீண்டும் ட்ரிப் ஆகிறது?",
      "mr": "एमसीबी वारंवार का ट्रिप होतो?"
    },
    "options": [
      {
        "id": "short_circuit",
        "text": {
          "en": "There is an overload or short-circuit fault to investigate",
          "hi": "ओवरलोड या शॉर्ट सर्किट की समस्या है",
          "te": "ఓవర్‌లోడ్ లేదా షార్ట్ సర్క్యూట్ సమస్య ఉంది"
        },
        "icon": "alert",
        "isCorrect": true
      },
      {
        "id": "tie_mcb",
        "text": {
          "en": "Tie the MCB up with wire so it can't trip",
          "hi": "एमसीबी को तार से बांध दें ताकि वह गिरे नहीं",
          "te": "ట్రిప్ అవ్వకుండా ఎంసీబీని వైర్‌తో కట్టేయండి"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "ignore",
        "text": {
          "en": "Ignore it completely",
          "hi": "इसे पूरी तरह नज़रअंदाज़ करें",
          "te": "దాన్ని పట్టించుకోకండి"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "carp_q1",
    "trade": "carpentry",
    "competency": "toolRecognition",
    "type": "visual_mcq",
    "question": {
      "en": "Which precision tool is used to check if a wooden surface or joint is perfectly at a 90-degree right angle?",
      "hi": "लकड़ी की सतह या जोड़ को 90 डिग्री के समकोण पर जांचने के लिए किस उपकरण का उपयोग किया जाता है?",
      "te": "చెక్క ఉపరితలం లేదా జాయింట్ ఖచ్చితంగా 90 డిగ్రీల లంబకోణంలో ఉందో లేదో తనిఖీ చేయడానికి ఏ సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ಮರದ ಮೇಲ್ಮೈ ಅಥವಾ ಜಾಯಿಂಟ್ ನಿಖರವಾಗಿ 90 ಡಿಗ್ರಿ ಲಂಬಕೋನದಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲು ಯಾವ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "மர மேற்பரப்பு அல்லது இணைப்பு சரியாக 90 டிகிரி செங்கோணத்தில் உள்ளதா என்பதை சரிபார்க்க எந்தக் கருவி பயன்படுகிறது?",
      "mr": "लाकडी पृष्ठभाग किंवा जोड अचूक ९० अंश काटकोनात आहे की नाही हे तपासण्यासाठी कोणते साधन वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which tool checks a 90-degree right angle?",
      "hi": "90 डिग्री समकोण जांचने का औज़ार कौन सा है?",
      "te": "90 డిగ్రీల మూలను చూసే సాధనం ఏది?",
      "kn": "90 ಡಿಗ್ರಿ ಮೂಲೆಯನ್ನು ನೋಡುವ ಸಾಧನ ಯಾವುದು?",
      "ta": "90 டிகிரி மூலையை சரிபார்க்கும் கருவி எது?",
      "mr": "९० अंशाचा काटकोन तपासण्याचे साधन कोणते?"
    },
    "options": [
      {
        "id": "try_square",
        "text": {
          "en": "Try Square (Guniya)",
          "hi": "गुनिया (Try Square)",
          "te": "ట్రై స్క్వేర్ (గునియా)",
          "kn": "ಟ್ರೈ ಸ್ಕ್ವೇರ್ (ಗುಣಿಯಾ / Try Square)",
          "ta": "ட்ரை ஸ்கொயர் (மூலமட்டம் / Try Square)",
          "mr": "ट्राय स्क्वेअर (गुण्या / Try Square)"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "plier",
        "text": {
          "en": "Cutting Pliers",
          "hi": "प्लास",
          "te": "కట్టర్ ప్లాస్"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "scissor",
        "text": {
          "en": "Scissors",
          "hi": "कैंची",
          "te": "కత్తెర"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "carp_q2",
    "trade": "carpentry",
    "competency": "basicKnowledge",
    "type": "visual_mcq",
    "question": {
      "en": "Which tool is specifically designed for carving grooves and shaping wood joints by hand?",
      "hi": "हाथ से लकड़ी में खांचे (झिरी) काटने और जोड़ों को आकार देने के लिए कौन सा उपकरण बनाया गया है?",
      "te": "చేతితో చెక్కలో గాడులు చెక్కడానికి మరియు జాయింట్లను తీర్చిదిద్దడానికి ప్రత్యేకంగా రూపొందించిన సాధనం ఏది?",
      "kn": "ಕೈಯಿಂದ ಮರದಲ್ಲಿ ಚಡಿಗಳನ್ನು ಕೆತ್ತಲು ಮತ್ತು ಜಾಯಿಂಟ್‌ಗಳನ್ನು ರೂಪಿಸಲು ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಸಾಧನ ಯಾವುದು?",
      "ta": "கையால் மரத்தில் பள்ளங்களைச் செதுக்கவும் இணைப்புகளை உருவாக்கவும் வடிவமைக்கப்பட்ட கருவி எது?",
      "mr": "लाकडात खाचा कोरण्यासाठी आणि सांधे व्यवस्थित करण्यासाठी खास बनवलेले साधन कोणते?"
    },
    "audioPrompt": {
      "en": "Which tool carves wood grooves?",
      "hi": "लकड़ी में खांचा बनाने वाला औज़ार कौन सा है?",
      "te": "చెక్కను చెక్కే ఉలి ఏది?",
      "kn": "ಮರವನ್ನು ಕೆತ್ತುವ ಉಳಿ ಯಾವುದು?",
      "ta": "மரம் செதுக்கும் உளி எது?",
      "mr": "लाकूड तासण्याची पटाशी कोणती?"
    },
    "options": [
      {
        "id": "wood_chisel",
        "text": {
          "en": "Wood Chisel (Rookhani)",
          "hi": "रुखानी / छेनी (Chisel)",
          "te": "చెక్క ఉలి (Chisel)",
          "kn": "ಮರದ ಉಳಿ (Wood Chisel)",
          "ta": "மர உளி (Wood Chisel)",
          "mr": "लाकडी पटाशी (Wood Chisel)"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "screwdriver",
        "text": {
          "en": "Screwdriver",
          "hi": "पेचकस",
          "te": "స్క్రూడ్రైవర్",
          "kn": "ಸ್ಕ್ರೂಡ್ರೈವರ್",
          "ta": "ஸ்க்ரூடிரைவர்",
          "mr": "स्क्रू ड्रायव्हर"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "spanner",
        "text": {
          "en": "Wrench / Spanner",
          "hi": "पाना / स्पैनर",
          "te": "స్పానర్"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "carp_q3",
    "trade": "carpentry",
    "competency": "safetyAwareness",
    "type": "scenario",
    "question": {
      "en": "What personal safety equipment must always be worn when sawing or sanding wood to protect your eyes from flying chips?",
      "hi": "लकड़ी को काटते या घिसते समय उड़ने वाले बुरादे से आँखों की सुरक्षा के लिए क्या पहनना अनिवार्य है?",
      "te": "చెక్కను రంపంతో కోసేటప్పుడు లేదా పాలిష్ చేసేటప్పుడు కళ్లను కాపాడుకోవడానికి ఏ భద్రతా పరికరాన్ని తప్పనిసరిగా ధరించాలి?",
      "kn": "ಮರವನ್ನು ಗರಗಸದಿಂದ ಕತ್ತರಿಸುವಾಗ ಅಥವಾ ಪಾಲಿಶ್ ಮಾಡುವಾಗ ಕಣ್ಣುಗಳನ್ನು ರಕ್ಷಿಸಲು ಯಾವ ಸಾಧನವನ್ನು ಧರಿಸಬೇಕು?",
      "ta": "மரத்தை அரியும் போதோ அல்லது பாலிஷ் செய்யும் போதோ கண்களைப் பாதுகாக்க எதை அணிய வேண்டும்?",
      "mr": "लाकूड करवतीने कापताना किंवा रंधताना डोळ्यांच्या संरक्षणासाठी कोणते साधन परिधान करणे आवश्यक आहे?"
    },
    "audioPrompt": {
      "en": "What eye protection is needed during wood cutting?",
      "hi": "लकड़ी कटाई के समय आँखों की सुरक्षा के लिए क्या पहनें?",
      "te": "చెక్క పనిలో కంటి రక్షణకు ఏం ధరించాలి?",
      "kn": "ಮರದ ಕೆಲಸದಲ್ಲಿ ಕಣ್ಣಿನ ರಕ್ಷಣೆಗೆ ಏನು ಧರಿಸಬೇಕು?",
      "ta": "மர வேலையில் கண் பாதுகாப்புக்கு என்ன அணிய வேண்டும்?",
      "mr": "लाकडी कामात डोळ्यांच्या सुरक्षेसाठी काय वापरावे?"
    },
    "options": [
      {
        "id": "safety_goggles",
        "text": {
          "en": "Safety Goggles / Eye Glasses",
          "hi": "सुरक्षा चश्मा (Safety Goggles)",
          "te": "సేఫ్టీ గాగుల్స్ (రక్షణ కళ్లద్దాలు)",
          "kn": "ಸುರಕ್ಷತಾ ಕನ್ನಡಕ (Safety Goggles)",
          "ta": "பாதுகாப்பு கண்ணாடி (Safety Goggles)",
          "mr": "सुरक्षा गॉगल (Safety Goggles)"
        },
        "icon": "shield",
        "isCorrect": true
      },
      {
        "id": "sunglasses",
        "text": {
          "en": "Normal fashion sunglasses",
          "hi": "फैशन धूप का चश्मा",
          "te": "ఫ్యాషన్ సన్ గ్లాసెస్",
          "kn": "ಫ್ಯಾಷನ್ ಸನ್‌ಗ್ಲಾಸ್",
          "ta": "பேஷன் சன்கிளாஸ்",
          "mr": "फॅशन गॉगल"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "no_protection",
        "text": {
          "en": "No protection needed",
          "hi": "कुछ भी पहनने की ज़रूरत नहीं",
          "te": "ఏమీ అవసరం లేదు",
          "kn": "ಯಾವುದೂ ಅಗತ್ಯವಿಲ್ಲ",
          "ta": "எதுவும் தேவையில்லை",
          "mr": "काहीही गरज नाही"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "tailor_q1",
    "trade": "tailoring",
    "competency": "toolRecognition",
    "type": "visual_mcq",
    "question": {
      "en": "Which tool is used for temporary markings on fabric that wash off easily without staining?",
      "hi": "कपड़े पर अस्थायी निशान लगाने के लिए किस उपकरण का उपयोग किया जाता है जो दाग छोड़े बिना आसानी से मिट जाता है?",
      "te": "బట్టపై మరకలు పడకుండా సులభంగా తొలగిపోయే తాత్కాలిక గుర్తులు వేయడానికి ఏ సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ಬಟ್ಟೆಯ ಮೇಲೆ ಕಲೆಯಾಗದೆ ಸುಲಭವಾಗಿ ಅಳಿಸಿಹೋಗುವ ತಾತ್ಕಾಲಿಕ ಗುರುತುಗಳನ್ನು ಹಾಕಲು ಯಾವ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "துணியில் கறை படியாமல் எளிதில் அழியக்கூடிய தற்காலிக அடையாளங்களை இட எந்தக் கருவி பயன்படுகிறது?",
      "mr": "कापडावर डाग न पडता सहज पुसल्या जाणाऱ्या तात्पुरत्या खुणा करण्यासाठी कोणते साधन वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which chalk marks fabric without permanent stains?",
      "hi": "कपड़े पर निशान लगाने वाला चाक कौन सा है?",
      "te": "బట్టలపై గుర్తు పెట్టే చాక్ ఏది?",
      "kn": "ಬಟ್ಟೆಯ ಮೇಲೆ ಗುರುತು ಹಾಕುವ ಚಾಕ್ ಯಾವುದು?",
      "ta": "துணியில் குறியிட உதவும் சாக்பீஸ் எது?",
      "mr": "कापडावर खूण करण्यासाठी कोणता खडू वापरतात?"
    },
    "options": [
      {
        "id": "tailor_chalk",
        "text": {
          "en": "Tailor's Chalk",
          "hi": "टेलर का चाक (मिल्टन चाक)",
          "te": "టైలర్స్ చాక్ (సుద్ద)"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "permanent_marker",
        "text": {
          "en": "Permanent ink marker",
          "hi": "पक्का मार्कर पेन",
          "te": "పర్మనెంట్ మార్కర్",
          "kn": "ಪರ್ಮನೆಂಟ್ ಮಾರ್ಕರ್",
          "ta": "பெர்மனன்ட் மார்க்கர்",
          "mr": "पर्मनंट मार्कर"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "ball_pen",
        "text": {
          "en": "Ballpoint pen",
          "hi": "बॉल पेन",
          "te": "బాల్ పాయింట్ పెన్"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "tailor_q2",
    "trade": "tailoring",
    "competency": "scenarioUnderstanding",
    "type": "scenario",
    "question": {
      "en": "When sewing machine thread repeatedly snaps or tangles on the underside, what is the most common cause to inspect?",
      "hi": "सिलाई करते समय जब धागा बार-बार टूटता है या नीचे गुच्छा बन जाता है, तो सबसे पहले क्या जांचना चाहिए?",
      "te": "కుట్టు మిషన్ దారం పదే పదే తెగిపోతుంటే లేదా కింద ముద్దగా చిక్కుకుంటుంటే, మొదట దేనిని తనిఖీ చేయాలి?",
      "kn": "ಹೊಲಿಗೆ ಯಂತ್ರದ ದಾರವು ಪದೇ ಪದೇ ತುಂಡಾಗುತ್ತಿದ್ದರೆ ಅಥವಾ ಕೆಳಗೆ ಗಂಟು ಬೀಳುತ್ತಿದ್ದರೆ, ಮೊದಲು ಏನನ್ನು ಪರಿಶೀಲಿಸಬೇಕು?",
      "ta": "தையல் இயந்திர நூல் மீண்டும் மீண்டும் அறுந்தாலோ அல்லது அடியில் சுருண்டாலோ முதலில் எதை சோதிக்க வேண்டும்?",
      "mr": "शिलाई मशीनचा धागा वारंवार तुटत असल्यास किंवा खाली गुंता होत असल्यास सर्वप्रथम काय तपासले पाहिजे?"
    },
    "audioPrompt": {
      "en": "What causes sewing machine thread to break repeatedly?",
      "hi": "सिलाई मशीन में धागा बार-बार क्यों टूटता है?",
      "te": "కుట్టు మిషన్ దారం ఎందుకు తెగిపోతుంది?",
      "kn": "ಹೊಲಿಗೆ ಯಂತ್ರದ ದಾರ ಏಕೆ ತುಂಡಾಗುತ್ತದೆ?",
      "ta": "தையல் நூல் ஏன் அறுந்து போகிறது?",
      "mr": "शिलाईचा धागा का तुटतो?"
    },
    "options": [
      {
        "id": "thread_tension",
        "text": {
          "en": "Thread tension disc and needle bluntness",
          "hi": "धागे का तनाव (Tension) और सुई का मुड़ना",
          "te": "దారపు టెన్షన్ మరియు సూది మొన"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "cloth_color",
        "text": {
          "en": "The color of the fabric",
          "hi": "कपड़े का रंग",
          "te": "బట్ట రంగు"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "room_light",
        "text": {
          "en": "Room lighting",
          "hi": "कमरे की रोशनी",
          "te": "గదిలోని వెలుతురు"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "tailor_q3",
    "trade": "tailoring",
    "competency": "safetyAwareness",
    "type": "scenario",
    "question": {
      "en": "What safety habit prevents sewing machine needles from piercing fingers during high-speed sewing?",
      "hi": "तेज़ गति से सिलाई करते समय सुई को उंगली में चुभने से बचाने के लिए क्या सावधानी बरतनी चाहिए?",
      "te": "వేగంగా కుడుతున్నప్పుడు సూది వేలికి గుచ్చుకోకుండా ఉండటానికి ఏ జాగ్రత్త పాటించాలి?",
      "kn": "ವೇಗವಾಗಿ ಹೊಲಿಯುವಾಗ ಸೂಜಿ ಬೆರಳಿಗೆ ಚುಚ್ಚದಂತೆ ಯಾವ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು?",
      "ta": "வேகமாக தைக்கும் போது ஊசி விரலில் குத்தாமல் இருக்க என்ன முன்னெச்சரிக்கை தேவை?",
      "mr": "वेगाने शिलाई करताना सुई बोटात टोचू नये म्हणून कोणती काळजी घ्यावी?"
    },
    "audioPrompt": {
      "en": "How to prevent sewing needle from hurting fingers?",
      "hi": "सिलाई करते समय उंगली को सुई से कैसे बचाएं?",
      "te": "సూది వేలికి గుచ్చుకోకుండా ఎలా చూసుకోవాలి?",
      "kn": "ಸೂಜಿ ಬೆರಳಿಗೆ ಚುಚ್ಚದಂತೆ ಹೇಗೆ ನೋಡಿಕೊಳ್ಳಬೇಕು?",
      "ta": "ஊசி விரலில் குத்தாமல் இருப்பது எப்படி?",
      "mr": "सुई बोटात टोचू नये म्हणून काय करावे?"
    },
    "options": [
      {
        "id": "finger_guard",
        "text": {
          "en": "Keep fingers at safe distance from presser foot & needle guard",
          "hi": "सुई और प्रेसर फुट से उंगलियों को सुरक्षित दूरी पर रखें",
          "te": "సూది మరియు ప్రెషర్ ఫుట్ నుండి వేళ్లను సురక్షిత దూరంలో ఉంచండి"
        },
        "icon": "shield",
        "isCorrect": true
      },
      {
        "id": "eyes_closed",
        "text": {
          "en": "Close your eyes while sewing",
          "hi": "आँखें बंद करके सिलें",
          "te": "కళ్లు మూసుకుని కుట్టండి"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "touch_needle",
        "text": {
          "en": "Hold the needle bar while operating",
          "hi": "चलती सुई को पकड़ें",
          "te": "సూదిని పట్టుకోండి"
        },
        "icon": "alert",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "mason_q1",
    "trade": "masonry",
    "competency": "toolRecognition",
    "type": "visual_mcq",
    "question": {
      "en": "Which weight-based tool is suspended by a string to verify that a brick wall is perfectly vertical (straight upright)?",
      "hi": "ईंट की दीवार बिल्कुल सीधी (लंबवत) बन रही है या नहीं, यह जांचने के लिए धागे से लटके किस उपकरण का उपयोग किया जाता है?",
      "te": "ఇటుక గోడ ఖచ్చితంగా నిలువుగా (నిటారుగా) ఉందో లేదో తనిఖీ చేయడానికి దారానికి వేలాడదీసే ఏ సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ಇಟ್ಟಿಗೆ ಗೋಡೆಯು ನಿಖರವಾಗಿ ಲಂಬವಾಗಿ (ನೇರವಾಗಿ) ಇದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲು ದಾರಕ್ಕೆ ನೇತುಹಾಕುವ ಯಾವ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "செங்கல் சுவர் சரியாக செங்குத்தாக உள்ளதா என்பதை சரிபார்க்க நூலில் தொங்கவிடப்படும் எந்தக் கருவி பயன்படுகிறது?",
      "mr": "विटांची भिंत अगदी सरळ उभी (काटकोनात) आहे की नाही हे तपासण्यासाठी दोरीला लटकवलेले कोणते साधन वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which hanging tool checks a wall's vertical straightness?",
      "hi": "दीवार का सीधापन जांचने वाला लटकता औज़ार कौन सा है?",
      "te": "గోడ నిలువును చూసే తూకం గుండు ఏది?",
      "kn": "ಗೋಡೆಯ ನೇರವನ್ನು ನೋಡುವ ತೂಕದ ಗುಂಡು ಯಾವುದು?",
      "ta": "சுவர் நேராக உள்ளதா என சோதிக்கும் தூக்குநூல் எது?",
      "mr": "भिंत सरळ आहे का हे पाहण्याची साहुली कोणती?"
    },
    "options": [
      {
        "id": "plumb_bob",
        "text": {
          "en": "Plumb Bob (Sahul)",
          "hi": "साहुल (Plumb Bob)",
          "te": "సాహుల్ / తూకం గుండు (Plumb Bob)",
          "kn": "ಸಾಹುಲ್ / ತೂಕದ ಗುಂಡು (Plumb Bob)",
          "ta": "தூக்குகுண்டு (Plumb Bob)",
          "mr": "साहुळी / ओळंबा (Plumb Bob)"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "hand_saw",
        "text": {
          "en": "Hand Saw",
          "hi": "आरी",
          "te": "రంపం"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "paint_brush",
        "text": {
          "en": "Paint Brush",
          "hi": "पेंट ब्रश",
          "te": "పెయింట్ బ్రష్",
          "kn": "ಪೇಂಟ್ ಬ್ರಷ್",
          "ta": "பெயிண்ட் பிரஷ்",
          "mr": "रंगकामाचा ब्रश"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "mason_q2",
    "trade": "masonry",
    "competency": "basicKnowledge",
    "type": "visual_mcq",
    "question": {
      "en": "What flat triangular metal tool is primarily used to spread, shape, and apply cement mortar on bricks?",
      "hi": "ईंटों पर सीमेंट का मसाला फैलाने और लगाने के लिए मुख्य रूप से किस त्रिकोणीय धातु उपकरण का उपयोग किया जाता है?",
      "te": "ఇటుకలపై సిమెంట్ మోర్టార్‌ను పరచడానికి మరియు సరిచేయడానికి ప్రధానంగా ఏ త్రిభుజాకార సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ಇಟ್ಟಿಗೆಗಳ ಮೇಲೆ ಸಿಮೆಂಟ್ ಗಾರೆಯನ್ನು ಹರಡಲು ಮತ್ತು ಸರಿಪಡಿಸಲು ಪ್ರಮುಖವಾಗಿ ಯಾವ ತ್ರಿಕೋನಾಕಾರದ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "செங்கற்கள் மீது சிமெண்ட் கலவையை பரப்பவும் சரிசெய்யவும் பயன்படும் முக்கோண வடிவிலான கருவி எது?",
      "mr": "विटांवर सिमेंटचा मसाला पसरवण्यासाठी आणि सपाट करण्यासाठी मुख्यत्वे कोणते त्रिकोणी साधन वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which tool spreads cement mortar?",
      "hi": "सीमेंट मसाला लगाने वाली करनी कौन सी है?",
      "te": "సిమెంట్ మోర్టార్ పూసే తాపీ ఏది?",
      "kn": "ಸಿಮೆಂಟ್ ಗಾರೆ ಹರಡುವ ಕರಣೆ ಯಾವುದು?",
      "ta": "சிமெண்ட் கலவை பூசும் கரண்டி எது?",
      "mr": "सिमेंट मसाला लावणारी थापी कोणती?"
    },
    "options": [
      {
        "id": "trowel",
        "text": {
          "en": "Mason's Trowel (Karni)",
          "hi": "करनी (Trowel)",
          "te": "తాపీ (Mason's Trowel)"
        },
        "icon": "check",
        "isCorrect": true
      },
      {
        "id": "screw_driver",
        "text": {
          "en": "Screwdriver",
          "hi": "पेचकस",
          "te": "స్క్రూడ్రైవర్"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "wire_stripper",
        "text": {
          "en": "Wire Stripper",
          "hi": "वायर स्ट्रिपर",
          "te": "వైర్ స్ట్రిప్పర్",
          "kn": "ವೈರ್ ಸ್ಟ್ರಿಪ್ಪರ್",
          "ta": "ஒயர் ஸ்ட்ரிப்பர்",
          "mr": "वायर स्ट्रिपर"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "mason_q3",
    "trade": "masonry",
    "competency": "safetyAwareness",
    "type": "scenario",
    "question": {
      "en": "Why is it dangerous to handle wet cement mortar with bare hands for long periods?",
      "hi": "लंबे समय तक नंगे हाथों से गीले सीमेंट मसाले को छूना क्यों खतरनाक होता है?",
      "te": "ఎక్కువసేపు ఒట్టి చేతులతో తడి సిమెంట్ మోర్టార్‌ను తాకడం ఎందుకు ప్రమాదకరం?",
      "kn": "ಹೆಚ್ಚು ಕಾಲ ಬರಿಗೈಯಿಂದ ಒದ್ದೆ ಸಿಮೆಂಟ್ ಗಾರೆಯನ್ನು ಮುಟ್ಟುವುದು ಏಕೆ ಅಪಾಯಕಾರಿ?",
      "ta": "ஈரமான சிமெண்ட் கலவையை வெறும் கைகளால் நீண்ட நேரம் தொடுவது ஏன் ஆபத்தானது?",
      "mr": "ओल्या सिमेंटच्या मसाल्याला जास्त वेळ उघड्या हातांनी स्पर्श करणे का धोकादायक आहे?"
    },
    "audioPrompt": {
      "en": "Why shouldn't you touch wet cement with bare hands?",
      "hi": "गीले सीमेंट को नंगे हाथ क्यों नहीं छूना चाहिए?",
      "te": "తడి సిమెంట్‌ను ఒట్టి చేతులతో ఎందుకు తాకకూడదు?",
      "kn": "ಒದ್ದೆ ಸಿಮೆಂಟ್ ಅನ್ನು ಬರಿಗೈಯಿಂದ ಏಕೆ ಮುಟ್ಟಬಾರದು?",
      "ta": "ஈர சிமெண்ட்டை வெறும் கையால் ஏன் தொடக்கூடாது?",
      "mr": "ओल्या सिमेंटला उघड्या हातांनी का हात लावू नये?"
    },
    "options": [
      {
        "id": "skin_burns",
        "text": {
          "en": "Cement is highly alkaline and causes severe skin burns/cracks",
          "hi": "सीमेंट क्षारीय होता है और त्वचा को जला या फाड़ सकता है",
          "te": "సిమెంట్ ఆల్కలీన్ స్వభావం కలిగి చర్మాన్ని కాల్చివేస్తుంది"
        },
        "icon": "shield",
        "isCorrect": true
      },
      {
        "id": "makes_hands_clean",
        "text": {
          "en": "It cleans the hands completely",
          "hi": "यह हाथ को साफ करता है",
          "te": "ఇది చేతులను శుభ్రపరుస్తుంది"
        },
        "icon": "x",
        "isCorrect": false
      },
      {
        "id": "dries_too_fast",
        "text": {
          "en": "It has no chemical effect",
          "hi": "इसका कोई असर नहीं होता",
          "te": "ఎలాంటి ప్రభావం ఉండదు"
        },
        "icon": "x",
        "isCorrect": false
      }
    ]
  },
  {
    "id": "farm_q1",
    "trade": "farming",
    "competency": "toolRecognition",
    "type": "visual_mcq",
    "question": {
      "en": "Which tool is commonly used to loosen soil?",
      "hi": "मिट्टी को ढीला और पोला करने के लिए आमतौर पर किस उपकरण का उपयोग किया जाता है?",
      "te": "నేలను గుల్లగా చేయడానికి సాధారణంగా ఏ సాధనాన్ని ఉపయోగిస్తారు?",
      "kn": "ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಲು ಸಾಮಾನ್ಯವಾಗಿ ಯಾವ ಸಾಧನವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?",
      "ta": "மண்ணை தளர்த்த பொதுவாக எந்தக் கருவி பயன்படுத்தப்படுகிறது?",
      "mr": "जमीन भुसभुशीत करण्यासाठी सामान्यतः कोणते अवजार वापरले जाते?"
    },
    "audioPrompt": {
      "en": "Which tool is commonly used to loosen soil?",
      "hi": "मिट्टी को ढीला और पोला करने के लिए कौन सा औजार इस्तेमाल होता है?",
      "te": "నేలను గుల్లగా చేయడానికి ఏ సాధనం వాడతారు?",
      "kn": "ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಲು ಯಾವ ಸಾಧನ ಬಳಸುತ್ತಾರೆ?",
      "ta": "மண்ணை தளர்த்த எந்தக் கருவி பயன்படுகிறது?",
      "mr": "जमीन भुसभुशीत करण्यासाठी कोणते साधन वापरतात?"
    },
    "options": [
      {
        "id": "opt_hoe",
        "text": {
          "en": "Hoe",
          "hi": "कुदाल / खुरपी (Hoe)",
          "te": "గునపం / పార (Hoe)"
        },
        "visualIcon": "Hoe",
        "icon": "check",
        "isCorrect": true,
        "keywords": [
          "hoe",
          "khurpi",
          "kudal",
          "कुदाल",
          "खुरपी",
          "फावड़ा",
          "పార",
          "గునపం"
        ]
      },
      {
        "id": "opt_hammer",
        "text": {
          "en": "Hammer",
          "hi": "हथौड़ा (Hammer)",
          "te": "సుత్తి (Hammer)"
        },
        "visualIcon": "Hammer",
        "icon": "hammer",
        "isCorrect": false,
        "keywords": [
          "hammer",
          "hathoda",
          "हथौड़ा",
          "సుత్తి"
        ]
      },
      {
        "id": "opt_screwdriver",
        "text": {
          "en": "Screwdriver",
          "hi": "पेचकस (Screwdriver)",
          "te": "స్క్రూడ్రైవర్ (Screwdriver)"
        },
        "visualIcon": "Tool",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "screwdriver",
          "pechkas",
          "पेचकस",
          "స్క్రూడ్రైవర్"
        ]
      }
    ]
  },
  {
    "id": "farm_q2",
    "trade": "farming",
    "competency": "basicKnowledge",
    "type": "visual_mcq",
    "question": {
      "en": "Which is important for healthy crop growth?",
      "hi": "फसल की स्वस्थ वृद्धि के लिए क्या आवश्यक है?",
      "te": "పంటలు ఆరోగ్యంగా పెరగడానికి ఏది ముఖ్యం?",
      "kn": "ಬೆಳೆಗಳು ಆರೋಗ್ಯಕರವಾಗಿ ಬೆಳೆಯಲು ಯಾವುದು ಮುಖ್ಯ?",
      "ta": "பயிர்கள் ஆரோக்கியமாக வளர எது முக்கியம்?",
      "mr": "पिकांची निकोप आणि निरोगी वाढ होण्यासाठी काय महत्त्वाचे आहे?"
    },
    "audioPrompt": {
      "en": "Which is important for healthy crop growth?",
      "hi": "फसलों की स्वस्थ वृद्धि के लिए क्या जरूरी है?",
      "te": "పంటలు ఆరోగ్యంగా పెరగడానికి ఏది ముఖ్యం?",
      "kn": "ಬೆಳೆಗಳು ಚೆನ್ನಾಗಿ ಬೆಳೆಯಲು ಏನು ಮುಖ್ಯ?",
      "ta": "பயிர்கள் வளர எது முக்கியம்?",
      "mr": "पिकांच्या वाढीसाठी काय आवश्यक आहे?"
    },
    "options": [
      {
        "id": "opt_water_nutrients",
        "text": {
          "en": "Water and suitable nutrients",
          "hi": "पानी और उपयुक्त पोषक तत्व (खाद)",
          "te": "నీరు మరియు సరైన పోషకాలు"
        },
        "visualIcon": "Water",
        "icon": "check",
        "isCorrect": true,
        "keywords": [
          "water",
          "nutrients",
          "fertilizer",
          "पानी",
          "खाद",
          "पोषक",
          "నీరు",
          "పోషకాలు"
        ]
      },
      {
        "id": "opt_only_paint",
        "text": {
          "en": "Only paint",
          "hi": "केवल पेंट (रंग)",
          "te": "కేవలం పెయింట్"
        },
        "visualIcon": "Paint",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "paint",
          "रंग",
          "పెయింట్"
        ]
      },
      {
        "id": "opt_only_plastic",
        "text": {
          "en": "Only plastic",
          "hi": "केवल प्लास्टिक",
          "te": "కేవలం ప్లాస్టిక్"
        },
        "visualIcon": "Plastic",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "plastic",
          "प्लास्टिक",
          "ప్లాస్టిక్"
        ]
      }
    ]
  },
  {
    "id": "farm_q3",
    "trade": "farming",
    "competency": "basicKnowledge",
    "type": "scenario",
    "question": {
      "en": "Why do farmers provide water to crops?",
      "hi": "किसान फसलों को पानी (सिंचाई) क्यों देते हैं?",
      "te": "రైతులు పంటలకు నీరు ఎందుకు అందిస్తారు?",
      "kn": "ರೈತರು ಬೆಳೆಗಳಿಗೆ ನೀರಾವರಿ ಏಕೆ ಒದಗಿಸುತ್ತಾರೆ?",
      "ta": "விவசாயிகள் பயிர்களுக்கு ஏன் நீர் பாய்ச்சுகிறார்கள்?",
      "mr": "शेतकरी पिकांना पाणी (सिंचन) का देतात?"
    },
    "audioPrompt": {
      "en": "Why do farmers provide water to crops?",
      "hi": "किसान फसलों को पानी क्यों देते हैं?",
      "te": "రైతులు పంటలకు నీరు ఎందుకు అందిస్తారు?",
      "kn": "ಬೆಳೆಗಳಿಗೆ ನೀರು ಏಕೆ ನೀಡುತ್ತಾರೆ?",
      "ta": "பயிர்களுக்கு நீர் ஏன் தேவை?",
      "mr": "पिकांना पाणी का द्यावे लागते?"
    },
    "options": [
      {
        "id": "opt_support_growth",
        "text": {
          "en": "To support crop growth",
          "hi": "फसलों के विकास और पोषण के लिए",
          "te": "పంట పెరుగుదలకు తోడ్పడటానికి"
        },
        "visualIcon": "Sprout",
        "icon": "check",
        "isCorrect": true,
        "keywords": [
          "growth",
          "support",
          "विकास",
          "पोषण",
          "పెరుగుదల",
          "పంట"
        ]
      },
      {
        "id": "opt_harden_soil",
        "text": {
          "en": "To make the soil harder",
          "hi": "मिट्टी को सख्त बनाने के लिए",
          "te": "నేలను గట్టిగా చేయడానికి"
        },
        "visualIcon": "Rock",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "harder",
          "सख्त",
          "గట్టిగా"
        ]
      },
      {
        "id": "opt_remove_seeds",
        "text": {
          "en": "To remove seeds",
          "hi": "बीज हटाने के लिए",
          "te": "విత్తనాలను తొలగించడానికి"
        },
        "visualIcon": "X",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "remove",
          "हटाने",
          "తొలగించడానికి"
        ]
      }
    ]
  },
  {
    "id": "farm_q4",
    "trade": "farming",
    "competency": "safetyAwareness",
    "type": "scenario",
    "question": {
      "en": "What should you do before using a farm tool?",
      "hi": "कृषि उपकरण का उपयोग करने से पहले आपको क्या करना चाहिए?",
      "te": "వ్యవసాయ పరికరాన్ని ఉపయోగించే ముందు మీరు ఏమి చేయాలి?",
      "kn": "ಕೃಷಿ ಉಪಕರಣವನ್ನು ಬಳಸುವ ಮೊದಲು ನೀವು ಏನು ಮಾಡಬೇಕು?",
      "ta": "ஒரு பண்ணைக் கருவியைப் பயன்படுத்துவதற்கு முன்பு நீங்கள் என்ன செய்ய வேண்டும்?",
      "mr": "शेतीचे कोणतेही अवजार वापरण्यापूर्वी तुम्ही काय केले पाहिजे?"
    },
    "audioPrompt": {
      "en": "What should you do before using a farm tool?",
      "hi": "कृषि उपकरण का उपयोग करने से पहले क्या करना चाहिए?",
      "te": "వ్యవసాయ పరికరాన్ని వాడే ముందు ఏమి చేయాలి?",
      "kn": "ಕೃಷಿ ಉಪಕರಣ ಬಳಸುವ ಮುನ್ನ ಏನು ಮಾಡಬೇಕು?",
      "ta": "கருவியை பயன்படுத்துமுன் என்ன செய்ய வேண்டும்?",
      "mr": "अवजार वापरण्यापूर्वी काय करावे?"
    },
    "options": [
      {
        "id": "opt_check_safety",
        "text": {
          "en": "Check that it is safe to use",
          "hi": "जांचें कि यह सुरक्षित और ठीक स्थिति में है",
          "te": "ఇది సురక్షితంగా ఉందో లేదో తనిఖీ చేయండి"
        },
        "visualIcon": "Shield",
        "icon": "shield",
        "isCorrect": true,
        "keywords": [
          "safe",
          "check",
          "सुरक्षित",
          "जांचें",
          "తనిఖీ",
          "సురక్షితం"
        ]
      },
      {
        "id": "opt_throw_ground",
        "text": {
          "en": "Throw it on the ground",
          "hi": "इसे जमीन पर फेंक दें",
          "te": "నేలపై విసిరేయండి"
        },
        "visualIcon": "Alert",
        "icon": "alert",
        "isCorrect": false,
        "keywords": [
          "throw",
          "फेंक",
          "విసిరేయండి"
        ]
      },
      {
        "id": "opt_use_unchecked",
        "text": {
          "en": "Use it without checking",
          "hi": "बिना जांचे तुरंत उपयोग करें",
          "te": "తనిఖీ చేయకుండానే వాడండి"
        },
        "visualIcon": "X",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "without checking",
          "बिना जांचे",
          "తనిఖీ చేయకుండా"
        ]
      }
    ]
  },
  {
    "id": "farm_q5",
    "trade": "farming",
    "competency": "scenarioUnderstanding",
    "type": "scenario",
    "question": {
      "en": "What can help protect crops from weeds?",
      "hi": "फसलों को खरपतवार (अवांछित घास) से बचाने में क्या मदद कर सकता है?",
      "te": "పంటలను కలుపు మొక్కల నుండి రక్షించడానికి ఏది సహాయపడుతుంది?",
      "kn": "ಕಳೆಗಳಿಂದ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಲು ಯಾವುದು ಸಹಾಯ ಮಾಡುತ್ತದೆ?",
      "ta": "களைகளிலிருந்து பயிர்களைப் பாதுகாக்க எது உதவுகிறது?",
      "mr": "पिकांना तणांपासून वाचवण्यासाठी काय मदत करते?"
    },
    "audioPrompt": {
      "en": "What can help protect crops from weeds?",
      "hi": "फसलों को खरपतवार से बचाने में क्या मदद करता है?",
      "te": "పంటలను కలుపు మొక్కల నుండి కాపాడటానికి ఏది సహాయపడుతుంది?",
      "kn": "ಬೆಳೆಗಳನ್ನು ಕಳೆಗಳಿಂದ ರಕ್ಷಿಸಲು ಏನು ಮಾಡಬೇಕು?",
      "ta": "களைகளை கட்டுப்படுத்த என்ன செய்ய வேண்டும்?",
      "mr": "तण नियंत्रणासाठी काय करावे?"
    },
    "options": [
      {
        "id": "opt_weeding_mulching",
        "text": {
          "en": "Timely weeding and mulching",
          "hi": "समय पर निराई-गुड़ाई और मल्चिंग (खरपतवार हटाना)",
          "te": "సకాలంలో కలుపు తీయడం మరియు రక్షణ కవర్"
        },
        "visualIcon": "Plant",
        "icon": "check",
        "isCorrect": true,
        "keywords": [
          "weeding",
          "mulching",
          "निराई",
          "गुड़ाई",
          "खरपतवार",
          "కలుపు",
          "కలుపు తీయడం"
        ]
      },
      {
        "id": "opt_spilling_plastic",
        "text": {
          "en": "Spilling waste plastic over field",
          "hi": "खेत में प्लास्टिक कचरा फैलाना",
          "te": "పొలంలో ప్లాస్టిక్ చెత్త వేయడం"
        },
        "visualIcon": "X",
        "icon": "x",
        "isCorrect": false,
        "keywords": [
          "plastic",
          "waste",
          "प्लास्टिक",
          "చెత్త"
        ]
      },
      {
        "id": "opt_ignoring_field",
        "text": {
          "en": "Ignoring the field completely",
          "hi": "खेत की बिल्कुल देखभाल न करना",
          "te": "పొలాన్ని పట్టించుకోకపోవడం"
        },
        "visualIcon": "Alert",
        "icon": "alert",
        "isCorrect": false,
        "keywords": [
          "ignoring",
          "अनदेखा",
          "వదిలేయడం"
        ]
      }
    ]
  }
];

export const SKILL_ASSESSMENT_QUESTIONS = {
  plumbing: ASSESSMENT_QUESTIONS.filter(q => q.trade_id === "plumbing"),
  electrician: ASSESSMENT_QUESTIONS.filter(q => q.trade_id === "electrician"),
  carpentry: ASSESSMENT_QUESTIONS.filter(q => q.trade_id === "carpentry"),
  tailoring: ASSESSMENT_QUESTIONS.filter(q => q.trade_id === "tailoring"),
  welding: ASSESSMENT_QUESTIONS.filter(q => q.trade_id === "welding"),
  farming: ASSESSMENT_QUESTIONS.filter(q => q.trade_id === "farming")
};

export const COMPETENCY_LABELS = {
  toolRecognition: {
    en: "Tool Recognition",
    hi: "उपकरण पहचान (Tool Recognition)",
    te: "పరికరాల గుర్తింపు (Tool Recognition)",
    kn: "ಉಪಕರಣ ಗುರುತಿಸುವಿಕೆ (Tool Recognition)",
    ta: "கருவி அங்கீகாரம் (Tool Recognition)",
    mr: "साधने ओळख (Tool Recognition)"
  },
  scenarioUnderstanding: {
    en: "Workplace Scenario",
    hi: "कार्यस्थल परिदृश्य (Scenario Understanding)",
    te: "కార్యాలయ పరిస్థితి (Workplace Scenario)",
    kn: "ಕೆಲಸದ ಸ್ಥಳ ಸನ್ನಿವೇಶ (Workplace Scenario)",
    ta: "பணிச்சூழல் புரிதல் (Workplace Scenario)",
    mr: "कामाच्या ठिकाणची परिस्थिती (Scenario Understanding)"
  },
  basicKnowledge: {
    en: "Core Trade Knowledge",
    hi: "मूलभूत व्यापार ज्ञान (Core Knowledge)",
    te: "వృత్తి ప్రాథమిక జ్ఞానం (Core Knowledge)",
    kn: "ಮೂಲ ವೃತ್ತಿಪರ ಜ್ಞಾನ (Core Knowledge)",
    ta: "அடிப்படை தொழில் அறிவு (Core Knowledge)",
    mr: "मूलभूत व्यवसाय ज्ञान (Core Knowledge)"
  },
  safetyAwareness: {
    en: "Safety & Hazard Awareness",
    hi: "सुरक्षा एवं सावधानी (Safety Awareness)",
    te: "భద్రత మరియు జాగ్రత్తలు (Safety Awareness)",
    kn: "ಸುರಕ್ಷತೆ ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು (Safety Awareness)",
    ta: "பாதுகாப்பு விழிப்புணர்வு (Safety Awareness)",
    mr: "सुरक्षा आणि खबरदारी (Safety Awareness)"
  }
};

