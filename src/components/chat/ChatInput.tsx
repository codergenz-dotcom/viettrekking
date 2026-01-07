import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image, Smile, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-3">
      <div className="flex items-end gap-2">
        {/* Attachment buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 hover:bg-primary/10">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 hover:bg-primary/10">
            <Image className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Attachment button - Mobile */}
        <Button variant="ghost" size="icon" className="sm:hidden shrink-0 h-9 w-9">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        {/* Input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none pr-10",
              "focus-visible:ring-1 focus-visible:ring-primary"
            )}
            rows={1}
            disabled={disabled}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
          >
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Send/Mic button */}
        {message.trim() ? (
          <Button
            onClick={handleSend}
            disabled={disabled}
            size="icon"
            className="shrink-0 h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-10 w-10"
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Quick tip - Desktop */}
      <p className="hidden md:block text-xs text-muted-foreground mt-2 text-center">
        Nhấn <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> để gửi, <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Shift + Enter</kbd> để xuống dòng
      </p>
    </div>
  );
}
