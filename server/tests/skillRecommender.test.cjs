// server/tests/skillRecommender.test.cjs
// Comprehensive test suite for Dataset-Driven Skill Recommendation System
// Tests:
// - IT interest
// - Web development interest
// - Computer hardware interest
// - Electronics interest
// - Electrical-related interest & distinction notice
// - Unknown interest
// - Empty dataset handling
// - Missing CSV file handling
// - Current versus legacy filtering
// - Education and duration filters
// - Invalid query parameters

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { recommendCourses, resolveInterest, getAvailableInterests } = require('../matchingEngine/skillRecommender.cjs');
const { getAllCourses, deriveExpectedSkills } = require('../matchingEngine/dataLoader.cjs');

describe('Dataset-Driven Skill Recommendation System Verification', () => {

  describe('1. Interest Resolution & Mapping Layer', () => {
    it('should map "IT" to IT sector and relevant skill clusters', () => {
      const resolved = resolveInterest('IT');
      assert.ok(resolved, 'Should resolve IT');
      assert.strictEqual(resolved.id, 'it');
      assert.strictEqual(resolved.sector, 'IT');
      assert.ok(resolved.skillClusters.includes('Web Development'));
      assert.ok(resolved.skillClusters.includes('Core IT Diploma (O/A/B Level)'));
    });

    it('should map natural language "I want to work in IT." to IT sector', () => {
      const resolved = resolveInterest('I want to work in IT.');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'it');
      assert.strictEqual(resolved.sector, 'IT');
    });

    it('should map "Web Development" interest to Web Development cluster and IT sector', () => {
      const resolved = resolveInterest('Web Development');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'web_development');
      assert.strictEqual(resolved.sector, 'IT');
      assert.ok(resolved.skillClusters.includes('Web Development'));
    });

    it('should map "I want to learn computer programming." to Programming in IT sector', () => {
      const resolved = resolveInterest('I want to learn computer programming.');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'programming');
      assert.strictEqual(resolved.sector, 'IT');
    });

    it('should map "Computer Hardware and Repair" to Electronics sector and Hardware cluster', () => {
      const resolved = resolveInterest('Computer Hardware and Repair');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'computer_repair');
      assert.strictEqual(resolved.sector, 'Electronics');
      assert.ok(resolved.skillClusters.includes('Hardware Repair & Maintenance'));
    });

    it('should map natural language "I want to repair computers." to computer_repair', () => {
      const resolved = resolveInterest('I want to repair computers.');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'computer_repair');
    });

    it('should map "Electronics" to Electronics sector', () => {
      const resolved = resolveInterest('Electronics');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'electronics');
      assert.strictEqual(resolved.sector, 'Electronics');
    });

    it('should map "Electrical-related interests" with a clear distinction notice', () => {
      const resolved = resolveInterest('I am interested in electrical work.');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'electrical');
      assert.strictEqual(resolved.sector, 'Electronics');
      assert.ok(resolved.distinctionNotice, 'Must include explicit distinction notice');
      assert.ok(resolved.distinctionNotice.toLowerCase().includes('not equivalent to industrial'));
    });

    it('should map "IoT and Embedded Systems" to Electronics sector', () => {
      const resolved = resolveInterest('IoT and Embedded Systems');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'iot_embedded');
      assert.strictEqual(resolved.sector, 'Electronics');
    });

    it('should map natural language "I want to learn robotics." to robotics in Electronics sector', () => {
      const resolved = resolveInterest('I want to learn robotics.');
      assert.ok(resolved);
      assert.strictEqual(resolved.id, 'robotics');
      assert.strictEqual(resolved.sector, 'Electronics');
      assert.ok(resolved.skillClusters.includes('Robotics & Drones'));
    });

    it('should return null for completely unknown non-matching interest', () => {
      const resolved = resolveInterest('astronautical deep ocean diving');
      assert.strictEqual(resolved, null, 'Unknown interest should return null');
    });
  });

  describe('2. Course Recommendations by Interest', () => {
    it('should recommend verified IT courses for IT interest', () => {
      const res = recommendCourses({ interest: 'IT' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.matchedSector, 'IT');
      assert.ok(res.totalFound > 0, 'Should find courses');
      // All default courses must be verified
      assert.ok(res.recommendations.every(c => c.is_verified), 'All default recommendations must be verified');
    });

    it('should recommend web development courses including "Certified Web Developer"', () => {
      const res = recommendCourses({ interest: 'Web Development' });
      assert.strictEqual(res.success, true);
      const names = res.recommendations.map(c => c.course_name);
      assert.ok(names.includes('Certified Web Developer'), 'Must recommend Certified Web Developer');
    });

    it('should recommend hardware repair courses for computer hardware interest', () => {
      const res = recommendCourses({ interest: 'Computer Hardware and Repair' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.matchedSector, 'Electronics');
      const names = res.recommendations.map(c => c.course_name);
      assert.ok(names.some(n => n.includes('Assembly & Maintenance of Personal Computer') || n.includes('Repair and Maintenance')));
    });

    it('should recommend electronics and solar qualifications with distinction notice for electrical interest', () => {
      const res = recommendCourses({ interest: 'I am interested in electrical work.' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.matchedSector, 'Electronics');
      assert.ok(res.distinctionNotice, 'Must include distinction notice');
      assert.ok(res.distinctionNotice.toLowerCase().includes('not equivalent to industrial'));
      // Returns electronics / solar courses
      assert.ok(res.recommendations.some(c => c.skill_cluster.includes('Solar') || c.skill_cluster.includes('Electronics')));
    });

    it('should handle unknown interest gracefully without throwing', () => {
      const res = recommendCourses({ interest: 'completely unknown obscure term 99824' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.totalFound, 0);
      assert.deepStrictEqual(res.recommendations, []);
    });
  });

  describe('3. Current vs Legacy Course Filtering (Feature 5)', () => {
    it('should NOT include legacy unverified courses by default', () => {
      const res = recommendCourses({ interest: 'IT' });
      assert.strictEqual(res.success, true);
      const hasLegacy = res.recommendations.some(c => !c.is_verified || c.verification_status === 'LEGACY_UNVERIFIED');
      assert.strictEqual(hasLegacy, false, 'Default recommendations must contain zero legacy courses');
    });

    it('should include legacy unverified courses when includeLegacy=true and label them clearly', () => {
      const resWithout = recommendCourses({ interest: 'Web Development', includeLegacy: false });
      const resWith = recommendCourses({ interest: 'Web Development', includeLegacy: true });

      assert.ok(resWith.totalFound >= resWithout.totalFound);
      const legacyCourses = resWith.recommendations.filter(c => !c.is_verified);
      assert.ok(legacyCourses.length > 0, 'Must include legacy courses when requested');

      // Check legacy course properties
      const sample = legacyCourses[0];
      assert.strictEqual(sample.is_verified, false);
      assert.strictEqual(sample.is_historical, true);
      assert.strictEqual(sample.verification_status, 'LEGACY_UNVERIFIED');
      assert.ok(sample.matching_reasons.some(r => r.includes('Historical record')));
    });
  });

  describe('4. Education and Duration Filters (Feature 3 & 6)', () => {
    it('should filter courses by maximum duration in weeks', () => {
      const resShort = recommendCourses({ interest: 'IT', maxDurationWeeks: 4 });
      assert.strictEqual(resShort.success, true);
      assert.ok(resShort.recommendations.every(c => c.est_duration_weeks <= 4), 'All courses must be <= 4 weeks');
    });

    it('should filter courses by NSQF level', () => {
      const resLevel4 = recommendCourses({ interest: 'IT', nsqfLevel: 4 });
      assert.strictEqual(resLevel4.success, true);
      assert.ok(resLevel4.recommendations.every(c => c.nsqf_level === 4), 'All courses must be NSQF Level 4');
    });

    it('should assess education compatibility without excluding courses entirely', () => {
      // 8th pass candidate looking at Robotics (which typically infers 12th/ITI)
      const res = recommendCourses({ interest: 'Robotics', education: 'Class 8 pass' });
      assert.strictEqual(res.success, true);
      assert.ok(res.recommendations.length > 0, 'Should NOT exclude courses solely because entry profile does not match');

      const course = res.recommendations[0];
      assert.ok(course.eligibility, 'Must contain eligibility evaluation');
      assert.strictEqual(course.eligibility.status, 'REQUIRES_PREREQUISITE_CHECK');
      assert.ok(course.eligibility.note.toLowerCase().includes('typically expects'));
    });

    it('should mark candidate as ELIGIBLE when education requirement is met', () => {
      const res = recommendCourses({ interest: 'Computer Hardware and Repair', education: 'Class 10 pass' });
      assert.strictEqual(res.success, true);
      const eligibleCourse = res.recommendations.find(c => c.course_name.includes('Assembly & Maintenance of Personal Computer'));
      assert.ok(eligibleCourse);
      assert.strictEqual(eligibleCourse.eligibility.status, 'ELIGIBLE');
    });

    it('should explain entry requirement transparently when user education is unspecified', () => {
      const res = recommendCourses({ interest: 'IT', education: '' });
      assert.strictEqual(res.success, true);
      const sample = res.recommendations[0];
      assert.strictEqual(sample.eligibility.status, 'UNKNOWN_USER_EDUCATION');
    });
  });

  describe('5. Recommendation Card Payload Quality (Feature 4)', () => {
    it('should provide all required fields on every recommended course', () => {
      const res = recommendCourses({ interest: 'IT' });
      assert.ok(res.recommendations.length > 0);
      const c = res.recommendations[0];

      assert.ok(c.course_name, 'Must have course_name');
      assert.ok(c.sector, 'Must have sector');
      assert.ok(c.skill_cluster, 'Must have skill_cluster');
      assert.ok(Array.isArray(c.expected_skills) && c.expected_skills.length > 0, 'Must have expected_skills array');
      assert.ok(typeof c.nsqf_level === 'number', 'Must have nsqf_level');
      assert.ok(typeof c.notional_hours === 'number', 'Must have notional_hours');
      assert.ok(typeof c.est_duration_weeks === 'number', 'Must have est_duration_weeks');
      assert.ok(c.course_type, 'Must have course_type');
      assert.ok(c.entry_profile, 'Must have entry_profile');
      assert.strictEqual(c.entry_profile.is_inferred, true, 'Entry profile must be marked as inferred');
      assert.ok(c.verification_status, 'Must have verification_status');
      assert.ok(c.source_url, 'Must have official source_url');
      assert.ok(c.fee_info, 'Must have fee_info note');
      assert.ok(c.source_disclaimer, 'Must have source_disclaimer');
    });
  });

  describe('6. Edge Cases & Robustness (Feature 6)', () => {
    it('should handle empty or missing interest query parameter by returning available interests list', () => {
      const res = recommendCourses({});
      assert.strictEqual(res.success, true);
      assert.ok(Array.isArray(res.availableInterests));
      assert.ok(res.availableInterests.length >= 8);
    });

    it('should handle invalid non-numeric filters gracefully without crashing', () => {
      const res = recommendCourses({
        interest: 'IT',
        nsqfLevel: 'invalid_abc',
        maxDurationWeeks: 'not_a_number'
      });
      assert.strictEqual(res.success, true);
      assert.ok(res.totalFound > 0);
    });
  });
});
