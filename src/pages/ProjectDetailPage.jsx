import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { ArrowLeft, Calendar, Code2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { COMPANY } from '@/data/company';
import NotFoundPage from '@/pages/NotFoundPage';

const LOCALE_TAGS = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', ar: 'ar' };

export default function ProjectDetailPage() {
  const { project } = useLoaderData() ?? {};
  const { t } = useTranslation('projects');
  const locale = useLocale();

  if (!project) return <NotFoundPage />;

  const meta = [
    project.client && { key: 'client', Icon: User, value: project.client },
    project.date && {
      key: 'date',
      Icon: Calendar,
      value: new Date(project.date).toLocaleDateString(LOCALE_TAGS[locale] ?? locale),
    },
  ].filter(Boolean);

  return (
    <>
      <Seo
        routeKey="projectDetail"
        params={{ slug: project.slug }}
        title={`${project.title} | ${COMPANY.name}`}
        description={project.excerpt}
        image={project.image?.url}
      />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('title'), path: pathFor('projects', locale) },
          { name: project.title, path: pathFor('projectDetail', locale, { slug: project.slug }) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-28 pb-20 min-h-screen">
        <article className="container mx-auto px-4 max-w-4xl">
          <LocalizedLink
            to="projects"
            className="inline-flex items-center gap-2 text-[#d4af37] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t('cta.backToProjects', { ns: 'common' })}
          </LocalizedLink>

          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{project.title}</h1>
          {project.excerpt && <p className="text-lg text-gray-400 mb-10">{project.excerpt}</p>}

          {project.image && (
            <img
              src={project.image.url}
              srcSet={project.image.srcset || undefined}
              sizes="(min-width: 1024px) 896px, 100vw"
              alt={project.image.alt || project.title}
              width={project.image.width ?? undefined}
              height={project.image.height ?? undefined}
              className="w-full rounded-xl border border-[#333] mb-10"
            />
          )}

          {(meta.length > 0 || project.technologies?.length > 0) && (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 bg-[#25262b] rounded-xl border border-[#333] p-6">
              {meta.map((item) => (
                <div key={item.key}>
                  <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-2">
                    <item.Icon className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
                    {t(`detail.${item.key}`)}
                  </dt>
                  <dd className="text-white font-semibold">{item.value}</dd>
                </div>
              ))}
              {project.technologies?.length > 0 && (
                <div className="sm:col-span-3">
                  <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 mb-2">
                    <Code2 className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
                    {t('detail.technologies')}
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-full bg-[#1a1b1e] border border-[#333] text-xs text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <h2 className="text-2xl font-bold mb-4">{t('detail.overview')}</h2>
          {/* Body HTML comes from the owner's own WordPress install. */}
          <div
            className="prose prose-invert prose-lg max-w-none prose-a:text-[#d4af37] prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        </article>
      </main>
    </>
  );
}
