/**
 * Single source of truth for locales and URL slugs.
 *
 * The router, the hreflang alternates and sitemap.xml are all derived from
 * this file. Keeping them in one place is what makes it structurally
 * impossible for them to drift apart -- the most common failure in
 * multilingual SEO is a sitemap or hreflang set that no longer matches the
 * routes actually shipped.
 */

export const SITE_URL = 'https://ankaverse.com.tr';

export const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ar'];
export const DEFAULT_LOCALE = 'tr';
export const RTL_LOCALES = ['ar'];

/**
 * Locales whose blog content exists. Phase 4 ships tr+en; phase 5 adds the
 * rest once the DeepL quota renews. Until then no blog route is generated for
 * the other locales -- showing the English posts under /de/blog would create
 * duplicate content across five URLs.
 */
export const BLOG_LOCALES = ['tr', 'en'];

export const LOCALE_LABELS = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
};

/** BCP-47 tags for <html lang> and hreflang. */
export const HTML_LANG = {
  tr: 'tr',
  en: 'en',
  de: 'de',
  fr: 'fr',
  es: 'es',
  ar: 'ar',
};

/** Open Graph locale codes. */
export const OG_LOCALES = {
  tr: 'tr_TR',
  en: 'en_US',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  ar: 'ar_AR',
};

/**
 * Slugs per route per locale.
 *
 * Arabic uses Latin slugs rather than Arabic script on purpose: Arabic paths
 * survive as percent-encoded URLs, which are unreadable when shared and a
 * recurring source of breakage in static file serving and tooling. The ranking
 * cost is small -- Google ranks on content, not URL keywords -- and the /ar/
 * prefix already disambiguates the locale.
 */
export const ROUTES = {
  home: {
    slugs: { tr: '', en: '', de: '', fr: '', es: '', ar: '' },
  },
  about: {
    slugs: {
      tr: 'hakkimizda',
      en: 'about-us',
      de: 'ueber-uns',
      fr: 'a-propos',
      es: 'sobre-nosotros',
      ar: 'about-us',
    },
  },
  services: {
    slugs: {
      tr: 'hizmetler',
      en: 'services',
      de: 'leistungen',
      fr: 'services',
      es: 'servicios',
      ar: 'services',
    },
  },
  projects: {
    slugs: {
      tr: 'projeler',
      en: 'projects',
      de: 'projekte',
      fr: 'projets',
      es: 'proyectos',
      ar: 'projects',
    },
  },
  projectDetail: {
    parent: 'projects',
    param: 'slug',
  },
  blog: {
    locales: BLOG_LOCALES,
    slugs: {
      tr: 'blog',
      en: 'blog',
      de: 'blog',
      fr: 'blog',
      es: 'blog',
      ar: 'blog',
    },
  },
  blogDetail: {
    parent: 'blog',
    param: 'slug',
    locales: BLOG_LOCALES,
  },
  contact: {
    slugs: {
      tr: 'iletisim',
      en: 'contact',
      de: 'kontakt',
      fr: 'contact',
      es: 'contacto',
      ar: 'contact',
    },
  },
  privacy: {
    slugs: {
      tr: 'gizlilik-politikasi',
      en: 'privacy-policy',
      de: 'datenschutz',
      fr: 'politique-de-confidentialite',
      es: 'politica-de-privacidad',
      ar: 'privacy-policy',
    },
  },
  terms: {
    slugs: {
      tr: 'kullanim-sartlari',
      en: 'terms-of-use',
      de: 'nutzungsbedingungen',
      fr: 'conditions-utilisation',
      es: 'terminos-de-uso',
      ar: 'terms-of-use',
    },
  },

  // Unlisted routes: rendered, but kept out of the sitemap and never given an
  // hreflang set. They are still declared here so <Seo> can resolve a canonical
  // for them instead of throwing.
  notFound: {
    unlisted: true,
    slugs: { tr: '404', en: '404', de: '404', fr: '404', es: '404', ar: '404' },
  },
  vaktiaPrivacy: {
    unlisted: true,
    locales: ['tr'],
    slugs: { tr: 'Vaktia/PRIVACY_POLICY' },
  },
};

export const isUnlisted = (routeKey) => Boolean(ROUTES[routeKey]?.unlisted);

/** Route keys that belong in the sitemap. */
export const listedRouteKeys = () => Object.keys(ROUTES).filter((key) => !isUnlisted(key));

export const isRTL = (locale) => RTL_LOCALES.includes(locale);

export const dirFor = (locale) => (isRTL(locale) ? 'rtl' : 'ltr');

/** Locales a given route is published in. */
export function localesForRoute(routeKey) {
  const route = ROUTES[routeKey];
  if (!route) throw new Error(`Unknown route key: ${routeKey}`);
  if (route.locales) return route.locales;
  if (route.parent) return localesForRoute(route.parent);
  return LOCALES;
}

/** Slug of a route in a locale, resolving detail routes through their parent. */
function slugFor(routeKey, locale) {
  const route = ROUTES[routeKey];
  if (!route) throw new Error(`Unknown route key: ${routeKey}`);
  if (route.parent) {
    const parentSlug = slugFor(route.parent, locale);
    return { base: parentSlug.base, isDetail: true };
  }
  const slug = route.slugs[locale];
  if (slug === undefined) {
    throw new Error(`Route "${routeKey}" has no slug for locale "${locale}"`);
  }
  return { base: slug, isDetail: false };
}

/**
 * Build the path for a route in a locale.
 * The default locale lives at the root with no prefix so existing Turkish
 * URLs -- and whatever ranking they have accumulated -- stay untouched.
 */
export function pathFor(routeKey, locale, params = {}) {
  const { base, isDetail } = slugFor(routeKey, locale);
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;

  const segments = [];
  if (base) segments.push(base);
  if (isDetail) {
    const param = ROUTES[routeKey].param;
    const value = params[param];
    if (!value) throw new Error(`Route "${routeKey}" requires a "${param}" param`);
    segments.push(value);
  }

  const path = `${prefix}/${segments.join('/')}`.replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

export const absoluteUrl = (path) => `${SITE_URL}${path === '/' ? '/' : path}`;

/**
 * All published language versions of a route.
 * Used for both <link rel="alternate" hreflang> and the sitemap's xhtml:link
 * entries, so the two can never disagree.
 */
export function alternatesFor(routeKey, params = {}) {
  const paramName = ROUTES[routeKey]?.param;

  return localesForRoute(routeKey)
    .map((locale) => {
      const localeParams = params[locale] ?? params;

      // A detail page only has a counterpart in locales whose translation
      // exists. Emitting an hreflang for a URL that was never generated is
      // worse than emitting none: crawlers discard the entire set.
      if (paramName && !localeParams?.[paramName]) return null;

      const path = pathFor(routeKey, locale, localeParams);
      return { locale, hreflang: HTML_LANG[locale], path, url: absoluteUrl(path) };
    })
    .filter(Boolean);
}

/** Locale of a pathname, for the language switcher and locale provider. */
export function localeFromPath(pathname) {
  const first = pathname.split('/').filter(Boolean)[0];
  return LOCALES.includes(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}
