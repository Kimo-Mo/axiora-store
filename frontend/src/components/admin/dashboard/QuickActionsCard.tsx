'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Boxes, ShoppingBag, FolderTree } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function QuickActionsCard() {
  const t = useTranslations('admin.dashboard.quickActions');

  const actions = [
    {
      title: t('addProduct'),
      href: '/dashboard/products/create',
      icon: PlusCircle,
      color: 'bg-primary/10 text-primary hover:bg-primary/20',
    },
    {
      title: t('checkInventory'),
      href: '/dashboard/inventory',
      icon: Boxes,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
    },
    {
      title: t('viewOrders'),
      href: '/dashboard/orders',
      icon: ShoppingBag,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
    },
    {
      title: t('manageCategories'),
      href: '/dashboard/categories',
      icon: FolderTree,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
    },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors group"
              >
                <div className={`p-2 rounded-md ${action.color} transition-colors`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {action.title}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
