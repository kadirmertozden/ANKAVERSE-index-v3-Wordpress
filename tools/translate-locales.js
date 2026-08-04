#!/usr/bin/env node
/**
 * Generate src/locales/<lang>/*.json from the Turkish source.
 *
 * These are the corporate strings a visitor and an investor actually read, so
 * DeepL only produces the first draft: the output is committed and then hand
 * corrected. Re-running never overwrites an existing key -- only missing ones
 * are fetched -- so manual fixes survive.
 *
 *   node tools/translate-locales.js            # fill in what is missing
 *   node tools/translate-locales.js --force    # retranslate everything
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createClient,
  DEEPL_TARGETS,
  assertQuota,
  assertTargetsSupported,
  countCharacters,
  restoreProtectedTerms,
} from './deepl.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = resolve(__dirname, '../src/locales');
const SOURCE_LOCALE = 'tr';
const TARGET_LOCALES = ['en', 'de', 'fr', 'es', 'ar'];

const force = process.argv.includes('--force');

/** Walk a nested object, collecting every string with its path. */
function collectStrings(value, path = [], collected = []) {
  if (typeof value === 'string') {
    collected.push({ path, value });
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, [...path, index], collected));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, [...path, key], collected);
    }
  }
  return collected;
}

const getAt = (object, path) =>
  path.reduce((node, key) => (node == null ? undefined : node[key]), object);

function setAt(object, path, value) {
  let node = object;
  path.slice(0, -1).forEach((key, index) => {
    const nextKey = path[index + 1];
    node[key] ??= typeof nextKey === 'number' ? [] : {};
    node = node[key];
  });
  node[path.at(-1)] = value;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * i18next interpolation placeholders must survive verbatim. DeepL leaves
 * {{share}} alone in practice, but a mangled placeholder renders as literal
 * braces on the page, so it is checked rather than assumed.
 */
const placeholders = (text) => (text.match(/\{\{[^}]+\}\}/g) ?? []).sort().join('|');

async function main() {
  const client = createClient();
  await assertTargetsSupported(client, TARGET_LOCALES);

  const namespaces = (await readdir(resolve(LOCALES_DIR, SOURCE_LOCALE))).filter((name) =>
    name.endsWith('.json'),
  );

  // Work out the whole job first so the quota check is meaningful.
  const jobs = [];
  for (const locale of TARGET_LOCALES) {
    for (const namespace of namespaces) {
      const source = await readJson(resolve(LOCALES_DIR, SOURCE_LOCALE, namespace));
      const existing = force ? {} : ((await readJson(resolve(LOCALES_DIR, locale, namespace))) ?? {});
      const missing = collectStrings(source).filter(
        (entry) => typeof getAt(existing, entry.path) !== 'string',
      );
      if (missing.length > 0) jobs.push({ locale, namespace, source, existing, missing });
    }
  }

  if (jobs.length === 0) {
    console.log('Locale files are complete; nothing to translate.');
    return;
  }

  const required = jobs.reduce(
    (total, job) => total + countCharacters(job.missing.map((entry) => entry.value)),
    0,
  );
  await assertQuota(client, required);

  let warnings = 0;
  for (const job of jobs) {
    const sources = job.missing.map((entry) => entry.value);
    const translations = await client.translate(sources, DEEPL_TARGETS[job.locale]);

    const output = structuredClone(job.existing);
    job.missing.forEach((entry, index) => {
      const translated = restoreProtectedTerms(translations[index], entry.value);
      if (placeholders(entry.value) !== placeholders(translated)) {
        console.warn(
          `  ! placeholder changed in ${job.locale}/${job.namespace} at ${entry.path.join('.')}`,
        );
        warnings += 1;
      }
      setAt(output, entry.path, translated);
    });

    const target = resolve(LOCALES_DIR, job.locale, job.namespace);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    console.log(`${job.locale}/${job.namespace}: ${job.missing.length} strings`);
  }

  console.log(`\nTranslated ${required.toLocaleString('en-US')} characters.`);
  if (warnings > 0) console.log(`${warnings} placeholder warning(s) -- review before committing.`);

  await updatePublishedLocales(namespaces);
}

/**
 * A locale becomes routable only once every namespace has every key. Written
 * as a module rather than inferred at runtime so the browser bundle does not
 * need to inspect the filesystem, and so the change is visible in a diff.
 */
async function updatePublishedLocales(namespaces) {
  const complete = [SOURCE_LOCALE];

  for (const locale of TARGET_LOCALES) {
    const results = await Promise.all(
      namespaces.map(async (namespace) => {
        const source = await readJson(resolve(LOCALES_DIR, SOURCE_LOCALE, namespace));
        const translated = await readJson(resolve(LOCALES_DIR, locale, namespace));
        if (!translated) return false;
        return collectStrings(source).every(
          (entry) => typeof getAt(translated, entry.path) === 'string',
        );
      }),
    );
    if (results.every(Boolean)) complete.push(locale);
  }

  const target = resolve(__dirname, '../src/i18n/published.js');
  const current = await readFile(target, 'utf8');
  const updated = current.replace(
    /export const PUBLISHED_LOCALES = \[[^\]]*\];/,
    `export const PUBLISHED_LOCALES = [${complete.map((locale) => `'${locale}'`).join(', ')}];`,
  );

  if (updated !== current) {
    await writeFile(target, updated, 'utf8');
    console.log(`Published locales: ${complete.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
