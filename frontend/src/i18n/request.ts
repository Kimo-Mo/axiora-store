import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Locale is validated by proxy.ts + [locale]/layout.tsx; fall back to
  // the default locale here so a missing key/config never crashes rendering.
  const requested = await requestLocale;
  const locale = requested === 'ar' || requested === 'en' ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
