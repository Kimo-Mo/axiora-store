import { Badge } from '@/components/ui/badge';
import type { RoleEnum } from '@/types/admin/users';

export function UserRoleBadge({ role }: { role: RoleEnum }) {
  switch (role) {
    case 'admin':
      return <Badge variant="destructive">Admin</Badge>;
    case 'user':
      return <Badge variant="secondary">User</Badge>;
    case 'seller':
      return <Badge variant="outline">Seller</Badge>;
    case 'developer':
      return <Badge variant="default">Developer</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}
