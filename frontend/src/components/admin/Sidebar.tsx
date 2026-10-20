'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Boxes,
  ShoppingCart,
  Truck,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemConfig {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItemConfig[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'products', href: '/dashboard/products', icon: Package },
  { key: 'categories', href: '/dashboard/categories', icon: FolderTree },
  { key: 'brands', href: '/dashboard/brands', icon: Tag },
  { key: 'inventory', href: '/dashboard/inventory', icon: Boxes },
  { key: 'orders', href: '/dashboard/orders', icon: ShoppingCart },
  { key: 'shipping', href: '/dashboard/shipping', icon: Truck },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations('admin.nav');

  return (
    <aside
      className={cn(
        'w-64 border-e border-border bg-sidebar/80 backdrop-blur-md flex flex-col min-h-screen shrink-0',
        className
      )}>
      <div className="px-6 h-16 border-b border-border hidden lg:flex items-center">
        <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-primary">
          Axiora <span className="text-foreground">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}>
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'
                )}
              />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">{t('copyright')}</div>
      </div>
    </aside>
  );
}
