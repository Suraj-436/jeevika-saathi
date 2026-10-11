// server/tests/phoneNormalizer.test.js
// Automated verification for speech phone number parser and normalizer

import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSpokenPhoneNumber, normalizePhoneNumber, parseSpokenOtp } from '../../src/utils/phoneNormalizer.js';

describe('Voice Phone Normalizer & Speech Parser Verification', () => {
  it('should parse standard 10-digit numeric strings', () => {
    const res = parseSpokenPhoneNumber('9876543210');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should parse English digit words', () => {
    const res = parseSpokenPhoneNumber('nine eight seven six five four three two one zero');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should parse spoken two-digit numbers (spaced and compound)', () => {
    // 98 76 54 32 10
    const res = parseSpokenPhoneNumber('ninety eight seventy six fifty four thirty two ten');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should parse hyphenated spoken number words from speech engines', () => {
    // 98 76 54 32 10
    const res = parseSpokenPhoneNumber('ninety-eight seventy-six fifty-four thirty-two ten');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should strip country code +91, 91, and leading zero', () => {
    assert.strictEqual(parseSpokenPhoneNumber('+91 98765 43210').number, '9876543210');
    assert.strictEqual(parseSpokenPhoneNumber('plus ninety one 9876543210').number, '9876543210');
    assert.strictEqual(parseSpokenPhoneNumber('09876543210').number, '9876543210');
  });

  it('should handle multipliers like double and triple', () => {
    const res = parseSpokenPhoneNumber('double nine double eight seven six five four three two');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9988765432');
  });

  it('should parse Telugu spoken digits in native script', () => {
    const res = parseSpokenPhoneNumber('తొమ్మిది ఎనిమిది ఏడు ఆరు ఐదు నాలుగు మూడు రెండు ఒకటి సున్నా');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should parse Telugu transliterated digits', () => {
    const res = parseSpokenPhoneNumber('tommidi enimidi edu aaru aidu naalugu moodu rendu okati sunna');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should parse Hindi spoken digits in native script with conversational fillers', () => {
    const res = parseSpokenPhoneNumber('मेरा मोबाइल नंबर नौ आठ सात छह पाँच चार तीन दो एक शून्य है');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should parse Hindi two-digit words', () => {
    const res = parseSpokenPhoneNumber('अट्ठानवे छिहत्तर चौवन बत्तीस दस');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.number, '9876543210');
  });

  it('should provide informative error and partial digits on incomplete speech', () => {
    const res = parseSpokenPhoneNumber('nine eight seven six five');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.partialDigits, '98765');
    assert.ok(res.error.includes('Heard 5 digits'));
  });

  it('normalizePhoneNumber should cleanly format pasted strings', () => {
    assert.strictEqual(normalizePhoneNumber('+91 98765 43210'), '9876543210');
    assert.strictEqual(normalizePhoneNumber('98765-43210'), '9876543210');
    assert.strictEqual(normalizePhoneNumber('(0) 9876543210'), '9876543210');
  });
});
