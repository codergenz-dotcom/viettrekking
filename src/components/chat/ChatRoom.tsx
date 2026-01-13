import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MoreVertical, Users, User, Info, PanelRightClose } from 'lucide-react';
import { SecureAvatar } from '@/components/ui/SecureAvatar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, type ConversationResponse, type MessageResponse } from '@/services/api';
import { chatWebSocketClient } from '@/utils/websocket';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatRoomProps {
  room: ConversationResponse;
  onBack?: () => void;
  onToggleInfo?: () => void;
  showInfoButton?: boolean;
}

export function ChatRoom({ room, onBack, onToggleInfo, showInfoButton }: ChatRoomProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await chatService.getMessages(room.id, { size: 50 });
      // API returns newest first, we want display oldest first? 
      // Actually usually chat history is sorted DESC in API, let's reverse for UI.
      setMessages([...response.data.content].reverse());
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time messages
    chatWebSocketClient.subscribeToConversation(room.id, (newMessage: MessageResponse) => {
      setMessages(prev => {
        // Avoid duplicates if REST and WS both return same message
        if (prev.find(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    // Subscribe to typing indicators
    chatWebSocketClient.subscribeToTyping(room.id, (data) => {
      if (data.userId !== currentUser?.id) {
        setIsTyping(data.isTyping);
        // Clear typing after 3 seconds if no update
        if (data.isTyping) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    return () => {
      chatWebSocketClient.unsubscribe(room.id);
    };
  }, [room.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (content: string) => {
    if (!currentUser) return;
    chatWebSocketClient.sendMessage(room.id, content);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <SecureAvatar
          src={room.displayAvatar}
          className="h-10 w-10 shrink-0"
          fallback={
            room.type === 'TRIP_GROUP' ? (
              <Users className="h-5 w-5 text-primary" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )
          }
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{room.displayName}</h3>
          {room.type === 'TRIP_GROUP' ? (
            <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              Nhóm chuyến đi • Hoạt động
            </p>
          ) : (
            <p className="text-xs text-green-600">Đang trực tuyến</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showInfoButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleInfo}
              className="hidden lg:flex hover:bg-primary/10"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Xem thông tin
              </DropdownMenuItem>
              <DropdownMenuItem>Tắt thông báo</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Rời khỏi nhóm</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-2" ref={scrollRef}>
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    senderId: message.senderId || '',
                    senderName: message.senderName || 'Unknown',
                    senderAvatar: message.senderAvatar,
                    content: message.contentText,
                    timestamp: new Date(message.createdAt),
                    type: 'text'
                  }}
                  isOwn={message.senderId === currentUser?.id}
                />
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground italic">
                  <span>Ai đó đang soạn tin...</span>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput
          onSend={handleSend}
          onTyping={(typing) => chatWebSocketClient.sendTyping(room.id, typing)}
        />
      </div>
    </div>
  );
}
