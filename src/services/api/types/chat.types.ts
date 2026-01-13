export type ConversationType = 'DIRECT' | 'TRIP_GROUP';
export type MessageContentType = 'TEXT' | 'IMAGE' | 'FILE';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'SEEN';

export interface ConversationResponse {
  id: string;
  type: ConversationType;
  displayName: string;
  displayAvatar?: string;
  lastMessage?: {
    contentText: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
  tripId?: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  contentType: MessageContentType;
  contentText: string;
  attachmentUrl?: string | null;
  status: MessageStatus;
  createdAt: string;
}

export interface CreateDirectConversationRequest {
  recipientUserId: string;
}

export interface SendMessageRequest {
  conversationId: string;
  contentType: MessageContentType;
  contentText: string;
}

export interface ConversationMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: string;
  lastReadAt: string | null;
}

export interface ConversationDetailResponse {
  id: string;
  type: ConversationType;
  tripId?: string | null;
  tripName?: string | null;
  otherUserId?: string | null;
  otherUserName?: string | null;
  otherUserEmail?: string | null;
  members: ConversationMember[];
  lastMessage?: {
    contentText: string;
    createdAt: string;
  } | null;
  unreadCount: number | null;
  createdAt: string;
  updatedAt: string;
}
