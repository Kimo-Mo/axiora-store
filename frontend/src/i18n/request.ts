import { getRequestConfig } from 'next-intl/server';
import { isSupportedLocale, routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Locale is validated by proxy.ts + [locale]/layout.tsx; fall back to
  // the default locale here so a missing key/config never crashes rendering.
  const requested = await requestLocale;
  const locale = isSupportedLocale(requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../messages/${locale}`)).default;

  return {
    locale,
    messages,
  };
});
