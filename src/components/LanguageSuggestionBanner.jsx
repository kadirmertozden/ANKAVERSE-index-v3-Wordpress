import React, { useEffect, useState } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { Globe, X } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { resolvePath } from '@/i18n/Link';
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from '@/i18n/routes';

const DISMISS_KEY = 'ankaverse:lang-suggestion-dismissed';

const SUGGESTION_TEXT = {
  en: 'View this page in English',
  de: 'Diese Seite auf Deutsch ansehen',
  fr: 'Voir cette page en français',
  es: 'Ver esta página en español',
  ar: 'عرض هذه الصفحة بالعربية',
  tr: 'Bu sayfayı Türkçe görüntüle',
};

/**
 * Suggests the visitor's language instead of redirecting to it.
 *
 * An automatic redirect sends crawlers to whatever locale the crawl happens to
 * originate from, so the Turkish home page gets indexed as German and the rest
 * is never reached. Google documents this as a thing not to do. A dismissible
 * banner gets the same visitor to the same page without touching what the
 * crawler sees.
 */
export default function LanguageSuggestionBanner() {
  const locale = useLocale();
  const matches = useMatches();
  const [suggested, setSuggested] = useState(null);

  const routeKey =
    [...matches].reverse().find((match) => match.handle?.routeKey)?.handle?.routeKey ?? 'home';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(DISMISS_KEY)) return;

    const preferred = (navigator.languages ?? [navigator.language ?? ''])
      .map((tag) => tag.split('-')[0].toLowerCase())
      .find((tag) => LOCALES.includes(tag));

    if (preferred && preferred !== locale) setSuggested(preferred);
  }, [locale]);

  if (!suggested) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, '1');
    setSuggested(null);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] bg-[#25262b] border-t border-[#d4af37]/30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3 text-gray-300">
          <Globe className="h-4 w-4 text-[#d4af37] shrink-0" />
          <Link
            to={resolvePath(routeKey, suggested)}
            hrefLang={suggested}
            onClick={dismiss}
            className="text-[#d4af37] hover:underline"
          >
            {SUGGESTION_TEXT[suggested] ?? `View in ${LOCALE_LABELS[suggested] ?? suggested}`}
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={suggested === DEFAULT_LOCALE ? 'Kapat' : 'Dismiss'}
          className="text-gray-500 hover:text-white transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
