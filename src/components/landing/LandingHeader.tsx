import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mountain, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const LandingHeader = () => {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Mountain className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">VietTrekking</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white/90 hover:text-white transition-colors">
            Trang chủ
          </Link>
          <Link to="/trips" className="text-white/90 hover:text-white transition-colors">
            Trekking
          </Link>
          <Link to="#about" className="text-white/90 hover:text-white transition-colors">
            Về chúng tôi
          </Link>
          <Link to="#contact" className="text-white/90 hover:text-white transition-colors">
            Liên hệ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 text-white hover:bg-white/20 px-2 group">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium leading-none group-hover:text-white">{currentUser?.full_name}</p>
                    <p className="text-[10px] text-white/70 leading-tight mt-0.5">Thành viên</p>
                  </div>
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.full_name} />
                    <AvatarFallback className="bg-white/10 text-white text-xs font-medium">
                      {currentUser?.full_name
                        ? currentUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : <User className="h-4 w-4" />
                      }
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/trips')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Bảng điều khiển
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-white text-primary hover:bg-white/90">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
