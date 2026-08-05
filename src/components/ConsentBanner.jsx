import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie } from 'lucide-react';
import { LocalizedLink } from '@/i18n/Link';
import { CONSENT_KEY, DENIED, GRANTED, consentPayload, readConsent, writeConsent } from '@/lib/consent';

/**
 * Cookie consent, asked once and remembered.
 *
 * The tags are already loaded by the time this renders; index.html sets
 * Consent Mode to denied before any of them run, so nothing has been stored or
 * sent yet. This banner's only job is to collect the answer and pass it on.
 *
 * Accept and reject are one click each and look the same. A banner where
 * refusing takes an extra step, or is a link while accepting is a button, is
 * not valid consent under GDPR -- and a site that ships one has the compliance
 * cost without the compliance.
 *
 * There is no close button for the same reason: continuing to browse is not
 * agreement, so an unanswered banner has to stay.
 */
export default function ConsentBanner({ onDecided }) {
  const { t } = useTranslation('legal');
  const [answered, setAnswered] = useState(true);

  // Read after mount, never during render: the prerendered HTML is the same
  // for everyone and localStorage does not exist when it is generated.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let storage = null;
    try {
      storage = window.localStorage;
    } catch {
      // Locked-down browsers throw on the property itself.
    }
    const decided = readConsent(storage) !== null;
    setAnswered(decided);
    onDecided?.(decided);
  }, [onDecided]);

  if (answered) return null;

  const decide = (answer) => {
    let storage = null;
    try {
      storage = window.localStorage;
    } catch {
      /* The choice applies to this page load even if it cannot be kept. */
    }
    writeConsent(storage, answer);
    window.gtag?.('consent', 'update', consentPayload(answer));
    setAnswered(true);
    onDecided?.(true);
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[70] bg-[#25262b] border-t border-[#d4af37]/30 px-4 py-4"
      role="dialog"
      aria-live="polite"
      aria-label={t('consent.title')}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
        <div className="flex items-start gap-3 text-gray-300 flex-1">
          <Cookie className="h-4 w-4 text-[#d4af37] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t('consent.body')}{' '}
            <LocalizedLink to="privacy" className="text-[#d4af37] hover:underline">
              {t('consent.policyLink')}
            </LocalizedLink>
          </p>
        </div>
        {/* Same size, same weight, same row: refusing must cost no more than
            accepting, and the layout is where that is usually given away. */}
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => decide(DENIED)}
            className="px-5 py-2.5 rounded-lg font-bold border border-gray-600 text-gray-200 hover:border-white hover:text-white transition-colors"
          >
            {t('consent.reject')}
          </button>
          <button
            type="button"
            onClick={() => decide(GRANTED)}
            className="px-5 py-2.5 rounded-lg font-bold bg-[#d4af37] text-black hover:bg-white transition-colors"
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

export { CONSENT_KEY };
