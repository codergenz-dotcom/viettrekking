import { mockAdminUsers } from '@/data/mockUsers';
import { mockTrips } from '@/data/mockTrips';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system';
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'group' | 'private';
  tripId?: string;
  tripName?: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  avatar?: string;
}

const CHAT_ROOMS_STORAGE_KEY = 'viettrekking_chat_rooms';

const loadSavedRooms = (): ChatRoom[] | null => {
  try {
    const saved = localStorage.getItem(CHAT_ROOMS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((room: any) => ({
        ...room,
        lastMessage: room.lastMessage ? {
          ...room.lastMessage,
          timestamp: new Date(room.lastMessage.timestamp)
        } : undefined
      }));
    }
  } catch (e) {
    console.error('Error loading chat rooms from localStorage:', e);
  }
  return null;
};

const generateTripChatRooms = (): ChatRoom[] => mockTrips.map((trip) => ({
  id: `trip-chat-${trip.id}`,
  name: trip.name,
  type: 'group' as const,
  tripId: trip.id,
  tripName: trip.name,
  participants: [trip.organizerId],
  lastMessage: {
    id: `msg-trip-${trip.id}`,
    senderId: trip.organizerId,
    senderName: mockAdminUsers.find(u => u.id === trip.organizerId)?.name || 'Porter',
    content: `Chào mừng mọi người đến với chuyến đi ${trip.name}!`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * Math.floor(Math.random() * 48)),
    type: 'text' as const,
  },
  unreadCount: 0,
  avatar: trip.image,
}));

const manualChatRooms: ChatRoom[] = [
  {
    id: 'private-1',
    name: 'Trần Văn Porter',
    type: 'private',
    participants: ['user-1', 'porter-1'],
    lastMessage: {
      id: 'msg-3',
      senderId: 'porter-1',
      senderName: 'Trần Văn Porter',
      content: 'Bạn cần hỗ trợ gì thêm không?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: 'text',
    },
    unreadCount: 1,
  },
  {
    id: 'private-2',
    name: 'Admin VietTrekking',
    type: 'private',
    participants: ['user-1', 'admin-1'],
    lastMessage: {
      id: 'msg-4',
      senderId: 'admin-1',
      senderName: 'Admin VietTrekking',
      content: 'Chào bạn, cảm ơn đã sử dụng dịch vụ!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'text',
    },
    unreadCount: 0,
  },
];

const initChatRooms = (): ChatRoom[] => {
  const saved = loadSavedRooms();
  if (saved) return saved;
  return [...generateTripChatRooms(), ...manualChatRooms];
};

export let mockChatRooms: ChatRoom[] = initChatRooms();

const saveChatRooms = () => {
  try {
    localStorage.setItem(CHAT_ROOMS_STORAGE_KEY, JSON.stringify(mockChatRooms));
  } catch (e) {
    console.error('Error saving chat rooms to localStorage:', e);
  }
};

export const addUserToTripChat = (tripId: string, userId: string): ChatRoom | undefined => {
  const roomIndex = mockChatRooms.findIndex(room => room.tripId === tripId);
  if (roomIndex === -1) return undefined;

  const room = mockChatRooms[roomIndex];
  if (!room.participants.includes(userId)) {
    room.participants = [...room.participants, userId];
    mockChatRooms = [...mockChatRooms];
    saveChatRooms();
  }
  return room;
};

export const getUserChatRooms = (userId: string): ChatRoom[] => {
  return mockChatRooms.filter(room => room.participants.includes(userId));
};

export const getPrivateChatRooms = (): ChatRoom[] => {
  return mockChatRooms.filter(room => room.type === 'private');
};

export const getChatRoomByTripId = (tripId: string): ChatRoom | undefined => {
  return mockChatRooms.find(room => room.tripId === tripId);
};

const generateTripMessages = (): Record<string, ChatMessage[]> => {
  const messages: Record<string, ChatMessage[]> = {};

  mockTrips.forEach((trip) => {
    const roomId = `trip-chat-${trip.id}`;
    const organizer = mockAdminUsers.find(u => u.id === trip.organizerId);
    const organizerName = organizer?.name || 'Porter';

    messages[roomId] = [
      {
        id: `msg-${roomId}-1`,
        senderId: 'system',
        senderName: 'Hệ thống',
        content: 'Nhóm thảo luận đã được tạo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        type: 'system',
      },
      {
        id: `msg-${roomId}-2`,
        senderId: trip.organizerId,
        senderName: organizerName,
        content: `Chào mừng mọi người đến với chuyến đi ${trip.name}! 🎉`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        type: 'text',
      },
      {
        id: `msg-${roomId}-3`,
        senderId: 'user-1',
        senderName: 'Nguyễn Văn A',
        content: 'Chào mọi người! Em rất mong chờ chuyến đi này',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        type: 'text',
      },
      {
        id: `msg-${roomId}-4`,
        senderId: trip.organizerId,
        senderName: organizerName,
        content: 'Mọi người nhớ chuẩn bị đầy đủ đồ dùng cá nhân, giày leo núi và áo ấm nhé!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
        type: 'text',
      },
      {
        id: `msg-${roomId}-5`,
        senderId: 'user-2',
        senderName: 'Trần Thị B',
        content: 'Dạ em đã chuẩn bị xong rồi ạ. Có cần mang thêm gì không anh?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15),
        type: 'text',
      },
      {
        id: `msg-${roomId}-6`,
        senderId: trip.organizerId,
        senderName: organizerName,
        content: 'Nhớ mang theo đèn pin, đồ ăn nhẹ và nước uống đủ dùng nha',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10),
        type: 'text',
      },
      {
        id: `msg-${roomId}-7`,
        senderId: 'user-1',
        senderName: 'Nguyễn Văn A',
        content: 'Thời tiết ngày đi có đẹp không anh?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        type: 'text',
      },
      {
        id: `msg-${roomId}-8`,
        senderId: trip.organizerId,
        senderName: organizerName,
        content: 'Theo dự báo thì thời tiết khá đẹp, trời nắng nhẹ. Nhưng mọi người vẫn nên mang áo mưa phòng trường hợp thời tiết thay đổi nhé!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        type: 'text',
      },
    ];
  });

  return messages;
};

export const mockMessages: Record<string, ChatMessage[]> = {
  ...generateTripMessages(),
  'private-1': [
    {
      id: 'msg-p1-1',
      senderId: 'user-1',
      senderName: 'Nguyễn Văn A',
      content: 'Anh ơi cho em hỏi về lịch trình chuyến đi',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10),
      type: 'text',
    },
    {
      id: 'msg-p1-2',
      senderId: 'porter-1',
      senderName: 'Trần Văn Porter',
      content: 'Chào bạn, bạn cần hỏi gì cứ nhắn anh nhé',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      type: 'text',
    },
    {
      id: 'msg-p1-3',
      senderId: 'porter-1',
      senderName: 'Trần Văn Porter',
      content: 'Bạn cần hỗ trợ gì thêm không?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: 'text',
    },
  ],
  'private-2': [
    {
      id: 'msg-p2-1',
      senderId: 'admin-1',
      senderName: 'Admin VietTrekking',
      content: 'Chào bạn, cảm ơn đã sử dụng dịch vụ!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'text',
    },
  ],
};

export const getUserInfo = (userId: string) => {
  return mockAdminUsers.find(u => u.id === userId);
};
