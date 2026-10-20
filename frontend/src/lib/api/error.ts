import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.code;
  }
  return undefined;
}
