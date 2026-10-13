import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

/**
 * Root account route: redirects to /account/profile preserving the browsing locale.
 */
export default async function AccountRootRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/account/profile`);
}