'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Smartphone, Headphones, Watch, Zap, Tag, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { ProductCategory, ProductTag } from '@/types';

export const SecondaryNavbar = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hasHovered, setHasHovered] = useState(false);

  const handleMouseEnter = (id: string) => {
    setActiveMenu(id);
    if (!hasHovered) setHasHovered(true);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.publicCategoriesList(),
    enabled: hasHovered,
    staleTime: Infinity,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => catalogService.publicTagsList(),
    enabled: hasHovered,
    staleTime: Infinity,
  });

  const categories: ProductCategory[] = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
  }, [categoriesData]);

  const tags: ProductTag[] = useMemo(() => {
    return Array.isArray(tagsData) ? tagsData : tagsData?.data || [];
  }, [tagsData]);

  const navItems = useMemo(
    () => [
      {
        id: 'mobiles',
        label: 'Mobiles & Tablets',
        icon: Smartphone,
        href: '/store?category=mobiles',
        menu: {
          columns: [
            {
              title: 'Categories',
              links: categories.slice(0, 8).map((c) => ({
                label: c.name,
                href: `/store?category=${c.slug}`,
              })),
            },
            {
              title: 'Popular Tags',
              links: tags.slice(0, 8).map((t) => ({
                label: t.name,
                href: `/store?tag=${t.slug}`,
              })),
            },
          ],
        },
      },
      {
        id: 'audio',
        label: 'Audio & Earbuds',
        icon: Headphones,
        href: '/store?category=audio',
      },
      {
        id: 'wearables',
        label: 'Smart Watches',
        icon: Watch,
        href: '/store?category=wearables',
      },
      {
        id: 'chargers',
        label: 'Chargers & Cables',
        icon: Zap,
        href: '/store?category=chargers',
      },
      {
        id: 'offers',
        label: 'Special Offers',
        icon: Tag,
        href: '/store?is_popular=true',
        badge: 'HOT',
        badgeColor: 'bg-red-600',
      },
      {
        id: 'warranty',
        label: 'Warranty & Genuine',
        icon: ShieldCheck,
        href: '/legal',
      },
    ],
    [categories, tags]
  );

  return (
    <div className="bg-card border-border relative z-40 hidden w-full border-t md:block">
      <div className="main_container">
        <ul className="flex items-center gap-6 text-sm font-medium h-12">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'text-muted-foreground flex h-full items-center gap-2 transition-colors hover:text-foreground relative',
                    activeMenu === item.id && 'text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded leading-none text-white',
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {activeMenu === item.id && item.menu && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>

                {/* Mega Menu */}
                {item.menu && activeMenu === item.id && (
                  <div className="bg-popover border-border absolute top-full left-0 w-full overflow-hidden border-t shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="main_container py-8 flex gap-8 relative z-10">
                      <div className="flex-1 flex flex-wrap gap-x-12 gap-y-8">
                        {item.menu.columns.map((col, idx) => {
                          if (col.links.length === 0) return null;
                          return (
                            <div key={idx} className="flex flex-col gap-4 min-w-35">
                              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                {col.title}
                              </h3>
                              <ul className="flex flex-col gap-2.5">
                                {col.links.map(
                                  (link: { href: string; label: string }, lIdx: number) => (
                                    <li key={lIdx}>
                                      <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white text-[13px] transition-colors"
                                      >
                                        {link.label}
                                      </Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
