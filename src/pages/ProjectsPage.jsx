import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { COMPANY } from '@/data/company';

export default function ProjectsPage() {
  const { projects = [] } = useLoaderData() ?? {};
  const { t } = useTranslation('projects');
  const locale = useLocale();

  return (
    <>
      <Seo routeKey="projects" />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('title'), path: pathFor('projects', locale) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        <section className="py-20 bg-[#111] relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-4 block">
                {t('eyebrow')}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('title')}</h1>
              <p className="text-xl text-gray-400 leading-relaxed">{t('subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#1a1b1e]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-[#25262b] rounded-xl overflow-hidden border border-white/5 shadow-lg hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300"
                >
                  <LocalizedLink
                    to="projectDetail"
                    params={{ slug: project.slug }}
                    className="block h-full"
                  >
                    <div className="aspect-video overflow-hidden relative bg-[#1a1b1e]">
                      {project.image && (
                        <img
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          src={project.image.url}
                          srcSet={project.image.srcset || undefined}
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          alt={project.image.alt || project.title}
                          width={project.image.width ?? undefined}
                          height={project.image.height ?? undefined}
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-300 z-10" />
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#d4af37] text-black p-3 rounded-full shadow-lg">
                          <Eye className="w-6 h-6" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                        {project.title}
                      </h2>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">{project.excerpt}</p>
                      <div className="flex items-center text-[#d4af37] text-sm font-medium mt-auto">
                        {t('card.view')}{' '}
                        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                      </div>
                    </div>
                  </LocalizedLink>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
