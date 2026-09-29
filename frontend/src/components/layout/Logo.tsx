'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  /** Future image logo swap: pass `src` to render the image mark instead of the text logo. Call sites stay unchanged. */
  src?: string;
  alt?: string;
}

export const Logo = ({ className, src, alt = 'Axiora Store' }: LogoProps) => {
  return (
    <Link
      href="/"
      aria-label="Axiora Store — home"
      className={`flex shrink-0 select-none items-center gap-1.5 ${className || ''}`}
    >
      {src ? (
        <Image src={src} alt={alt} width={148} height={36} priority className="h-9 w-auto" />
      ) : (
        <span className="flex items-stretch gap-1" aria-hidden="false">
          <span className="bg-board text-[#f2f2f2] border-border flex items-center rounded-md border px-2.5 py-1.5 font-display text-lg font-extrabold tracking-[0.18em]">
            AXIORA
          </span>
          <span className="bg-[#ffb000] flex items-center rounded-md px-1.5 py-1.5 font-display text-[10px] font-extrabold tracking-widest text-black">
            EG
          </span>
        </span>
      )}
    </Link>
  );
};
