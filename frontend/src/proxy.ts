import { NextRequest, NextResponse } from 'next/server';

// ─── Route Definitions ────────────────────────────────────────────────────────

/** Requires any authenticated user */
const PROTECTED_ROUTES = ['/profile', '/orders', '/payments', '/checkout'];

/** Requires admin or developer role */
const ADMIN_ROUTES = ['/dashboard'];

/** Skip middleware entirely (static) */
const IGNORE_PREFIXES = ['/_next', '/favicon.ico', '/google-logo.png'];

const BACKEND_API_PREFIXES = [
  '/api/auth',
  '/api/users',
  '/api/catalog',
  '/api/cart',
  '/api/orders',
  '/api/dashboard',
  '/api/payments',
  '/api/support',
  '/api/v1/auth',
  '/api/v1/users',
  '/api/v1/catalog',
  '/api/v1/cart',
  '/api/v1/orders',
  '/api/v1/dashboard',
  '/api/v1/payments',
  '/api/v1/support',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path.startsWith(p));
}

/**
 * Decode JWT payload without verifying signature.
 * Safe for middleware — we only need the role claim for routing.
 * The real signature validation happens on the backend for every API call.
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
  if (startsWithAny(pathname, BACKEND_API_PREFIXES)) {
    let backendUrlString = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    if (backendUrlString.endsWith('/')) {
      backendUrlString = backendUrlString.slice(0, -1);
    }
    let backendPath = pathname;
    if (backendPath.startsWith('/api/v1/')) {
      // Already contains v1, leaving it alone
    } else if (backendPath.startsWith('/api/')) {
      backendPath = backendPath.replace('/api/', '/api/v1/');
    }

    if (!backendPath.endsWith('/')) {
      backendPath += '/';
    }

    const backendUrl = new URL(`${backendUrlString}${backendPath}${search}`);
    return NextResponse.rewrite(backendUrl);
  }

  // Skip for static assets and Next internals
  if (startsWithAny(pathname, IGNORE_PREFIXES) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const isProtected = startsWithAny(pathname, PROTECTED_ROUTES);
  const isAdminRoute = startsWithAny(pathname, ADMIN_ROUTES);

  // Nothing to protect — let through
  if (!isProtected && !isAdminRoute) {
    return NextResponse.next();
  }

  // Read HttpOnly access cookie set by Django backend
  const accessToken = request.cookies.get('access')?.value;
  const refreshToken = request.cookies.get('refresh')?.value;

  // ── 1. No token at all (neither access nor refresh) → redirect to login ──
  if (!accessToken && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'login');
    return NextResponse.redirect(url);
  }

  const payload = accessToken ? decodeJwtPayload(accessToken) : null;

  // ── 2. Token expired or invalid, and no refresh token to save the day → redirect to login ──
  if ((!payload || isTokenExpired(payload)) && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'login');
    const response = NextResponse.redirect(url);
    response.cookies.delete('access');
    return response;
  }

  // ── 3. Admin route — role check ──
  if (isAdminRoute) {
    // Prefer the dedicated user_role cookie (set by authStore & axios interceptor),
    // because the JWT issued after token refresh may be missing the role claim.
    const roleCookie = request.cookies.get('user_role')?.value;
    const role: string | undefined =
      roleCookie || (payload && !isTokenExpired(payload) ? (payload['role'] as string) : undefined);

    const allowedRoles = ['admin', 'developer'];

    if (!role || !allowedRoles.includes(role)) {
      // The user IS authenticated (tokens exist) but lacks admin rights.
      // Redirect to home — do NOT add ?auth=login (that opens a login modal
      // for someone who is already logged in).
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.delete('auth');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
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

