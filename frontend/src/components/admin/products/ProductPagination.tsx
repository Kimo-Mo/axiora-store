import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface ProductPaginationProps {
  current_page: number;
  total_pages: number;
  count: number;
  loading: boolean;
  setPage: Dispatch<SetStateAction<number>>;
}

export function ProductPagination({
  current_page,
  total_pages,
  count,
  loading,
  setPage,
}: ProductPaginationProps) {
  if (total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
      <p className="text-sm text-muted-foreground">
        Page {current_page} of {total_pages} ({count} total)
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={current_page <= 1 || loading}
          className="border-border h-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(total_pages, p + 1))}
          disabled={current_page >= total_pages || loading}
          className="border-border h-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
