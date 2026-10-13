import type { ReactNode } from 'react';
import AccountSidebar from './AccountSidebar';

/**
 * Account area shell (Phase 11).
 *
 * Hosts Profile, Orders, and Addresses pages behind one responsive layout:
 * horizontal tab bar on mobile, sticky sidebar on desktop. The locale is set
 * by the parent `[locale]` layout, so this shell needs no params. Profile and
 * Addresses pages land in Polish (T039/T040); their sidebar entries are
 * placeholders until then.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="md:w-60 md:shrink-0">
          <div className="md:sticky md:top-24">
            <AccountSidebar />
          </div>
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
