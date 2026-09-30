import Link from 'next/link';
import { cookies } from 'next/headers';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSupportedLocale, routing } from '@/i18n/routing';

export default async function NotFound() {
  const cookieStore = await cookies();
  const remembered = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isSupportedLocale(remembered) ? remembered : routing.defaultLocale;
  const isAr = locale === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
      {/* Big 404 */}
      <div className="relative select-none">
        <span className="text-[9rem] font-black leading-none text-muted/60 tracking-tighter">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none bg-clip-text text-transparent bg-linear-to-br from-primary to-primary/30 tracking-tighter">
          404
        </span>
      </div>

      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">
          {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isAr
            ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك مواصلة التسوق للهواتف الذكية والإكسسوارات الأصلية في متجر أكسيورا.'
            : "The page you're looking for doesn't exist or has been moved. You can keep shopping genuine smartphones and accessories at Axiora Store."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href={`/${locale}`}>
            <Home size={16} className="me-2" />
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${locale}/store`}>
            <Search size={16} className="me-2" />
            {isAr ? 'تصفح المنتجات' : 'Browse Products'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
