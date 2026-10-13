'use client';

import { LayoutGrid, LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { Link, usePathname } from '@/i18n/navigation';
import { useSignOut } from '@/hooks/useSignOut';

const ITEMS = [
  { href: '/account/profile', labelKey: 'sidebarProfile', icon: UserRound, exact: false },
  { href: '/account/orders', labelKey: 'sidebarOrders', icon: Package, exact: false },
  { href: '/account/addresses', labelKey: 'sidebarAddresses', icon: MapPin, exact: false },
] as const;

/**
 * Account sidebar (Phase 11 account shell).
 *
 * Locale-aware links via the i18n navigation wrappers so the locale prefix
 * survives client-side navigation; logical properties (`ms-`, `ps-`) keep the
 * active indicator correct in both RTL and LTR.
 */
export default function AccountSidebar() {
  const t = useTranslations('account');
  const pathname = usePathname();
  const { signOut } = useSignOut();

  return (
    <nav aria-label={t('sidebarTitle')} className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
      <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block">
        <span className="inline-flex items-center gap-2">
          <LayoutGrid size={14} />
          {t('sidebarTitle')}
        </span>
      </p>
      {ITEMS.map(({ href, labelKey, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}>
            <Icon size={16} className="shrink-0" />
            {t(labelKey)}
          </Link>
        );
      })}
      <Button
        variant="ghost"
        onClick={() => signOut()}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-error md:justify-start">
        <LogOut size={16} className="shrink-0" />
        {t('sidebarSignOut')}
      </Button>
    </nav>
  );
}
