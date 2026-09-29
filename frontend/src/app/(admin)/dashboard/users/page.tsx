'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UserTable } from '@/components/admin/users/UserTable';
import { UserProfileModal } from '@/components/admin/users/UserProfileModal';
import { useAdminUsersQuery } from '@/hooks/admin/useAdminUsersQuery';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import type { AdminUser, UserListParams } from '@/types/admin/users';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentAdminId = useAuthStore((state) => state.user?.id) ?? '';

  const search = searchParams.get('search') ?? '';
  const role = searchParams.get('role') ?? '';
  const isActive = searchParams.get('is_active') ?? '';
  const provider = searchParams.get('provider') ?? '';
  const isVerified = searchParams.get('is_verified') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(search);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const updateParamsRef = useRef(updateParams);
  useEffect(() => {
    updateParamsRef.current = updateParams;
  }, [updateParams]);

  // Sync search input when URL changes (back/forward navigation)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search — 400ms
  useEffect(() => {
    const id = setTimeout(() => {
      if ((searchInput || null) !== (search || null)) {
        updateParamsRef.current({ search: searchInput || null, page: null });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput, search]);

  const queryParams: UserListParams = {
    search: search || undefined,
    role: role || undefined,
    is_active: isActive !== '' ? isActive === 'true' : undefined,
    provider: provider || undefined,
    is_verified: isVerified !== '' ? isVerified === 'true' : undefined,
    page,
    page_size: 10,
  };

  const { data, isPending, isError } = useAdminUsersQuery(queryParams);
  const users = data?.results ?? [];
  const pagination = {
    count: data?.count ?? 0,
    total_pages: data?.total_pages ?? 1,
    current_page: data?.current_page ?? 1,
  };

  // When a user is updated (role change), refresh selectedUser from fresh list data
  useEffect(() => {
    if (selectedUser && data?.results) {
      const refreshed = data.results.find((u) => u.id === selectedUser.id);
      if (refreshed && refreshed !== selectedUser) {
        setSelectedUser(refreshed);
      }
    }
  }, [data?.results, selectedUser]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage registered user accounts and privileges.</p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground mb-4">Users</CardTitle>
          <UserFilters
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            roleFilter={role}
            onRoleChange={(v) => updateParams({ role: v === 'all' ? null : v, page: null })}
            isActiveFilter={isActive}
            onIsActiveChange={(v) => updateParams({ is_active: v === 'all' ? null : v, page: null })}
            providerFilter={provider}
            onProviderChange={(v) => updateParams({ provider: v === 'all' ? null : v, page: null })}
            isVerifiedFilter={isVerified}
            onIsVerifiedChange={(v) => updateParams({ is_verified: v === 'all' ? null : v, page: null })}
          />
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            isPending={isPending}
            isError={isError}
            totalPages={pagination.total_pages}
            currentPage={pagination.current_page}
            totalCount={pagination.count}
            onPageChange={(p) => updateParams({ page: String(p) })}
            onUserClick={(id) => {
              const found = users.find((u) => u.id === id) ?? null;
              setSelectedUser(found);
            }}
          />
        </CardContent>
      </Card>

      <UserProfileModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        currentAdminId={currentAdminId}
      />
    </div>
  );
}
