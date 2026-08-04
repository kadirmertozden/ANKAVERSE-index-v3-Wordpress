import React, { createContext, useContext, useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './config';
import { DEFAULT_LOCALE } from './routes';

const LocaleContext = createContext(DEFAULT_LOCALE);

export const useLocale = () => useContext(LocaleContext);

/**
 * One i18next instance per locale instead of calling changeLanguage().
 *
 * Prerendering renders every locale in the same process; a shared singleton
 * whose language is mutated during render can leak one locale's strings into
 * another locale's HTML, and that page would then be served under an hreflang
 * claiming a language it isn't in.
 */
const instances = new Map();

function instanceFor(locale) {
  if (!instances.has(locale)) {
    instances.set(
      locale,
      locale === DEFAULT_LOCALE ? i18n : i18n.cloneInstance({ lng: locale, initImmediate: false }),
    );
  }
  return instances.get(locale);
}

export function LocaleProvider({ locale, children }) {
  const instance = useMemo(() => instanceFor(locale), [locale]);

  return (
    <LocaleContext.Provider value={locale}>
      <I18nextProvider i18n={instance}>{children}</I18nextProvider>
    </LocaleContext.Provider>
  );
}

export default LocaleProvider;
