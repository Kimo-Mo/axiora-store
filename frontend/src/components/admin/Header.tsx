'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import Link from 'next/link';
import { ThemeToggle } from '../ui';
import { UserDropdown } from '../layout/navbar/UserDropdown';
import { useAuthStore } from '@/lib/stores/useAuthStore';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'developer';
  const handleLogout = async () => {
    await logout();
  };
  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 bg-sidebar border-border w-72"
              aria-describedby={undefined}
              showCloseButton={false}>
              <SheetTitle>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-primary">
                    Axiora <span className="text-foreground">Admin</span>
                  </Link>
                  <SheetClose asChild>
                    <button className="rounded-lg p-1.5 bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <X size={18} />
                    </button>
                  </SheetClose>
                </div>
              </SheetTitle>
              <Sidebar className="border-r-0 w-full" />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-primary">
            Axiora <span className="text-foreground">Admin</span>
          </Link>
        </div>

        {/* Placeholder for left-side elements on desktop if any */}
        <div className="hidden lg:block"></div>

        <div className="flex items-center flex-1 justify-end gap-2 sm:gap-4">
          <ThemeToggle />
          {isAuthenticated && user && (
            <UserDropdown user={user} isAdmin={isAdmin} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </header>
  );
}
