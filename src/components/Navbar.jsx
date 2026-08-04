import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LocalizedLink, useLocalizedPath } from '@/i18n/Link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const MENU_ROUTES = ['home', 'about', 'services', 'projects', 'blog', 'contact'];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation('common');
  const pathFor = useLocalizedPath();

  const toggleMenu = () => setIsOpen((open) => !open);
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 bg-[#1a1b1e]/95 backdrop-blur-md border-b border-[#d4af37]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <LocalizedLink to="home" className="flex items-center gap-2 group">
              <img
                src="/favicon-4-Buyuk.png"
                alt={t('brand')}
                width="48"
                height="48"
                className="h-12 w-12 rounded-full border-2 border-[#d4af37] group-hover:border-white transition-colors duration-300"
              />
              <span className="font-bold text-2xl tracking-widest text-white group-hover:text-[#d4af37] transition-colors duration-300">
                {t('brand')}
              </span>
            </LocalizedLink>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {MENU_ROUTES.map((routeKey) => (
              <LocalizedLink
                key={routeKey}
                to={routeKey}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  isActive(pathFor(routeKey))
                    ? 'text-[#d4af37]'
                    : 'text-gray-300 hover:text-[#d4af37]',
                )}
              >
                {t(`nav.${routeKey}`)}
              </LocalizedLink>
            ))}

            <LanguageSwitcher />

            <LocalizedLink
              to="contact"
              className="ms-2 px-6 py-2 bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black rounded-full font-medium transition-all duration-300"
            >
              {t('cta.quote')}
            </LocalizedLink>
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={t('nav.menu')}
              aria-expanded={isOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1a1b1e] border-b border-[#d4af37]/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {MENU_ROUTES.map((routeKey) => (
                <LocalizedLink
                  key={routeKey}
                  to={routeKey}
                  onClick={toggleMenu}
                  className={cn(
                    'block px-3 py-4 text-base font-medium rounded-md',
                    isActive(pathFor(routeKey))
                      ? 'text-[#d4af37]'
                      : 'text-gray-300 hover:text-[#d4af37] hover:bg-gray-800',
                  )}
                >
                  {t(`nav.${routeKey}`)}
                </LocalizedLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
