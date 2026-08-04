import React from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { COMPANY } from '@/data/company';

const LOCALE_TAGS = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', ar: 'ar' };

/**
 * Privacy and terms share a structure, so they share a renderer and differ
 * only by which section list they read out of the legal namespace.
 */
export default function LegalPage({ routeKey, documentKey }) {
  const { t, i18n } = useTranslation('legal');
  const locale = useLocale();

  const sections = t(`${documentKey}.sections`, { returnObjects: true });
  const title = t(`${documentKey}.title`);
  const updated = new Date().toLocaleDateString(LOCALE_TAGS[locale] ?? i18n.language);

  return (
    <>
      <Seo routeKey={routeKey} />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: title, path: pathFor(routeKey, locale) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#d4af37]">{title}</h1>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p>
              {t('lastUpdated')}: {updated}
            </p>

            {(Array.isArray(sections) ? sections : []).map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-white mt-8 mb-3">{section.heading}</h2>
                {(section.body ?? []).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <p>
              <a href={`mailto:${COMPANY.email}`} className="text-[#d4af37]">
                {COMPANY.email}
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
