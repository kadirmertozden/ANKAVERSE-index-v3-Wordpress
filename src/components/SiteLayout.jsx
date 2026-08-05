import React, { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import LocaleProvider from '@/i18n/LocaleProvider';
import { OrganizationJsonLd } from '@/components/JsonLd';
import ConsentBanner from '@/components/ConsentBanner';
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
  // Both strips sit at the bottom of the viewport, so they cannot both be
  // there. Consent goes first: it is the one the visitor has to answer, and
  // stacking a language suggestion on top of it would obscure the choice.
  const [consentSettled, setConsentSettled] = useState(false);
  const handleConsentDecided = useCallback((decided) => setConsentSettled(decided), []);

  return (
    <LocaleProvider locale={locale}>
      <OrganizationJsonLd />
      <ConsentBanner onDecided={handleConsentDecided} />
      {consentSettled && <LanguageSuggestionBanner />}
      <Navbar />
      <Outlet />
      <Footer />
    </LocaleProvider>
  );
}
