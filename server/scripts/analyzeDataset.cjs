// server/scripts/analyzeDataset.cjs
const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../data/nielit_nsqf_full_dataset_with_legacy.csv');
const content = fs.readFileSync(csvPath, 'utf8');

function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let cur = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (c === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && text[i+1] === '\n') { i++; }
      row.push(cur.trim());
      if (row.some(x => x !== '')) lines.push(row);
      row = [];
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur || row.length > 0) { row.push(cur.trim()); lines.push(row); }
  return lines;
}

const rows = parseCSV(content);
const headers = rows[0];
const data = rows.slice(1);

console.log('=== DATASET SUMMARY ===');
console.log('Total Records:', data.length);
console.log('Columns (' + headers.length + '):', headers);

const summary = {};
headers.forEach((h) => {
  summary[h] = { missing: 0, distinct: new Set(), sampleValues: [] };
});

const ids = new Set();
let dupIds = 0;

data.forEach((r) => {
  const id = r[0];
  if (ids.has(id)) dupIds++;
  ids.add(id);

  headers.forEach((h, idx) => {
    const val = r[idx];
    if (!val || val === '' || val.toLowerCase() === 'nan' || val.toLowerCase() === 'null') {
      summary[h].missing++;
    } else {
      summary[h].distinct.add(val);
      if (summary[h].sampleValues.length < 4) summary[h].sampleValues.push(val);
    }
  });
});

console.log('Duplicate IDs count:', dupIds);

const colReport = {};
headers.forEach(h => {
  colReport[h] = {
    missingCount: summary[h].missing,
    distinctCount: summary[h].distinct.size,
    samples: summary[h].sampleValues
  };
});
console.log('\n=== COLUMN ANALYSIS ===');
console.log(JSON.stringify(colReport, null, 2));

console.log('\n=== STATUS BREAKDOWN ===');
const statusCounts = {};
data.forEach(r => {
  const st = r[10] || 'EMPTY';
  statusCounts[st] = (statusCounts[st] || 0) + 1;
});
console.log(statusCounts);

console.log('\n=== NSQF LEVEL BREAKDOWN ===');
const nsqfCounts = {};
data.forEach(r => {
  const lvl = r[4] || 'EMPTY';
  nsqfCounts[lvl] = (nsqfCounts[lvl] || 0) + 1;
});
console.log(nsqfCounts);

console.log('\n=== SECTOR BREAKDOWN ===');
const sectorCounts = {};
data.forEach(r => {
  const s = r[2] || 'EMPTY';
  sectorCounts[s] = (sectorCounts[s] || 0) + 1;
});
console.log(sectorCounts);

console.log('\n=== SKILL CLUSTER BREAKDOWN ===');
const clusterCounts = {};
data.forEach(r => {
  const sc = r[8] || 'EMPTY';
  clusterCounts[sc] = (clusterCounts[sc] || 0) + 1;
});
console.log(clusterCounts);

console.log('\n=== ENTRY PROFILES BREAKDOWN ===');
const entryCounts = {};
data.forEach(r => {
  const ep = r[9] || 'EMPTY';
  entryCounts[ep] = (entryCounts[ep] || 0) + 1;
});
console.log(entryCounts);
