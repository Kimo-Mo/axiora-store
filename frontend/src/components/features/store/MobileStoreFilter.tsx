'use client';

import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import StoreSidebarFilter, { StoreFilterState } from './StoreSidebarFilter';

interface MobileStoreFilterProps {
  search: string;
  setSearch: (search: string) => void;
  filters: StoreFilterState;
  onChange: (filters: StoreFilterState) => void;
}

export default function MobileStoreFilter({
  search,
  setSearch,
  filters,
  onChange,
}: MobileStoreFilterProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        showCloseButton={false}
        aria-describedby={undefined}
        side="left"
        className="w-75 sm:w-87.5 overflow-y-auto dark:bg-card backdrop-blur border-r-border">
        <SheetTitle>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-bold">Filters</h3>
            <SheetClose asChild>
              <button className="rounded-lg p-1.5 bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </SheetClose>
          </div>
        </SheetTitle>
        <StoreSidebarFilter
          search={search}
          setSearch={setSearch}
          filters={filters}
          onChange={onChange}
        />
      </SheetContent>
    </Sheet>
  );
}
