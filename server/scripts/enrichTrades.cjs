// server/scripts/enrichTrades.cjs
const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../src/data/trades.js');
let content = fs.readFileSync(targetPath, 'utf8');

const tradesTranslations = {
  "nsqf-001": {
    kn: "ಗ್ರಾಹಕ ಸೇವಾ ಕಾರ್ಯನಿರ್ವಾಹಕ (Customer Service Executive)",
    mr: "ग्राहक सेवा अधिकारी (Customer Service Executive)"
  },
  "nsqf-002": {
    kn: "ಸೌರ ಮತ್ತು ಗೃಹ ವಿದ್ಯುತ್ ತಂತ್ರಜ್ಞ (Solar & Domestic Electrician)",
    mr: "सोलर व घरगुती इलेक्ट्रिशियन (Solar & Domestic Electrician)"
  },
  "nsqf-003": {
    kn: "ಪಾದರಕ್ಷೆ ಮತ್ತು ಚರ್ಮ ಕರಕುಶಲಕರ್ಮಿ 2.0 (Leather Artisan)",
    mr: "पादत्राणे व चर्मोद्योग कारागीर २.० (Footwear & Leather Artisan)"
  },
  "nsqf-004": {
    kn: "ಕೈಗಾರಿಕಾ ಹೊಲಿಗೆ ಯಂತ್ರ ನಿರ್ವಾಹಕ ಮತ್ತು ಬೊಟಿಕ್ ವಿನ್ಯಾಸ",
    mr: "औद्योगिक शिलाई व बुटीक टेलरिंग (Industrial Sewing & Tailoring)"
  },
  "nsqf-005": {
    kn: "ಜನರಲ್ ಡ್ಯೂಟಿ ಅಸಿಸ್ಟೆಂಟ್ (ಆರೋಗ್ಯ ಸೇವೆ)",
    mr: "जनरल ड्युटी असिस्टंट (आरोग्य सहाय्यक)"
  },
  "nsqf-006": {
    kn: "ಸಲೂನ್ ಮತ್ತು ಕ್ಷೇಮ ಥೆರಪಿಸ್ಟ್ (Salon & Wellness)",
    mr: "सलोन व वेलनेस थेरपिस्ट (Salon & Wellness)"
  },
  "nsqf-007": {
    kn: "ಸ್ಮಾರ್ಟ್ ಡೈರಿ ಮತ್ತು ಆಧುನಿಕ ಕೃಷಿ ತಂತ್ರಜ್ಞ",
    mr: "स्मार्ट डेअरी व आधुनिक शेती तंत्रज्ञ (Smart Dairy & Hydroponics)"
  },
  "nsqf-008": {
    kn: "ಸುಧಾರಿತ ಆರ್ಕ್ ಮತ್ತು ಟಿಐಜಿ ವೆಲ್ಡರ್ (Arc & TIG Welder)",
    mr: "प्रगत आर्क व टीआयजी वेल्डर (Advanced Arc & TIG Welder)"
  },
  "nsqf-009": {
    kn: "ಮಾಡ್ಯುಲರ್ ಮರಗೆಲಸ ಮತ್ತು ಬಡಗಿ (Modular Woodworker & Carpenter)",
    mr: "मॉड्युलर लाकूडकाम व सुतारकाम (Modular Woodworker & Carpenter)"
  },
  "nsqf-010": {
    kn: "ಪ್ಲಂಬಿಂಗ್ ಮತ್ತು ಸ್ಮಾರ್ಟ್ ನೈರ್ಮಲ್ಯ ತಂತ್ರಜ್ಞ",
    mr: "प्लंबिंग व स्मार्ट स्वच्छता तंत्रज्ञ (Plumbing & Sanitation)"
  }
};

for (const [id, trans] of Object.entries(tradesTranslations)) {
  const marker = `id: "${id}",`;
  const idx = content.indexOf(marker);
  if (idx !== -1) {
    const teMarker = `trade_name_te: "`;
    const teIdx = content.indexOf(teMarker, idx);
    const endLine = content.indexOf('\n', teIdx);
    const addition = `\n    trade_name_kn: "${trans.kn}",\n    trade_name_mr: "${trans.mr}",`;
    content = content.slice(0, endLine) + addition + content.slice(endLine);
  }
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully enriched trades.js with Kannada and Marathi!');
