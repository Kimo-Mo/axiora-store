'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_DATA = [
  { title: 'Home', href: '/' },
  { title: 'Store', href: '/store' },
  { title: 'About', href: '/about' },
  { title: 'Support', href: '/support' },
];
export const MainNavItems = () => {
  const [activeLink, setActiveLink] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  return (
    <ul className="hidden md:flex items-center gap-4">
      {NAV_DATA.map((item) => (
        <li key={item.title}>
          <Link
            href={item.href}
            className={`font-medium transition-colors hover:text-primary ${activeLink === item.href ? 'text-primary' : ''}`}>
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};
