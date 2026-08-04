import React from 'react';
import { Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { COMPANY } from '@/data/company';
import { getServices } from '@/lib/content';

const QUICK_LINKS = ['home', 'about', 'services', 'projects', 'contact'];

const Footer = () => {
  const { t } = useTranslation('common');
  const locale = useLocale();
  const services = getServices(locale);

  return (
    <footer className="bg-[#111] border-t border-[#333] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/favicon-4-Buyuk.png"
                alt={t('brand')}
                width="40"
                height="40"
                loading="lazy"
                className="h-10 w-10 rounded-full border border-[#d4af37]"
              />
              <span className="text-2xl font-bold text-white tracking-widest">{t('brand')}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>

          <div>
            <span className="block text-white font-bold text-lg mb-6 border-s-4 border-[#d4af37] ps-3">
              {t('footer.quickLinks')}
            </span>
            <ul className="space-y-3">
              {QUICK_LINKS.map((routeKey) => (
                <li key={routeKey}>
                  <LocalizedLink
                    to={routeKey}
                    className="text-gray-400 hover:text-[#d4af37] transition-colors"
                  >
                    {t(`nav.${routeKey}`)}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="block text-white font-bold text-lg mb-6 border-s-4 border-[#d4af37] ps-3">
              {t('footer.ourServices')}
            </span>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <LocalizedLink
                    to="services"
                    className="text-gray-400 hover:text-[#d4af37] transition-colors"
                  >
                    {service.title}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="block text-white font-bold text-lg mb-6 border-s-4 border-[#d4af37] ps-3">
              {t('footer.contact')}
            </span>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#d4af37] shrink-0 mt-1" />
                <span className="text-gray-400 text-sm">{COMPANY.address.full}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#d4af37] shrink-0" />
                <a
                  href={`tel:${COMPANY.telephone}`}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  {COMPANY.telephoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#d4af37] shrink-0" />
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  {COMPANY.email}
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a
                href={COMPANY.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={COMPANY.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={COMPANY.social.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#333] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {COMPANY.legalName} {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <LocalizedLink to="privacy" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </LocalizedLink>
            <LocalizedLink to="terms" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
