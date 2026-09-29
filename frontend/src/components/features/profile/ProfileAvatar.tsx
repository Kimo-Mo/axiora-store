import { AuthUser } from '@/types';

interface ProfileAvatarProps {
  user: AuthUser;
}

export function ProfileAvatar({ user }: ProfileAvatarProps) {
  const initials = (user.full_name ?? user.username ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative shrink-0">
      <div className="size-20 rounded-2xl bg-linear-to-br from-primary to-primary/50 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
        {initials}
      </div>
      <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-success border-2 border-background" />
    </div>
  );
}
