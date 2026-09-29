import { useState, useEffect } from 'react';
import type { PaymentStatus } from '@/types/admin/payments';

export function usePaymentFilters() {
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [ordering, setOrdering] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 whenever search term changes
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const resetPage = () => setPage(1);

  return {
    search,
    debouncedSearch,
    status,
    ordering,
    page,
    setSearch,
    setStatus,
    setOrdering,
    setPage,
    resetPage,
  };
}
