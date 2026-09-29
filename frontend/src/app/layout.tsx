import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui';
import { ThemeProvider } from '@/providers/ThemeProvider';
import NextTopLoader from 'nextjs-toploader';
import CookieConsent from '@/components/layout/CookieConsent';
import ScrollToTopButton from '@/components/layout/ScrollToTopButton';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://axiora-store.com'),
  title: 'Axiora Store - Electronics, Phones & Accessories',
  description: 'Your premier store for smartphones, mobile accessories, chargers, and audio in Egypt.',
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
    locale: 'en_US',
    siteName: 'Axiora Store',
    title: 'Axiora Store - Electronics, Phones & Accessories',
    description:
      'Browse and purchase smartphones, mobile accessories, chargers, cables, and audio gear in Egypt.',
    url: 'https://axiora-store.com',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Axiora Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axiora Store - Electronics, Phones & Accessories',
    description: 'Your premier store for smartphones, mobile accessories, chargers, and audio in Egypt.',
    images: ['/images/og-default.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} antialiased`}>
        {/* Progress bar for all client-side navigation */}
        <NextTopLoader
          color="#2563eb"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #2563eb, 0 0 5px #3b82f6"
          easing="ease"
          speed={200}
        />
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
      </body>
    </html>
  );
}
