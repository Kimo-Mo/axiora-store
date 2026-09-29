'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { usePaymentFilters } from '@/hooks/admin/usePaymentFilters';
import { useAdminPaymentsQuery } from '@/hooks/admin/useAdminPaymentsQuery';
import { PaymentsFilters } from '@/components/admin/payments/PaymentsFilters';
import { PaymentsTable } from '@/components/admin/payments/PaymentsTable';
import { PaymentDetailModal } from '@/components/admin/payments/PaymentDetailModal';
import { UpdatePaymentStatusDialog } from '@/components/admin/payments/UpdatePaymentStatusDialog';

export default function PaymentsPage() {
  const {
    search,
    debouncedSearch,
    status,
    ordering,
    page,
    setSearch,
    setStatus,
    setPage,
    resetPage,
  } = usePaymentFilters();

  const { data, isLoading } = useAdminPaymentsQuery({
    user: debouncedSearch || undefined,
    status: status || undefined,
    ordering: ordering || undefined,
    page,
    page_size: 10,
  });

  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [updateStatusTarget, setUpdateStatusTarget] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && data && data.results.length === 0 && page > 1) {
      setPage(page - 1);
    }
  }, [data, isLoading, page, setPage]);

  const pagination = {
    count: data?.count ?? 0,
    total_pages: data?.total_pages ?? 1,
    current_page: data?.current_page ?? 1,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Monitor and manage payment transactions.</p>
        </div>
      </div>
      
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <PaymentsFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              resetPage();
            }}
            status={status}
            onStatusChange={(v) => {
              setStatus(v);
              resetPage();
            }}
          />
        </CardHeader>
        <CardContent>
          <PaymentsTable
            payments={data?.results ?? []}
            isLoading={isLoading}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            onView={(id) => setSelectedPaymentId(id)}
            onUpdateStatus={(id) => setUpdateStatusTarget(id)}
          />
        </CardContent>
      </Card>

      <PaymentDetailModal
        id={selectedPaymentId}
        open={selectedPaymentId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPaymentId(null);
        }}
        onUpdateStatus={(id) => {
          setSelectedPaymentId(null);
          setUpdateStatusTarget(id);
        }}
      />
      
      <UpdatePaymentStatusDialog
        paymentId={updateStatusTarget}
        open={updateStatusTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUpdateStatusTarget(null);
        }}
      />
    </div>
  );
}
