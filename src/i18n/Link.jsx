import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from './LocaleProvider';
import { DEFAULT_LOCALE, localesForRoute, pathFor } from './routes';

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
