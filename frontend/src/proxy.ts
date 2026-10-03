import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { isSupportedLocale, routing } from './i18n/routing';

// next-intl locale handling: negotiates locale, redirects bare `/` and
// locale-less paths (remembered preference → else Arabic default).
const intlMiddleware = createMiddleware(routing);

// First segment shaped like a locale tag (xx or xx-YY), e.g. `/fr`, `/ar-EG`.
// Unsupported tags are stripped explicitly (FR-013) — next-intl would
// otherwise prefix them as-is (`/fr/x` → `/ar/fr/x`).
const LOCALE_LIKE = /^\/([A-Za-z]{2}(?:-[A-Za-z0-9]{2,})?)(\/|$)/;

// ─── Route Definitions ────────────────────────────────────────────────────────

/** Requires any authenticated user */
const PROTECTED_ROUTES = ['/profile', '/orders', '/payments', '/checkout'];

/** Requires the administrator role */
const ADMIN_ROUTES = ['/dashboard'];

/** Skip middleware entirely (static) */
const IGNORE_PREFIXES = ['/_next', '/favicon.ico', '/google-logo.png'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path.startsWith(p));
}

/**
 * Decode the JWT payload without verifying the signature.
 *
 * This is a routing convenience, NOT an authorization boundary. The Edge runtime
 * cannot verify against a secret held only by the backend, so a forged token could
 * make an admin page render here. That is harmless: every data request inside it is
 * refused by the backend's `requireAdmin`. The backend is the sole authority for
 * authorization (constitution Principle II).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    // atob is available in Next.js Edge Runtime
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload['exp'];
  if (typeof exp !== 'number') return true;
  return Date.now() / 1000 > exp;
}

// ─── Proxy ───────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ── 1. API Reverse Proxy ──
  // If request targets one of the backend spaces via /api/, rewrite it to the backend server.
  // This avoids CORS issues and guarantees cookies are mapped properly to localhost.
  if (pathname.startsWith('/api/')) {
    // Port 5000 is the Express app (`backend/.env` PORT). 8000 was Django's.
    let backendUrlString = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
    if (backendUrlString.endsWith('/')) {
      backendUrlString = backendUrlString.slice(0, -1);
    }

    // Callers may use either `/api/...` or the explicit `/api/v1/...`.
    const backendPath = pathname.startsWith('/api/v1/') ? pathname : pathname.replace('/api/', '/api/v1/');

    const backendUrl = new URL(`${backendUrlString}${backendPath}${search}`);
    return NextResponse.rewrite(backendUrl);
  }

  // Skip for static assets and Next internals
  if (startsWithAny(pathname, IGNORE_PREFIXES)) {
    return NextResponse.next();
  }

  // ── 2. Invalid-locale strip (FR-013) ──
  // `/fr/store` → `/ar/store`, `/ar-EG/x` → `/ar/x`. Anything else falls
  // through to next-intl (bare `/`, locale-less paths, valid prefixes).
  const localeLike = pathname.match(LOCALE_LIKE);
  if (localeLike && !isSupportedLocale(localeLike[1].toLowerCase())) {
    const rest = pathname.slice(localeLike[1].length + 1) || '/';
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}${rest.startsWith('/') ? rest : `/${rest}`}`;
    return NextResponse.redirect(url);
  }

  // ── 3. next-intl locale routing ──
  const intlResponse = intlMiddleware(request);
  // intl issued a redirect (e.g. `/` → `/ar`, locale-less → prefixed):
  // honor it untouched.
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // From here on, work with the locale-stripped path for guard matching,
  // but re-attach the locale on every redirect (FR-010).
  const localePrefix = pathname.match(/^\/(ar|en)(\/|$)/);
  const locale = localePrefix ? localePrefix[1] : routing.defaultLocale;
  const strippedPath = localePrefix ? pathname.slice(localePrefix[0].length - 1) || '/' : pathname;

  const isProtected = startsWithAny(strippedPath, PROTECTED_ROUTES);
  const isAdminRoute = startsWithAny(strippedPath, ADMIN_ROUTES);

  // Nothing to protect — let through (carries next-intl headers/cookies)
  if (!isProtected && !isAdminRoute) {
    return intlResponse;
  }

  const createLocaleRedirect = (authParam?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    if (authParam) {
      url.searchParams.set('auth', authParam);
      if (strippedPath && strippedPath !== '/') {
        url.searchParams.set('returnTo', strippedPath + (search || ''));
      }
    } else {
      url.searchParams.delete('auth');
      url.searchParams.delete('returnTo');
    }
    return withIntlCookies(NextResponse.redirect(url), intlResponse);
  };

  // HttpOnly cookies set by the Express backend
  const accessToken = request.cookies.get('access')?.value;
  const refreshToken = request.cookies.get('refresh')?.value;

  // 1. No token at all (neither access nor refresh) -> redirect to login
  if (!accessToken && !refreshToken) {
    return createLocaleRedirect('login');
  }

  const payload = accessToken ? decodeJwtPayload(accessToken) : null;

  // 2. Token expired or invalid, and no refresh token to save the day -> redirect to login
  if ((!payload || isTokenExpired(payload)) && !refreshToken) {
    const response = createLocaleRedirect('login');
    response.cookies.delete('access');
    return response;
  }

  // 3. Admin route — role check
  if (isAdminRoute) {
    // The role comes from the signed JWT claim only. The `user_role` cookie that
    // used to be preferred here was written by client JavaScript, so anyone could
    // grant themselves an admin redirect by setting it. It no longer exists.
    //
    // The claim is uppercase, matching the backend `Role` enum. The previous
    // lowercase comparison could never match, which left the guard inert.
    const role = payload && !isTokenExpired(payload) ? (payload['role'] as string | undefined) : undefined;

    if (role !== 'ADMIN') {
      // The user IS authenticated (tokens exist) but lacks admin rights.
      // Redirect to home — do NOT add ?auth=login (that opens a login modal
      // for someone who is already logged in).
      return createLocaleRedirect();
    }
  }

  // Guards passed — return the intl response (carries locale headers/cookies).
  return intlResponse;
}

/**
 * Propagate next-intl cookies (e.g. remembered-locale preference) onto a
 * guard redirect so locale memory survives auth redirects.
 */
function withIntlCookies(response: NextResponse, intlResponse: NextResponse) {
  const setCookie = intlResponse.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
  return response;
}

export const config = {
  /*
   * Match all routes EXCEPT:
   * - Next.js internals  (_next/*)
   * - Static files       (favicon, images …)
   * - API routes         (api/*)
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
