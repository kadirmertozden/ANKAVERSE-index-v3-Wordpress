import React from 'react';
import { useRouteError } from 'react-router-dom';
import i18n from '@/i18n/config';
import { DEFAULT_LOCALE, LOCALES, pathFor } from '@/i18n/routes';
import { isStaleDeploymentError, shouldAttemptReload } from '@/lib/stale-deploy';

/**
 * The router's last resort.
 *
 * Without an `errorElement` React Router answers any loader or render failure
 * with its own development screen -- a bare "Unexpected Application Error!"
 * over the raw exception -- in place of the entire site. Visitors saw that
 * screen carrying `SyntaxError: Unexpected token '<', "<!DOCTYPE "...` on
 * ankaverse.com.tr, because vite-react-ssg's client loader had fetched a
 * build-hashed manifest that the current deploy no longer serves.
 *
 * That class of failure is not a bug in the page: the tab is running a build
 * that has been replaced. Reloading picks up the current one, so the boundary
 * does that instead of showing anything -- once, so that a deploy which is
 * genuinely missing files cannot put the browser in a reload loop.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();
  const stale = isStaleDeploymentError(error);

  // 'reloading' renders nothing: the document is on its way out and the error
  // text would only flash. Anything we cannot reload away is shown properly.
  const [phase, setPhase] = React.useState(stale ? 'reloading' : 'error');

  React.useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  React.useEffect(() => {
    if (!stale || typeof window === 'undefined') return;

    let session = null;
    try {
      session = window.sessionStorage;
    } catch {
      // Locked-down browsers throw on the property itself, before getItem.
    }

    if (shouldAttemptReload(session)) {
      window.location.reload();
      return;
    }
    setPhase('error');
  }, [stale]);

  const locale = localeFromPath(
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );

  if (phase === 'reloading') {
    return <div className="min-h-screen bg-[#1a1b1e]" />;
  }

  // getFixedT rather than useTranslation: this boundary renders above
  // SiteLayout, so the locale context the rest of the app reads does not exist
  // here and the language has to come from the URL.
  const t = i18n.getFixedT(locale, 'common');

  return (
    <main
      className="bg-[#1a1b1e] text-white min-h-screen flex items-center"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <h1 className="text-2xl md:text-4xl font-bold mb-6">{t('state.error')}</h1>
        {/* A real navigation, not a client-side one: it re-requests the HTML,
            which is the only way a tab on a replaced build gets a working one. */}
        <a
          href={pathFor('home', locale)}
          className="inline-block px-8 py-4 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors"
        >
          {t('cta.backHome')}
        </a>
      </div>
    </main>
  );
}

function localeFromPath(pathname) {
  const [, first] = pathname.split('/');
  return LOCALES.includes(first) ? first : DEFAULT_LOCALE;
}
