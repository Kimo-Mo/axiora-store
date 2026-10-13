import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

/**
 * Legacy orders page (pre-Phase-11 Django-era surface).
 * Replaced by the account order history — server redirect so old links
 * and bookmarks land on the new page with the browsing locale preserved.
 */
export default async function LegacyOrdersRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/account/orders`);
}
