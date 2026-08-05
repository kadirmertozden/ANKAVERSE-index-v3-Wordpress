# OpenRouter Translation Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace DeepL with OpenRouter as the only translation provider, with validators that stop the run rather than let an LLM quietly emit broken or untranslated text.

**Architecture:** A pure, network-free guards module holds every validator so it can be unit tested under plain node. A thin OpenRouter client owns HTTP, prompt construction and the batch protocol, and calls the guards on every response. The two translation scripts change only their import block, two function names, and — in `translate-content.js` — gain a `--backfill` mode that pins slugs.

**Tech Stack:** Node 22 ESM, no new dependencies. `fetch` is built in. Tests are plain `node:assert/strict` scripts in the style of `tools/verify-stale-deploy.js`.

## Global Constraints

- Translation never runs in the Coolify build. It runs in GitHub Actions (`.github/workflows/content-sync.yml`) and commits its output. `OPENROUTER_API_KEY` must never be added to Coolify.
- No `VITE_` prefix on any secret. `VITE_`-prefixed variables are inlined into the browser bundle.
- A run must never half-finish. Any validation failure throws and exits non-zero; nothing is salvaged, nothing is written for that item.
- Indexed URLs must not move. In `--backfill` mode the translated slug is pinned to the file already on disk.
- `temperature: 0` on every request.
- Protected terms, verbatim: `ANKAVERSE`, `Ankaverse`, `Vaktia`, `ANKAVERSE Nexus`, `ANKAVERSE Hub`, `Suguya`.
- Untranslated-text threshold: strings shorter than **20 characters** are exempt from the identical-output check.
- Model ids are never hardcoded. `OPENROUTER_MODEL` and `OPENROUTER_MODEL_BULK` come from the environment.
- Tests must not be added to `npm run build`. The build is deliberately network-free.

---

### Task 1: Translation guards

The validators live apart from the HTTP client because they are the part worth testing, and they are pure: strings in, throw or return. Everything network-shaped stays in Task 2.

**Files:**
- Create: `tools/translation-guards.js`
- Create: `tools/verify-translation.js`
- Modify: `package.json` (add `verify:translation` script)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `class TranslationError extends Error`
  - `PROTECTED_TERMS: string[]`
  - `UNTRANSLATED_MIN_LENGTH: number` (20)
  - `orderedBatch(sent: string[], received: unknown): string[]`
  - `assertTranslated(source: string, translated: string, label: string): void`
  - `tagSequence(html: string): string[]`
  - `assertHtmlIntact(source: string, translated: string, label: string): void`
  - `restoreProtectedTerms(translated: string, source: string): string`
  - `countCharacters(texts: string[]): number`

- [ ] **Step 1: Write the failing test**

Create `tools/verify-translation.js`:

```js
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
  TranslationError,
  UNTRANSLATED_MIN_LENGTH,
  assertHtmlIntact,
  assertTranslated,
  countCharacters,
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
  assert.equal(restoreProtectedTerms('ankaverse builds things', 'ANKAVERSE bir şeyler yapar'), 'ANKAVERSE builds things');
  assert.equal(restoreProtectedTerms('VAKTIA app', 'Vaktia uygulaması'), 'Vaktia app');
});

test('a brand name absent from the source is left alone', () => {
  assert.equal(restoreProtectedTerms('the universe', 'evren'), 'the universe');
});

test('characters are counted across a set of strings', () => {
  assert.equal(countCharacters(['abc', 'de']), 5);
  assert.equal(countCharacters([]), 0);
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tools/verify-translation.js`
Expected: `ERR_MODULE_NOT_FOUND` for `tools/translation-guards.js`.

- [ ] **Step 3: Write the implementation**

Create `tools/translation-guards.js`:

