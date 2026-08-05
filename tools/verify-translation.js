/**
 * Tests for the translation guards.
 *
 * DeepL failed loudly; an LLM fails quietly. It adds a preamble, drops an item
 * from a batch, eats an HTML tag, or hands the source text straight back. Under
 * a foreign hreflang that last one is this pipeline's cardinal sin, so each of
 * these is a hard stop rather than something to salvage.
 *
 * Run: node tools/verify-translation.js
 */
import assert from 'node:assert/strict';

import {
  ModelOutputError,
  TranslationError,
  UNTRANSLATED_MIN_LENGTH,
  assertHtmlIntact,
  assertTranslated,
  countCharacters,
  estimateCostUsd,
  orderedBatch,
  restoreProtectedTerms,
  tagSequence,
} from './translation-guards.js';

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('a well formed batch comes back in order', () => {
  const sent = ['bir', 'iki', 'üç'];
  const received = { 0: 'one', 1: 'two', 2: 'three' };
  assert.deepEqual(orderedBatch(sent, received), ['one', 'two', 'three']);
});

test('key order in the response does not matter', () => {
  const sent = ['bir', 'iki'];
  assert.deepEqual(orderedBatch(sent, { 1: 'two', 0: 'one' }), ['one', 'two']);
});

test('a dropped item fails the run', () => {
  assert.throws(() => orderedBatch(['bir', 'iki'], { 0: 'one' }), TranslationError);
});

test('an extra item fails the run', () => {
  assert.throws(() => orderedBatch(['bir'], { 0: 'one', 1: 'two' }), TranslationError);
});

test('an empty or non-string value fails the run', () => {
  assert.throws(() => orderedBatch(['bir'], { 0: '' }), TranslationError);
  assert.throws(() => orderedBatch(['bir'], { 0: '   ' }), TranslationError);
  assert.throws(() => orderedBatch(['bir'], { 0: 42 }), TranslationError);
  assert.throws(() => orderedBatch(['bir'], { 0: null }), TranslationError);
});

test('a response that is not an object at all fails the run', () => {
  assert.throws(() => orderedBatch(['bir'], null), TranslationError);
  assert.throws(() => orderedBatch(['bir'], ['one']), TranslationError);
  assert.throws(() => orderedBatch(['bir'], 'one'), TranslationError);
});

test('text handed back untranslated fails the run', () => {
  const turkish = 'Yazılım geliştirme ve yapay zekâ çözümleri sunuyoruz.';
  assert.ok(turkish.length > UNTRANSLATED_MIN_LENGTH);
  assert.throws(() => assertTranslated(turkish, turkish, 'de/common'), TranslationError);
  // Surrounding whitespace does not make it a translation.
  assert.throws(() => assertTranslated(turkish, `  ${turkish}  `, 'de/common'), TranslationError);
});

test('short strings may legitimately be identical', () => {
  // "Blog", "Demo", "CTA" survive unchanged in most target languages, and
  // calling that an error reproduces the false positives of trap 8.
  assert.doesNotThrow(() => assertTranslated('Blog', 'Blog', 'de/common'));
  assert.doesNotThrow(() => assertTranslated('Demo', 'Demo', 'fr/common'));
});

test('a brand name may be identical at any length', () => {
  const brand = 'ANKAVERSE Nexus ANKAVERSE Hub Vaktia Suguya';
  assert.ok(brand.length > UNTRANSLATED_MIN_LENGTH);
  assert.doesNotThrow(() => assertTranslated(brand, brand, 'de/common'));
});

test('a real translation passes', () => {
  assert.doesNotThrow(() =>
    assertTranslated('Yazılım geliştirme çözümleri', 'Software development solutions', 'en/common'),
  );
});

test('the tag sequence describes structure, not text', () => {
  assert.deepEqual(tagSequence('<p>bir <a href="/x">iki</a></p>'), ['p', 'a', '/a', '/p']);
  assert.deepEqual(tagSequence('düz metin'), []);
});

