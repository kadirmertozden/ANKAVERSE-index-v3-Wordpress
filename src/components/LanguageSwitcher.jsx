import React, { useState } from 'react';
import { Link, useMatches, useParams } from 'react-router-dom';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleProvider';
import { alternatePathFor } from '@/i18n/Link';
import { LOCALES, LOCALE_LABELS, ROUTES, localesForRoute } from '@/i18n/routes';

export default function LanguageSwitcher({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const matches = useMatches();
  const params = useParams();

  const routeKey =
    [...matches].reverse().find((match) => match.handle?.routeKey)?.handle?.routeKey ?? 'home';

  // A locale is offered only if it can lead somewhere real: either this route
  // exists in it, or the route has a parent list page that does.
  const options = LOCALES.filter(
    (candidate) => localesForRoute(routeKey).includes(candidate) || ROUTES[routeKey]?.parent,
  );

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Language"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-[#d4af37] transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 min-w-[11rem] rounded-lg border border-[#d4af37]/20 bg-[#1a1b1e] py-1 shadow-xl z-50"
          >
            {options.map((option) => (
              <li key={option}>
                <Link
                  to={alternatePathFor(routeKey, option, params)}
                  hrefLang={option}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#d4af37] transition-colors"
                >
                  <span>{LOCALE_LABELS[option]}</span>
                  {option === locale && <Check className="h-4 w-4 text-[#d4af37]" />}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
