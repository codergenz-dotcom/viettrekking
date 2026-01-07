import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/data/mockChats';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-muted-foreground bg-muted px-4 py-1.5 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 mb-3 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0 mt-1">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {message.senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn('flex flex-col max-w-[75%] md:max-w-[65%]', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">{message.senderName}</span>
        )}
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          )}
        >
          {message.content}
        </div>
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {format(message.timestamp, 'HH:mm', { locale: vi })}
          </span>
          {isOwn && (
            <CheckCheck className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}
