import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageSquarePlus, Users, User, Info } from 'lucide-react';
import { ChatRoomItem } from '@/components/chat/ChatRoomItem';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { mockChatRooms, getChatRoomByTripId, addUserToTripChat, getPrivateChatRooms, type ChatRoom as ChatRoomType } from '@/data/mockChats';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Chat() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'group' | 'private'>('all');
  const [showInfo, setShowInfo] = useState(false);
  const [focusedTripRoom, setFocusedTripRoom] = useState<ChatRoomType | null>(null);
  const [displayRooms, setDisplayRooms] = useState<ChatRoomType[]>(mockChatRooms);

  useEffect(() => {
    const tripId = searchParams.get('tripId');
    const roomId = searchParams.get('roomId');

    if (tripId && currentUser) {
      const room = addUserToTripChat(tripId, currentUser.id);
      if (room) {
        setSelectedRoom(room);
        setFocusedTripRoom(room);
        setActiveTab('all');
        const privateRooms = getPrivateChatRooms().filter(r => r.participants.includes(currentUser.id));
        setDisplayRooms([room, ...privateRooms]);
      }
    } else if (roomId) {
      const room = mockChatRooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoom(room);
        setActiveTab(room.type === 'group' ? 'group' : 'private');
        setDisplayRooms(mockChatRooms);
      }
    } else {
      setDisplayRooms(mockChatRooms);
      setFocusedTripRoom(null);
    }
  }, [searchParams, currentUser]);

  const filteredRooms = displayRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'group' && room.type === 'group') ||
      (activeTab === 'private' && room.type === 'private');
    return matchesSearch && matchesTab;
  });

  const groupRooms = displayRooms.filter((r) => r.type === 'group');
  const privateRooms = displayRooms.filter((r) => r.type === 'private');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* Sidebar - Chat List */}
      <div
        className={cn(
          'w-full md:w-[320px] lg:w-[360px] xl:w-[400px] border-r flex flex-col bg-muted/30 shrink-0',
          selectedRoom ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b bg-background space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Tin nhắn</h1>
            <Button size="icon" variant="ghost" className="hover:bg-primary/10">
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-background h-11 p-0">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-full"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger
              value="group"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5 h-full"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Nhóm</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {groupRooms.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="private"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5 h-full"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Riêng tư</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {privateRooms.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredRooms.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <MessageSquarePlus className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Không tìm thấy cuộc trò chuyện</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <ChatRoomItem
                    key={room.id}
                    room={room}
                    isActive={selectedRoom?.id === room.id}
                    onClick={() => setSelectedRoom(room)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
        </div>

      {/* Main Chat Area */}
      <div className={cn('flex-1 flex flex-col', !selectedRoom ? 'hidden md:flex' : 'flex')}>
        {selectedRoom ? (
          <ChatRoom 
            room={selectedRoom} 
            onBack={() => setSelectedRoom(null)}
            onToggleInfo={() => setShowInfo(!showInfo)}
            showInfoButton
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/20">
            <div className="text-center max-w-md px-4">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="h-12 w-12 text-primary/60" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Chào mừng đến với Tin nhắn</h2>
              <p className="text-sm">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin với nhóm trip hoặc thành viên khác.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel - Desktop only */}
      {selectedRoom && showInfo && (
        <div className="hidden lg:flex w-80 border-l flex-col bg-background">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Thông tin</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowInfo(false)}>
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Avatar & Name */}
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={selectedRoom.avatar} />
                  <AvatarFallback className="bg-primary/10 text-2xl">
                    {selectedRoom.type === 'group' ? (
                      <Users className="h-8 w-8 text-primary" />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-lg">{selectedRoom.name}</h4>
                {selectedRoom.type === 'group' && (
                  <p className="text-sm text-muted-foreground">
                    {selectedRoom.participants.length} thành viên
                  </p>
                )}
              </div>

              <Separator />

              {/* Trip Info */}
              {selectedRoom.tripName && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Chuyến đi</h5>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">{selectedRoom.tripName}</p>
                  </div>
                </div>
              )}

              {/* Participants */}
              {selectedRoom.type === 'group' && (
                <div>
                  <h5 className="text-sm font-medium mb-3">Thành viên ({selectedRoom.participants.length})</h5>
                  <div className="space-y-2">
                    {selectedRoom.participants.map((participantId, idx) => (
                      <div key={participantId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-sm">
                            {String.fromCharCode(65 + idx)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Thành viên {idx + 1}</p>
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Search className="h-4 w-4" />
                  Tìm kiếm tin nhắn
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
