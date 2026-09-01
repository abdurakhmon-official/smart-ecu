'use client';

import { useLocale } from 'next-intl';
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@repo/contracts';

const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** `next-intl`ning `useLocale()` — oddiy `string` qaytaradi; `pickLocalized` esa tor `Locale` ittifoqini kutadi. */
export const useAppLocale = (): Locale => {
  const locale = useLocale();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
};
