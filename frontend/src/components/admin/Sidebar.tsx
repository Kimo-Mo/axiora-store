'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'w-64 border-e border-border bg-sidebar/80 backdrop-blur-md flex flex-col min-h-screen',
        className
      )}>
      <div className="px-6 h-16 border-b border-border hidden lg:flex items-center">
        <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-primary">
          Axiora <span className="text-foreground">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}>
              <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">&copy; 2026 Axiora Admin</div>
      </div>
    </aside>
  );
}
