'use client';

import Link from 'next/link';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/"
      className={`font-black text-xl tracking-tight flex items-center gap-1.5 shrink-0 select-none ${className || ''}`}
    >
      <span className="text-primary font-black text-2xl tracking-tighter">AXIORA</span>
      <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary font-extrabold border border-primary/20">
        STORE
      </span>
    </Link>
  );
};
