import React from 'react';
import { Navigate, useLoaderData } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BlogPostingJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { absoluteUrl, pathFor } from '@/i18n/routes';
import { COMPANY } from '@/data/company';
import NotFoundPage from '@/pages/NotFoundPage';
import slugAlternates from '@/content/slug-alternates.json';

const LOCALE_TAGS = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', ar: 'ar' };

export default function BlogDetailPage() {
  const { post, redirectTo } = useLoaderData() ?? {};
  const { t } = useTranslation('blog');
  const locale = useLocale();

  if (redirectTo) return <Navigate to={redirectTo} replace />;
  if (!post) return <NotFoundPage />;

  // Every locale gives this post a different slug, so the alternates cannot be
  // derived from the route table alone -- they come from the map the content
  // pipeline emits alongside the translations.
  const alternates = slugAlternates[post.slug] ?? { [locale]: post.slug };
  const perLocaleParams = Object.fromEntries(
    Object.entries(alternates).map(([key, slug]) => [key, { slug }]),
  );
  const url = absoluteUrl(pathFor('blogDetail', locale, { slug: post.slug }));

  return (
    <>
      <Seo
        routeKey="blogDetail"
        params={perLocaleParams}
        title={post.title}
        description={post.excerpt}
        image={post.image?.url}
        type="article"
        article={{
          publishedTime: post.date,
          modifiedTime: post.modified,
          author: post.author,
        }}
      />
      <BlogPostingJsonLd post={post} url={url} image={post.image?.url} />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('eyebrow'), path: pathFor('blog', locale) },
          { name: post.title, path: pathFor('blogDetail', locale, { slug: post.slug }) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-28 pb-20 min-h-screen">
        <article className="container mx-auto px-4 max-w-3xl">
          <LocalizedLink
            to="blog"
            className="inline-flex items-center gap-2 text-[#d4af37] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t('cta.backToBlog', { ns: 'common' })}
          </LocalizedLink>

          <header className="mb-8">
            {post.categories?.[0] && (
              <span className="inline-block bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
                {post.categories[0].name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(LOCALE_TAGS[locale] ?? locale)}
                </time>
              </span>
              {post.author && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
                  {post.author}
                </span>
              )}
            </div>
          </header>

          {post.image && (
            <img
              src={post.image.url}
              srcSet={post.image.srcset || undefined}
              sizes="(min-width: 768px) 768px, 100vw"
              alt={post.image.alt || post.title}
              width={post.image.width ?? undefined}
              height={post.image.height ?? undefined}
              className="w-full rounded-xl border border-[#333] mb-10"
            />
          )}

          {/* Body HTML comes from the owner's own WordPress install. */}
          <div
            className="prose prose-invert prose-lg max-w-none prose-a:text-[#d4af37] prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags?.length > 0 && (
            <footer className="mt-12 pt-8 border-t border-[#333]">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#d4af37]" aria-hidden="true" />
                {t('detail.tags')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="px-3 py-1 rounded-full bg-[#25262b] border border-[#333] text-xs text-gray-300"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </article>
      </main>
    </>
  );
}
