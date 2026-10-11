// server/tests/nsqfDatasetService.test.cjs
// Verification Suite for Dedicated NIELIT NSQF Dataset Service & Search Endpoints

const test = require('node:test');
const { describe, it } = test;
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const {
  searchRecords,
  getDatasetOverview,
  formatRecord,
  EXTERNAL_SECTORS
} = require('../nsqfDatasetService.cjs');
const { getAllCourses } = require('../matchingEngine/dataLoader.cjs');

describe('NIELIT NSQF Dataset Service & Search Verification', () => {

  describe('1. Dataset Integrity & Loading', () => {
    it('should load all 165 records and parse actual CSV columns without fabricating data', () => {
      const overview = getDatasetOverview();
      assert.strictEqual(overview.totalRecords, 165);
      assert.strictEqual(overview.verifiedCount, 123);
      assert.strictEqual(overview.legacyCount, 42);
      assert.strictEqual(overview.sectors.IT, 52);
      assert.strictEqual(overview.sectors.Electronics, 71);
      assert.ok(overview.skillClusters.length > 10);
    });

    it('should verify that all returned records match real entries in the CSV file', () => {
      const res = searchRecords({ limit: 10 });
      assert.strictEqual(res.success, true);
      const csvPath = path.join(__dirname, '..', 'data', 'nielit_nsqf_full_dataset_with_legacy.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf8');

      res.records.forEach(rec => {
        assert.ok(rec.qualification, 'Record must have qualification');
        assert.ok(rec.sector === 'IT' || rec.sector === 'Electronics');
        assert.ok(rec.nsqf_level >= 1 && rec.nsqf_level <= 8);
        assert.ok(csvContent.includes(rec.qualification), `Qualification "${rec.qualification}" must exist verbatim in CSV`);
      });
    });
  });

  describe('2. Sector-Based Searches (Minimum 3 Sectors Tested)', () => {
    it('Sector 1: should search Sector "IT" and return strictly IT courses', () => {
      const res = searchRecords({ sector: 'IT', limit: 50 });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.total, 52);
      assert.ok(res.records.every(r => r.sector === 'IT'), 'Every course must belong to IT sector');
      assert.ok(res.records.some(r => r.qualification.includes('Web Developer') || r.qualification.includes('Programming')));
    });

    it('Sector 2: should search Sector "Electronics" and return strictly Electronics courses', () => {
      const res = searchRecords({ sector: 'Electronics', limit: 50 });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.total, 71);
      assert.ok(res.records.every(r => r.sector === 'Electronics'), 'Every course must belong to Electronics sector');
      assert.ok(res.records.some(r => r.qualification.includes('Solar') || r.qualification.includes('Microcontroller') || r.qualification.includes('Maintenance')));
    });

    it('Sector 3 (External): should handle Sector "Agriculture" with scope notice and related tech courses without fabricating trades', () => {
      const res = searchRecords({ sector: 'agriculture' });
      assert.strictEqual(res.success, true);
      assert.ok(res.notice, 'Must provide clear sectoral scope notice');
      assert.ok(res.notice.includes('Agriculture Skill Council of India') || res.notice.includes('ASCI'));
      // Should include IoT in Agriculture from NIELIT
      assert.ok(res.records.some(r => r.qualification.includes('Agriculture') || r.skill_cluster.includes('Solar') || r.skill_cluster.includes('IoT')));
    });

    it('Sector 4 (External): should handle Sector "Healthcare" with scope notice without fabricating clinical trades', () => {
      const res = searchRecords({ sector: 'healthcare' });
      assert.strictEqual(res.success, true);
      assert.ok(res.notice, 'Must provide clear sectoral scope notice for healthcare');
      assert.ok(res.notice.includes('Healthcare Sector Skill Council') || res.notice.includes('HSSC'));
    });
  });

  describe('3. Job Role and Keyword Searches', () => {
    it('should search by job role using stemming ("programmer" -> matches programming courses)', () => {
      const res = searchRecords({ role: 'programmer' });
      assert.strictEqual(res.success, true);
      assert.ok(res.total > 0, 'Must match programming courses');
      assert.ok(res.records.some(r => r.qualification.toLowerCase().includes('programm')));
    });

    it('should search by job role ("developer" -> matches developer qualifications)', () => {
      const res = searchRecords({ role: 'developer' });
      assert.strictEqual(res.success, true);
      assert.ok(res.total > 0);
      assert.ok(res.records.some(r => r.qualification.toLowerCase().includes('developer')));
    });

    it('should search by job role ("technician" -> matches repair & technician courses)', () => {
      const res = searchRecords({ role: 'technician' });
      assert.strictEqual(res.success, true);
      assert.ok(res.total > 0);
      assert.ok(res.records.some(r => r.qualification.toLowerCase().includes('technician') || r.qualification.toLowerCase().includes('repair')));
    });

    it('should search by freeform spoken query ("I want to repair computers")', () => {
      const res = searchRecords({ query: 'I want to repair computers' });
      assert.strictEqual(res.success, true);
      assert.ok(res.total > 0);
      assert.ok(res.records.some(r => r.qualification.toLowerCase().includes('repair') || r.qualification.toLowerCase().includes('maintenance')));
    });
  });

  describe('4. Edge Cases, Missing Parameters & Error Resilience', () => {
    it('should handle completely missing parameters gracefully', () => {
      const res = searchRecords({});
      assert.strictEqual(res.success, true);
      assert.ok(res.records.length > 0);
      assert.strictEqual(res.page, 1);
    });

    it('should handle non-matching obscure query without crashing, returning empty results with advice', () => {
      const res = searchRecords({ query: 'xyzcompletelyunknownquery98721' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.total, 0);
      assert.deepStrictEqual(res.records, []);
      assert.ok(res.notice.includes('No NIELIT qualifications found'));
    });

    it('should handle invalid non-numeric filters gracefully without throwing', () => {
      const res = searchRecords({
        nsqfLevel: 'invalid-string',
        maxDurationWeeks: 'not-a-number',
        page: 'invalid-page',
        limit: 'invalid-limit'
      });
      assert.strictEqual(res.success, true);
      assert.ok(res.records.length > 0);
    });

    it('should filter by NSQF level accurately', () => {
      const res = searchRecords({ sector: 'IT', nsqfLevel: 4 });
      assert.strictEqual(res.success, true);
      assert.ok(res.records.every(r => r.nsqf_level === 4));
    });

    it('should filter by maxDurationWeeks accurately', () => {
      const res = searchRecords({ maxDurationWeeks: 8 });
      assert.strictEqual(res.success, true);
      assert.ok(res.records.every(r => r.training_info.est_duration_weeks <= 8));
    });

    it('should assess educational compatibility without discarding candidate records', () => {
      const res = searchRecords({ sector: 'IT', education: '10th' });
      assert.strictEqual(res.success, true);
      assert.ok(res.records.length > 0);
      const sample = res.records[0];
      assert.ok(sample.eligibility, 'Must contain eligibility assessment');
      assert.ok(typeof sample.eligibility.is_eligible === 'boolean');
      assert.ok(sample.eligibility.note);
    });
  });

  describe('5. Presentation Payload Quality', () => {
    it('should return all required presentation fields on every record', () => {
      const res = searchRecords({ limit: 5 });
      res.records.forEach(rec => {
        assert.ok(rec.id);
        assert.ok(rec.qualification);
        assert.ok(rec.job_role);
        assert.ok(rec.sector);
        assert.ok(rec.skill_cluster);
        assert.ok(Array.isArray(rec.skills));
        assert.ok(typeof rec.nsqf_level === 'number');
        assert.ok(rec.training_info);
        assert.ok(typeof rec.training_info.notional_hours === 'number');
        assert.ok(typeof rec.training_info.est_duration_weeks === 'number');
        assert.ok(rec.training_info.fee_note);
        assert.ok(rec.entry_profile);
        assert.strictEqual(rec.entry_profile.is_inferred, true);
        assert.strictEqual(rec.is_verified, true);
      });
    });
  });
});
