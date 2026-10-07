import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url?: string | null): string {
  if (!url)
    return 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  if (url.startsWith('http') || url.startsWith('https')) return url;

  // Clean URL to make sure it starts with /
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  // Use public env var, fallback to 127.0.0.1:8000
  let baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000/api/v1';

  // Media files are served from the root domain, not the /api/v1 path
  baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');

  return `${baseUrl}${cleanUrl}`;
}

/**
 * Format a number as Egyptian currency (EGP) with locale-appropriate numerals
 * and up to 2 decimal places.
 */
export function formatMoney(amount: number, locale: string = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
