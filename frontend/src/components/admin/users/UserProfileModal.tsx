import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, ShoppingBag } from 'lucide-react';
import { useUserOrdersQuery } from '@/hooks/admin/useUserOrdersQuery';
import { UserRoleBadge } from './UserRoleBadge';
import { UserActionButtons } from './UserActionButtons';
import { OrderStatusBadge } from '@/components/admin/orders/OrderStatusBadge';
import type { AdminUser } from '@/types/admin/users';
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import { useState } from 'react';

interface UserProfileModalProps {
  user: AdminUser | null; // null = modal closed
  onClose: () => void;
  currentAdminId: string;
}

export function UserProfileModal({ user, onClose, currentAdminId }: UserProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const { data: ordersData, isPending: ordersPending } = useUserOrdersQuery(user?.id ?? null);
  const orders = ordersData?.results ?? [];

  const fmt = (d: string) => new Date(d).toLocaleDateString();
  const fmtDT = (d: string) => new Date(d).toLocaleString();

  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {user && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl truncate">
                    {user.full_name ?? user.username}
                  </DialogTitle>
                  <DialogDescription className="truncate">{user.email}</DialogDescription>
                </div>
                <UserRoleBadge role={user.role} />
              </div>
            </DialogHeader>

            {/* copy user id */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">User ID</span>
              <span className="text-sm font-medium">{user.id}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(user.id)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                  toast.success('User ID copied to clipboard')
                }}
                className="h-6 w-6">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Username
                </span>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Full Name
                </span>
                <span className="text-sm font-medium">{user.full_name ?? '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Email
                </span>
                <span className="text-sm font-medium break-all">{user.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Role
                </span>
                <span>
                  <UserRoleBadge role={user.role} />
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Status
                </span>
                <span>
                  {user.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Provider
                </span>
                <span className="text-sm font-medium capitalize">{user.provider || '—'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Verified
                </span>
                <span className="text-sm font-medium">{user.is_verified ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Staff
                </span>
                <span className="text-sm font-medium">{user.is_staff ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Joined
                </span>
                <span className="text-sm font-medium">{fmt(user.date_joined)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Last Login
                </span>
                <span className="text-sm font-medium">
                  {user.last_login ? fmtDT(user.last_login) : 'Never'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Last Updated
                </span>
                <span className="text-sm font-medium">{fmtDT(user.last_updated)}</span>
              </div>
            </div>

            <Separator />

            {/* Order History */}
            <div className="py-4">
              <h3 className="font-semibold text-foreground mb-4">Order History</h3>
              {ordersPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground flex flex-col items-center gap-2">
                  <ShoppingBag className="w-8 h-8 opacity-50" />
                  <p className="text-sm">No orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {order.order_number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {fmt(order.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-sm font-medium">
                          {order.currency} {parseFloat(order.total_price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(ordersData?.count ?? 0) > 10 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Showing most recent 10 orders ({ordersData?.count} total).
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-start pt-2 border-t border-border">
              <UserActionButtons
                user={user}
                currentAdminId={currentAdminId}
                onActionSuccess={onClose}
              />
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
