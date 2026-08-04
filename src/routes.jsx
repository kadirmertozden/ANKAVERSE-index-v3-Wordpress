import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import SiteLayout from '@/components/SiteLayout';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import { LOCALES, DEFAULT_LOCALE, localesForRoute, pathFor } from '@/i18n/routes';
import {
  loadPost,
  loadPostIndex,
  loadProject,
  loadProjects,
  postSlugs,
  projectSlugs,
} from '@/lib/content';

/** Pathless root: things that must exist once, above every locale. */
function AppShell() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <Toaster />
    </>
  );
}

const page = (importer) => async () => ({ Component: (await importer()).default });

/**
 * Routes for one locale.
 *
 * Paths come from the route table rather than being written out here, so the
 * router, the hreflang tags and the sitemap are all reading the same slugs.
 */
function routesForLocale(locale) {
  const routes = [];

  const add = (routeKey, importer, extra = {}) => {
    if (!localesForRoute(routeKey).includes(locale)) return;
    // Detail routes pass their own `path` (it needs a `:param` placeholder),
    // so only resolve a static path when one was not supplied.
    routes.push({
      path: extra.path ?? pathFor(routeKey, locale),
      handle: { routeKey, locale },
      lazy: page(importer),
      ...extra,
    });
  };

  add('home', () => import('@/pages/HomePage'));
  add('about', () => import('@/pages/AboutPage'));
  add('services', () => import('@/pages/ServicesPage'));
  add('projects', () => import('@/pages/ProjectsPage'), {
    loader: async () => ({ projects: await loadProjects(locale) }),
  });
  add('blog', () => import('@/pages/BlogPage'), {
    loader: async () => ({ posts: await loadPostIndex(locale) }),
  });
  add('contact', () => import('@/pages/ContactPage'));
  add('privacy', () => import('@/pages/PrivacyPolicyPage'));
  add('terms', () => import('@/pages/TermsOfUsePage'));

  add('projectDetail', () => import('@/pages/ProjectDetailPage'), {
    path: pathFor('projectDetail', locale, { slug: ':slug' }),
    loader: async ({ params }) => ({ project: await loadProject(locale, params.slug) }),
    getStaticPaths: async () =>
      (await projectSlugs(locale)).map((slug) => pathFor('projectDetail', locale, { slug })),
  });

  add('blogDetail', () => import('@/pages/BlogDetailPage'), {
    path: pathFor('blogDetail', locale, { slug: ':slug' }),
    loader: async ({ params }) => {
      const post = await loadPost(locale, params.slug);
      if (post) return { post, redirectTo: null };

      // Posts used to be linked by numeric WordPress id. Those URLs may be
      // indexed or bookmarked, so resolve them to the slug rather than 404.
      if (/^\d+$/.test(params.slug)) {
        const index = await loadPostIndex(locale);
        const match = index.find((entry) => String(entry.id) === params.slug);
        if (match) {
          return { post: null, redirectTo: pathFor('blogDetail', locale, { slug: match.slug }) };
        }
      }
      return { post: null, redirectTo: null };
    },
    getStaticPaths: async () =>
      (await postSlugs(locale)).map((slug) => pathFor('blogDetail', locale, { slug })),
  });

  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  routes.push({
    path: `${prefix}/*`,
    handle: { routeKey: 'notFound', locale },
    lazy: page(() => import('@/pages/NotFoundPage')),
  });

  return routes;
}

/** Paths that moved. Kept client-side as a safety net; nginx 301s them first. */
const LEGACY_REDIRECTS = ['/giris', '/giris.html', '/kurumsal'];

export const routes = [
  {
    element: <AppShell />,
    children: [
      ...LOCALES.map((locale) => ({
        element: <SiteLayout locale={locale} />,
        children: routesForLocale(locale),
      })),

      ...LEGACY_REDIRECTS.map((path) => ({
        path,
        element: <Navigate to="/" replace />,
      })),

      {
        path: '/Vaktia/PRIVACY_POLICY',
        element: <SiteLayout locale="tr" />,
        children: [
          {
            index: true,
            handle: { routeKey: 'vaktiaPrivacy', locale: 'tr' },
            lazy: page(() => import('@/pages/VaktiaPrivacyPolicyPage')),
          },
        ],
      },

      // Prerendered so the server has a body to return with a 404 status.
      {
        path: '/404',
        element: <SiteLayout locale={DEFAULT_LOCALE} />,
        children: [
          {
            index: true,
            handle: { routeKey: 'notFound', locale: DEFAULT_LOCALE },
            lazy: page(() => import('@/pages/NotFoundPage')),
          },
        ],
      },
    ],
  },
];

export default routes;
