import React, { useMemo, useState } from 'react';
import { useLoaderData, useSearchParams } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '@/components/Seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { LocalizedLink } from '@/i18n/Link';
import { useLocale } from '@/i18n/LocaleProvider';
import { pathFor } from '@/i18n/routes';
import { categoriesFromIndex } from '@/lib/content';
import { COMPANY } from '@/data/company';

const PAGE_SIZE = 12;
const LOCALE_TAGS = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', ar: 'ar' };
const WORDS_PER_MINUTE = 200;

const readMinutes = (post) =>
  Math.max(1, Math.round((post.excerpt ?? '').split(/\s+/).length / WORDS_PER_MINUTE) || 1);

export default function BlogPage() {
  const { posts = [] } = useLoaderData() ?? {};
  const { t } = useTranslation('blog');
  const locale = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const categories = useMemo(() => categoriesFromIndex(posts), [posts]);
  const dateFormat = LOCALE_TAGS[locale] ?? locale;

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return posts.filter((post) => {
      const matchesCategory =
        !category || (post.categories ?? []).some((item) => item.slug === category);
      const matchesQuery =
        !needle ||
        post.title.toLocaleLowerCase(locale).includes(needle) ||
        (post.excerpt ?? '').toLocaleLowerCase(locale).includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category, locale]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
    setVisible(PAGE_SIZE);
  };

  return (
    <>
      <Seo routeKey="blog" />
      <BreadcrumbJsonLd
        items={[
          { name: COMPANY.name, path: pathFor('home', locale) },
          { name: t('title'), path: pathFor('blog', locale) },
        ]}
      />

      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-2 block">
                {t('eyebrow')}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h1>
              <p className="text-gray-400 max-w-2xl mx-auto">{t('subtitle')}</p>
            </div>

            <div className="max-w-3xl mx-auto mb-10">
              <label className="relative block">
                <span className="sr-only">{t('search.placeholder')}</span>
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => updateParam('q', event.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full bg-[#25262b] border border-[#333] rounded-full ps-11 pe-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </label>

              <div className="flex flex-wrap gap-2 justify-center mt-6">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    category ? 'bg-[#25262b] text-gray-300 hover:text-white' : 'bg-[#d4af37] text-black font-bold'
                  }`}
                >
                  {t('categories.all')}
                </button>
                {categories.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => updateParam('category', item.slug)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      category === item.slug
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'bg-[#25262b] text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {(query || category) && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setSearchParams({}, { replace: true })}
                    className="flex items-center gap-2 bg-white/5 text-gray-300 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> {t('search.clear')}
                  </button>
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-16">{t('search.noResults')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.slice(0, visible).map((post) => (
                  <LocalizedLink
                    key={post.slug}
                    to="blogDetail"
                    params={{ slug: post.slug }}
                    className="group"
                  >
                    <article className="bg-[#25262b] h-full rounded-xl overflow-hidden border border-[#333] group-hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col shadow-lg">
                      <div className="aspect-video bg-[#1a1b1e] overflow-hidden relative">
                        {post.categories?.[0] && (
                          <span className="absolute top-4 start-4 z-10 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full">
                            {post.categories[0].name}
                          </span>
                        )}
                        {post.image && (
                          <img
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            alt={post.image.alt || post.title}
                            src={post.image.url}
                            srcSet={post.image.srcset || undefined}
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            width={post.image.width ?? undefined}
                            height={post.image.height ?? undefined}
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#d4af37]" aria-hidden="true" />
                            <time dateTime={post.date}>
                              {new Date(post.date).toLocaleDateString(dateFormat)}
                            </time>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#d4af37]" aria-hidden="true" />
                            {t('card.readTime', { count: readMinutes(post) })}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold mb-3 text-white group-hover:text-[#d4af37] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <span className="text-[#d4af37] text-sm font-bold flex items-center gap-1 mt-auto pt-4 border-t border-white/5">
                          {t('card.readMore')}{' '}
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                        </span>
                      </div>
                    </article>
                  </LocalizedLink>
                ))}
              </div>
            )}

            {visible < filtered.length && (
              <div className="flex justify-center mt-12">
                <button
                  type="button"
                  onClick={() => setVisible((count) => count + PAGE_SIZE)}
                  className="px-8 py-3 bg-[#25262b] border border-white/10 rounded-lg text-white hover:bg-[#d4af37] hover:text-black transition-all"
                >
                  {t('card.readMore')}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