test('html whose text changed but whose structure held passes', () => {
  const source = '<p>Merhaba <strong>dünya</strong></p>';
  const translated = '<p>Hello <strong>world</strong></p>';
  assert.doesNotThrow(() => assertHtmlIntact(source, translated, 'en/posts/x'));
});

test('a dropped, added or reordered tag fails the run', () => {
  const source = '<p>Merhaba <strong>dünya</strong></p>';
  assert.throws(
    () => assertHtmlIntact(source, '<p>Hello world</p>', 'en/posts/x'),
    TranslationError,
  );
  assert.throws(
    () => assertHtmlIntact(source, '<p>Hello <strong>world</strong><br></p>', 'en/posts/x'),
    TranslationError,
  );
  assert.throws(
    () => assertHtmlIntact(source, '<strong><p>Hello world</p></strong>', 'en/posts/x'),
    TranslationError,
  );
});

test('brand names are restored after the model case-folds them', () => {
  assert.equal(
    restoreProtectedTerms('ankaverse builds things', 'ANKAVERSE bir şeyler yapar'),
    'ANKAVERSE builds things',
  );
  assert.equal(restoreProtectedTerms('VAKTIA app', 'Vaktia uygulaması'), 'Vaktia app');
});

test('a brand name absent from the source is left alone', () => {
  assert.equal(restoreProtectedTerms('the universe', 'evren'), 'the universe');
});

test('characters are counted across a set of strings', () => {
  assert.equal(countCharacters(['abc', 'de']), 5);
  assert.equal(countCharacters([]), 0);
});

test('a bad generation is distinguishable from a bad request', () => {
  // Everything the model got wrong is worth generating again; a 400 or a
  // missing key is not. The client retries on this type alone, so the guards
  // have to raise it rather than the base error.
  const badGenerations = [
    () => orderedBatch(['bir'], { 0: 'one', 1: 'two' }),
    () => orderedBatch(['bir'], null),
    () => assertTranslated('Yazılım geliştirme ve yapay zekâ çözümleri.', 'Yazılım geliştirme ve yapay zekâ çözümleri.', 'de/x'),
    () => assertHtmlIntact('<p>a <b>b</b></p>', '<p>a b</p>', 'en/x'),
  ];
  for (const fn of badGenerations) {
    assert.throws(fn, ModelOutputError);
    // Still a TranslationError, so existing handling keeps working.
    assert.throws(fn, TranslationError);
  }
});

test('a price that cannot be read is not a bad generation', () => {
  // Retrying it would ask the same catalogue the same question forever.
  assert.throws(() => estimateCostUsd(3000, {}), TranslationError);
  assert.throws(() => estimateCostUsd(3000, {}), (error) => !(error instanceof ModelOutputError));
});

test('cost is estimated from the real per-token price', () => {
  // OpenRouter prices are USD per token, as strings.
  const pricing = { prompt: '0.00000015', completion: '0.0000006' };
  // 3000 characters is ~1000 prompt tokens, and a translation comes back at
  // roughly the length it went in, so ~1000 completion tokens.
  const cost = estimateCostUsd(3000, pricing);
  assert.ok(Math.abs(cost - 0.00075) < 1e-9, `got ${cost}`);
});

test('the expensive model costs more for the same text', () => {
  const cheap = estimateCostUsd(3000, { prompt: '0.00000015', completion: '0.0000006' });
  const dear = estimateCostUsd(3000, { prompt: '0.0000025', completion: '0.000015' });
  assert.ok(dear > cheap * 10);
});

test('pricing that cannot be read fails rather than estimating zero', () => {
  // An unreadable price silently estimating $0 would make the budget guard
  // wave through a run that empties the balance.
  assert.throws(() => estimateCostUsd(3000, undefined), TranslationError);
  assert.throws(() => estimateCostUsd(3000, {}), TranslationError);
  assert.throws(() => estimateCostUsd(3000, { prompt: 'free' }), TranslationError);
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
