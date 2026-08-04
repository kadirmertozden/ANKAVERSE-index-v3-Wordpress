import React from 'react';
import { Outlet } from 'react-router-dom';
import LocaleProvider from '@/i18n/LocaleProvider';
import { OrganizationJsonLd } from '@/components/JsonLd';
import LanguageSuggestionBanner from '@/components/LanguageSuggestionBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Per-locale layout route.
 *
 * Navbar, Footer and the Organization graph live here rather than in each
 * page: they are identical everywhere, and the previous arrangement -- each
 * page importing them itself -- is how a page ends up shipping without its
 * structured data.
 */
export default function SiteLayout({ locale }) {
  return (
    <LocaleProvider locale={locale}>
      <OrganizationJsonLd />
      <LanguageSuggestionBanner />
      <Navbar />
      <Outlet />
      <Footer />
    </LocaleProvider>
  );
}
