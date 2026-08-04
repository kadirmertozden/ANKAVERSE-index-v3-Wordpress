import React from 'react';
import { Head } from 'vite-react-ssg';
import { useLocale } from '@/i18n/LocaleProvider';
import { COMPANY, COMPANY_SAME_AS } from '@/data/company';
import { SITE_URL, HTML_LANG, absoluteUrl, pathFor } from '@/i18n/routes';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

/** Emits a JSON-LD graph. Nodes are cross-referenced by @id so Google reads them as one entity. */
function JsonLdScript({ graph }) {
  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}
      </script>
    </Head>
  );
}

export function organizationNode(locale) {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    logo: { '@type': 'ImageObject', url: COMPANY.logo },
    image: COMPANY.logo,
    email: COMPANY.email,
    telephone: COMPANY.telephone,
    foundingDate: COMPANY.foundingDate,
    vatID: COMPANY.taxNumber,
    identifier: [
      { '@type': 'PropertyValue', name: 'MERSIS', value: COMPANY.mersis },
      { '@type': 'PropertyValue', name: 'Trade Registry No', value: COMPANY.tradeRegistryNo },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.locality,
      addressRegion: COMPANY.address.region,
      addressCountry: COMPANY.address.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: COMPANY.email,
      telephone: COMPANY.telephone,
      availableLanguage: Object.values(HTML_LANG),
    },
    founder: COMPANY.founders.map((f) => ({ '@type': 'Person', name: f.name })),
    sameAs: COMPANY_SAME_AS,
    inLanguage: HTML_LANG[locale],
  };
}

/** Organization graph. Rendered on every page via the shared layout. */
export function OrganizationJsonLd() {
  const locale = useLocale();
  return <JsonLdScript graph={[organizationNode(locale)]} />;
}

/** Home page only: identifies the site itself and exposes site search. */
export function WebSiteJsonLd() {
  const locale = useLocale();
  return (
    <JsonLdScript
      graph={[
        {
          '@type': 'WebSite',
          '@id': SITE_ID,
          url: absoluteUrl(pathFor('home', locale)),
          name: COMPANY.name,
          publisher: { '@id': ORG_ID },
          inLanguage: HTML_LANG[locale],
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${absoluteUrl(pathFor('blog', 'tr'))}?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
      ]}
    />
  );
}

/** items: [{ name, path }] -- the trail, excluding the current page's own entry is not required. */
export function BreadcrumbJsonLd({ items }) {
  return (
    <JsonLdScript
      graph={[
        {
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
          })),
        },
      ]}
    />
  );
}

export function BlogPostingJsonLd({ post, url, image }) {
  const locale = useLocale();
  return (
    <JsonLdScript
      graph={[
        {
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.modified ?? post.date,
          image: image ? [image] : undefined,
          author: { '@type': post.author ? 'Person' : 'Organization', name: post.author ?? COMPANY.name },
          publisher: { '@id': ORG_ID },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          inLanguage: HTML_LANG[locale],
        },
      ]}
    />
  );
}

export function ServiceListJsonLd({ services }) {
  const locale = useLocale();
  return (
    <JsonLdScript
      graph={services.map((service) => ({
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: { '@id': ORG_ID },
        areaServed: 'Worldwide',
        inLanguage: HTML_LANG[locale],
      }))}
    />
  );
}

export default OrganizationJsonLd;
