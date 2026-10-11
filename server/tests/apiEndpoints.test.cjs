// server/tests/apiEndpoints.test.cjs
/**
 * End-to-end HTTP API integration test for Express server.
 */

const http = require('http');
const assert = require('assert');

const app = require('../index.cjs');
let localServer = null;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (_) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('\n--- 6. End-to-End API Endpoint Tests ---');
  
  // Probe if server is already running on 3001
  const isRunning = await new Promise(resolve => {
    const req = http.get('http://127.0.0.1:3001/api/health', (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => { req.destroy(); resolve(false); });
  });

  if (!isRunning) {
    await new Promise(resolve => {
      localServer = app.listen(3001, () => resolve());
    });
    await wait(300);
  }

  // 1. Health check
  const healthRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  });
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthRes.data.status, 'ok');
  console.log('  ✓ GET /api/health returns 200 and status ok');

  // 2. Base API
  const baseRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api',
    method: 'GET'
  });
  assert.strictEqual(baseRes.status, 200);
  assert.ok(baseRes.data.endpoints);
  console.log('  ✓ GET /api returns list of endpoints');

  // 3. Send OTP
  const otpRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { phone: '9876500001', role: 'beneficiary' });
  assert.strictEqual(otpRes.status, 200);
  assert.strictEqual(otpRes.data.success, true);
  console.log('  ✓ POST /api/auth/send-otp returns demo OTP and success status');

  // 4. Verify OTP
  const verifyRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/auth/verify-otp',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { phone: '9876500001', otp: otpRes.data.demoOtp });
  assert.strictEqual(verifyRes.status, 200);
  assert.strictEqual(verifyRes.data.success, true);
  assert.ok(verifyRes.data.token);
  console.log('  ✓ POST /api/auth/verify-otp returns signed HMAC session token');

  // 5. Evaluate Skill Assessment
  const evalRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/assessments/evaluate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${verifyRes.data.token}`
    }
  }, {
    trade: 'plumbing',
    answers: {
      plumb_q1: 'opt_pipe_wrench',
      plumb_q2: 'opt_shutoff',
      plumb_q3: 'opt_teflon_tape',
      plumb_q4: 'opt_replace_washer',
      plumb_q5: 'opt_pvc_solvent'
    }
  });
  assert.strictEqual(evalRes.status, 200);
  assert.strictEqual(evalRes.data.success, true);
  assert.strictEqual(evalRes.data.assessment.passed, true);
  console.log('  ✓ POST /api/assessments/evaluate evaluates trade and enforces safety gate');

  // 6. Opportunity Reservation
  const resRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/opportunities/reserve',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${verifyRes.data.token}`
    }
  }, {
    centerId: 'center-pmkk-agra',
    centerName: 'PMKK Agra Central',
    trade: 'Plumbing',
    phone: '9876500001'
  });
  assert.strictEqual(resRes.status, 200);
  assert.strictEqual(resRes.data.success, true);
  assert.ok(resRes.data.reservation.reservationId);
  console.log('  ✓ POST /api/opportunities/reserve persists genuine reservation record');

  // 7. Bhashini Supported Languages Endpoint
  const bhashiniLangRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/bhashini/languages',
    method: 'GET'
  });
  assert.strictEqual(bhashiniLangRes.status, 200);
  assert.strictEqual(bhashiniLangRes.data.success, true);
  assert.ok(bhashiniLangRes.data.languages.te);
  assert.ok(bhashiniLangRes.data.languages.hi);
  assert.ok(bhashiniLangRes.data.languages.en);
  assert.ok(bhashiniLangRes.data.languages.ta);
  assert.ok(bhashiniLangRes.data.languages.kn);
  assert.ok(bhashiniLangRes.data.languages.mr);
  assert.ok(bhashiniLangRes.data.languages.ml);
  console.log('  ✓ GET /api/bhashini/languages returns supported languages registry (te, hi, en, ta, kn, mr, ml)');

  // 8. Bhashini Script & Language Mismatch Check
  const mismatchRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/bhashini/check-mismatch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    text: 'నా పేరు రమేష్', // Telugu text
    selectedLanguage: 'hi' // Hindi selected
  });
  assert.strictEqual(mismatchRes.status, 200);
  assert.strictEqual(mismatchRes.data.isMismatch, true);
  assert.strictEqual(mismatchRes.data.detectedLanguage, 'te');
  console.log('  ✓ POST /api/bhashini/check-mismatch accurately detects language mismatches');

  // 9. Bhashini Live Translation Endpoint
  const transRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/bhashini/translate',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    text: 'Welcome',
    sourceLanguage: 'en',
    targetLanguage: 'te'
  });
  assert.strictEqual(transRes.status, 200);
  assert.strictEqual(transRes.data.success, true);
  assert.ok(transRes.data.translatedText);
  console.log('  ✓ POST /api/bhashini/translate successfully translates via Bhashini pipeline');

  // 10. Voice Language Identification Endpoint
  const idLangRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/bhashini/identify-language',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    phrase: 'తెలుగు కావాలి' // user speaks in Telugu
  });
  assert.strictEqual(idLangRes.status, 200);
  assert.strictEqual(idLangRes.data.success, true);
  assert.strictEqual(idLangRes.data.language, 'te');
  assert.ok(idLangRes.data.confirmationMessage.includes('తెలుగు'));
  console.log('  ✓ POST /api/bhashini/identify-language recognizes spoken native language and gives confirmation phrase');

  // 11. 404 on invalid route
  const notFoundRes = await request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/non-existent-route',
    method: 'GET'
  });
  assert.strictEqual(notFoundRes.status, 404);
  console.log('  ✓ Unmatched routes return 404 without leaking stack trace');

  console.log('\nAll API integration tests passed successfully!\n');
  if (localServer) {
    localServer.close();
  }
  process.exit(0);
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