```js
/**
 * Validators for LLM translation output.
 *
 * Kept free of network and filesystem access so tools/verify-translation.js can
 * exercise every branch under plain node. The client in openrouter.js calls
 * these on every response.
 *
 * All of them throw. None of them repair: a response that failed a check is
 * evidence the model misunderstood the job, and writing a patched version of it
 * would put text on the site that nobody has seen.
 */
export class TranslationError extends Error {}

/** Names that must survive translation verbatim. */
export const PROTECTED_TERMS = [
  'ANKAVERSE Nexus',
  'ANKAVERSE Hub',
  'ANKAVERSE',
  'Ankaverse',
  'Vaktia',
  'Suguya',
];

/**
 * Below this length an identical translation is normal rather than suspicious:
 * "Blog", "Demo" and "CTA" are the same word in most of our target languages.
 * Trap 8 in the postmortem was a validator whose false positives hid real
 * errors, so the threshold errs towards silence on short strings.
 */
export const UNTRANSLATED_MIN_LENGTH = 20;

/**
 * Turn the model's keyed response back into an ordered array.
 *
 * The request numbers each string and the reply is required to use the same
 * keys. Anything else -- a dropped item, an invented one, a blank value --
 * means the batch cannot be trusted as a whole, because there is no way to tell
 * which translation belongs to which source.
 */
export function orderedBatch(sent, received) {
  if (received === null || typeof received !== 'object' || Array.isArray(received)) {
    throw new TranslationError(
      `Model returned ${Array.isArray(received) ? 'an array' : typeof received}, expected a JSON object keyed by index.`,
    );
  }

  const keys = Object.keys(received);
  if (keys.length !== sent.length) {
    throw new TranslationError(
      `Model returned ${keys.length} translations for ${sent.length} strings.`,
    );
  }

  return sent.map((_, index) => {
    const value = received[String(index)];
    if (typeof value !== 'string') {
      throw new TranslationError(`Model returned no string at index ${index}.`);
    }
    if (value.trim() === '') {
      throw new TranslationError(`Model returned an empty string at index ${index}.`);
    }
    return value;
  });
}

/** True when the string is nothing but brand names and punctuation. */
function isOnlyProtectedTerms(text) {
  let remainder = text;
  for (const term of PROTECTED_TERMS) {
    remainder = remainder.split(term).join(' ');
  }
  return remainder.trim().replace(/[\s\p{P}]/gu, '') === '';
}

/**
 * The cardinal sin: Turkish text written into a locale file and then served
 * under that locale's hreflang, telling Google the site misdescribes itself.
 */
export function assertTranslated(source, translated, label) {
  if (source.trim() !== translated.trim()) return;
  if (source.trim().length < UNTRANSLATED_MIN_LENGTH) return;
  if (isOnlyProtectedTerms(source)) return;

  throw new TranslationError(
    `Model returned the source text unchanged for ${label}: ${JSON.stringify(source.slice(0, 80))}`,
  );
}

/** Tag names in document order, closing tags marked with a leading slash. */
export function tagSequence(html) {
  return [...html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g)].map(
    (match) => `${match[1]}${match[2].toLowerCase()}`,
  );
}

/**
 * Blog and project bodies are HTML. A model that drops a closing tag or wraps
 * the text in an extra element produces markup that renders wrong on one page
 * in one language -- exactly the kind of fault nobody goes looking for.
 */
export function assertHtmlIntact(source, translated, label) {
  const before = tagSequence(source).join(',');
  const after = tagSequence(translated).join(',');
  if (before === after) return;

  throw new TranslationError(
    `Model changed the HTML structure of ${label}.\n  source:     ${before}\n  translated: ${after}`,
  );
}

/**
 * Restore brand names the model transliterated or case-folded. Cheaper and
 * safer than wrapping every occurrence in markup, which would leak tags into
 * plain-text fields.
 */
export function restoreProtectedTerms(translated, source) {
  let result = translated;
  for (const term of PROTECTED_TERMS) {
    if (!source.includes(term)) continue;
    const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(pattern, term);
  }
  return result;
}

/** Characters in a set of strings, used for cost estimation. */
export const countCharacters = (texts) => texts.reduce((total, text) => total + text.length, 0);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tools/verify-translation.js`
Expected: `16/16 passed`.

- [ ] **Step 5: Add the npm script**

In `package.json`, after the `verify:stale-deploy` line:

```json
    "verify:stale-deploy": "node tools/verify-stale-deploy.js",
    "verify:translation": "node tools/verify-translation.js"
```

