import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProfileAvatar } from './ProfileAvatar';
import type { MyProfileData } from './types';

interface ProfileHeaderProps {
  user: MyProfileData;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="space-y-4 flex justify-between flex-wrap">
      <div className="flex items-center gap-4">
        <ProfileAvatar user={user} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{user.full_name ?? user.username}</h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <Badge className="mt-1 text-xs capitalize" variant="outline">
            {user.role ?? 'user'}
          </Badge>
        </div>
      </div>

      <Link href="/orders" className='w-full sm:w-auto'>
        <div className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">My Orders</p>
            <p className="text-xs text-muted-foreground">View history</p>
          </div>
          <ChevronRight
            size={15}
            className="ml-auto text-muted-foreground transition-colors group-hover:text-primary"
          />
        </div>
      </Link>
    </div>
  );
}
