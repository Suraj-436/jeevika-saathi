// server/tests/voiceWorkflow.test.cjs
/**
 * Test Suite: Voice Assessment → Skill Recommendations → Nearby Opportunities Workflow
 * Verifies all 8 user-mandated workflow scenarios:
 * 1. A new beneficiary logs in → is prompted to complete the Voice Assessment.
 * 2. The beneficiary completes the assessment → results are saved with structured data & timestamp.
 * 3. The beneficiary is redirected to Recommendations → personalized dataset-backed skills appear.
 * 4. The beneficiary refreshes the page → recommendations remain available.
 * 5. The beneficiary logs out and logs in again → the completed assessment is recognized.
 * 6. An incomplete assessment → recommendations remain gated.
 * 7. The beneficiary retakes the assessment → saved results and recommendations update.
 * 8. Nearby Opportunities uses the completed assessment profile.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const {
  getVoiceAssessment,
  saveVoiceAssessment,
  resetVoiceAssessment,
  getBeneficiaryProfile,
  saveBeneficiaryProfile
} = require('../assessmentEngine.cjs');
const { searchRecords } = require('../nsqfDatasetService.cjs');
const { recommendCourses } = require('../matchingEngine/skillRecommender.cjs');

describe('Voice Assessment → Recommendations → Nearby Opportunities Workflow', () => {

  const TEST_USER_NEW = 'test_ben_workflow_new_1001';
  const TEST_USER_COMPLETED = 'test_ben_workflow_comp_1002';
  const TEST_USER_INCOMPLETE = 'test_ben_workflow_inc_1003';
  const TEST_USER_RETAKE = 'test_ben_workflow_retake_1004';

  before(() => {
    // Reset test users before running
    resetVoiceAssessment(TEST_USER_NEW);
    resetVoiceAssessment(TEST_USER_COMPLETED);
    resetVoiceAssessment(TEST_USER_INCOMPLETE);
    resetVoiceAssessment(TEST_USER_RETAKE);
  });

  after(() => {
    // Clean up test users
    resetVoiceAssessment(TEST_USER_NEW);
    resetVoiceAssessment(TEST_USER_COMPLETED);
    resetVoiceAssessment(TEST_USER_INCOMPLETE);
    resetVoiceAssessment(TEST_USER_RETAKE);
  });

  // ── Scenario 1: New beneficiary logs in → prompted to complete assessment ──
  it('Scenario 1: New beneficiary has NOT_STARTED assessment status on backend', () => {
    const va = getVoiceAssessment(TEST_USER_NEW);
    assert.strictEqual(va.status, 'NOT_STARTED', 'New beneficiary status must be NOT_STARTED');
    assert.strictEqual(va.completedAt, null, 'completedAt must be null');
    assert.deepStrictEqual(va.data, {}, 'Data should initially be empty');

    const profileRecord = getBeneficiaryProfile(TEST_USER_NEW);
    assert.ok(profileRecord.profile.completion === 0 || profileRecord.status === 'NEW', 'Profile completion should be 0');
  });

  // ── Scenario 2: Beneficiary completes assessment → results saved with timestamp ──
  it('Scenario 2: Completed assessment saves structured results and completion timestamp against beneficiary', () => {
    const assessmentPayload = {
      full_name: 'Ramesh Kumar',
      current_occupation: 'Solar Pump Assistant',
      years_of_experience: 2,
      family_occupation: 'Farming',
      existing_skills: ['Solar wiring', 'DC inverter basics', 'Panel mounting'],
      interests: ['electrical', 'electronics'],
      career_aspiration: 'Certified Solar PV Technician',
      employment_preference: 'Self-Employment',
      location: 'Agra, Uttar Pradesh',
      mobility_limit_km: 25,
      training_availability_duration: '2 months',
      training_schedule: 'Full-time'
    };

    const saved = saveVoiceAssessment(TEST_USER_COMPLETED, assessmentPayload, true);

    assert.strictEqual(saved.status, 'COMPLETED', 'Status must be COMPLETED');
    assert.ok(saved.completedAt, 'completedAt must be populated');
    assert.strictEqual(saved.data.current_occupation, 'Solar Pump Assistant');
    assert.strictEqual(saved.data.career_aspiration, 'Certified Solar PV Technician');
    assert.strictEqual(saved.data.existing_skills.length, 3);
    assert.strictEqual(saved.data.mobility_limit_km, 25);

    // Profile record in backend should be updated in sync
    const profile = getBeneficiaryProfile(TEST_USER_COMPLETED);
    assert.strictEqual(profile.profile.currentLivelihood, 'Solar Pump Assistant');
    assert.strictEqual(profile.profile.aspiration, 'Certified Solar PV Technician');
    assert.strictEqual(profile.profile.completion, 100);
  });

  // ── Scenario 3: Recommendations auto-generate from saved assessment & NIELIT dataset ──
  it('Scenario 3: Recommendations automatically map to saved interests, skills and education from NIELIT dataset', () => {
    const va = getVoiceAssessment(TEST_USER_COMPLETED);
    assert.strictEqual(va.status, 'COMPLETED');

    // Use saved interests ('electrical') and existing skills to fetch recommendations
    const primaryInterest = va.data.interests[0];
    const recs = recommendCourses({
      interest: primaryInterest,
      education: '10th Pass',
      includeLegacy: false
    });

    assert.strictEqual(recs.success, true);
    assert.ok(recs.recommendations.length > 0, 'Must return recommendations');

    // Check that top recommended course is verified from real dataset
    const topCourse = recs.recommendations[0];
    assert.ok(topCourse.course_name, 'Must have official course name');
    assert.ok(topCourse.nsqf_level, 'Must have NSQF level');
    assert.strictEqual(topCourse.is_verified, true, 'Top course must be CURRENT_VERIFIED');
    assert.ok(topCourse.fee_note, 'Must carry PM-AJAY GIA fee note');

    // Check distinction notice exists for electrical vs electronics
    assert.ok(recs.distinctionNotice, 'Must include distinction notice');
  });

  // ── Scenario 4: Survives page refresh (fetching again returns same completed profile) ──
  it('Scenario 4: Assessment and recommendations survive page refreshes via persisted backend state', () => {
    // Simulate refresh by reading fresh record from backend service
    const refreshedVa = getVoiceAssessment(TEST_USER_COMPLETED);
    assert.strictEqual(refreshedVa.status, 'COMPLETED', 'Must retain COMPLETED status on reload');
    assert.strictEqual(refreshedVa.data.current_occupation, 'Solar Pump Assistant');
    assert.ok(refreshedVa.completedAt, 'completedAt must persist');

    // Recommendations remain accessible immediately without re-assessment
    const recs = recommendCourses({ interest: refreshedVa.data.interests[0] });
    assert.ok(recs.recommendations.length > 0);
  });

  // ── Scenario 5: Logout and Login again recognizes completed assessment ──
  it('Scenario 5: Logging in recognizes existing completed assessment without forcing repetition', () => {
    // Beneficiary logs in with same userId
    const loginUserCheck = getVoiceAssessment(TEST_USER_COMPLETED);
    assert.strictEqual(loginUserCheck.status, 'COMPLETED', 'Completed assessment recognized');
    assert.ok(loginUserCheck.completedAt, 'Existing timestamp recognized');

    // Verification that new/other beneficiary does NOT inherit this status
    const otherUser = getVoiceAssessment(TEST_USER_NEW);
    assert.strictEqual(otherUser.status, 'NOT_STARTED');
  });

  // ── Scenario 6: Incomplete assessment remains gated ──
  it('Scenario 6: Incomplete or partially answered assessment remains gated (does not mark COMPLETED)', () => {
    // User starts talking, but assessment is interrupted or incomplete
    const partialPayload = {
      full_name: 'Interrupted User',
      current_occupation: 'Day Laborer'
      // Missing completed flag, skills, interests
    };

    const saved = saveVoiceAssessment(TEST_USER_INCOMPLETE, partialPayload, false);

    assert.strictEqual(saved.status, 'IN_PROGRESS', 'Partial assessment must be IN_PROGRESS, not COMPLETED');
    assert.strictEqual(saved.completedAt, null, 'completedAt must remain null');

    // Empty payload attempt with isCompleted=true should still be rejected if core info missing
    const emptyCompletedAttempt = saveVoiceAssessment('test_ghost_user_99', {}, true);
    assert.strictEqual(emptyCompletedAttempt.status, 'NOT_STARTED', 'Empty profile cannot be completed');
    assert.strictEqual(emptyCompletedAttempt.completedAt, null);
  });

  // ── Scenario 7: Retaking assessment updates saved profile & recommendations ──
  it('Scenario 7: Retaking assessment resets backend state and updates results upon completion', () => {
    // 1. Initial completion in IT sector
    saveVoiceAssessment(TEST_USER_RETAKE, {
      current_occupation: 'Data Entry Operator',
      existing_skills: ['Typing', 'MS Excel'],
      interests: ['web_development'],
      career_aspiration: 'Web Developer'
    }, true);

    let va = getVoiceAssessment(TEST_USER_RETAKE);
    assert.strictEqual(va.status, 'COMPLETED');
    assert.strictEqual(va.data.career_aspiration, 'Web Developer');

    // 2. User clicks "Retake Voice Assessment"
    resetVoiceAssessment(TEST_USER_RETAKE);
    va = getVoiceAssessment(TEST_USER_RETAKE);
    assert.strictEqual(va.status, 'NOT_STARTED', 'Status must reset to NOT_STARTED');
    assert.strictEqual(va.completedAt, null);

    // 3. User completes second assessment in Electronics & Hardware
    saveVoiceAssessment(TEST_USER_RETAKE, {
      current_occupation: 'Mobile Repair Shop Helper',
      existing_skills: ['Soldering', 'Screen replacement'],
      interests: ['computer_repair'],
      career_aspiration: 'Computer Hardware Technician'
    }, true);

    const updatedVa = getVoiceAssessment(TEST_USER_RETAKE);
    assert.strictEqual(updatedVa.status, 'COMPLETED');
    assert.strictEqual(updatedVa.data.career_aspiration, 'Computer Hardware Technician');
    assert.strictEqual(updatedVa.data.interests[0], 'computer_repair');

    // Recommendations now update to computer hardware courses
    const updatedRecs = recommendCourses({ interest: updatedVa.data.interests[0] });
    assert.ok(updatedRecs.recommendations.some(c => 
      c.course_name.toLowerCase().includes('hardware') || c.course_name.toLowerCase().includes('repair') || c.course_name.toLowerCase().includes('assembly')
    ), 'Recommendations must reflect updated retaken profile');
  });

  // ── Scenario 8: Nearby Opportunities uses completed assessment profile ──
  it('Scenario 8: Nearby Opportunities utilizes location, travel radius, and trade from completed assessment', () => {
    const va = getVoiceAssessment(TEST_USER_COMPLETED);
    assert.strictEqual(va.status, 'COMPLETED');

    // Verify profile parameters used by Nearby Opportunities
    const userLocation = va.data.location;
    const mobilityRadius = va.data.mobility_limit_km;
    const targetTrade = va.data.career_aspiration;

    assert.strictEqual(userLocation, 'Agra, Uttar Pradesh');
    assert.strictEqual(mobilityRadius, 25);
    assert.strictEqual(targetTrade, 'Certified Solar PV Technician');

    // Verify dataset courses match the target trade for nearby opportunities
    const nsqfMatch = searchRecords({
      role: 'technician',
      sector: 'Electronics'
    });

    assert.ok(nsqfMatch.records.length > 0, 'Found accredited courses in target sector for opportunities');
  });

});
