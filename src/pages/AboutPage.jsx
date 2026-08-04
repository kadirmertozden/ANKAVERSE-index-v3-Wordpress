import React from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Building2,
  Calendar,
  Compass,
  Crown,
  FileText,
  Hash,
  Landmark,
  MapPin,
  Target,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { COMPANY } from '@/data/company';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AboutPage() {
  const { t } = useTranslation('about');
  const locale = useLocale();

  const officialInfo = [
    { key: 'legalName', value: COMPANY.legalName, Icon: Building2 },
    { key: 'mersis', value: COMPANY.mersis, Icon: Hash },
    { key: 'tradeRegistryNo', value: COMPANY.tradeRegistryNo, Icon: FileText },
    { key: 'tax', value: `${COMPANY.taxOffice} / ${COMPANY.taxNumber}`, Icon: Landmark },
    { key: 'tradeRegistryOffice', value: COMPANY.tradeRegistryOffice, Icon: Landmark },
    { key: 'companyType', value: t('official.companyType'), Icon: Building2 },
    { key: 'foundingDate', value: '09.07.2025', Icon: Calendar },
    { key: 'director', value: COMPANY.founders[0].name, Icon: Crown },
    { key: 'boardChair', value: COMPANY.founders[1].name, Icon: Crown },
    { key: 'address', value: COMPANY.address.full, Icon: MapPin },
    { key: 'brand', value: COMPANY.name, Icon: Award },
  ];

  const founders = [
    { ...COMPANY.founders[0], shareKey: 'majority', Icon: Crown },
    { ...COMPANY.founders[1], shareKey: 'founding', Icon: Award },
  ];

  return (
    <>
      <Seo routeKey="about" />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('title'), path: pathFor('about', locale) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen flex flex-col">
        <section className="relative py-20 bg-[#111] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }}>
              <span className="text-[#d4af37] font-bold tracking-widest text-sm uppercase mb-3 block">
                {t('eyebrow')}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t('subtitle')}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="w-full text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
                <span className="w-1 h-8 bg-[#d4af37] rounded-full block" />
                {t('profile.title')}
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed text-lg max-w-4xl mx-auto">
                <p>{t('profile.p1')}</p>
                <p>{t('profile.p2')}</p>
                <p>{t('profile.p3')}</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-[#25262b] relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { key: 'vision', Icon: Compass },
                { key: 'mission', Icon: Target },
              ].map(({ key, Icon }, index) => (
                <motion.div
                  key={key}
                  className="bg-[#1a1b1e] p-8 md:p-10 rounded-2xl border border-[#333] hover:border-[#d4af37]/50 transition-all duration-300 group relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="absolute top-0 end-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="w-32 h-32 text-[#d4af37]" aria-hidden="true" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37] mb-6 border border-[#d4af37]/20">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-white">{t(`${key}.title`)}</h2>
                    <p className="text-gray-400 leading-relaxed">{t(`${key}.description`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#1a1b1e] border-b border-[#333]">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <span className="w-1 h-8 bg-[#d4af37] rounded-full block" />
                {t('team.title')}
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{t('team.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {founders.map((founder, index) => (
                <motion.div
                  key={founder.name}
                  className="bg-[#25262b] p-8 rounded-2xl border border-[#333] hover:border-[#d4af37]/50 transition-all duration-300 relative overflow-hidden group"
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-start">
                    <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37] border border-[#d4af37]/20 shrink-0">
                      <span className="font-bold text-3xl">{founder.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{founder.name}</h3>
                      <div className="text-[#d4af37] font-medium mb-4 flex items-center justify-center sm:justify-start gap-2">
                        <founder.Icon className="w-4 h-4" aria-hidden="true" />
                        {t(`team.roles.${founder.roleKey}`)}
                      </div>
                      <div className="bg-[#1a1b1e] p-3 rounded-lg border border-[#333] w-full">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {t('team.shareStructure')}
                        </div>
                        <div className="text-white font-bold flex items-center justify-center sm:justify-start gap-2">
                          <span className="w-2 h-2 bg-[#d4af37] rounded-full" />
                          {t(`team.shares.${founder.shareKey}`, { share: founder.share })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#1a1b1e]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">{t('official.title')}</h2>
              <div className="h-1 w-16 bg-[#d4af37] mx-auto rounded-full" />
              <p className="text-gray-400 mt-4 text-sm">{t('official.subtitle')}</p>
            </div>

            <dl className="bg-[#25262b] rounded-xl border border-[#333] overflow-hidden text-sm">
              {officialInfo.map((item, index) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-4 p-4 ${
                    index !== officialInfo.length - 1 ? 'border-b border-[#333]' : ''
                  } hover:bg-[#2c2e33] transition-colors`}
                >
                  <div className="text-[#d4af37] bg-[#d4af37]/10 p-2 rounded-md shrink-0">
                    <item.Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <dt className="text-gray-400 font-medium w-32 shrink-0">
                    {t(`official.labels.${item.key}`)}:
                  </dt>
                  <dd className="text-white font-semibold flex-grow break-words">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </>
  );
}
