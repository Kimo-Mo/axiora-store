import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import type { AdminUser } from '@/types/admin/users';
import { UserRoleBadge } from './UserRoleBadge';

interface UserTableRowProps {
  user: AdminUser;
  onClick: (userId: string) => void;
}

export function UserTableRow({ user, onClick }: UserTableRowProps) {
  return (
    <TableRow className="border-border hover:bg-muted/50">
      <TableCell className="font-medium text-foreground tracking-tight">{user.username}</TableCell>
      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
      <TableCell className="text-sm text-foreground">{user.full_name ?? '—'}</TableCell>
      <TableCell>
        <UserRoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        {user.is_active ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm">
        {user.provider ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1) : ''}
      </TableCell>
      <TableCell>
        {user.is_verified ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClick(user.id)}
          className="text-primary hover:text-primary-hover hover:bg-primary/10 gap-2 h-8">
          <Eye className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only">View</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
