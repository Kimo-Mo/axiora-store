import { useQueryClient } from '@tanstack/react-query';

/**
 * Drop every cached server response after an administrative change.
 *
 * The previous implementation called a Django `clear-cache` endpoint to purge a
 * server-rendered fragment cache. That cache no longer exists: server state lives
 * in TanStack Query on the client, so clearing it is a local operation and needs
 * no round trip.
 */
export const useCacheClear = () => {
  const queryClient = useQueryClient();

  return async (): Promise<void> => {
    queryClient.clear();
  };
};
