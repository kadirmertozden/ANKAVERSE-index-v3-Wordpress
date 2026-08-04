import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LOCALES, DEFAULT_LOCALE } from './routes';

/**
 * Translations are bundled eagerly rather than lazy-loaded. Prerendering runs
 * the same code in Node, and an async resource loader would race the render
 * pass and emit pages with raw translation keys in them.
 */
const modules = import.meta.glob('../locales/*/*.json', { eager: true });

const resources = {};
for (const [filePath, module] of Object.entries(modules)) {
  const match = filePath.match(/\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, locale, namespace] = match;
  resources[locale] ??= {};
  resources[locale][namespace] = module.default ?? module;
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    supportedLngs: LOCALES,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'common',
    // A missing key must be visible, not silently replaced by Turkish text
    // that would then be served under an English hreflang.
    fallbackNS: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