Run: `npm run verify:translation`
Expected: `16/16 passed`.

- [ ] **Step 6: Commit**

```bash
git add tools/translation-guards.js tools/verify-translation.js package.json
git commit -m "Add validators for LLM translation output"
```

---

### Task 2: OpenRouter client

**Files:**
- Create: `tools/openrouter.js`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces:
  - `TARGET_LANGUAGES: Record<string, string>` — locale code to the language name used in the prompt
  - `createClient({ apiKey?, model? }): { models(), credits(), translate(texts, targetLocale, options) }`
  - `translate(texts: string[], targetLocale: string, { html?: boolean, sourceLang?: string, label?: string }): Promise<string[]>`
  - `assertModelAvailable(client): Promise<void>`
  - `assertBudget(client, estimatedCharacters: number): Promise<void>`
  - re-exports `countCharacters` and `restoreProtectedTerms` from the guards module, so the two scripts keep a single import source

- [ ] **Step 1: Write the implementation**

There is no unit test in this task: every function is an HTTP call, and a test that stubs `fetch` would only assert that the code calls the stub. The behaviour worth testing lives in Task 1; this module is verified by the live smoke check in Step 2.

Create `tools/openrouter.js`:

```js
/**
 * OpenRouter client for the translation scripts.
 *
 * Runs in GitHub Actions, never in the Coolify build: the build container is
 * ephemeral, so translating there would redo the whole archive on every deploy.
 * The key must not be added to Coolify -- there is no reason for it to reach
 * the VPS at all.
 */
import {
  TranslationError,
  assertHtmlIntact,
  assertTranslated,
  countCharacters,
  orderedBatch,
  restoreProtectedTerms,
} from './translation-guards.js';

export { countCharacters, restoreProtectedTerms, TranslationError };

const BASE = 'https://openrouter.ai/api/v1';

/** Locale code to the language name the prompt names. */
export const TARGET_LANGUAGES = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
  tr: 'Turkish',
};

/**
 * Smaller than DeepL's 50. A batch is one JSON object the model has to return
 * intact, and a long batch of HTML bodies is where models start dropping keys.
 */
const MAX_TEXTS_PER_REQUEST = 20;

const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function systemPrompt(languageName, html) {
  return [
    `You are a professional translator. Translate from Turkish into ${languageName}.`,
    '',
    'Rules:',
    '- Return ONLY a JSON object whose keys are the same index strings you were given.',
    '- Translate every value. Never copy the Turkish text through unchanged.',
    '- Never add commentary, notes, or explanation.',
    '- Keep these names exactly as written: ANKAVERSE, ANKAVERSE Nexus, ANKAVERSE Hub, Vaktia, Suguya.',
    '- Keep i18next placeholders such as {{count}} byte-for-byte identical.',
    html
      ? '- The values are HTML. Translate only the text between tags. Do not add, remove, reorder or rename any tag or attribute.'
      : '- The values are plain text. Do not add HTML.',
    '- Match the register of the source: corporate, precise, not marketing filler.',
  ].join('\n');
}

export function createClient({ apiKey = process.env.OPENROUTER_API_KEY, model } = {}) {
  if (!apiKey) {
    throw new TranslationError(
      'OPENROUTER_API_KEY is not set (GitHub Secrets, or .env for local runs)',
    );
  }
  if (!model) {
    throw new TranslationError('No model configured. Set OPENROUTER_MODEL.');
  }

  const headers = {
    Authorization: `Bearer ${apiKey.trim()}`,
    'HTTP-Referer': 'https://ankaverse.com.tr',
    'X-Title': 'ANKAVERSE content pipeline',
  };

  async function call(path, body) {
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const response = await fetch(`${BASE}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) return response.json();

      const detail = await response.text().catch(() => '');
      lastError = new TranslationError(
        `OpenRouter ${path} failed: ${response.status} ${response.statusText} ${detail}`,
      );

      // Only rate limiting and server faults are worth retrying. A 400 means
      // the request is wrong and will stay wrong.
      if (response.status !== 429 && response.status < 500) throw lastError;
      if (attempt < MAX_RETRIES) await sleep(2 ** attempt * 1000);
    }
    throw lastError;
  }

  return {
    model,
    models: () => call('/models'),
    credits: () => call('/credits'),

    async translate(texts, targetLocale, { html = false, label = targetLocale } = {}) {
      if (texts.length === 0) return [];

      const languageName = TARGET_LANGUAGES[targetLocale];
      if (!languageName) {
        throw new TranslationError(`No language name configured for locale "${targetLocale}".`);
      }

      const results = [];
      for (let offset = 0; offset < texts.length; offset += MAX_TEXTS_PER_REQUEST) {
        const batch = texts.slice(offset, offset + MAX_TEXTS_PER_REQUEST);
        const payload = Object.fromEntries(batch.map((text, index) => [String(index), text]));

        const data = await call('/chat/completions', {
          model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt(languageName, html) },
            { role: 'user', content: JSON.stringify(payload) },
          ],
        });

        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
          throw new TranslationError(`OpenRouter returned no message content for ${label}.`);
        }

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          throw new TranslationError(
            `OpenRouter returned content that is not JSON for ${label}: ${content.slice(0, 200)}`,
          );
        }

        const translated = orderedBatch(batch, parsed);
        translated.forEach((value, index) => {
          const itemLabel = `${label}[${offset + index}]`;
          assertTranslated(batch[index], value, itemLabel);
          if (html) assertHtmlIntact(batch[index], value, itemLabel);
        });

        results.push(...translated);
      }
      return results;
    },
  };
}

