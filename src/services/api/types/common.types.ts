export interface PaginationRequest {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface NotificationResponse {
  id: string;
  type: 'NEW_JOIN_REQUEST' | 'JOIN_APPROVED' | 'JOIN_CANCELLED' | 'TRIP_APPROVED' | 'TRIP_REJECTED';
  title: string;
  message: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
