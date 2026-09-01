import { defineRouting } from 'next-intl/routing';
import { LOCALES, DEFAULT_LOCALE } from '@repo/contracts';

/**
 * Add every new page's route here — this is the project's single source of
 * truth for routes (see CODING_STANDARDS.md).
 *
 * Locales come from @repo/contracts so backend and frontend always agree.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',

  pathnames: {
    '/': '/',
    '/sign-in': '/sign-in',
    '/sign-up': '/sign-up',
    '/my-garage': '/my-garage',
    '/services': '/services',
    '/services/[id]': '/services/[id]',
    '/my-service': '/my-service',
    '/my-orders': '/my-orders',
    '/ai-assistant': '/ai-assistant',
    '/admin': '/admin',
    '/admin/users': '/admin/users',
    '/admin/vehicle-catalog': '/admin/vehicle-catalog',
    '/admin/service-catalog': '/admin/service-catalog',
    '/admin/service-providers': '/admin/service-providers',
  },
});

export type AppPathname = keyof typeof routing.pathnames;
