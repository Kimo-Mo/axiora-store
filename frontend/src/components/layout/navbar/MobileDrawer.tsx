'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  User,
  LogOut,
  X,
  Zap,
  Tag,
  ChevronRight,
  Home,
  HeadphonesIcon,
  ShoppingBag,
  Settings,
  Moon,
  Sun,
  Smartphone,
  Watch,
} from 'lucide-react';
import {
  Button,
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { Logo } from '../Logo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { userService } from '@/services/user.service';
import type { AuthUser, ProductCategory, ProductTag } from '@/types';

const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'EGP',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'CAD',
  'BRL',
  'MXN',
  'ARS',
  'CLP',
  'JPY',
  'KRW',
  'CNY',
  'HKD',
  'TWD',
  'SGD',
  'MYR',
  'THB',
  'INR',
  'IDR',
  'PHP',
  'VND',
  'SAR',
  'AED',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
  'TRY',
  'ZAR',
  'NGN',
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function MobileDrawer({
  open,
  onClose,
  isAuthenticated,
  onLogin,
  onLogout,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tErrors = useTranslations('errors');
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false);

  const { data: userCurrencyData } = useQuery({
    queryKey: ['profile', 'currency', user?.id],
    queryFn: () => userService.getUserCurrency(user!.id),
    enabled: isAuthenticated && Boolean(user?.id) && open,
  });

  const cookieCurrency =
    typeof document !== 'undefined'
      ? document.cookie.match(new RegExp('(^| )currency=([^;]+)'))?.[2]
        ? decodeURIComponent(document.cookie.match(new RegExp('(^| )currency=([^;]+)'))![2])
        : null
      : null;

  const currency =
    selectedCurrency ||
    (isAuthenticated ? userCurrencyData?.currency || user?.settings?.currency : null) ||
    cookieCurrency ||
    'USD';

  const handleCurrencyChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    setIsUpdatingCurrency(true);

    // 1. Always set cookie for SSR and backend global currency logic
    document.cookie = `currency=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;

    if (isAuthenticated && user) {
      try {
        // 2. Update Backend Database (correcting the /api/user/ -> /api/users/user/ path)
        await userService.updateUserCurrency(user.id, { currency: newCurrency });

        // 3. Update Auth Store (so persisted state has the new currency)
        const updatedUser: AuthUser = {
          ...user,
          settings: {
            language_preference: 'ar',
            mode: 'system',
            location: null,
            ...(user.settings || {}),
            currency: newCurrency,
          },
        };
        setUser(updatedUser);

        // 4. Refresh Cart Prices and Clear Query Cache
        await useCartStore.getState().refreshCartPrices();
        queryClient.clear();

        // 5. Hard reload to ensure all server-side and client-side state is perfectly synced
        window.location.reload();
      } catch (error) {
        console.error('Failed to update currency:', error);
        toast.error(tErrors('updateCurrency'));
        setIsUpdatingCurrency(false);
      }
    } else {
      // Unauthenticated: just reload to apply cookie globally
      window.location.reload();
    }
  };

  // Fetch data only when drawer is opened
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => catalogService.publicTagsList(),
    enabled: open,
    staleTime: Infinity,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.publicCategoriesList(),
    enabled: open,
    staleTime: Infinity,
  });

  const getArray = <T,>(data: unknown): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as T[];
    if (
      typeof data === 'object' &&
      'results' in data &&
      Array.isArray((data as { results: unknown }).results)
    ) {
      return (data as { results: T[] }).results;
    }
    return [];
  };

  const tags = getArray<ProductTag>(tagsData);
  const categories = getArray<ProductCategory>(categoriesData);

  const navGroups = [
    {
      id: 'mobiles',
      label: t('mobiles'),
      icon: <Smartphone size={18} />,
      sections: [
        {
          title: t('categories'),
          items: categories.slice(0, 8).map((c) => ({
            label: c.name,
            href: `/store?category=${c.slug}`,
          })),
        },
        {
          title: t('popularTags'),
          items: tags.slice(0, 8).map((t2) => ({
            label: t2.name,
            href: `/store?tag=${t2.slug}`,
          })),
        },
      ],
    },
    {
      id: 'audio',
      label: t('audio'),
      icon: <HeadphonesIcon size={18} />,
      sections: [
        {
          title: t('audioGear'),
          items: [
            { label: t('wirelessEarbuds'), href: '/store?search=earbuds' },
            { label: t('headphones'), href: '/store?search=headphones' },
            { label: t('bluetoothSpeakers'), href: '/store?search=speaker' },
          ],
        },
      ],
    },
    {
      id: 'accessories',
      label: t('accessories'),
      icon: <Zap size={18} />,
      sections: [
        {
          title: t('powerProtection'),
          items: [
            { label: t('fastWallChargers'), href: '/store?search=charger' },
            { label: t('powerBanks'), href: '/store?search=power+bank' },
            { label: t('cablesAdapters'), href: '/store?search=cable' },
            { label: t('casesCovers'), href: '/store?search=case' },
          ],
        },
      ],
    },
    {
      id: 'wearables',
      label: t('wearables'),
      icon: <Watch size={18} />,
      sections: [
        {
          title: t('wearables'),
          items: [
            { label: t('smartWatches'), href: '/store?category=wearables' },
            { label: t('smartBands'), href: '/store?search=smart+band' },
          ],
        },
      ],
    },
  ];

  const renderSingleLink = (
    href: string,
    label: string,
    icon: React.ReactNode,
    active: boolean,
    onClick?: (e: React.MouseEvent) => void,
    badge?: string,
    badgeColor?: string
  ) => (
    <SheetClose asChild>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group ${
          active
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted text-foreground/80 hover:text-foreground'
        }`}>
        <div
          className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            active
              ? 'bg-primary/15 text-primary'
              : 'bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
          }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 font-medium">{label}</div>
        {badge && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none text-white ${badgeColor}`}>
            {badge}
          </span>
        )}
      </Link>
    </SheetClose>
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="start"
        showCloseButton={false}
        className="w-80 p-0 flex flex-col bg-background border-border"
        aria-describedby={undefined}>
        {/* ── Header ── */}
        <SheetTitle>
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 bg-black/80 supports-backdrop-filter:bg-black/80">
            <div onClick={onClose} className="cursor-pointer">
              <Logo />
            </div>
            <SheetClose asChild>
              <button className="rounded-full p-2 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </SheetClose>
          </div>
        </SheetTitle>

        {/* ── Navigation Links ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
          {isAuthenticated && (
            <div className="mb-4 space-y-1 pb-4 border-b border-white/10">
              <h3 className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {t('myAccount')}
              </h3>
              {renderSingleLink(
                '/profile',
                t('myProfile'),
                <Settings size={18} />,
                pathname === '/profile'
              )}
              {renderSingleLink(
                '/profile?tab=orders',
                t('myOrders'),
                <ShoppingBag size={18} />,
                pathname.includes('/profile') &&
                  typeof window !== 'undefined' &&
                  window.location.search.includes('orders')
              )}
            </div>
          )}

          {renderSingleLink('/', t('home'), <Home size={18} />, pathname === '/')}
          {renderSingleLink('/store', t('shop'), <ShoppingBag size={18} />, pathname === '/store')}

          <Accordion type="multiple" className="w-full space-y-1">
            {navGroups.map((group) => (
              <AccordionItem value={group.id} key={group.id} className="border-none">
                <AccordionTrigger className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 hover:bg-muted text-foreground/80 hover:text-foreground hover:no-underline data-[state=open]:bg-muted/50 data-[state=open]:text-white data-[state=open]:font-bold group">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="size-9 rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-data-[state=open]:bg-primary/20 group-data-[state=open]:text-primary flex items-center justify-center shrink-0 transition-colors">
                      {group.icon}
                    </div>
                    <span className="text-[15px]">{group.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2 pt-1 px-2">
                  <div className="ps-13 pe-2 space-y-5">
                    {group.sections.map((section, idx) => {
                      if (section.items.length === 0) return null;
                      return (
                        <div key={idx} className="space-y-2.5">
                          <h4 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                            {section.title}
                          </h4>
                          <div className="grid grid-cols-1 gap-1.5">
                            {section.items.map(
                              (item: { label: string; href: string }, i: number) => (
                                <SheetClose asChild key={i}>
                                  <Link
                                    href={item.href}
                                    className="text-[13.5px] text-gray-400 hover:text-primary hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200 flex items-center gap-2">
                                    <ChevronRight
                                      size={12}
                                      className="opacity-0 -ms-3 transition-all duration-200 rtl:rotate-180"
                                    />
                                    <span>{item.label}</span>
                                  </Link>
                                </SheetClose>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {renderSingleLink(
            '/store?is_popular=true',
            t('specialOffers'),
            <Tag size={18} />,
            false,
            undefined,
            t('hot'),
            'bg-red-600'
          )}
          {renderSingleLink(
            '/support',
            t('support'),
            <HeadphonesIcon size={18} />,
            pathname === '/support'
          )}
        </div>

        {/* ── Settings & Footer ── */}
        <div className="border-t border-white/5 bg-black/80 supports-backdrop-filter:bg-black/80 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Select
              value={currency}
              onValueChange={handleCurrencyChange}
              disabled={isUpdatingCurrency}>
              <SelectTrigger className="flex-1 h-10 bg-background/50 border-white/10 font-bold focus:ring-1 focus:ring-primary">
                <SelectValue placeholder={t('currency')} />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((cur) => (
                  <SelectItem key={cur} value={cur} className="font-medium">
                    {cur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <LanguageSwitcher className="h-10 w-10 shrink-0" />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-white/10 bg-background/50"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors cursor-pointer group">
              <div className="size-10 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center shrink-0 transition-colors">
                <LogOut size={18} className="text-destructive" />
              </div>
              <div className="text-start flex-1">
                <p className="text-[15px] font-semibold text-white">{t('signOut')}</p>
                <p className="text-xs text-destructive/80 mt-0.5">{t('endSession')}</p>
              </div>
            </button>
          ) : (
            <Button
              className="w-full h-12 text-[15px] font-bold rounded-xl gap-2 shadow-lg shadow-primary/20"
              onClick={() => {
                onLogin();
                onClose();
              }}>
              <User size={18} />
              {t('signInAccount')}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
