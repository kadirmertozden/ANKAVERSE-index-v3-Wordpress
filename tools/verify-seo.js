#!/usr/bin/env node
/**
 * Checks that fail the build rather than a list to look at later.
 *
 * Every rule here corresponds to a way the previous site was silently losing
 * search visibility, or a way this pipeline could start doing so.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, DEFAULT_LOCALE } from '../src/i18n/routes.js';
import { COMPANY } from '../src/data/company.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

const TITLE_MAX = 65;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 165;

/**
 * Letters that only occur in Turkish among the locales we publish. Their
 * presence in a non-Turkish page means untranslated copy is being served under
 * a foreign hreflang -- the failure mode that is invisible in review and
 * actively harmful in search.
 */
const TURKISH_ONLY = /[ğışĞİŞ]/g;
const NON_TURKISH_HTML_LANGS = ['en', 'de', 'fr', 'es', 'ar'];

/**
 * Proper nouns that must stay Turkish in every locale: a company's registered
 * name, its address and its people are not translated. They appear in the
 * footer of every page, so they are removed before the scan rather than
 * allowed to flag all 400-odd pages.
 */
const PROPER_NOUNS = [
  COMPANY.legalName,
  COMPANY.address.full,
  COMPANY.address.street,
  COMPANY.address.locality,
  COMPANY.address.region,
  COMPANY.taxOffice,
  COMPANY.tradeRegistryOffice,
  ...COMPANY.founders.map((founder) => founder.name),
].filter(Boolean);

/**
 * Only lowercase words are counted.
 *
 * Turkish proper nouns survive translation on purpose -- an English article
 * about Doğuş Group or a person named Adalı still spells them that way, and
 * counting those flagged correctly translated pages. Untranslated Turkish
 * prose, by contrast, is overwhelmingly lowercase: "değişim", "başladı",
 * "ışık". Capitalised words are therefore skipped, which leaves the signal
 * pointed at running text rather than at names.
 */
const TURKISH_MIN_COUNT = 8;

