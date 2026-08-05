#!/usr/bin/env node
/**
 * Translate the committed WordPress content into the other locales.
 *
 * Each item is translated once. The translated file records the hash of the
 * Turkish source it came from; on the next run a matching hash means the item
 * is skipped and costs nothing. That makes rebuilds free, keeps the text
 * stable at a given URL -- Google penalises pages whose content churns -- and
 * leaves the files editable: a hand-corrected translation survives as long as
 * the source has not changed.
 *
 *   node tools/translate-content.js                 # locales from CONTENT_LOCALES
 *   node tools/translate-content.js --locales=en    # just one
 *   node tools/translate-content.js --dry-run       # report cost, translate nothing
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createClient,
  assertBudget,
  assertModelAvailable,
  countCharacters,
  restoreProtectedTerms,
} from './openrouter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT = resolve(__dirname, '../src/content');
const SOURCE = 'tr';

/**
 * Blog translation is staged: the archive is 70 posts, and translating it into
 * five languages at once is roughly 900k characters -- nearly twice the free
 * monthly quota. English first, the rest when the quota renews.
 */
const DEFAULT_POST_LOCALES = (process.env.CONTENT_LOCALES ?? 'en').split(',').filter(Boolean);
const PAGE_LOCALES = ['en', 'de', 'fr', 'es', 'ar'];

const dryRun = process.argv.includes('--dry-run');
const localesArg = process.argv.find((arg) => arg.startsWith('--locales='));
const postLocales = localesArg ? localesArg.split('=')[1].split(',') : DEFAULT_POST_LOCALES;

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

const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 16);

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
};

