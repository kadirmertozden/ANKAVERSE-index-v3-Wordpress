/**
 * Cookie consent state.
 *
 * GDPR and KVKK both want a choice made before anything non-essential runs,
 * and both count silence as refusal. Google Consent Mode v2 is how that
 * refusal reaches gtag: the tags still load, but storage and identifiers stay
 * off until the visitor says otherwise, so a refusal costs measurement rather
 * than breaking the page or the ads.
 *
 * Every uncertain path here resolves to denial. A bug that reports consent
 * where there is none sends data for someone who refused and leaves no trace
 * on the page, which is the one failure nobody would notice.
 *
 * Kept free of browser and bundler dependencies so tools/verify-consent.js can
 * exercise it under plain node. The same logic runs twice: once inline in
 * index.html before the tags load, and once here for the banner.
 */
export const CONSENT_KEY = 'ankaverse:consent';

export const GRANTED = 'granted';
export const DENIED = 'denied';

/**
 * The visitor's answer, or null if they have not given one.
 *
 * @param {{getItem: (k: string) => string | null} | null} storage
 * @returns {'granted' | 'denied' | null}
 */
export function readConsent(storage) {
  if (!storage) return null;

  try {
    const value = storage.getItem(CONSENT_KEY);
    return value === GRANTED || value === DENIED ? value : null;
  } catch {
    // Safari in private browsing throws on the property itself. Showing the
    // banner again is harmless; assuming consent would not be.
    return null;
  }
}

/**
 * @param {{setItem: (k: string, v: string) => void} | null} storage
 * @param {'granted' | 'denied'} value
 */
export function writeConsent(storage, value) {
  if (value !== GRANTED && value !== DENIED) {
    throw new Error(`Consent must be "${GRANTED}" or "${DENIED}", got ${JSON.stringify(value)}`);
  }
  if (!storage) return;

  try {
    storage.setItem(CONSENT_KEY, value);
  } catch {
    // Unable to remember the choice. The banner returns on the next page,
    // which is worse manners than it is a compliance problem.
  }
}

/**
 * The four signals Consent Mode v2 reads.
 *
 * ad_user_data and ad_personalization are the pair v2 added, and they are the
 * ones most often left out -- a banner that sets only the original two looks
 * like consent management while advertising identifiers carry on.
 *
 * @param {unknown} answer - anything but 'granted' is refusal.
 */
export function consentPayload(answer) {
  const state = answer === GRANTED ? GRANTED : DENIED;
  return {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  };
}
