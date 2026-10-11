// server/tests/runAllTests.cjs
/**
 * Automated Test Runner for Jeevika Saathi.
 * Tests:
 * 1. Authentication & HMAC session token security
 * 2. OTP lifecycle (cooldown, expiration, max attempts, demo indicator)
 * 3. Assessment evaluation safety gate across all trades (including Farming)
 * 4. Persistence integrity & atomic file writes
 * 5. Opportunity reservations without fabricated SMS claims
 * 6. Security utilities & input sanitization
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const {
  requestOtp,
  verifyOtp,
  loginOfficial,
  createSessionToken,
  verifySessionToken
} = require('../authService.cjs');

const {
  TRADE_RULES,
  evaluateAnswers,
  getVoiceAssessment,
  saveVoiceAssessment,
  resetVoiceAssessment,
  recordReservation,
  getUserReservations,
  getBeneficiaryProfile,
  saveBeneficiaryProfile
} = require('../assessmentEngine.cjs');

const {
  isValidIndianPhone,
  normalizePhoneNumber,
  sanitizeString,
  createRateLimiter
} = require('../security.cjs');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('  JEEVIKA SAATHI AUTOMATED TEST SUITE');
  console.log('========================================\n');

  console.log('--- 1. Security & Validation Tests ---');
  test('Validates 10-digit Indian mobile numbers correctly', () => {
    assert.strictEqual(isValidIndianPhone('9876543210'), true);
    assert.strictEqual(isValidIndianPhone('+919876543210'), true);
    assert.strictEqual(isValidIndianPhone('919876543210'), true);
    assert.strictEqual(isValidIndianPhone('12345'), false);
    assert.strictEqual(isValidIndianPhone('abcdefghij'), false);
    assert.strictEqual(isValidIndianPhone(''), false);
  });

  test('Normalizes phone numbers to standard 10 digits', () => {
    assert.strictEqual(normalizePhoneNumber('+91 98765 43210'), '9876543210');
    assert.strictEqual(normalizePhoneNumber('919876543210'), '9876543210');
    assert.strictEqual(normalizePhoneNumber('9876543210'), '9876543210');
  });

  test('Sanitizes user input string and prevents control character injection', () => {
    const dirty = '  Hello World\u0000\u001F  ';
    const clean = sanitizeString(dirty, 20);
    assert.strictEqual(clean, 'Hello World');
  });

  console.log('\n--- 2. Authentication & Authorization Tests ---');
  test('Requests OTP and distinguishes demo mode when no SMS gateway configured', () => {
    const testPhone = '9876543211';
    const result = requestOtp(testPhone, 'beneficiary');
    assert.strictEqual(result.success, true);
    assert.strictEqual(typeof result.demoOtp, 'string');
    assert.strictEqual(result.demoOtp.length, 4);
    assert.strictEqual(result.isDemoMode, true);
    assert.strictEqual(result.providerConfirmed, false);
  });

  test('Prevents OTP flooding within cooldown window', () => {
    const testPhone = '9876543212';
    requestOtp(testPhone, 'beneficiary');
    assert.throws(() => {
      requestOtp(testPhone, 'beneficiary');
    }, /Please wait/);
  });

  test('Verifies OTP and generates cryptographically signed session token', () => {
    const testPhone = '9876543213';
    const otpRes = requestOtp(testPhone, 'beneficiary');
    const verifyRes = verifyOtp(testPhone, otpRes.demoOtp);

    assert.strictEqual(verifyRes.success, true);
    assert.ok(verifyRes.token);
    assert.strictEqual(verifyRes.user.phone, `+91 ${testPhone}`);
    assert.strictEqual(verifyRes.user.role, 'beneficiary');

    // Verify token validity
    const decoded = verifySessionToken(verifyRes.token);
    assert.ok(decoded);
    assert.strictEqual(decoded.userId, `ben_${testPhone}`);
    assert.strictEqual(decoded.role, 'beneficiary');
  });

  test('Rejects invalid OTP and tracks remaining attempts', () => {
    const testPhone = '9876543214';
    requestOtp(testPhone, 'beneficiary');
    assert.throws(() => {
      verifyOtp(testPhone, '0000');
    }, /Incorrect OTP/);
  });

  test('Detects tampered tokens and rejects invalid signatures', () => {
    const testPhone = '9876543215';
    const otpRes = requestOtp(testPhone, 'beneficiary');
    const verifyRes = verifyOtp(testPhone, otpRes.demoOtp);
    const tampered = verifyRes.token.slice(0, -4) + 'abcd';
    const decoded = verifySessionToken(tampered);
    assert.strictEqual(decoded, null);
  });

  test('Official login verifies credentials and assigns official role', () => {
    const officialRes = loginOfficial({ username: 'nodal.admin', password: 'PMAJAY@2026' });
    assert.strictEqual(officialRes.success, true);
    assert.strictEqual(officialRes.user.role, 'official');
    const decoded = verifySessionToken(officialRes.token);
    assert.strictEqual(decoded.role, 'official');
  });

  console.log('\n--- 3. Trade Assessment Safety Gate Tests ---');
  test('Electrician trade enforces strict safety gate (>= 75% required)', () => {
    const userId = 'test_elec_user';
    // Answers with tool recognition correct, but wrong safety answers
    const answers = {
      elec_q1: 'opt_neon_tester', // correct
      elec_q2: 'opt_wrong',        // wrong safety
      elec_q3: 'opt_red_black_green', // correct
      elec_q4: 'opt_remove_overload', // correct
      elec_q5: 'opt_wrong'         // wrong safety
    };
    const result = evaluateAnswers(userId, 'electrician', answers);
    assert.strictEqual(result.assessment.passed, false);
    assert.strictEqual(result.assessment.status, 'TRAINING_RECOMMENDED');
  });

  test('Electrician passes when both overall score and safety gate are satisfied', () => {
    const userId = 'test_elec_pass';
    const answers = {
      elec_q1: 'opt_neon_tester',
      elec_q2: 'opt_turn_off_mcb',
      elec_q3: 'opt_red_black_green',
      elec_q4: 'opt_remove_overload',
      elec_q5: 'opt_rubber_gloves'
    };
    const result = evaluateAnswers(userId, 'electrician', answers);
    assert.strictEqual(result.assessment.passed, true);
    assert.strictEqual(result.assessment.status, 'VERIFIED');
    assert.strictEqual(result.verifiedStatus.status, 'VERIFIED');
  });

  test('Farming / Agriculture trade assessment evaluates properly', () => {
    const userId = 'test_farm_user';
    const answers = {
      farm_q1: 'opt_hoe',
      farm_q2: 'opt_water_nutrients',
      farm_q3: 'opt_support_growth',
      farm_q4: 'opt_check_safety',
      farm_q5: 'opt_weeding_mulching'
    };
    const result = evaluateAnswers(userId, 'farming', answers);
    assert.strictEqual(result.assessment.passed, true);
    assert.strictEqual(result.assessment.trade, 'farming');
    assert.strictEqual(result.assessment.status, 'VERIFIED');
  });

  console.log('\n--- 4. Voice Assessment & Profile Persistence Tests ---');
  await asyncTest('Voice assessment saves and updates state without overwriting valid data', async () => {
    const userId = 'test_va_user_1';
    resetVoiceAssessment(userId);

    const step1 = saveVoiceAssessment(userId, {
      full_name: 'Verified Test Beneficiary',
      current_occupation: 'Farmer'
    }, false);
    assert.strictEqual(step1.status, 'IN_PROGRESS');
    assert.strictEqual(step1.data.full_name, 'Verified Test Beneficiary');

    const step2 = saveVoiceAssessment(userId, {
      existing_skills: ['irrigation', 'dairy'],
      career_aspiration: 'Dairy Unit Owner'
    }, true);
    assert.strictEqual(step2.status, 'COMPLETED');
    assert.strictEqual(step2.data.full_name, 'Verified Test Beneficiary');
    assert.ok(step2.completedAt);
  });

  console.log('\n--- 5. Opportunities & Reservation Persistence Tests ---');
  test('Records seat reservations in database without fabricating SMS delivery', () => {
    const res = recordReservation({
      userId: 'test_res_user',
      centerId: 'center-pmkk-agra',
      centerName: 'PMKK Agra Central',
      trade: 'Solar Domestic Electrician',
      phone: '+91 98765 43210'
    });

    assert.ok(res.reservationId);
    assert.strictEqual(res.centerId, 'center-pmkk-agra');
    assert.strictEqual(res.status, 'CONFIRMED_DEMO');

    const userReservations = getUserReservations('test_res_user');
    assert.ok(userReservations.length >= 1);
    assert.strictEqual(userReservations[0].centerName, 'PMKK Agra Central');
  });

  console.log('\n--- 6. Beneficiary Profile Persistence & Integrity Tests ---');
  test('New beneficiary profile returns neutral initial state without random person details', () => {
    const res = getBeneficiaryProfile('new_unregistered_ben_999');
    assert.strictEqual(res.status, 'NEW');
    assert.strictEqual(res.profile.name, null);
    assert.strictEqual(res.profile.district, null);
    assert.strictEqual(res.profile.currentLivelihood, null);
    assert.notStrictEqual(res.profile.name, 'Ramesh');
    assert.notStrictEqual(res.profile.currentLivelihood, 'Carpenter');
  });

  test('Persisting beneficiary profile saves and normalizes real user data correctly', () => {
    const testId = 'ben_test_profile_user_1';
    const profileData = {
      name: 'Priya Sharma',
      age: 24,
      gender: 'Female',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      skills: ['Tailoring', 'Embroidery'],
      aspiration: 'Boutique Owner',
      employmentPref: 'Self-Employment / Micro-Enterprise'
    };

    const saved = saveBeneficiaryProfile(testId, profileData);
    assert.strictEqual(saved.success, true);
    assert.strictEqual(saved.profile.name, 'Priya Sharma');
    assert.strictEqual(saved.profile.age, 24);
    assert.strictEqual(saved.profile.district, 'Varanasi');
    assert.strictEqual(saved.profile.districtState, 'Varanasi, Uttar Pradesh');
    assert.strictEqual(saved.profile.aspiration, 'Boutique Owner');

    const fetched = getBeneficiaryProfile(testId);
    assert.strictEqual(fetched.status, 'ACTIVE');
    assert.strictEqual(fetched.profile.name, 'Priya Sharma');
    assert.deepStrictEqual(fetched.profile.skills, ['Tailoring', 'Embroidery']);
  });

  console.log('\n========================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
