import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Changa, IBM_Plex_Sans_Arabic } from 'next/font/google';
import '../globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui';
import { ThemeProvider } from '@/providers/ThemeProvider';
import NextTopLoader from 'nextjs-toploader';
import CookieConsent from '@/components/layout/CookieConsent';
import ScrollToTopButton from '@/components/layout/ScrollToTopButton';
import { getLocaleDirection, isSupportedLocale, routing } from '@/i18n/routing';

// Flap-cell display voice: condensed caps, Arabic + Latin. Body companion below.
const display = Changa({
  subsets: ['arabic', 'latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

// Arabic-native body face for RTL parity. Latin glyphs fall back cleanly.
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: 'common' });
  const title = t('siteTitle');
  const description = t('siteDescription');

  return {
    metadataBase: new URL(process.env.SITE_URL || 'https://axiora-store.com'),
    title,
    description,
    keywords: [
      'smartphones',
      'phone accessories',
      'chargers',
      'cables',
      'earbuds',
      'smart watches',
      'Egypt electronics',
    ],
    authors: [{ name: 'Axiora Store' }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      siteName: 'Axiora Store',
      title,
      description,
      url: 'https://axiora-store.com',
      images: [
        {
          url: '/icon.svg',
          width: 64,
          height: 64,
          alt: 'Axiora Store',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/icon.svg'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Invalid locale segments are redirected by proxy.ts; this is the safety net.
  if (!isSupportedLocale(locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      suppressHydrationWarning
      data-scroll-behavior="smooth">
      <body className={`${display.variable} ${arabic.variable} font-sans antialiased`}>
        <div
          aria-hidden="true"
          hidden
          dangerouslySetInnerHTML={{
            __html: `<!-- THESIS: Axiora is the night concourse where every price is a departure: ranked deal rows in fixed cells, cascade-flip drops, steel-framed boards. The carousel-mall arrangement is refused. OWN-WORLD: flap-black boards, steel frames, letter-white Changa caps (Arabic-first) with tabular prices; amber is live/CTA, red is price-drop, white is in-stock; ruled columns never move; one cascade motion; paper-timetable light twin. STORY: visitor reads today's drops like departures, believes prices are live and honest, boards a row to product, exits through COD with a receipt. FIRST VIEWPORT: concourse masthead (flap-cell AXIORA, utilities); giant flap-cell Arabic offer headline plus amber CTA; live deal rows (item, drop, was, now, status); platform strip of categories. FORM: challenger split-flap fused for deals, 2nd of 7 grounded, seed 0e5a151d. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->`,
          }}
        />
        {/* Progress bar for all client-side navigation */}
        <NextTopLoader
          color="#FFB000"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #FFB000, 0 0 5px #FFC233"
          easing="ease"
          speed={200}
        />
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange>
              {children}
              <CookieConsent />
              <ScrollToTopButton />
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
