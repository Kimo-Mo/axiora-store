import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import type { AuthErrorCode } from '@/types/auth';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Suppresses the refresh-and-retry flow for this request. Set on the
     * credential endpoints themselves: a 401 from `/auth/refresh` means the
     * session is genuinely dead, and retrying would loop.
     */
    skipTokenRefresh?: boolean;
    /** Set once a request has already been replayed after a renewal. */
    _retried?: boolean;
    /** Inconclusive-failure retry counter, for transient network/server faults. */
    _attempt?: number;
  }
}

const isServer = typeof window === 'undefined';
let baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

if (isServer && baseURL.startsWith('/')) {
  // Server-side rendering has no cookie jar to forward, so calls go straight to
  // the backend. Port 5000 is the Express app (`backend/.env` PORT) — 8000 was
  // Django's and is no longer running.
  const backendUrlString = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
  const backendUrl = backendUrlString.endsWith('/') ? backendUrlString.slice(0, -1) : backendUrlString;
  baseURL = baseURL.replace('/api', `${backendUrl}/api/v1`);
}

const api = axios.create({
  // Relative on the client (same-origin via `proxy.ts`), absolute on the server.
  baseURL,
  // Required: the session lives in HttpOnly cookies the browser will not attach
  // unless the request is explicitly credentialed.
  withCredentials: true,
});

/** Paths that must never trigger the refresh flow. */
const NO_REFRESH_PATHS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout'];

const MAX_TRANSIENT_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 400;

/**
 * The in-flight renewal, shared by every request that is waiting on it.
 *
 * This is the whole concurrency control. After a 15-minute expiry a burst of
 * requests 401s together; if each fired its own refresh, rotation would invalidate
 * all but the last and log the customer out. Assigning the promise synchronously
 * — before any `await` — means concurrent callers all receive the same one.
 */
let refreshPromise: Promise<unknown> | null = null;

function renewSession(): Promise<unknown> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, undefined, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** Hook so signing out can drop the cached user even though it lives in a query. */
let onSessionEnded: (() => void) | null = null;

export function setSessionEndedHandler(handler: (() => void) | null): void {
  onSessionEnded = handler;
}

/**
 * A 401 or 403 is a *definitive rejection*: the server judged the credential and
 * refused it. A 5xx, timeout, or network error is *inconclusive*: the server
 * never reached a judgement, so the session may well still be valid.
 *
 * Signing out on an inconclusive failure is what the previous implementation did,
 * and it meant a momentary database blip logged out every customer browsing at
 * that moment. Here the session survives and the customer is told the connection
 * is the problem.
 */
function isDefinitiveRejection(error: AxiosError): boolean {
  const status = error.response?.status;
  return status === 401 || status === 403;
}

function errorCode(error: unknown): AuthErrorCode | null {
  if (!axios.isAxiosError(error)) return null;
  const code = (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code;
  return (code as AuthErrorCode | undefined) ?? null;
}

function isTransient(error: AxiosError): boolean {
  const status = error.response?.status;
  // No response at all means the request never reached the server.
  return status === undefined || status === 0 || status >= 500;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & AxiosRequestConfig) | undefined;
    if (!config || config.skipTokenRefresh) {
      return Promise.reject(error);
    }

    const path = config.url ?? '';
    const credentialPath = NO_REFRESH_PATHS.some((p) => path.includes(p));

    if (isDefinitiveRejection(error) && !credentialPath && !config._retried) {
      config._retried = true;
      try {
        await renewSession();
      } catch {
        // The renewal itself was definitively refused: the session is dead.
        onSessionEnded?.();
        return Promise.reject(error);
      }
      return api.request(config);
    }

    if (isTransient(error) && (config._attempt ?? 0) < MAX_TRANSIENT_ATTEMPTS) {
      config._attempt = (config._attempt ?? 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * config._attempt!));
      return api.request(config);
    }

    if (errorCode(error) === 'RATE_LIMITED' || error.response?.status === 429) {
      toast.error('Too many attempts. Please wait a moment and try again.');
    } else if (isTransient(error)) {
      // Recoverable: the session is untouched, the customer can simply retry.
      toast.error('Connection problem. Please check your network and try again.');
    }

    return Promise.reject(error);
  },
);

export default api;
