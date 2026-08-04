#!/usr/bin/env node
/**
 * Pull WordPress content into src/content/*.json.
 *
 * This runs in the GitHub Actions sync workflow, not in the Coolify build.
 * Coolify builds in a throwaway container, so anything fetched there would be
 * refetched on every deploy and the prerender would depend on WordPress being
 * reachable at deploy time. Committing the content instead makes the build
 * hermetic and reproducible.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'src/content');

const API_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.VITE_WORDPRESS_API_URL ||
  'https://wordpress.ankaverse.com.tr/wp-json/wp/v2';

/** Posts carrying this tag are already written in English and are not translated. */
const ENGLISH_TAG = 'en';

async function fetchAll(endpoint, params = {}) {
  const results = [];
  let page = 1;

  for (;;) {
    const url = new URL(`${API_URL}/${endpoint}`);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url);
    if (response.status === 400 && page > 1) break; // past the last page
    if (!response.ok) {
      throw new Error(`${endpoint} page ${page}: ${response.status} ${response.statusText}`);
    }

    const batch = await response.json();
    results.push(...batch);

    const totalPages = Number(response.headers.get('x-wp-totalpages') || '1');
    if (page >= totalPages) break;
    page += 1;
  }

  return results;
}

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&#039;|&#8216;/g, "'")
    .replace(/&quot;|&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const embedded = (item, key) => item._embedded?.[key] ?? [];

function featuredImage(item) {
  const media = embedded(item, 'wp:featuredmedia')[0];
  if (!media || media.code) return null;
  const sizes = media.media_details?.sizes ?? {};
  return {
    url: media.source_url,
    alt: media.alt_text || stripHtml(item.title?.rendered) || '',
    width: media.media_details?.width ?? null,
    height: media.media_details?.height ?? null,
    srcset: Object.values(sizes)
      .filter((size) => size.source_url && size.width)
      .map((size) => `${size.source_url} ${size.width}w`)
      .join(', '),
  };
}

function taxonomyNames(item, taxonomy) {
  return embedded(item, 'wp:term')
    .flat()
    .filter((term) => term?.taxonomy === taxonomy)
    .map((term) => ({ id: term.id, name: term.name, slug: term.slug }));
}

function normalizePost(item) {
  const tags = taxonomyNames(item, 'post_tag');
  return {
    id: item.id,
    slug: item.slug,
    lang: tags.some((tag) => tag.slug === ENGLISH_TAG) ? 'en' : 'tr',
    title: stripHtml(item.title?.rendered),
    excerpt: stripHtml(item.excerpt?.rendered),
    content: item.content?.rendered ?? '',
    date: item.date_gmt ? `${item.date_gmt}Z` : item.date,
    modified: item.modified_gmt ? `${item.modified_gmt}Z` : item.modified,
    categories: taxonomyNames(item, 'category'),
    tags: tags.filter((tag) => tag.slug !== ENGLISH_TAG),
    image: featuredImage(item),
    author: embedded(item, 'author')[0]?.name ?? null,
  };
}

function normalizeProject(item) {
  const acf = item.acf ?? {};
  return {
    id: item.id,
    slug: item.slug,
    title: stripHtml(item.title?.rendered),
    excerpt: stripHtml(acf.proje_kisa_aciklamasi ?? item.excerpt?.rendered ?? ''),
    content: item.content?.rendered ?? '',
    client: acf.musteri ?? null,
    date: acf.tarih ?? item.date,
    technologies: (acf.teknolojiler ?? '')
      .split(',')
      .map((tech) => tech.trim())
      .filter(Boolean),
    image: featuredImage(item),
    secondaryImage: acf.ikincil_gorsel?.url ?? acf.ikincil_gorsel ?? null,
  };
}

function normalizeService(item) {
  const acf = item.acf ?? {};
  return {
    id: item.id,
    slug: item.slug,
    title: stripHtml(item.title?.rendered),
    description: stripHtml(item.content?.rendered ?? ''),
    icon: acf.ikon_adi ?? 'Code2',
    features: (acf.ozellikler ?? '')
      .split('\n')
      .map((feature) => feature.trim())
      .filter(Boolean),
  };
}

async function writeJson(relativePath, data) {
  const target = resolve(CONTENT_DIR, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/**
 * The list view only needs a summary, so post bodies live in their own files.
 * Bundling all 70 bodies -- and later their five translations -- would ship
 * roughly a megabyte of JSON to every visitor on top of the prerendered HTML
 * that already contains the same text.
 */
export const toIndexEntry = (post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  date: post.date,
  categories: post.categories,
  tags: post.tags,
  image: post.image,
  author: post.author,
});

async function main() {
  console.log(`Fetching content from ${API_URL}`);

  const [posts, projects, services] = await Promise.all([
    fetchAll('posts', { _embed: true }),
    fetchAll('project', { _embed: true }),
    fetchAll('service', { _embed: true }),
  ]);

  const normalizedPosts = posts.map(normalizePost).sort((a, b) => b.date.localeCompare(a.date));
  const turkishPosts = normalizedPosts.filter((post) => post.lang === 'tr');
  const englishPosts = normalizedPosts.filter((post) => post.lang === 'en');

  await writeJson('index/tr.json', turkishPosts.map(toIndexEntry));
  for (const post of turkishPosts) {
    await writeJson(`posts/tr/${post.slug}.json`, post);
  }

  // Posts authored directly in English in WordPress take precedence over
  // anything the translation step would produce for the same slug.
  if (englishPosts.length > 0) {
    await writeJson('index/en.json', englishPosts.map(toIndexEntry));
    for (const post of englishPosts) {
      await writeJson(`posts/en/${post.slug}.json`, post);
    }
  }

  // Per-locale directories from the start: the translation step fills in the
  // other five, and consumers never need to know which locales exist yet.
  await writeJson('projects/tr.json', projects.map(normalizeProject));
  await writeJson('services/tr.json', services.map(normalizeService));
  await writeJson('meta.json', {
    generatedAt: new Date().toISOString(),
    source: API_URL,
    counts: { tr: turkishPosts.length, en: englishPosts.length, projects: projects.length, services: services.length },
  });

  console.log(
    `posts: ${normalizedPosts.length} (${turkishPosts.length} tr, ${englishPosts.length} en)` +
      `  projects: ${projects.length}  services: ${services.length}`,
  );
}

main().catch((error) => {
  console.error(`Content fetch failed: ${error.message}`);
  process.exit(1);
});
