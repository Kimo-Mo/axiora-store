import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ProductListHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products Catalog</h1>
        <p className="text-muted-foreground mt-1">Manage your store&apos;s digital products.</p>
      </div>
      <Link href="/dashboard/products/create">
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Plus className="me-2 h-4 w-4" /> Add Product
        </Button>
      </Link>
    </div>
  );
}
