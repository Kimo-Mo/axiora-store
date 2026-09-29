'use client';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export const MainNavItems = () => {
  const t = useTranslations('nav');
  const [activeLink, setActiveLink] = useState('');
  // next-intl pathname (locale prefix stripped) — hrefs stay unprefixed.
  const pathname = usePathname();

  const NAV_DATA = [
    { title: t('home'), href: '/' },
    { title: t('shop'), href: '/store' },
    { title: t('mobiles'), href: '/store?category=mobiles' },
    { title: t('accessories'), href: '/store?category=accessories' },
    { title: t('audio'), href: '/store?category=audio' },
    { title: t('wearables'), href: '/store?category=wearables' },
    { title: t('offers'), href: '/store?is_popular=true' },
  ];

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  return (
    <ul className="hidden md:flex items-center gap-4">
      {NAV_DATA.map((item) => (
        <li key={item.href}>
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
