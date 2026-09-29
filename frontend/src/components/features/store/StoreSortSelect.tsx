'use client';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS = [
  { label: 'Price -- Low to High', value: 'price' },
  { label: 'Price -- High to Low', value: '-price' },
];

interface StoreSortSelectProps {
  className?: string;
  value: string;
  onChange: (val: string) => void;
}

export default function StoreSortSelect({ className, value, onChange }: StoreSortSelectProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 text-sm whitespace-nowrap overflow-x-auto scrollbar-hide',
        className
      )}>
      <span className="hidden md:inline font-bold shrink-0">Sort by</span>
      <div className="flex items-center gap-6">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[180px] bg-card border-border font-medium">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
