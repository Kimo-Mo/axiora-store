import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales — Arabic default (Egypt-first), English secondary
  locales: ['ar', 'en'],
  // Bare `/` and locale-less paths resolve here when no preference is remembered
  defaultLocale: 'ar',
});

export type Locale = (typeof routing.locales)[number];

export const LOCALES: readonly Locale[] = routing.locales;

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return value === 'ar' || value === 'en';
}

export function getLocaleDirection(locale: string | undefined | null): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
