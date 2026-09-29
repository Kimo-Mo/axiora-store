import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Safety fallback for `/`. The proxy (`src/proxy.ts`) handles locale
// detection/redirects first; this only runs if the proxy is bypassed.
export default async function RootPage() {
  const store = await cookies();
  const remembered = store.get('NEXT_LOCALE')?.value;
  redirect(remembered === 'en' ? '/en' : '/ar');
}
