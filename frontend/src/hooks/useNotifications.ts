/**
 * src/hooks/useNotifications.ts
 * Notification polling hook with 60s refresh interval.
 */
import { notificationApi } from '../api/services/notificationApi';
import type { Notification } from '../api/services/notificationApi';
import { useApi } from './useApi';

export function useNotifications() {
  const result = useApi<Notification[]>(
    () => notificationApi.getAll(),
    [],
    { refreshInterval: 60_000, immediate: true },
  );

  const unreadCount = result.data
    ? result.data.filter((n) => !n.read).length
    : 0;

  const criticalCount = result.data
    ? result.data.filter((n) => n.severity === 'high' && !n.read).length
    : 0;

  return { ...result, unreadCount, criticalCount };
}
