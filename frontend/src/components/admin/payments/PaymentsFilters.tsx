import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { PaymentStatus } from '@/types/admin/payments';

interface PaymentsFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: PaymentStatus | '';
  onStatusChange: (v: PaymentStatus | '') => void;
}

export function PaymentsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: PaymentsFiltersProps) {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-8"
        />
      </div>
      <Select
        value={status || 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? '' : (v as PaymentStatus))}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="intended">Intended</SelectItem>
          <SelectItem value="success">Success</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
