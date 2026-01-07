import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MoreVertical, Users, User, Info, PanelRightClose } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatRoom as ChatRoomType, ChatMessage as ChatMessageType } from '@/data/mockChats';
import { mockMessages } from '@/data/mockChats';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatRoomProps {
  room: ChatRoomType;
  onBack?: () => void;
  onToggleInfo?: () => void;
  showInfoButton?: boolean;
}

export function ChatRoom({ room, onBack, onToggleInfo, showInfoButton }: ChatRoomProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(mockMessages[room.id] || []);
  }, [room.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string) => {
    if (!currentUser) return;
    
    const newMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date(),
      type: 'text',
    };
    
    setMessages((prev) => [...prev, newMessage]);
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
        
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={room.avatar} />
          <AvatarFallback className="bg-primary/10">
            {room.type === 'group' ? (
              <Users className="h-5 w-5 text-primary" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{room.name}</h3>
          {room.type === 'group' ? (
            <p className="text-xs text-muted-foreground">
              {room.participants.length} thành viên • Hoạt động
            </p>
          ) : (
            <p className="text-xs text-green-600">Đang hoạt động</p>
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
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser?.id}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
