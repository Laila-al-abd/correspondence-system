import apiClient from './axios-client';
import {
  NotificationView,
  UnreadCountView,
  MarkReadResult,
  PurgeResult,
  ListNotificationsDto,
  StreamTicketResponse,
} from '@/types/observability';
import { OffsetPage } from '@/types/shared';


/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const notificationsApi = {
  /**
   * Get paginated list of notifications for the current user.
   * GET /notifications
   */
  getAll: async (
    params?: ListNotificationsDto
  ): Promise<OffsetPage<NotificationView>> => {
    const { data } = await apiClient.get<OffsetPage<NotificationView>>('/notifications', {
      params: {
        unreadOnly: params?.unreadOnly ?? undefined,
        limit: params?.limit ?? undefined,
        offset: params?.offset ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get unread notification count for the current user.
   * GET /notifications/unread-count
   */
  getUnreadCount: async (): Promise<UnreadCountView> => {
    const { data } = await apiClient.get<UnreadCountView>('/notifications/unread-count');
    return data;
  },

  /**
   * Get a stream ticket for Server-Sent Events connection.
   * POST /notifications/stream-ticket
   */
  getStreamTicket: async (): Promise<StreamTicketResponse> => {
    const { data } = await apiClient.post<StreamTicketResponse>('/notifications/stream-ticket');
    return data;
  },

  /**
   * Mark a single notification as read.
   * POST /notifications/:id/read
   */
  markAsRead: async (id: string): Promise<NotificationView> => {
    const { data } = await apiClient.post<NotificationView>(`/notifications/${id}/read`);
    return data;
  },

  /**
   * Mark all notifications as read for the current user.
   * POST /notifications/read-all
   */
  markAllAsRead: async (): Promise<MarkReadResult> => {
    const { data } = await apiClient.post<MarkReadResult>('/notifications/read-all');
    return data;
  },

  /**
   * Purge old notifications (admin only).
   * POST /notifications/purge
   */
  purge: async (retentionDays?: number): Promise<PurgeResult> => {
    const { data } = await apiClient.post<PurgeResult>('/notifications/purge', {
      retentionDays: retentionDays ?? undefined,
    });
    return data;
  },
};