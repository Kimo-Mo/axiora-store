import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, 401/403 on this request will not trigger the refresh-token flow (e.g. logout). */
    skipTokenRefresh?: boolean;
  }
}

const isServer = typeof window === 'undefined';
let baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

if (isServer && baseURL.startsWith('/')) {
  const backendUrlString = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  const backendUrl = backendUrlString.endsWith('/') ? backendUrlString.slice(0, -1) : backendUrlString;
  baseURL = baseURL.replace('/api', `${backendUrl}/api/v1`);
}

const api = axios.create({
  // Use relative URL on client, absolute URL to backend on server
  baseURL,
  withCredentials: true,
});

interface QueueItem {
  resolve: (token?: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];
let csrfFetching = false;
let csrfFetchedAt: number | null = null;
const CSRF_MAX_AGE = 60 * 60;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// --------------------------
// Get CSRF from cookie
// --------------------------
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  const token = match ? decodeURIComponent(match[2]) : null;
  return token;
};

// --------------------------
// Ensure CSRF token exists
// --------------------------
const ensureCSRFToken = async (): Promise<string | null> => {
  let token = getCookie('csrftoken');
  const now = Math.floor(Date.now() / 1000);

  if (token && csrfFetchedAt && now - csrfFetchedAt < CSRF_MAX_AGE) {
    return token;
  }
  if (csrfFetching) {
    return token;
  }

  csrfFetching = true;
  try {
    await axios.get(`${baseURL}/auth/csrf-token/`, {
      withCredentials: true,
    });
    token = getCookie('csrftoken');
    if (token) {
      csrfFetchedAt = now;
    }
    // else {
    //   console.error('CSRF token not found in cookie after fetch');
    // }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  } finally {
    csrfFetching = false;
  }
  return token;
};

// --------------------------
// Always attach X-CSRFToken
// --------------------------
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = await ensureCSRFToken();
      if (csrfToken) {
        config.headers.set('X-CSRFToken', csrfToken);
      } else {
        console.warn('No CSRF token available for request:', config.url);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// --------------------------
// Refresh token logic
// --------------------------
const refreshToken = () => api.post('/auth/refresh/');

/**
 * Match auth subpaths regardless of how Axios stores `url` (e.g. `/auth/logout/` vs `auth/logout/`)
 * or whether `baseURL` is merged into a single string.
 */
const requestMatchesAuthSubpath = (
  config: InternalAxiosRequestConfig | undefined,
  subpath: 'refresh' | 'logout' | 'login' | 'register'
): boolean => {
  if (!config) return false;
  const url = config.url ?? '';
  const base = config.baseURL ?? '';
  const combined = `${base}${url}`.replace(/\/{2,}/g, '/');
  const patterns = [
    new RegExp(`(^|/)auth/${subpath}(/|\\?|$)`, 'i'),
    new RegExp(`(^|/)api/auth/${subpath}(/|\\?|$)`, 'i'),
  ];
  return patterns.some((re) => re.test(url) || re.test(combined));
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;

  // Clear the client-readable parts of auth state immediately.
  localStorage.removeItem('axiora-auth-storage');

  // The HttpOnly access/refresh cookies can only be cleared by the server.
  // We use fetch directly (not axios) to avoid triggering the interceptor
  // again and causing an infinite loop. The logout endpoint is AllowAny so
  // it succeeds even with an expired or missing access token.
  const csrfToken = getCookie('csrftoken') ?? '';
  fetch('/api/auth/logout/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
  }).finally(() => {
    window.location.href = '/?auth=login';
  });
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend wraps every response as { data: <payload>, message, status }
    // Auto-unwrap so service callers get the actual payload directly.
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      'status' in response.data
    ) {
      if (typeof response.data.data === 'number' && typeof response.data.status === 'object') {
        // Backend accidentally flipped data and status for this endpoint
        response.data = response.data.status;
      } else {
        response.data = response.data.data;
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!error.response || !originalRequest) {
      console.error('Network or server error:', error);
      return Promise.reject(error);
    }

    if (requestMatchesAuthSubpath(originalRequest, 'refresh')) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (
      originalRequest.skipTokenRefresh === true ||
      requestMatchesAuthSubpath(originalRequest, 'logout') ||
      requestMatchesAuthSubpath(originalRequest, 'login') ||
      requestMatchesAuthSubpath(originalRequest, 'register')
    ) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      // Do not gate refresh on localStorage: Zustand persist shape/timing can disagree with
      // in-memory auth (e.g. hydration), while HttpOnly cookies still hold a valid session.
      // Attempt refresh; if it fails, treat as logged out.

      if (originalRequest._retry) {
        redirectToLogin();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await refreshToken();
        if (res.status === 200 || res.status === 201) {
          // Persist role in a client-readable cookie so middleware can
          // authorize admin routes even when the new JWT lacks the role claim.
          if (typeof document !== 'undefined') {
            const role =
              (res.data as { user?: { role?: string } } | null)?.user?.role;
            if (role) {
              document.cookie = `user_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
            }
          }
          processQueue(null);
          return api(originalRequest);
        }
        processQueue(error, null);
        redirectToLogin();
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('Refresh token failed:', refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

