'use client';

import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { Smartphone, Headphones, Watch, Zap, Tag, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import { useCategories } from '@/hooks/useCatalog';
import { localized } from '@/types/catalog';
import type { LegacyProductTag } from '@/types/legacyCatalog';

export const SecondaryNavbar = () => {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hasHovered, setHasHovered] = useState(false);

  const handleMouseEnter = (id: string) => {
    setActiveMenu(id);
    if (!hasHovered) setHasHovered(true);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  // Categories come from the live catalogue, so this mega-menu cannot drift from
  // the store's own filter. The tag column still reads the retired endpoint and
  // hides itself when empty, until tags are modelled or dropped.
  const { data: categoryTree = [] } = useCategories();
  const categories = useMemo(() => categoryTree.filter((category) => category.parentId === null), [categoryTree]);

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => legacyCatalogService.publicTagsList(),
    enabled: hasHovered,
    staleTime: Infinity,
  });

  const tags: LegacyProductTag[] = useMemo(() => tagsData ?? [], [tagsData]);

  const navItems = useMemo(
    () => [
      {
        id: 'mobiles',
        label: t('mobilesTablets'),
        icon: Smartphone,
        href: '/store?category=mobiles-tablets',
        menu: {
          columns: [
            {
              title: t('categories'),
              links: categories.slice(0, 8).map((c) => ({
                label: localized(c, locale),
                href: `/store?category=${c.slug}`,
              })),
            },
            {
              title: t('popularTags'),
              links: tags.slice(0, 8).map((t2) => ({
                label: t2.name,
                href: `/store?tag=${t2.slug}`,
              })),
            },
          ],
        },
      },
      {
        id: 'audio',
        label: t('audioEarbuds'),
        icon: Headphones,
        href: '/store?category=audio',
      },
      {
        id: 'wearables',
        label: t('smartWatches'),
        icon: Watch,
        href: '/store?category=wearables',
      },
      {
        id: 'chargers',
        label: t('chargersCables'),
        icon: Zap,
        href: '/store?category=mobile-accessories',
      },
      {
        id: 'offers',
        label: t('specialOffers'),
        icon: Tag,
        href: '/store?isBestSeller=true',
        badge: t('hot'),
        badgeColor: 'bg-red-600',
      },
      {
        id: 'warranty',
        label: t('warrantyGenuine'),
        icon: ShieldCheck,
        href: '/legal',
      },
    ],
    [categories, tags, t, locale]
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
                    <div className="absolute bottom-0 inset-s-0 w-full h-0.5 bg-primary rounded-t-full" />
                  )}
                </Link>

                {/* Mega Menu */}
                {item.menu && activeMenu === item.id && (
                  <div className="bg-popover border-border absolute top-full inset-s-0 w-full overflow-hidden border-t shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="main_container py-8 flex gap-8 relative z-10">
                      <div className="flex-1 flex flex-wrap gap-x-12 gap-y-8">
                        {item.menu.columns.map((col, idx) => {
                          if (col.links.length === 0) return null;
                          return (
                            <div key={idx} className="flex flex-col gap-4 min-w-35">
                              <h3 className="text-foreground font-bold text-sm flex items-center gap-2">
                                {col.title}
                              </h3>
                              <ul className="flex flex-col gap-2.5">
                                {col.links.map(
                                  (link: { href: string; label: string }, lIdx: number) => (
                                    <li key={lIdx}>
                                      <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground text-[13px] transition-colors"
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
