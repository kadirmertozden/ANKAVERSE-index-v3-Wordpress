import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from './LocaleProvider';
import { DEFAULT_LOCALE, ROUTES, localesForRoute, pathFor } from './routes';
import slugAlternates from '@/content/slug-alternates.json';

/**
 * Resolve a route key to a path in a locale, falling back to a locale the
 * route actually exists in.
 *
 * The blog ships in fewer locales than the rest of the site while the
 * translation backfill catches up, so a German visitor's "Blog" link has to
 * land on /en/blog rather than a route that was never generated.
 */
export function resolvePath(routeKey, locale, params = {}) {
  const available = localesForRoute(routeKey);
  if (available.includes(locale)) return pathFor(routeKey, locale, params);
  const fallback = available.includes('en') ? 'en' : available[0] ?? DEFAULT_LOCALE;
  return pathFor(routeKey, fallback, params);
}

/**
 * The current page's equivalent in another locale.
 *
 * Detail pages carry a different slug per locale, so the target cannot come
 * from the route table alone -- it comes from the slug map the content
 * pipeline emits. When no translation exists the section's list page is used,
 * which is always generated.
 *
 * Callers must go through this rather than resolvePath(): passing a detail
 * route without its slug throws, and because the language banner did exactly
 * that, every blog and project page crashed on hydration for any visitor whose
 * browser language differed from the page's.
 */
export function alternatePathFor(routeKey, targetLocale, params = {}) {
  const route = ROUTES[routeKey];

  if (route?.param) {
    const currentSlug = params[route.param];
    const translated = currentSlug ? slugAlternates[currentSlug]?.[targetLocale] : null;
    if (translated) {
      return resolvePath(routeKey, targetLocale, { [route.param]: translated });
    }
    return resolvePath(route.parent, targetLocale);
  }

  return resolvePath(routeKey, targetLocale);
}

export function useLocalizedPath() {
  const locale = useLocale();
  return (routeKey, params) => resolvePath(routeKey, locale, params);
}

/** <Link> that takes a route key instead of a hardcoded path. */
export const LocalizedLink = React.forwardRef(function LocalizedLink(
  { to, params, ...props },
  ref,
) {
  const locale = useLocale();
  return <Link ref={ref} to={resolvePath(to, locale, params)} {...props} />;
});

export default LocalizedLink;
