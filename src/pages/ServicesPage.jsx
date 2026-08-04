import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd, ServiceListJsonLd } from '@/components/JsonLd';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { getServices } from '@/lib/content';
import { ServiceIcon } from '@/lib/icons';
import { COMPANY } from '@/data/company';

export default function ServicesPage() {
  const { t } = useTranslation('services');
  const locale = useLocale();
  const services = getServices(locale);

  return (
    <>
      <Seo routeKey="services" />
      <ServiceListJsonLd services={services} />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('title'), path: pathFor('services', locale) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-1/3 h-full bg-gradient-to-l from-[#d4af37]/5 to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-3 block">
                {t('eyebrow')}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
              <p className="text-gray-400 text-lg leading-relaxed">{t('subtitle')}</p>
            </motion.div>

            <div className="space-y-24">
              {services.map((service, index) => (
                <motion.div
                  key={service.slug}
                  id={service.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.7 }}
                  className={`flex flex-col ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } gap-12 items-center scroll-mt-24`}
                >
                  <div className="w-full lg:w-1/2">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-[#d4af37]/10 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300" />
                      <div className="relative bg-[#25262b] p-10 rounded-2xl border border-[#333] shadow-2xl hover:border-[#d4af37]/30 transition-colors">
                        <div className="bg-[#1a1b1e] w-20 h-20 rounded-xl flex items-center justify-center mb-6 border border-[#333]">
                          <ServiceIcon name={service.icon} className="h-12 w-12 text-[#d4af37]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{service.title}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2">
                    <div className="ps-0 lg:ps-8">
                      <h3 className="text-xl font-semibold text-[#d4af37] mb-6 flex items-center gap-2">
                        <span className="h-px w-8 bg-[#d4af37]" />
                        {t('featuresHeading')}
                      </h3>
                      <ul className="space-y-4">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className="h-6 w-6 text-[#d4af37] shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="text-gray-300 text-lg">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#111] border-t border-[#333]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">{t('cta.description')}</p>
            <LocalizedLink
              to="contact"
              className="inline-block px-8 py-4 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors duration-300 shadow-lg"
            >
              {t('cta.contactUs', { ns: 'common' })}
            </LocalizedLink>
          </div>
        </section>
      </main>
    </>
  );
}
