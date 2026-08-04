#!/usr/bin/env node
/**
 * Write dist/llms.txt -- a plain-text map of the site for language models.
 *
 * Derived from the prerendered HTML rather than by parsing JSX. The previous
 * version scanned page sources for <Helmet> blocks with regular expressions;
 * when that metadata moved into a shared <Seo> component it found nothing,
 * exited 1, and took the whole deployment down with it. Reading the built
 * output cannot drift from what is actually published.
 */
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, DEFAULT_LOCALE, LOCALES, LOCALE_LABELS } from '../src/i18n/routes.js';
import { COMPANY } from '../src/data/company.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

const match = (html, pattern) => (html.match(pattern) ?? [])[1];

const decodeEntities = (value = '') =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

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

const localeOf = (route) => {
  const first = route.split('/').filter(Boolean)[0];
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
};

async function main() {
  const pages = [];

  for (const page of await htmlFiles()) {
    const html = await readFile(page.file, 'utf8');
    // Unlisted and error pages are not part of the site's public map.
    if (/name="robots" content="noindex/.test(html)) continue;

    pages.push({
      route: page.route,
      locale: localeOf(page.route),
      url: match(html, /rel="canonical" href="([^"]+)"/) ?? `${SITE_URL}${page.route}`,
      title: decodeEntities(match(html, /<title[^>]*>([^<]*)<\/title>/) ?? ''),
      description: decodeEntities(match(html, /name="description" content="([^"]*)"/) ?? ''),
    });
  }

  if (pages.length === 0) {
    console.error('No prerendered pages found in dist/. Run the build first.');
    process.exit(1);
  }

  const sections = LOCALES.filter((locale) => pages.some((page) => page.locale === locale)).map(
    (locale) => {
      const entries = pages
        .filter((page) => page.locale === locale)
        .sort((a, b) => a.route.localeCompare(b.route))
        .map((page) => `- [${page.title}](${page.url}): ${page.description}`)
        .join('\n');
      return `## ${LOCALE_LABELS[locale] ?? locale} (${locale})\n\n${entries}`;
    },
  );

  const content = [
    `# ${COMPANY.name}`,
    '',
    `> ${COMPANY.legalName} -- ${COMPANY.url}`,
    '',
    'Software development, automation, artificial intelligence and e-commerce technology.',
    `Available in: ${LOCALES.map((locale) => LOCALE_LABELS[locale] ?? locale).join(', ')}.`,
    '',
    `Contact: ${COMPANY.email} | ${COMPANY.telephoneDisplay}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
    ...sections,
    '',
  ].join('\n');

  await writeFile(resolve(DIST, 'llms.txt'), content, 'utf8');
  console.log(`llms.txt: ${pages.length} pages across ${sections.length} locale(s)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
