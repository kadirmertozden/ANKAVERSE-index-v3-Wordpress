/**
 * Access to the committed WordPress content.
 *
 * Everything here is loaded through lazy `import.meta.glob` so Vite emits one
 * chunk per post instead of inlining every body -- and every translation of
 * every body -- into the main bundle. Route loaders call these during
 * prerendering, so the HTML still ships with the content already in it.
 */
import { DEFAULT_LOCALE } from '@/i18n/routes';

const postIndexes = import.meta.glob('../content/index/*.json');
const postBodies = import.meta.glob('../content/posts/*/*.json');
const projectFiles = import.meta.glob('../content/projects/*.json');

// Services are eager: the footer renders them on every page, and at ~3KB per
// locale the whole set costs less than the extra request would.
const serviceFiles = import.meta.glob('../content/services/*.json', { eager: true });

/**
 * Falls back to Turkish when a locale has not been translated yet.
 * Callers that must not show untranslated text check `locale` themselves --
 * this keeps pages rendering instead of blank during a partial backfill.
 */
export function getServices(locale) {
  const module =
    serviceFiles[`../content/services/${locale}.json`] ??
    serviceFiles[`../content/services/${DEFAULT_LOCALE}.json`];
  if (!module) return [];
  return module.default ?? module;
}

export async function loadProjects(locale) {
  const loader =
    projectFiles[`../content/projects/${locale}.json`] ??
    projectFiles[`../content/projects/${DEFAULT_LOCALE}.json`];
  if (!loader) return [];
  const module = await loader();
  return module.default ?? module;
}

export async function loadProject(locale, slug) {
  const projects = await loadProjects(locale);
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function projectSlugs(locale) {
  return (await loadProjects(locale)).map((project) => project.slug);
}

export async function loadPostIndex(locale) {
  const loader = postIndexes[`../content/index/${locale}.json`];
  if (!loader) return [];
  const module = await loader();
  return module.default ?? module;
}

export async function loadPost(locale, slug) {
  const loader = postBodies[`../content/posts/${locale}/${slug}.json`];
  if (!loader) return null;
  const module = await loader();
  return module.default ?? module;
}

/** Slugs a locale has posts for -- drives getStaticPaths. */
export async function postSlugs(locale) {
  return (await loadPostIndex(locale)).map((post) => post.slug);
}

/** Category list derived from the index, for the blog filter UI. */
export function categoriesFromIndex(index) {
  const seen = new Map();
  for (const post of index) {
    for (const category of post.categories ?? []) {
      if (!seen.has(category.slug)) seen.set(category.slug, category);
    }
  }
  return Array.from(seen.values());
}
