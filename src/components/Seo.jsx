import React from 'react';
import { Head } from 'vite-react-ssg';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/i18n/LocaleProvider';
import {
  SITE_URL,
  DEFAULT_LOCALE,
  HTML_LANG,
  OG_LOCALES,
  absoluteUrl,
  alternatesFor,
  dirFor,
  pathFor,
} from '@/i18n/routes';

const DEFAULT_OG_IMAGE = '/favicon-4-Buyuk.png';
const SITE_NAME = 'ANKAVERSE';
const DESCRIPTION_MAX = 160;
const TITLE_MAX = 65;

/**
 * Descriptions built from CMS excerpts run long. Google truncates around 160
 * characters anyway, so cut at a word boundary rather than letting the snippet
 * end mid-word.
 */
function clampDescription(text = '') {
  if (text.length <= DESCRIPTION_MAX) return text;
  const cut = text.slice(0, DESCRIPTION_MAX);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, '')}…`;
}

/**
 * The single place that emits page metadata.
 *
 * Everything except the copy itself is derived from the route table, so a new
 * locale or route cannot ship with a stale canonical or a missing hreflang.
 * Pages that managed their own <Helmet> block used to drift apart this way,
 * and one wrong canonical is enough to drop a page out of the index.
 */
export default function Seo({
  routeKey,
  params = {},
  title,
  description,
  image,
  type = 'website',
  noindex = false,
  article,
}) {
  const locale = useLocale();
  const { t } = useTranslation('seo');

  const localeParams = params[locale] ?? params;
  const path = pathFor(routeKey, locale, localeParams);
  const canonical = absoluteUrl(path);

  // CMS titles are already long; the brand suffix is dropped rather than
  // pushing the title past the width Google renders.
  const brandSuffix = ` | ${SITE_NAME}`;
  const resolvedTitle = title
    ? title.length + brandSuffix.length <= TITLE_MAX
      ? `${title}${brandSuffix}`
      : title
    : t(`${routeKey}.title`);
  const resolvedDescription = clampDescription(description || t(`${routeKey}.description`));
  const resolvedImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  // Unlisted and error pages must not advertise language versions of
  // themselves -- an hreflang pointing at a noindex page is a contradiction
  // crawlers resolve by ignoring the whole set.
  const alternates = noindex ? [] : alternatesFor(routeKey, params);
  const defaultAlternate = alternates.find((a) => a.locale === DEFAULT_LOCALE);

  return (
    <Head>
      <html lang={HTML_LANG[locale]} dir={dirFor(locale)} />

      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {alternates.map((alt) => (
        <link key={alt.locale} rel="alternate" hrefLang={alt.hreflang} href={alt.url} />
      ))}
      {defaultAlternate && (
        <link rel="alternate" hrefLang="x-default" href={defaultAlternate.url} />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:locale" content={OG_LOCALES[locale]} />
      {alternates
        .filter((alt) => alt.locale !== locale)
        .map((alt) => (
          <meta key={alt.locale} property="og:locale:alternate" content={OG_LOCALES[alt.locale]} />
        ))}

      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && <meta property="article:author" content={article.author} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />
    </Head>
  );
}