async function writeJson(relativePath, data) {
  const target = resolve(CONTENT, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const TURKISH_MAP = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

function slugify(text, fallback) {
  const slug = text
    .toLowerCase()
    .replace(/[çğıöşü]/g, (char) => TURKISH_MAP[char])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');

  // Scripts with no Latin equivalent (Arabic) slugify to nothing. Falling back
  // keeps the URL readable and ASCII instead of percent-encoded.
  return slug.length >= 3 ? slug : fallback;
}

/** Fields translated per content type, and whether they contain HTML. */
const FIELD_SETS = {
  post: [
    { key: 'title', html: false },
    { key: 'excerpt', html: false },
    { key: 'content', html: true },
  ],
  project: [
    { key: 'title', html: false },
    { key: 'excerpt', html: false },
    { key: 'content', html: true },
  ],
  service: [
    { key: 'title', html: false },
    { key: 'description', html: false },
    // The bullet list under each service is body copy, not metadata. Leaving
    // it out shipped five locales whose services page was still half Turkish.
    { key: 'features', html: false, list: true },
  ],
};

const fieldText = (item, field) => {
  const value = item[field.key];
  if (field.list) return Array.isArray(value) ? value.join(' ') : '';
  return value ?? '';
};

const sourceHashFor = (item, fields) => hash(fields.map((field) => fieldText(item, field)).join(' '));

async function translateItem(client, item, fields, locale) {
  const translated = { ...item };

  // Plain fields go out in one request; a list field contributes each of its
  // entries and is reassembled from the results afterwards.
  const slots = [];
  const texts = [];

  for (const field of fields.filter((entry) => !entry.html && fieldText(item, entry))) {
    if (field.list) {
      translated[field.key] = [...item[field.key]];
      item[field.key].forEach((entry, index) => {
        slots.push({ key: field.key, index });
        texts.push(entry);
      });
    } else {
      slots.push({ key: field.key, index: null });
      texts.push(item[field.key]);
    }
  }

  if (texts.length > 0) {
    const results = await client.translate(texts, locale, { label: `${locale}/${item.slug}` });
    slots.forEach((slot, position) => {
      const restored = restoreProtectedTerms(results[position], texts[position]);
      if (slot.index === null) translated[slot.key] = restored;
      else translated[slot.key][slot.index] = restored;
    });
  }

  for (const field of fields.filter((entry) => entry.html && item[entry.key])) {
    const [result] = await client.translate([item[field.key]], locale, {
      html: true,
      label: `${locale}/${item.slug}#${field.key}`,
    });
    translated[field.key] = restoreProtectedTerms(result, item[field.key]);
  }

  return translated;
}

/** Items needing work, with their character cost, before anything is spent. */
async function planPosts(locales, { backfill = false } = {}) {
  const index = (await readJson(resolve(CONTENT, `index/${SOURCE}.json`))) ?? [];
  const fields = FIELD_SETS.post;
  const jobs = [];

  for (const locale of locales) {
    // A translated post is stored under its own translated slug, so the cache
    // cannot be found by the Turkish slug. The locale index records which
    // source each entry came from; without this lookup every run retranslates
    // the whole archive and the hash cache never once hits.
    const translatedIndex = (await readJson(resolve(CONTENT, `index/${locale}.json`))) ?? [];
    const bySourceSlug = new Map(
      translatedIndex.map((entry) => [entry.sourceSlug ?? entry.slug, entry.slug]),
    );

    for (const entry of index) {
      const source = await readJson(resolve(CONTENT, `posts/${SOURCE}/${entry.slug}.json`));
      if (!source) continue;

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
    }
  }
  return jobs;
}

async function planCollection(name, type, locales) {
  const source = (await readJson(resolve(CONTENT, `${name}/${SOURCE}.json`))) ?? [];
  const fields = FIELD_SETS[type];
  const jobs = [];

  for (const locale of locales) {
    const existing = (await readJson(resolve(CONTENT, `${name}/${locale}.json`))) ?? [];
    const byslug = new Map(existing.map((item) => [item.slug, item]));

    const stale = source.filter(
      (item) => byslug.get(item.slug)?.sourceHash !== sourceHashFor(item, fields),
    );
    if (stale.length === 0) continue;

    jobs.push({
      type,
      name,
      locale,
      source,
      stale,
      existing: byslug,
      fields,
      characters: stale.reduce(
        (total, item) => total + countCharacters(fields.map((field) => item[field.key] ?? '')),
        0,
      ),
    });
  }
  return jobs;
}

/**
 * Rebuild each locale index from what is actually on disk, so posts
 * translated in earlier runs survive and orphans are dropped.
 */
async function rebuildIndexes(locales, { prune = true } = {}) {
  for (const locale of locales) {
    // pruneDuplicates deletes files. A backfill writes to the filenames that
    // are already there and creates no duplicates, so there is nothing for it
    // to clean up and every deletion it made would be a lost post.
    const posts = prune ? await pruneDuplicates(locale) : await readPosts(locale);
    const entries = posts
      .map((post) => ({
        id: post.id,
        slug: post.slug,
        sourceSlug: post.sourceSlug ?? post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        categories: post.categories,
        tags: post.tags,
        image: post.image,
        author: post.author,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    await writeJson(`index/${locale}.json`, entries);
  }
}

/**
 * Remove translated posts orphaned by a slug change.
 *
 * The slug is derived from the translated title, and DeepL does not return a
 * byte-identical title every time. Retranslating a post therefore writes a
 * second file for the same source and leaves the first one behind, which
 * publishes two URLs for one article with canonicals pointing at each other.
 * Only the newest file per source post is kept.
 */
async function pruneDuplicates(locale) {
  const dir = resolve(CONTENT, `posts/${locale}`);
  let files = [];
  try {
    files = (await readdir(dir)).filter((name) => name.endsWith('.json'));
  } catch {
    return [];
  }

  const bySource = new Map();
  for (const file of files) {
    const post = await readJson(resolve(dir, file));
    if (!post) continue;
    const key = post.sourceSlug ?? post.slug;
    const { mtimeMs } = await stat(resolve(dir, file));
    const previous = bySource.get(key);
    if (!previous || mtimeMs > previous.mtimeMs) {
      if (previous) await rm(resolve(dir, previous.file));
      bySource.set(key, { file, post, mtimeMs });
    } else {
      await rm(resolve(dir, file));
    }
  }

  return [...bySource.values()].map((entry) => entry.post);
}

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

async function rebuildSlugAlternates() {
  const alternates = {};
  const trIndex = (await readJson(resolve(CONTENT, `index/${SOURCE}.json`))) ?? [];

  for (const entry of trIndex) {
    alternates[entry.slug] = { [SOURCE]: entry.slug };
  }

  let locales = [];
  try {
    locales = (await readdir(resolve(CONTENT, 'index')))
      .filter((name) => name.endsWith('.json'))
      .map((name) => name.replace('.json', ''))
      .filter((locale) => locale !== SOURCE);
  } catch {
    locales = [];
  }

  for (const locale of locales) {
    const index = (await readJson(resolve(CONTENT, `index/${locale}.json`))) ?? [];
    for (const entry of index) {
      const sourceSlug = entry.sourceSlug ?? entry.slug;
      alternates[sourceSlug] ??= {};
      alternates[sourceSlug][locale] = entry.slug;
      // Reverse lookup: the detail page knows only its own slug.
      alternates[entry.slug] = alternates[sourceSlug];
    }
  }

  await writeJson('slug-alternates.json', alternates);
  return Object.keys(alternates).length;
}

async function main() {
  // The backfill is a bulk pass over thin archive posts, so it may run on a
  // cheaper model than the one new copy is translated with.
  const client = createClient({ model: backfill ? bulkModel : process.env.OPENROUTER_MODEL });
  await assertModelAvailable(client);

  const [postJobs, projectJobs, serviceJobs] = await Promise.all([
    planPosts(postLocales, { backfill }),
    // A backfill must not sweep the corporate collections into the cheap pass.
    backfill ? [] : planCollection('projects', 'project', PAGE_LOCALES),
    backfill ? [] : planCollection('services', 'service', PAGE_LOCALES),
  ]);

  const required =
    postJobs.reduce((total, job) => total + job.characters, 0) +
    [...projectJobs, ...serviceJobs].reduce((total, job) => total + job.characters, 0);

  if (required === 0) {
    console.log('Content translations are up to date; nothing to do.');
    await rebuildIndexes(postLocales, { prune: !backfill });
    await rebuildSlugAlternates();
    return;
  }

  console.log(
    `Pending: ${postJobs.length} post(s), ` +
      `${projectJobs.length} project set(s), ${serviceJobs.length} service set(s)`,
  );

  if (dryRun) {
    console.log(`Dry run: would translate ${required.toLocaleString('en-US')} characters.`);
    return;
  }

  await assertBudget(client, required);

  // Collections first: they are small, and the site is unusable in a locale
  // whose navigation and service names are still Turkish.
  for (const job of [...serviceJobs, ...projectJobs]) {
    const output = [];
    for (const item of job.source) {
      const currentHash = sourceHashFor(item, job.fields);
      const cached = job.existing.get(item.slug);
      if (cached?.sourceHash === currentHash) {
        output.push(cached);
        continue;
      }
      const translated = await translateItem(client, item, job.fields, job.locale);
      output.push({ ...translated, sourceHash: currentHash });
    }
    await writeJson(`${job.name}/${job.locale}.json`, output);
    console.log(`${job.name}/${job.locale}: ${job.stale.length} item(s)`);
  }

  const indexes = new Map();
  for (const job of postJobs) {
    const translated = await translateItem(client, job.source, job.fields, job.locale);
    const slug = job.pinnedSlug ?? slugify(translated.title, job.source.slug);

    const record = {
      ...translated,
      slug,
      sourceSlug: job.source.slug,
      lang: job.locale,
      sourceHash: job.sourceHash,
    };

    await writeJson(`posts/${job.locale}/${slug}.json`, record);

    const list = indexes.get(job.locale) ?? [];
    list.push(record);
    indexes.set(job.locale, list);
    console.log(`posts/${job.locale}/${slug}`);
  }

  await rebuildIndexes([...indexes.keys()], { prune: !backfill });

  const mapped = await rebuildSlugAlternates();
  console.log(`\nTranslated ${required.toLocaleString('en-US')} characters; ${mapped} slug mappings.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
