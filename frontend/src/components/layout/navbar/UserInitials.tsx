interface UserInitialsProps {
  name: string;
  /** 'sm' = 32px circle in navbar trigger, 'lg' = 44px rounded-xl in headers */
  size?: 'sm' | 'lg';
}

export function UserInitials({ name, size = 'sm' }: UserInitialsProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-sm shadow-primary/30 shrink-0 ${
        size === 'lg'
          ? 'size-12 rounded-xl text-sm shadow-md shadow-primary/20'
          : 'size-7 md:size-8 rounded-full text-[10px] md:text-xs'
      }`}>
      {initials}
    </div>
  );
}
