'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User, LayoutDashboard, Package, LogOut, ChevronDown, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { UserInitials } from './UserInitials';
import type { AuthUser } from '@/types';

interface UserDropdownProps {
  user: AuthUser;
  isAdmin: boolean;
  onLogout: () => void;
}

export function UserDropdown({ user, isAdmin, onLogout }: UserDropdownProps) {
  const t = useTranslations('nav');
  const displayName = user.fullName || user.username || t('account');
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-1.5 md:gap-2 rounded-full md:rounded-xl px-1 md:px-2 py-1 md:py-1.5 hover:bg-white/8 transition-all duration-200 outline-none cursor-pointer">
          <UserInitials name={displayName} size="sm" />
          <span className={`hidden lg:block text-sm font-medium max-w-32 truncate transition-colors ${pathname.includes('/dashboard') ? 'text-foreground group-hover:text-primary' : 'text-white/90 group-hover:text-white'}`}>
            {displayName}
          </span>
          <ChevronDown
            size={14}
            className={`hidden lg:block transition-all duration-200 group-data-[state=open]:rotate-180 ${pathname.includes('/dashboard') ? 'text-foreground group-hover:text-primary' : 'text-white/50 group-hover:text-white/80'}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-2 rounded-2xl border border-border/60 shadow-xl shadow-black/20"
        align="end"
        sideOffset={8}
        forceMount>
        {/* ── User Info Header ── */}
        <div className="flex items-center gap-3 px-2 py-3 mb-1">
          <UserInitials name={displayName} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5 capitalize">
              <Shield size={12} />
              {user.role}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        {/* ── Navigation Items ── */}
        <DropdownMenuItem
          asChild
          className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer hover:bg-primary/10!">
          <Link href="/profile" className="w-full">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <User size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{t('myProfile')}</p>
              <p className="text-xs text-muted-foreground">{t('accountSettings')}</p>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer hover:bg-primary/10!">
          <Link href="/orders" className="w-full">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Package size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{t('myOrders')}</p>
              <p className="text-xs text-muted-foreground">{t('purchaseHistory')}</p>
            </div>
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem
            asChild
            className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer hover:bg-primary/10!">
            <Link href="/dashboard" className="w-full">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <LayoutDashboard size={20} className="text-primary" />
              </div>
            <div>
              <p className="text-sm font-medium leading-tight">{t('adminPanel')}</p>
              <p className="text-xs text-muted-foreground">{t('managePlatform')}</p>
            </div>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1" />

        {/* ── Logout ── */}
        <DropdownMenuItem
          onClick={onLogout}
          className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
          <div className="size-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <LogOut size={20} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{t('signOut')}</p>
            <p className="text-xs text-destructive/70">{t('endSessionShort')}</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
