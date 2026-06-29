/**
 * src/api/services/notificationApi.ts
 * Notification API calls.
 */
import { apiGet } from '../client';

export interface Notification {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  icon: string;
  title: string;
  message: string;
  navigate?: string;
  timestamp: string;
  read: boolean;
}

export const notificationApi = {
  /** GET /api/notifications */
  getAll(): Promise<Notification[]> {
    return apiGet<Notification[]>('/notifications');
  },
};
