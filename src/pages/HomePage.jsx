import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Layers, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { WebSiteJsonLd, ServiceListJsonLd } from '@/components/JsonLd';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { getServices } from '@/lib/content';
import { ServiceIcon } from '@/lib/icons';
import { COMPANY } from '@/data/company';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const WHY_US = [
  { key: 'data', Icon: Database },
  { key: 'excellence', Icon: Layers },
  { key: 'sustainable', Icon: ShieldCheck },
];

/**
 * The corporate home page now lives at the site root.
 *
 * It previously sat at /giris behind a two-button splash screen, which meant
 * the most authoritative URL on the domain carried about twenty words and none
 * of the company's actual content.
 */
export default function HomePage() {
  const { t } = useTranslation('home');
  const locale = useLocale();
  const services = getServices(locale);

  return (
    <>
      <Seo routeKey="home" />
      <WebSiteJsonLd />
      <ServiceListJsonLd services={services} />

      <main className="bg-[#1a1b1e] text-white overflow-hidden min-h-screen flex flex-col">
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1b1e] via-[#1a1b1e]/90 to-[#1a1b1e] z-10" />
            <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl motion-safe:animate-pulse" />
            <div className="absolute bottom-1/4 end-1/4 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto relative z-20 text-center max-w-5xl">
            <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.2 }} variants={fadeIn}>
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-sm font-medium mb-8 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]" />
                </span>
                {t('hero.badge')}
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight"
              >
                {COMPANY.name} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  {t('hero.titleLead')}
                </span>
                <span className="block text-[#d4af37] mt-2">{t('hero.titleHighlight')}</span>
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                {t('hero.description')}
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <LocalizedLink
                  to="contact"
                  className="w-full sm:w-auto px-8 py-4 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#f4d678] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  {t('cta.start', { ns: 'common' })} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </LocalizedLink>
                <LocalizedLink
                  to="projects"
                  className="w-full sm:w-auto px-8 py-4 border border-white/20 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 hover:border-[#d4af37]/50 transition-all duration-300 backdrop-blur-sm"
                >
                  {t('cta.viewProjects', { ns: 'common' })}
                </LocalizedLink>
                <a
                  href={COMPANY.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 border border-[#d4af37]/40 text-[#d4af37] font-bold rounded-lg hover:bg-[#d4af37]/10 transition-all duration-300"
                >
                  {t('cta.store', { ns: 'common' })}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-[#1a1b1e] relative">
          <div className="absolute top-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-[#d4af37] font-semibold tracking-wider uppercase mb-3 text-sm">
                  {t('whyUs.eyebrow')}
                </h2>
                <p className="text-3xl md:text-4xl font-bold text-white mb-6">{t('whyUs.title')}</p>
                <p className="text-gray-400 mb-8 leading-relaxed">{t('whyUs.description')}</p>

                <div className="space-y-6">
                  {WHY_US.map(({ key, Icon }) => (
                    <div
                      key={key}
                      className="flex gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-[#d4af37]/30"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{t(`whyUs.points.${key}.title`)}</h3>
                        <p className="text-sm text-gray-400">{t(`whyUs.points.${key}.description`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/20 to-purple-500/20 blur-3xl opacity-30 rounded-full" />
                <h2 className="sr-only">{t('servicesHeading')}</h2>
                <div className="relative grid sm:grid-cols-2 gap-4">
                  {services.slice(0, 6).map((service, index) => (
                    <div
                      key={service.slug}
                      className={`p-6 rounded-2xl bg-[#222] border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300 group ${
                        index === services.length - 1 && services.length % 2 !== 0 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <div className="mb-4 text-[#d4af37]">
                        <ServiceIcon name={service.icon} className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-3">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#111] border-t border-[#333]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('cta.title')}</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">{t('cta.description')}</p>
            <LocalizedLink
              to="contact"
              className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[#d4af37] to-[#f4d678] text-black font-bold text-lg rounded-lg shadow-lg transition-all duration-300"
            >
              {t('cta.quote', { ns: 'common' })}{' '}
              <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
            </LocalizedLink>
          </div>
        </section>
      </main>
    </>
  );
}
