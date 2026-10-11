const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  getAllCourses,
  getVerifiedCourses,
  getCourseById,
  normalizeEducationLevel,
  parseEntryPrerequisites
} = require('../matchingEngine/dataLoader.cjs');

const {
  getOccupations,
  getOccupationById
} = require('../matchingEngine/occupations.cjs');

const {
  matchBeneficiary,
  scoreItem
} = require('../matchingEngine/matchingEngine.cjs');

describe('AI Livelihood Matching Engine - Phase 8 Verification', () => {

  describe('1. Dataset Loader & Normalization', () => {
    it('should parse all 165 courses from the official NIELIT dataset', () => {
      const allCourses = getAllCourses();
      assert.strictEqual(allCourses.length, 165, 'Total courses must be 165');
    });

    it('should separate 123 verified courses from 42 legacy unverified courses', () => {
      const verified = getVerifiedCourses();
      const all = getAllCourses();
      const legacy = all.filter(c => !c.is_verified);

      assert.strictEqual(verified.length, 123, 'Must have 123 current verified courses');
      assert.strictEqual(legacy.length, 42, 'Must have 42 legacy unverified courses');
    });

    it('should generate unique composite IDs for all courses', () => {
      const allCourses = getAllCourses();
      const idSet = new Set(allCourses.map(c => c.course_id));
      assert.strictEqual(idSet.size, 165, 'All course_id values must be globally unique');
    });

    it('should correctly normalize educational prerequisites to ordinal scale (0-6)', () => {
      assert.strictEqual(normalizeEducationLevel('8th pass'), 2);
      assert.strictEqual(normalizeEducationLevel('10th pass / matriculation'), 3);
      assert.strictEqual(normalizeEducationLevel('12th pass (Science) or ITI'), 4);
      assert.strictEqual(normalizeEducationLevel('Diploma in Electronics'), 5);
      assert.strictEqual(normalizeEducationLevel('B.Tech in Computer Science'), 6);
    });
  });

  describe('2. Occupation Model & Course Linkage', () => {
    it('should define exactly 10 standardized PM-AJAY livelihood occupations', () => {
      const occs = getOccupations();
      assert.strictEqual(occs.length, 10, 'Must provide 10 verified occupations');
    });

    it('should map verified NIELIT qualifications to each occupation', () => {
      const occs = getOccupations();
      for (const occ of occs) {
        assert.ok(occ.primary_qualifications.length > 0, `${occ.title} must have mapped primary courses`);
        assert.ok(occ.has_verified_training, `${occ.title} must have verified training options`);
      }
    });
  });

  describe('3. Educational Prerequisite Gating (Employment Safety Gate)', () => {
    it('should block 8th pass candidate from Drone Maintenance (requires 12th/ITI)', () => {
      const result = matchBeneficiary({
        education: '8th pass',
        skills: ['drone', 'flying'],
        interests: ['robotics'],
        sector: 'Electronics'
      });

      // Drone occupation must be in future pathways, NOT eligible now
      const isDroneInTop = result.top_pathways.some(p => p.occupation_title.includes('Drone'));
      assert.strictEqual(isDroneInTop, false, '8th pass candidate cannot be recommended Drone Technician as eligible now');

      const isDroneInFuture = result.future_pathways.some(p => p.title.includes('Drone'));
      assert.strictEqual(isDroneInFuture, true, 'Drone technician must appear under Future Pathways with prerequisite guidance');
    });

    it('should allow 12th pass / ITI candidate to access Drone Maintenance', () => {
      const result = matchBeneficiary({
        education: '12th pass',
        skills: ['drone', 'robotics'],
        interests: ['drone maintenance'],
        sector: 'Electronics'
      });

      const top1 = result.top_pathways[0];
      assert.ok(top1.occupation_title.includes('Drone'), '12th pass drone candidate should get Drone Technician');
      assert.strictEqual(top1.eligibility_status, 'ELIGIBLE_NOW');
    });
  });

  describe('4. Profile Differentiation & Skill Matching Accuracy', () => {
    it('should recommend Digital Office Assistant for office/computer profile', () => {
      const result = matchBeneficiary({
        education: '10th pass',
        skills: ['computer', 'typing', 'ms office'],
        interests: ['data entry', 'office automation'],
        sector: 'IT'
      });

      const top1 = result.top_pathways[0];
      assert.strictEqual(top1.occupation_id, 'occ-digital-office-assistant');
      assert.ok(top1.match_percentage >= 50);
      assert.ok(top1.recommended_primary_course !== null);
      assert.ok(top1.matched_skills.includes('computer'));
    });

    it('should recommend Solar-LED Assembly for solar/electrical profile', () => {
      const result = matchBeneficiary({
        education: '10th pass',
        skills: ['solar', 'wiring', 'electrical'],
        interests: ['renewable energy', 'solar installation'],
        sector: 'Electronics'
      });

      const top1 = result.top_pathways[0];
      assert.strictEqual(top1.occupation_id, 'occ-solar-lighting-assembler');
      assert.ok(top1.matched_skills.includes('solar'));
    });

    it('should recommend Consumer Electronics Hardware Repair for soldering/repair profile', () => {
      const result = matchBeneficiary({
        education: '10th pass',
        skills: ['soldering', 'repair', 'hardware'],
        interests: ['mobile repair', 'circuit troubleshooting'],
        sector: 'Electronics'
      });

      const top1 = result.top_pathways[0];
      assert.strictEqual(top1.occupation_id, 'occ-electronics-repair-tech');
    });
  });

  describe('5. Real Dataset Integrity & Fee-Waiver Disclaimers', () => {
    it('should include PM-AJAY GIA fee waiver in recommended primary courses', () => {
      const result = matchBeneficiary({
        education: '10th pass',
        skills: ['computer'],
        interests: ['office']
      });

      const topCourse = result.top_pathways[0].recommended_primary_course;
      assert.ok(topCourse.fee_waiver.includes('PM-AJAY GIA Component'), 'Must specify PM-AJAY GIA 100% free fee-waiver');
      assert.ok(topCourse.notional_hours > 0, 'Course must have real notional hours from dataset');
      assert.ok(result.top_pathways[0].disclaimer.includes('PMKK / NIELIT document verification'));
    });
  });

});
