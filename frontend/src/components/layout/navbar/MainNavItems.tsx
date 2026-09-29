'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_DATA = [
  { title: 'Home', href: '/' },
  { title: 'Shop', href: '/store' },
  { title: 'Mobiles', href: '/store?category=mobiles' },
  { title: 'Accessories', href: '/store?category=accessories' },
  { title: 'Audio', href: '/store?category=audio' },
  { title: 'Wearables', href: '/store?category=wearables' },
  { title: 'Offers', href: '/store?is_popular=true' },
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
