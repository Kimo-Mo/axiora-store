import { PackageSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';

/** Inviting empty state for customers with no orders (yet). */
export function OrdersEmptyState() {
  const t = useTranslations('orders');

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <PackageSearch size={40} className="text-muted-foreground" />
        <p className="text-base font-semibold">{t('list.emptyTitle')}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t('list.emptyHint')}</p>
        <Button asChild className="mt-1">
          <Link href="/store">{t('list.emptyCta')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
