/**
 * Tests for the stale-deployment classifier.
 *
 * The bug this guards against: vite-react-ssg replaces every route loader on
 * the client with a fetch of `static-loader-data-manifest-<buildHash>.json`
 * and calls `.json()` on the response without checking it. After a deploy the
 * hash changes, so a page still running the previous build asks for a file
 * that no longer exists; nginx answers with the HTML 404 page and the parse
 * throws a SyntaxError that React Router turns into a full-screen error.
 *
 * Run: node tools/verify-stale-deploy.js
 */
import assert from 'node:assert/strict';

import { RELOAD_WINDOW_MS, isStaleDeploymentError, shouldAttemptReload } from '../src/lib/stale-deploy.js';

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/** The exact error a browser produces for the reported failure. */
function manifestParsedAsHtml() {
  try {
    JSON.parse('<!DOCTYPE html><html lang="tr"><head><title>Sayfa Bulunamadı</title></head></html>');
    throw new Error('expected JSON.parse to throw');
  } catch (error) {
    return error;
  }
}

function fakeStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
}

test('the reported manifest failure is recognised', () => {
  const error = manifestParsedAsHtml();
  assert.equal(error.name, 'SyntaxError');
  assert.match(error.message, /is not valid JSON/);
  assert.equal(isStaleDeploymentError(error), true);
});

test('other engines phrase the same parse failure differently', () => {
  // Firefox and Safari word it their own way; all three mean the same thing.
  const messages = [
    'JSON.parse: unexpected character at line 1 column 1 of the JSON data',
    "Unexpected identifier \"DOCTYPE\"",
    'Unexpected end of JSON input',
  ];
  for (const message of messages) {
    assert.equal(isStaleDeploymentError(new SyntaxError(message)), true, message);
  }
});

test('chunks missing after a redeploy are recognised', () => {
  const messages = [
    'Failed to fetch dynamically imported module: https://ankaverse.com.tr/assets/BlogPage-D1s2f3.js',
    'error loading dynamically imported module',
    "Importing a module script failed.",
  ];
  for (const message of messages) {
    assert.equal(isStaleDeploymentError(new TypeError(message)), true, message);
  }
});

test('ordinary application errors are left alone', () => {
  const ordinary = [
    new TypeError("Cannot read properties of undefined (reading 'slug')"),
    new Error('API Error: 500 Internal Server Error'),
    new RangeError('Maximum call stack size exceeded'),
  ];
  for (const error of ordinary) {
    assert.equal(isStaleDeploymentError(error), false, error.message);
  }
});

test("React Router's own 404 response is not a stale deployment", () => {
  // What `useRouteError` returns for a thrown Response, not an Error at all.
  assert.equal(isStaleDeploymentError({ status: 404, statusText: 'Not Found', data: null }), false);
  assert.equal(isStaleDeploymentError(null), false);
  assert.equal(isStaleDeploymentError('boom'), false);
});

test('the page reloads once and then stops, so a broken deploy cannot loop', () => {
  const storage = fakeStorage();
  const start = 1_000_000;

  assert.equal(shouldAttemptReload(storage, start), true, 'first crash should reload');
  assert.equal(shouldAttemptReload(storage, start + 1_500), false, 'the crash right after the reload must not reload again');
  assert.equal(shouldAttemptReload(storage, start + RELOAD_WINDOW_MS - 1), false);
});

test('a later deploy in the same tab heals itself again', () => {
  const storage = fakeStorage();
  const start = 1_000_000;

  assert.equal(shouldAttemptReload(storage, start), true);
  assert.equal(shouldAttemptReload(storage, start + RELOAD_WINDOW_MS + 1), true);
});

test('a storage that throws does not take the page down with it', () => {
  // Safari private browsing throws on sessionStorage access.
  const hostile = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('SecurityError');
    },
  };
  assert.equal(shouldAttemptReload(hostile, 1_000_000), false);
  assert.equal(shouldAttemptReload(null, 1_000_000), false);
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL ${name}`);
    console.error(`       ${error.message}`);
  }
}

console.log(`\n${tests.length - failed}/${tests.length} passed`);
if (failed > 0) process.exit(1);
