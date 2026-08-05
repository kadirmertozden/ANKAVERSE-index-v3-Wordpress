/**
 * Tests for the cookie consent state.
 *
 * The failure that matters here is silent: a bug that reports consent when
 * there is none sends data to Google for a visitor who refused, and no page
 * looks any different afterwards. So the default has to be denial in every
 * branch, including the ones where something went wrong.
 *
 * Run: node tools/verify-consent.js
 */
import assert from 'node:assert/strict';

import {
  CONSENT_KEY,
  consentPayload,
  readConsent,
  writeConsent,
} from '../src/lib/consent.js';

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    _dump: () => Object.fromEntries(store),
  };
}

const hostileStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('SecurityError');
  },
};

test('a visitor who has not answered yet counts as undecided, not as consent', () => {
  assert.equal(readConsent(fakeStorage()), null);
});

test('a stored answer is read back', () => {
  assert.equal(readConsent(fakeStorage({ [CONSENT_KEY]: 'granted' })), 'granted');
  assert.equal(readConsent(fakeStorage({ [CONSENT_KEY]: 'denied' })), 'denied');
});

test('a value that is neither answer is treated as no answer', () => {
  // Anything else in there is corruption or an older format, and guessing
  // "granted" from it would track someone who never agreed.
  assert.equal(readConsent(fakeStorage({ [CONSENT_KEY]: 'yes' })), null);
  assert.equal(readConsent(fakeStorage({ [CONSENT_KEY]: '' })), null);
  assert.equal(readConsent(fakeStorage({ [CONSENT_KEY]: '1' })), null);
});

test('storage that cannot be read leaves the visitor undecided', () => {
  // Safari in private browsing throws on access. The banner shows again, which
  // is the harmless outcome; assuming consent would not be.
  assert.equal(readConsent(hostileStorage), null);
  assert.equal(readConsent(null), null);
});

test('only the two real answers can be written', () => {
  const storage = fakeStorage();
  writeConsent(storage, 'granted');
  assert.equal(storage._dump()[CONSENT_KEY], 'granted');

  writeConsent(storage, 'denied');
  assert.equal(storage._dump()[CONSENT_KEY], 'denied');

  assert.throws(() => writeConsent(storage, 'maybe'), /granted|denied/);
});

test('writing to storage that throws does not take the page down', () => {
  assert.doesNotThrow(() => writeConsent(hostileStorage, 'granted'));
  assert.doesNotThrow(() => writeConsent(null, 'granted'));
});

test('denial covers advertising as well as analytics', () => {
  // Consent Mode v2 splits these four ways, and ad_user_data and
  // ad_personalization are the two it added. Leaving either out is the
  // omission that makes a banner decorative.
  const denied = consentPayload('denied');
  assert.deepEqual(denied, {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
});

test('acceptance grants the same four', () => {
  const granted = consentPayload('granted');
  assert.deepEqual(Object.keys(granted).sort(), Object.keys(consentPayload('denied')).sort());
  assert.ok(Object.values(granted).every((value) => value === 'granted'));
});

test('anything other than acceptance is treated as denial', () => {
  for (const value of [null, undefined, 'maybe', '']) {
    assert.deepEqual(consentPayload(value), consentPayload('denied'), String(value));
  }
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL ${name}\n       ${error.message}`);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} passed`);
if (failed > 0) process.exit(1);
