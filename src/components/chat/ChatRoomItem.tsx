import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Users, User } from 'lucide-react';
import type { ConversationResponse } from '@/services/api';
import { SecureAvatar } from '@/components/ui/SecureAvatar';

interface ChatRoomItemProps {
  room: ConversationResponse;
  isActive: boolean;
  onClick: () => void;
}

function formatTime(dateInput: Date | string) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  if (isYesterday(date)) {
    return 'Hôm qua';
  }
  return format(date, 'dd/MM', { locale: vi });
}

export function ChatRoomItem({ room, isActive, onClick }: ChatRoomItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
        isActive ? 'bg-primary/10' : 'hover:bg-muted'
      )}
    >
      <div className="relative shrink-0">
        <SecureAvatar
          src={room.displayAvatar}
          className="h-12 w-12"
          fallback={
            room.type === 'TRIP_GROUP' ? (
              <Users className="h-5 w-5 text-primary" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )
          }
        />
        {room.type === 'TRIP_GROUP' && (
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
            <Users className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium truncate', room.unreadCount > 0 && 'text-foreground')}>
            {room.displayName}
          </span>
          {room.lastMessage && (
            <span className="text-xs text-muted-foreground shrink-0 ml-auto">
              {formatTime(room.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {room.lastMessage && (
            <p className={cn(
              'text-sm truncate',
              room.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {room.lastMessage.contentText}
            </p>
          )}
          {room.unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px] px-1.5 shrink-0 ml-auto">
              {room.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