/**
 * Replaces DeepL's target-language check. An LLM will attempt any language, so
 * the failure that actually needs catching is a model id that does not exist --
 * a typo in the environment would otherwise surface as an opaque 400 partway
 * through a paid run.
 */
export async function assertModelAvailable(client) {
  const data = await client.models();
  const ids = new Set((data?.data ?? []).map((entry) => entry.id));

  if (!ids.has(client.model)) {
    throw new TranslationError(
      `OpenRouter has no model "${client.model}". Check OPENROUTER_MODEL against https://openrouter.ai/models`,
    );
  }
}

/**
 * Replaces DeepL's quota check, and exists for the same reason: a run that
 * stops halfway leaves some pages translated and some Turkish under a foreign
 * hreflang. Pay-as-you-go makes this worse than a monthly quota -- DeepL simply
 * stopped, whereas here the balance drains until it runs out mid-job.
 *
 * Characters are converted to a rough token estimate, then to a rough cost. The
 * numbers are deliberately pessimistic: the point is to refuse to start a run
 * that plainly cannot finish, not to bill accurately.
 */
const CHARS_PER_TOKEN = 3;
const USD_PER_MILLION_TOKENS_ASSUMED = 15;

export async function assertBudget(client, estimatedCharacters) {
  const data = await client.credits();
  const total = data?.data?.total_credits;
  const used = data?.data?.total_usage;

  if (typeof total !== 'number' || typeof used !== 'number') {
    throw new TranslationError(
      `Could not read the OpenRouter credit balance: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  const remaining = total - used;
  // Output roughly matches input in length for translation, hence the doubling.
  const tokens = (estimatedCharacters / CHARS_PER_TOKEN) * 2;
  const estimate = (tokens / 1_000_000) * USD_PER_MILLION_TOKENS_ASSUMED;

  console.log(
    `OpenRouter credits: $${remaining.toFixed(2)} left; ` +
      `this run is estimated at $${estimate.toFixed(2)} ` +
      `(${estimatedCharacters.toLocaleString('en-US')} characters, model ${client.model})`,
  );

  if (estimate > remaining) {
    throw new TranslationError(
      `Not enough credit: estimated $${estimate.toFixed(2)}, $${remaining.toFixed(2)} left. ` +
        'Nothing was translated -- a half-finished run would leave some pages in Turkish ' +
        'under a foreign hreflang.',
    );
  }
}
```

- [ ] **Step 2: Smoke check the two endpoint shapes against the live API**

`assertModelAvailable` and `assertBudget` read fields (`data[].id`, `data.total_credits`, `data.total_usage`) whose names must be confirmed against the real responses before anything depends on them. Both are read-only and cost nothing.

With `OPENROUTER_API_KEY` in `.env`:

```bash
node --env-file-if-exists=.env -e "
import('./tools/openrouter.js').then(async (m) => {
  const c = m.createClient({ model: process.env.OPENROUTER_MODEL ?? 'x/y' });
  const models = await c.models();
  console.log('models:', Array.isArray(models?.data), models?.data?.length);
  console.log('sample id:', models?.data?.[0]?.id);
  console.log('credits:', JSON.stringify(await c.credits()));
});
"
```

Expected: `models: true <a number>`, a sample id such as `openai/gpt-4o-mini`, and a credits object.

If either shape differs from what the code reads, correct `assertModelAvailable` / `assertBudget` now. Do not proceed with a mismatch — an unread balance means the budget guard silently passes.

- [ ] **Step 3: Commit**

```bash
git add tools/openrouter.js
git commit -m "Add the OpenRouter translation client"
```

---

### Task 3: Move translate-locales.js onto OpenRouter

The corporate strings. Small volume, highest stakes — these are what an investor reads.

**Files:**
- Modify: `tools/translate-locales.js:16-23` (imports), `:75-76` (client setup), `:104` (budget), `:109` (call)

**Interfaces:**
- Consumes: `createClient`, `assertModelAvailable`, `assertBudget`, `countCharacters`, `restoreProtectedTerms`, `TARGET_LANGUAGES` from `./openrouter.js`.
- Produces: nothing new.

- [ ] **Step 1: Replace the import block**

Replace lines 16-23:

```js
import {
  createClient,
  DEEPL_TARGETS,
  assertQuota,
  assertTargetsSupported,
  countCharacters,
  restoreProtectedTerms,
} from './deepl.js';
```

with:

```js
import {
  createClient,
  assertBudget,
  assertModelAvailable,
  countCharacters,
  restoreProtectedTerms,
} from './openrouter.js';
```

`TARGET_LANGUAGES` is not imported: the client takes the locale code directly and looks the language name up itself.

- [ ] **Step 2: Replace the client setup**

Replace lines 75-76:

```js
  const client = createClient();
  await assertTargetsSupported(client, TARGET_LOCALES);
```

with:

```js
  const client = createClient({ model: process.env.OPENROUTER_MODEL });
  await assertModelAvailable(client);
```

- [ ] **Step 3: Replace the budget check and the translate call**

Line 104, replace `await assertQuota(client, required);` with:

```js
  await assertBudget(client, required);
```

Line 109, replace:

```js
    const translations = await client.translate(sources, DEEPL_TARGETS[job.locale]);
```

with:

```js
    const translations = await client.translate(sources, job.locale, {
      label: `${job.locale}/${job.namespace}`,
    });
```

- [ ] **Step 4: Verify nothing else references DeepL**

Run: `grep -n "deepl\|DEEPL\|assertQuota\|assertTargetsSupported" tools/translate-locales.js`
Expected: no output.

- [ ] **Step 5: Verify the script still parses and its no-op path works**

Run: `node --env-file-if-exists=.env tools/translate-locales.js`
Expected: with all locale files complete, `Locale files are complete; nothing to translate.` and exit 0. This path returns before any network call, so it passes without a key.

- [ ] **Step 6: Commit**

```bash
git add tools/translate-locales.js
git commit -m "Translate the interface strings through OpenRouter"
```

---

### Task 4: Move translate-content.js onto OpenRouter and add the backfill

**Files:**
- Modify: `tools/translate-content.js:20-27` (imports), `:41-43` (flags), `:130` and `:139-141` (translate calls), `:149-184` (`planPosts`), `:221-240` (`rebuildIndexes`), `:311-343` (`main` setup), `:364-384` (post write loop)

**Interfaces:**
- Consumes: the same OpenRouter exports as Task 3.
- Produces: `--backfill` CLI flag; `planPosts(locales, { backfill })`; `rebuildIndexes(locales, { prune })`.

- [ ] **Step 1: Replace the import block**

Replace lines 20-27 with:

```js
import {
  createClient,
  assertBudget,
  assertModelAvailable,
  countCharacters,
  restoreProtectedTerms,
} from './openrouter.js';
```

- [ ] **Step 2: Add the backfill flag**

After line 43 (`const postLocales = ...`), add:

```js
/**
 * Retranslate posts that already have a translation, pinning each one to the
 * slug already on disk.
 *
 * The slug comes from the translated title, so a plain retranslation would
 * write a new file, orphan the old one and move 70 indexed URLs. Pinning keeps
 * the URL and changes only what is on the page.
 */
const backfill = process.argv.includes('--backfill');
const bulkModel = process.env.OPENROUTER_MODEL_BULK ?? process.env.OPENROUTER_MODEL;
```

- [ ] **Step 3: Teach planPosts about the backfill**

Replace the signature on line 149 and the body of the per-entry loop. `planPosts(locales)` becomes:

```js
async function planPosts(locales, { backfill = false } = {}) {
```

Inside the `for (const entry of index)` loop, replace lines 168-181:

```js
      const translatedSlug = bySourceSlug.get(entry.slug) ?? entry.slug;
      const existing = await readJson(resolve(CONTENT, `posts/${locale}/${translatedSlug}.json`));
      const currentHash = sourceHashFor(source, fields);
      if (existing?.sourceHash === currentHash) continue;

      jobs.push({
        type: 'post',
        locale,
        source,
        fields,
        sourceHash: currentHash,
        characters: countCharacters(fields.map((field) => source[field.key] ?? '')),
      });
```

with:

```js
      const translatedSlug = bySourceSlug.get(entry.slug) ?? entry.slug;
      const existing = await readJson(resolve(CONTENT, `posts/${locale}/${translatedSlug}.json`));
      const currentHash = sourceHashFor(source, fields);

      // The backfill exists to redo posts that already have a translation, so
      // a matching hash is exactly what it is looking for rather than a reason
      // to skip. A post with no translation yet is left to a normal run.
      if (backfill) {
        if (!existing) continue;
      } else if (existing?.sourceHash === currentHash) {
        continue;
      }

      jobs.push({
        type: 'post',
        locale,
        source,
        fields,
        sourceHash: currentHash,
        // Pinned only in backfill mode; a normal run derives the slug from the
        // freshly translated title as before.
        pinnedSlug: backfill ? translatedSlug : null,
        characters: countCharacters(fields.map((field) => source[field.key] ?? '')),
      });
```

- [ ] **Step 4: Make index rebuilding skip pruning during a backfill**

Replace line 221-223:

```js
async function rebuildIndexes(locales) {
  for (const locale of locales) {
    const posts = await pruneDuplicates(locale);
```

with:

```js
async function rebuildIndexes(locales, { prune = true } = {}) {
  for (const locale of locales) {
    // pruneDuplicates deletes files. A backfill writes to the filenames that
    // are already there and creates no duplicates, so there is nothing for it
    // to clean up and every deletion it made would be a lost post.
    const posts = prune ? await pruneDuplicates(locale) : await readPosts(locale);
```

Then add `readPosts` immediately after `pruneDuplicates` (after line 276):

```js
/** Every translated post on disk for a locale, without deleting anything. */
async function readPosts(locale) {
  const dir = resolve(CONTENT, `posts/${locale}`);
  let files = [];
  try {
    files = (await readdir(dir)).filter((name) => name.endsWith('.json'));
  } catch {
    return [];
  }

  const posts = [];
  for (const file of files) {
    const post = await readJson(resolve(dir, file));
    if (post) posts.push(post);
  }
  return posts;
}
```

- [ ] **Step 5: Update the translate calls inside translateItem**

Line 130, replace:

```js
    const results = await client.translate(texts, DEEPL_TARGETS[locale]);
```

with:

```js
    const results = await client.translate(texts, locale, { label: `${locale}/${item.slug}` });
```

Lines 139-141, replace:

```js
    const [result] = await client.translate([item[field.key]], DEEPL_TARGETS[locale], {
      html: true,
    });
```

with:

```js
    const [result] = await client.translate([item[field.key]], locale, {
      html: true,
      label: `${locale}/${item.slug}#${field.key}`,
    });
```

- [ ] **Step 6: Update main() — client, plan call, budget**

Replace lines 312-314:

```js
  const client = createClient();
  const allLocales = [...new Set([...PAGE_LOCALES, ...postLocales])];
  await assertTargetsSupported(client, allLocales);
```

with:

```js
  // The backfill is a bulk pass over thin archive posts, so it may run on a
  // cheaper model than the one new copy is translated with.
  const client = createClient({ model: backfill ? bulkModel : process.env.OPENROUTER_MODEL });
  await assertModelAvailable(client);
```

Replace line 317 `planPosts(postLocales),` with:

```js
    planPosts(postLocales, { backfill }),
```

In backfill mode the corporate collections must not be swept up in the cheap pass. Replace lines 318-319:

```js
    planCollection('projects', 'project', PAGE_LOCALES),
    planCollection('services', 'service', PAGE_LOCALES),
```

with:

```js
    backfill ? [] : planCollection('projects', 'project', PAGE_LOCALES),
    backfill ? [] : planCollection('services', 'service', PAGE_LOCALES),
```

Replace line 328 `await rebuildIndexes(postLocales);` with:

```js
    await rebuildIndexes(postLocales, { prune: !backfill });
```

Replace line 343 `await assertQuota(client, required);` with:

```js
  await assertBudget(client, required);
```

- [ ] **Step 7: Pin the slug in the post write loop**

Replace line 366:

```js
    const slug = slugify(translated.title, job.source.slug);
```

with:

```js
    const slug = job.pinnedSlug ?? slugify(translated.title, job.source.slug);
```

Replace line 384 `await rebuildIndexes([...indexes.keys()]);` with:

```js
  await rebuildIndexes([...indexes.keys()], { prune: !backfill });
```

- [ ] **Step 8: Verify nothing else references DeepL**

Run: `grep -n "deepl\|DEEPL\|assertQuota\|assertTargetsSupported" tools/translate-content.js`
Expected: no output.

- [ ] **Step 9: Verify the dry run works end to end**

Run: `node --env-file-if-exists=.env tools/translate-content.js --dry-run`
Expected: either `Content translations are up to date; nothing to do.` or a `Pending: N post(s), ...` line followed by `Dry run: would translate N characters.` — and no network error, because `assertModelAvailable` runs first and must succeed.

- [ ] **Step 10: Commit**

```bash
git add tools/translate-content.js
git commit -m "Translate content through OpenRouter and pin slugs when backfilling"
```

---

### Task 5: Remove DeepL

**Files:**
- Delete: `tools/deepl.js`
- Modify: `.github/workflows/content-sync.yml:53-66`
- Modify: `docs/superpowers/specs/2026-08-05-openrouter-translation-design.md` (mark implemented)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm nothing imports it**

Run: `grep -rn "deepl" tools/ src/ .github/ --include="*.js" --include="*.yml" -i`
Expected: only matches inside `.github/workflows/content-sync.yml`.

- [ ] **Step 2: Delete the module**

```bash
git rm tools/deepl.js
```

- [ ] **Step 3: Swap the secret in the workflow**

In `.github/workflows/content-sync.yml`, replace both occurrences of:

```yaml
          DEEPL_API_KEY: ${{ secrets.DEEPL_API_KEY }}
```

with:

```yaml
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          OPENROUTER_MODEL: ${{ vars.OPENROUTER_MODEL }}
```

`OPENROUTER_MODEL` is a repository **variable**, not a secret: it is not sensitive, and keeping it visible means a wrong model id can be read straight off the workflow run.

- [ ] **Step 4: Verify the workflow is still valid YAML**

Run: `node -e "console.log(require('fs').readFileSync('.github/workflows/content-sync.yml','utf8').includes('OPENROUTER_API_KEY'))"`
Expected: `true`

Then check the file has no remaining DeepL reference:
Run: `grep -c DEEPL .github/workflows/content-sync.yml`
Expected: `0`

- [ ] **Step 5: Run every check**

```bash
npm run verify:translation
npm run verify:stale-deploy
npm run build
```

Expected: `16/16 passed`, `8/8 passed`, and `0 error(s)` from verify-seo.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Remove DeepL from the translation pipeline"
```

---

### Task 6: Run the pipeline

Nothing here changes code. It is the rollout the spec calls for, in the order that keeps a mistake cheap.

**Files:** none.

**Interfaces:** none.

- [ ] **Step 1: Put the keys in place**

Local `.env`:

```
OPENROUTER_API_KEY=<key>
OPENROUTER_MODEL=<the strong model id, exactly as OpenRouter lists it>
OPENROUTER_MODEL_BULK=<the cheap model id>
```

GitHub: add secret `OPENROUTER_API_KEY`, add variable `OPENROUTER_MODEL`, delete secret `DEEPL_API_KEY`. Add nothing to Coolify.

- [ ] **Step 2: Dry run, spend nothing**

Run: `node --env-file-if-exists=.env tools/translate-content.js --dry-run`
Read the reported character count and cost estimate before going further.

- [ ] **Step 3: One locale, read the output**

Run: `node --env-file-if-exists=.env tools/translate-content.js --locales=de`
Then read the diff by eye: `git diff --stat && git diff src/content/services/de.json`

- [ ] **Step 4: Capture the sitemap, then backfill**

```bash
npm run build && cp dist/sitemap.xml /tmp/sitemap-before.xml
node --env-file-if-exists=.env tools/translate-content.js --backfill --locales=en
npm run build && diff /tmp/sitemap-before.xml dist/sitemap.xml && echo "URLs unchanged"
```

Expected: `URLs unchanged`. **If `diff` reports anything, the backfill moved a URL — revert it with `git checkout src/content` and stop.**

- [ ] **Step 5: Commit the translations**

```bash
git add src/content src/locales src/i18n/published.js
git commit -m "Retranslate the archive through OpenRouter"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
| --- | --- |
| Modül sınırı (deepl.js → openrouter.js, table of replacements) | 2, 3, 4, 5 |
| Toplu iş bütünlüğü | 1 (`orderedBatch`) |
| Çevrilmemiş metin koruması, 20 karakter eşiği | 1 (`assertTranslated`) |
| HTML bütünlüğü | 1 (`assertHtmlIntact`) |
| `temperature: 0` | 2 |
| Yeniden deneme yalnız 429/5xx | 2 (`call`) |
| Sistem promptu: marka, HTML, "yalnız çeviri" | 2 (`systemPrompt`) |
| Model kademeleri, env'den | 4 (`bulkModel`), 3 (`OPENROUTER_MODEL`) |
| `assertModelAvailable` | 2 |
| Dolgu, slug sabitleme | 4 (`pinnedSlug`) |
| `pruneDuplicates` dolguda çalışmaz | 4 (`prune: !backfill`, `readPosts`) |
| Sitemap kabul kriteri | 6 Step 4 |
| `--dry-run` maliyet raporu | 4 Step 9, 6 Step 2 |
| `assertBudget` | 2 |
| Testler, build zincirine girmez | 1 (script added to `package.json`, not to `build`) |
| Anahtarlar: Secrets + .env, Coolify'a hiçbir şey | 5 Step 3, 6 Step 1 |

No gaps.

**Placeholder scan:** none. Every code step carries the code; the two endpoint field names that could not be confirmed offline are handled by an explicit live smoke check (Task 2 Step 2) with a stated failure action, not by a TODO.

**Type consistency:** `orderedBatch`, `assertTranslated`, `assertHtmlIntact`, `tagSequence`, `restoreProtectedTerms`, `countCharacters`, `TranslationError` are defined in Task 1 and used with those names in Tasks 2-4. `createClient({ model })`, `assertModelAvailable(client)`, `assertBudget(client, characters)` and `translate(texts, locale, { html, label })` are defined in Task 2 and called with those signatures in Tasks 3 and 4. `planPosts(locales, { backfill })` and `rebuildIndexes(locales, { prune })` are introduced and called consistently within Task 4.
