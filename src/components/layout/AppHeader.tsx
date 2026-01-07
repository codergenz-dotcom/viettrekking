import { Bell, User, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AppHeader() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm px-4">
      <SidebarTrigger className="h-8 w-8" />

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Admin Menu */}
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin')}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Button>
        )}

        {/* Chat */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9"
          onClick={() => navigate('/chat')}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/my-trips')}>Chuyến đi của tôi</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>Cài đặt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
