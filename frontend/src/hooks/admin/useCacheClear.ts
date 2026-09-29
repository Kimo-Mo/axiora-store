import { authService } from '@/services/auth.service';

export const useCacheClear = () => {
  const cacheClear = async (): Promise<void> => {
    try {
      await authService.clearCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return cacheClear;
};
