/**
 * Locales whose translation files are complete and therefore safe to publish.
 *
 * Maintained by tools/translate-locales.js -- it adds a locale here only once
 * every namespace has been translated.
 *
 * A locale that is routed but not translated is worse than a missing locale:
 * the page ships Turkish copy under `<html lang="de">` and a German hreflang,
 * which is a duplicate-content signal and tells Google the site lies about its
 * own content. Gating on real files makes that state unreachable rather than
 * merely unlikely.
 */
export const PUBLISHED_LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ar'];

/** Every locale the site is designed for, published or not. */
export const PLANNED_LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ar'];
