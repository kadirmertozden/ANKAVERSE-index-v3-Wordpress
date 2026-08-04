#!/usr/bin/env node
/**
 * Emit dist/sitemap.xml and dist/robots.txt from the route table and the
 * committed content, so the sitemap cannot list a page that was never built
 * or omit one that was.
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOCALES,
  DEFAULT_LOCALE,
  SITE_URL,
  ROUTES,
  absoluteUrl,
  alternatesFor,
  isUnlisted,
  listedRouteKeys,
  localesForRoute,
  pathFor,
} from '../src/i18n/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const CONTENT = resolve(ROOT, 'src/content');

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
};

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Slug alternates let a detail page advertise its counterparts in other locales. */
async function detailEntries(slugAlternates) {
  const entries = [];

  for (const locale of LOCALES) {
    if (localesForRoute('blogDetail').includes(locale)) {
      const index = (await readJson(resolve(CONTENT, `index/${locale}.json`))) ?? [];
      for (const post of index) {
        const alternates = slugAlternates[post.slug] ?? { [locale]: post.slug };
        entries.push({
          routeKey: 'blogDetail',
          locale,
          params: Object.fromEntries(
            Object.entries(alternates).map(([key, slug]) => [key, { slug }]),
          ),
          selfParams: { slug: post.slug },
          lastmod: post.modified ?? post.date,
        });
      }
    }

    const projects = (await readJson(resolve(CONTENT, `projects/${locale}.json`))) ?? [];
    for (const project of projects) {
      entries.push({
        routeKey: 'projectDetail',
        locale,
        params: { slug: project.slug },
        selfParams: { slug: project.slug },
        lastmod: project.date,
      });
    }
  }

  return entries;
}

function urlBlock({ loc, alternates, lastmod, priority }) {
  const lines = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];

  for (const alternate of alternates) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.url)}" />`,
    );
  }
  const fallback = alternates.find((alternate) => alternate.locale === DEFAULT_LOCALE);
  if (fallback) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(fallback.url)}" />`,
    );
  }

  // ACF date fields arrive in assorted shapes; an unparseable one is left out
  // rather than allowed to abort the whole sitemap.
  const parsed = lastmod ? new Date(lastmod) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    lines.push(`    <lastmod>${parsed.toISOString().slice(0, 10)}</lastmod>`);
  }
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

/** Every prerendered page, so the sitemap can be checked against reality. */
async function builtPaths(dir = DIST, prefix = '') {
  const found = new Set();
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
      for (const nested of await builtPaths(full, `${prefix}/${item}`)) found.add(nested);
    } else if (item === 'index.html') {
      found.add(prefix === '' ? '/' : prefix);
    }
  }
  return found;
}

async function main() {
  const slugAlternates = (await readJson(resolve(CONTENT, 'slug-alternates.json'))) ?? {};

  const entries = [];

  for (const routeKey of listedRouteKeys()) {
    if (ROUTES[routeKey].param) continue; // detail routes handled separately
    for (const locale of localesForRoute(routeKey)) {
      entries.push({
        loc: absoluteUrl(pathFor(routeKey, locale)),
        alternates: alternatesFor(routeKey),
        priority: routeKey === 'home' ? '1.0' : '0.8',
      });
    }
  }

  for (const detail of await detailEntries(slugAlternates)) {
    if (isUnlisted(detail.routeKey)) continue;
    entries.push({
      loc: absoluteUrl(pathFor(detail.routeKey, detail.locale, detail.selfParams)),
      alternates: alternatesFor(detail.routeKey, detail.params),
      lastmod: detail.lastmod,
      priority: '0.6',
    });
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(urlBlock),
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Unlisted: reachable by direct link only.',
    'Disallow: /Vaktia/',
    'Disallow: /404',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  await writeFile(resolve(DIST, 'robots.txt'), robots, 'utf8');

  const built = await builtPaths();
  const listed = new Set(entries.map((entry) => entry.loc.replace(SITE_URL, '') || '/'));
  const missing = [...listed].filter((path) => !built.has(path));

  console.log(`sitemap.xml: ${entries.length} URLs, robots.txt written`);
  if (missing.length > 0) {
    console.error(`Sitemap lists ${missing.length} path(s) that were not built:`);
    for (const path of missing.slice(0, 10)) console.error(`  ${path}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
