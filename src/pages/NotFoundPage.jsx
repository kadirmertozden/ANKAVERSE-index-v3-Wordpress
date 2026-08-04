import React from 'react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { LocalizedLink } from '@/i18n/Link';

/**
 * Unknown paths used to redirect to the home page with a 200 response, which
 * Google reads as a soft 404 and holds against the whole site. This page is
 * noindex and the server returns a real 404 status with it.
 */
export default function NotFoundPage() {
  const { t } = useTranslation('common');

  return (
    <>
      <Seo routeKey="notFound" noindex />
      <main className="bg-[#1a1b1e] text-white pt-32 pb-24 min-h-screen flex items-center">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-[#d4af37] font-bold tracking-widest text-sm uppercase mb-4">404</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('notFound.heading')}</h1>
          <p className="text-gray-400 mb-10 leading-relaxed">{t('notFound.description')}</p>
          <LocalizedLink
            to="home"
            className="inline-block px-8 py-4 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors"
          >
            {t('cta.backHome')}
          </LocalizedLink>
        </div>
      </main>
    </>
  );
}