function turkishLeakage(text) {
  let stripped = text;
  for (const noun of PROPER_NOUNS) {
    stripped = stripped.split(noun).join(' ');
  }

  let count = 0;
  const flagged = new Set();
  for (const word of stripped.split(/[^\p{L}\p{N}'-]+/u)) {
    if (!word || word[0] !== word[0].toLocaleLowerCase('tr')) continue;
    const matches = word.match(TURKISH_ONLY);
    if (matches) {
      count += matches.length;
      flagged.add(word);
    }
  }

  return { count, sample: [...flagged].slice(0, 6) };
}

const errors = [];
const warnings = [];

const fail = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);

async function htmlFiles(dir = DIST, prefix = '') {
  const found = [];
  let items = [];
  try {
    items = await readdir(dir);
  } catch {
    return found;
  }

  for (const item of items) {
    if (item === 'assets' || item.startsWith('.')) continue;
    const full = resolve(dir, item);
    if ((await stat(full)).isDirectory()) {
      found.push(...(await htmlFiles(full, `${prefix}/${item}`)));
    } else if (item === 'index.html') {
      found.push({ file: full, route: prefix === '' ? '/' : prefix });
    }
  }
  return found;
}

/**
 * Attribute values are HTML-escaped in the served markup, so `it's` occupies
 * six characters as `&#39;`. Lengths are checked against what a search engine
 * renders, not against the escaped source.
 */
const decodeEntities = (value = '') =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const match = (html, pattern) => (html.match(pattern) ?? [])[1];
const matchAll = (html, pattern) => [...html.matchAll(pattern)].map((m) => m[1]);

function checkPage({ file, route }, html, seen) {
  const label = route;

  // 1. Prerendering actually produced content.
  if (/<div id="root"><\/div>/.test(html)) {
    fail(label, 'prerendered with an empty root element');
  }
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]*>/g, ' ');
  if (text.replace(/\s+/g, ' ').trim().length < 200) {
    fail(label, 'almost no rendered text');
  }

  // 2. Canonical exists and points at this page.
  const canonical = match(html, /rel="canonical" href="([^"]+)"/);
  const noindex = /name="robots" content="noindex/.test(html);
  if (!canonical) {
    fail(label, 'missing canonical');
  } else {
    const expected = `${SITE_URL}${route}`;
    if (canonical !== expected && !noindex) {
      fail(label, `canonical ${canonical} does not match its own URL ${expected}`);
    }
  }

  // 3. Title and description are present, sane and unique per locale.
  const title = decodeEntities(match(html, /<title[^>]*>([^<]*)<\/title>/));
  const description = decodeEntities(match(html, /name="description" content="([^"]*)"/));
  const lang = match(html, /<html[^>]*\blang="([^"]+)"/);

  if (!title) fail(label, 'missing title');
  else if (title.length > TITLE_MAX) warn(label, `title is ${title.length} chars (>${TITLE_MAX})`);

  if (!description) fail(label, 'missing meta description');
  else if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX) {
    warn(label, `description is ${description.length} chars (want ${DESCRIPTION_MIN}-${DESCRIPTION_MAX})`);
  }

  if (title && !noindex) {
    const key = `${lang}::${title}`;
    if (seen.titles.has(key)) {
      warn(label, `duplicate title within ${lang}: also on ${seen.titles.get(key)}`);
    } else {
      seen.titles.set(key, label);
    }
  }

  // 4. lang / dir are in the served HTML, not applied later by JS.
  if (!lang) fail(label, 'missing <html lang>');
  const dir = match(html, /<html[^>]*\bdir="([^"]+)"/);
  if (!dir) fail(label, 'missing <html dir>');
  if (lang === 'ar' && dir !== 'rtl') fail(label, 'Arabic page is not marked dir="rtl"');

  // 5. Untranslated copy under a foreign language tag.
  if (lang && NON_TURKISH_HTML_LANGS.includes(lang)) {
    const { count, sample } = turkishLeakage(text);
    if (count >= TURKISH_MIN_COUNT) {
      fail(
        label,
        `lang="${lang}" but ${count} Turkish-only characters in lowercase words ` +
          `suggest untranslated copy (e.g. ${sample.join(', ')})`,
      );
    }
  }

  // 6. Structured data parses and carries a type.
  for (const block of matchAll(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block);
      const nodes = data['@graph'] ?? [data];
      if (nodes.some((node) => !node['@type'])) fail(label, 'JSON-LD node without @type');
    } catch {
      fail(label, 'invalid JSON-LD');
    }
  }

  // 7. Social preview tags -- the reason shared links currently render blank.
  for (const property of ['og:title', 'og:description', 'og:image', 'og:url']) {
    if (!html.includes(`property="${property}"`)) fail(label, `missing ${property}`);
  }
  if (!html.includes('name="twitter:card"')) fail(label, 'missing twitter:card');

  // 8. hreflang set, collected for the reciprocity check below.
  const alternates = [...html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(
    (m) => ({ lang: m[1], url: m[2] }),
  );
  if (!noindex) {
    if (alternates.length === 0) {
      fail(label, 'no hreflang alternates');
    } else if (!alternates.some((alternate) => alternate.lang === 'x-default')) {
      fail(label, 'hreflang set has no x-default');
    }
    seen.hreflang.set(`${SITE_URL}${route}`, alternates.filter((a) => a.lang !== 'x-default'));
  }
}

function checkReciprocity(seen) {
  for (const [url, alternates] of seen.hreflang) {
    for (const alternate of alternates) {
      if (alternate.url === url) continue;
      const reverse = seen.hreflang.get(alternate.url);
      if (!reverse) {
        errors.push(`${url}: hreflang points at ${alternate.url}, which was not built`);
      } else if (!reverse.some((item) => item.url === url)) {
        errors.push(`${url}: hreflang to ${alternate.url} is not reciprocated`);
      }
    }
  }
}

async function main() {
  const pages = await htmlFiles();
  if (pages.length === 0) {
    console.error('No prerendered pages found in dist/. Run the build first.');
    process.exit(1);
  }

  const seen = { titles: new Map(), hreflang: new Map() };
  for (const page of pages) {
    checkPage(page, await readFile(page.file, 'utf8'), seen);
  }
  checkReciprocity(seen);

  const sitemap = await readFile(resolve(DIST, 'sitemap.xml'), 'utf8').catch(() => null);
  if (!sitemap) errors.push('dist/sitemap.xml is missing');
  const robots = await readFile(resolve(DIST, 'robots.txt'), 'utf8').catch(() => null);
  if (!robots) errors.push('dist/robots.txt is missing');
  if (robots && !robots.includes('Sitemap:')) errors.push('robots.txt does not reference the sitemap');

  console.log(`\nverify-seo: checked ${pages.length} pages (default locale: ${DEFAULT_LOCALE})`);

  for (const warning of warnings) console.warn(`  warn  ${warning}`);
  for (const error of errors) console.error(`  FAIL  ${error}`);

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  if (errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
