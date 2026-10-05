'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search, ShoppingCart, User, Loader2, Menu } from 'lucide-react';
import { useCartStore } from '@/lib/stores/useCartStore';
import { Badge, Button, Input, ThemeToggle } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useClearUser, useUser } from '@/hooks/useUser';
import { authService } from '@/services/auth.service';
import { useAuthModal } from '@/providers/AuthModalProvider';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { MobileDrawer } from './navbar/MobileDrawer';
import { UserDropdown } from './navbar/UserDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MainNavItems } from './navbar/MainNavItems';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LegacyProduct } from '@/types/legacyCatalog';
import Image from 'next/image';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getImageUrl } from '@/lib/utils';
import { SecondaryNavbar } from './navbar/SecondaryNavbar';

export const Navbar = () => {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  // next-intl pathname (locale prefix stripped) — hiddenSearchPaths stay unprefixed.
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useAuthModal();
  // The session is server state, owned by `useUser()`. There is no persisted auth
  // state to rehydrate any more, so the old "wait for persist, then validate
  // session" dance is gone — the query asks the server on mount, which *is* the
  // validation, and it cannot disagree with the server about who is signed in.
  const { data: user, isLoading: isAuthLoading } = useUser();
  const clearUser = useClearUser();
  const isAuthenticated = Boolean(user);
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state._hasHydrated);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const hiddenSearchPaths = ['/store', '/legal', '/support', '/about', '/contact'];
  const shouldShowSearch = !hiddenSearchPaths.some((p) => pathname?.startsWith(p));

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['simpleSearch', debouncedSearch],
    queryFn: () => legacyCatalogService.simpleSearch(debouncedSearch),
    enabled: debouncedSearch.length > 1,
  });
  // Reset search focus/menu when navigating to a new page, but keep the search text
  useEffect(() => {
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
  }, [pathname]);

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/store?search=${encodeURIComponent(search.trim())}`);
      setIsSearchFocused(false);
      setIsMobileSearchFocused(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Revokes the session server-side, then clears cookies in the browser.
      await authService.logout();
    } catch {
      // A network or server fault must not leave the customer stuck signed in
      // locally, so the local state is cleared either way.
    } finally {
      clearUser();
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('axiora-auth-storage');
      }
      toast.success(t('signOut'));
      if (
        pathname &&
        (pathname.startsWith('/profile') ||
          pathname.startsWith('/orders') ||
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/checkout'))
      ) {
        router.push('/');
      }
    }
  };

  const totalItems = items.length;
  // Role values are uppercase, matching the backend `Role` enum.
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-50 flex w-full justify-center border-b border-border text-foreground backdrop-blur">
        <div className="main_container py-2 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
            {/* ── Left: Menu + Logo ── */}
            <div className="flex items-center gap-1 sm:gap-2">
                <button
                className="block p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setDrawerOpen(true)}
                aria-label={t('menu')}>
                <Menu className="size-5 md:size-5" />
              </button>
              <Logo />
            </div>
            {!shouldShowSearch ? (
              <MainNavItems />
            ) : (
              <div className="hidden md:flex items-center w-full max-w-md lg:max-w-xl relative">
                <div className="relative w-full">
                  <Input
                    id="search"
                    name="search"
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    className="pe-10 bg-input text-foreground w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onClick={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    name="search"
                    variant="secondary"
                    size="icon"
                    className="h-[calc(100%-2px)] absolute end-px top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:bg-muted-foreground/10"
                    onClick={handleSearch}>
                    {isSearchLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Search size={20} />
                    )}
                  </Button>
                </div>
                {/* Search Dropdown */}
                {isSearchFocused && debouncedSearch.length > 1 && searchResults?.products && (
                  <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-md shadow-lg flex flex-col max-h-80 overflow-y-auto z-99">
                    {searchResults.products.slice(0, 10).map((product: LegacyProduct, idx: number) => {
                      const details = [product.categories?.[0]?.name].filter(Boolean);

                      return (
                        <Link
                          key={idx}
                          href={`/product/${product.slug}`}
                          className="group flex items-start gap-3 p-3 hover:bg-white/5 transition-colors border-b border-border last:border-0"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsSearchFocused(false);
                          }}>

                          {/* Image */}
                          {product.main_image ? (
                            <div className="w-20 h-12 md:w-28 md:h-16 relative shrink-0 bg-muted/20 rounded-md overflow-hidden shadow-sm">
                              <Image
                                src={getImageUrl(product.main_image as string)}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 md:w-28 md:h-16 shrink-0 bg-muted/20 rounded-md flex items-center justify-center shadow-sm">
                              <Search size={16} className="text-muted-foreground/50" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex flex-1 min-w-0 justify-between items-start gap-2">
                            {/* Left Side (Title & Info) */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {product.name}
                                </span>
                                {product.is_popular && (
                                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#ff6a00] border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-sm leading-none">
                                    popular
                                  </span>
                                )}
                              </div>

                              {details.length > 0 && (
                                <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-0.5">
                                  <span className="line-clamp-2 font-medium leading-tight wrap-break-word">
                                    {details.join(' • ')}
                                  </span>
                                </div>
                              )}

                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden max-h-5.5">
                                  {product.tags.slice(0, 5).map((tag, i) => (
                                    <span key={i} className="text-[9px] text-gray-400 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                      {tag.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right Side (Price) */}
                            {product.price !== null && (
                              <div className="flex flex-col items-end shrink-0 ps-2">
                                <span className="text-sm font-bold text-foreground">
                                  {Number(product.price).toFixed(2)} {product.currency}
                                </span>

                                {product.price_before_offer && product.price_before_offer > product.price && (
                                  <div className="flex flex-col items-end mt-0.5 space-y-0.5">
                                    <span className="text-xs text-muted-foreground line-through">
                                      {Number(product.price_before_offer).toFixed(2)} {product.currency}
                                    </span>
                                    {(product.discount_percent ?? 0) > 0 && (
                                      <span className="text-[10px] font-bold text-white bg-[#ff4747] px-1.5 py-0.5 rounded-sm leading-none shadow-sm">
                                        -{product.discount_percent}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    {searchResults.products.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {t('noResultsFor', { query: debouncedSearch })}
                      </div>
                    )}
                    {searchResults.products.length > 10 && (
                      <div
                        className="p-2 text-center text-primary text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
                        onMouseDown={(e) => { e.preventDefault(); handleSearch(); }}>
                        {t('viewAllResults')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Right Actions ── */}
            <nav className="flex items-center gap-1 sm:gap-2 md:gap-3" aria-label={t('account')}>
              <LanguageSwitcher />

              <ThemeToggle className="h-8! w-8! md:h-9! md:w-9! rounded-full" />

              {/* Cart */}
              <Button variant="secondary" size="icon" className="relative h-8! w-8! md:h-9! md:w-9! rounded-full">
                <Link href="/cart" className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="size-4 md:size-5" />
                  {hydrated && totalItems > 0 && (
                    <Badge
                      className="absolute -top-2 -inset-e-2 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[9px] md:text-[10px]"
                      variant="default">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* Auth Area */}
              {isAuthenticated && user ? (
                <UserDropdown user={user} isAdmin={isAdmin} onLogout={handleLogout} />
              ) : isAuthLoading ? (
                <Button variant="outline" disabled className="gap-2 opacity-70 h-8! md:h-9! px-3 rounded-full md:rounded-md">
                  <Loader2 className="animate-spin size-4 md:size-3.75" />
                  <span className="hidden lg:block text-sm">{tCommon('loading')}</span>
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="flex items-center gap-2 cursor-pointer h-8! md:h-9! px-3 md:px-4 text-xs md:text-sm rounded-full md:rounded-md"
                  onClick={() => openModal()}>
                  <User className="size-4 md:size-5" />
                  <span className="hidden lg:block">{t('signIn')}</span>
                </Button>
              )}
            </nav>
          </div>

          {/* Mobile Search Bar — always visible on mobile */}
          {shouldShowSearch && (
            <div className="md:hidden relative w-full pb-1">
              <Input
                id="mobile-search"
                name="mobile-search"
                type="search"
                placeholder={t('searchPlaceholder')}
                className="pe-10 bg-input text-foreground w-full h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsMobileSearchFocused(true)}
                onClick={() => setIsMobileSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsMobileSearchFocused(false), 200)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                    setIsMobileSearchFocused(false);
                  }
                }}
              />
              <Button
                name="mobile-search-btn"
                variant="secondary"
                size="icon"
                className="absolute end-px top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:bg-muted-foreground/10 h-8! w-8!"
                onClick={() => { handleSearch(); setIsMobileSearchFocused(false); }}>
                {isSearchLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Search size={16} />
                )}
              </Button>

              {/* Mobile Search Dropdown */}
              {isMobileSearchFocused && debouncedSearch.length > 1 && searchResults?.products && (
                <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-md shadow-lg flex flex-col max-h-80 overflow-y-auto overflow-x-hidden z-100">
                  {searchResults.products.slice(0, 10).map((product: LegacyProduct, idx: number) => {
                    const details = [product.categories?.[0]?.name].filter(Boolean);

                    return (
                      <Link
                        key={idx}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setIsMobileSearchFocused(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className="group flex items-start gap-3 p-3 hover:bg-white/5 transition-colors border-b border-border last:border-0 relative">

                        {/* Image */}
                        {product.main_image ? (
                          <div className="w-20 h-12 md:w-28 md:h-16 relative shrink-0 bg-muted/20 rounded-md overflow-hidden shadow-sm">
                            <Image
                              src={getImageUrl(product.main_image as string)}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-12 md:w-28 md:h-16 shrink-0 bg-muted/20 rounded-md flex items-center justify-center shadow-sm">
                            <Search size={16} className="text-muted-foreground/50" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex flex-1 min-w-0 justify-between items-start gap-2">
                          {/* Left Side (Title & Info) */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {product.name}
                              </span>
                              {product.is_popular && (
                                <span className="hidden sm:inline-flex shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#ff6a00] border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-sm leading-none">
                                  popular
                                </span>
                              )}
                            </div>

                            {product.is_popular && (
                              <div className="sm:hidden mb-1">
                                <span className="inline-flex text-[9px] font-bold uppercase tracking-wider text-[#ff6a00] border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-1.5 py-0.5 rounded-sm leading-none">
                                  popular
                                </span>
                              </div>
                            )}

                            {details.length > 0 && (
                              <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <span className="line-clamp-2 font-medium leading-tight wrap-break-word">
                                  {details.join(' • ')}
                                </span>
                              </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden max-h-5.5">
                                {product.tags.slice(0, 5).map((tag, i) => (
                                  <span key={i} className="text-[9px] text-gray-400 border border-white/10 bg-white/5 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right Side (Price) */}
                          {product.price !== null && (
                            <div className="flex flex-col items-end shrink-0 ps-2">
                              <span className="text-sm font-bold text-foreground">
                                {Number(product.price).toFixed(2)} {product.currency}
                              </span>

                              {product.price_before_offer && product.price_before_offer > product.price && (
                                <div className="flex flex-col items-end mt-0.5 space-y-0.5">
                                  <span className="text-xs text-muted-foreground line-through">
                                    {Number(product.price_before_offer).toFixed(2)} {product.currency}
                                  </span>
                                  {(product.discount_percent ?? 0) > 0 && (
                                    <span className="text-[10px] font-bold text-white bg-[#ff4747] px-1.5 py-0.5 rounded-sm leading-none shadow-sm">
                                      -{product.discount_percent}%
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  {searchResults.products.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {t('noResultsFor', { query: debouncedSearch })}
                      </div>
                    )}
                    {searchResults.products.length > 10 && (
                      <div
                        className="p-2 text-center text-primary text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
                        onMouseDown={(e) => { e.preventDefault(); handleSearch(); setIsMobileSearchFocused(false); }}>
                        {t('viewAllResults')}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <SecondaryNavbar />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAuthenticated={isAuthenticated}
        onLogin={() => openModal()}
        onLogout={handleLogout}
      />
    </>
  );
};

