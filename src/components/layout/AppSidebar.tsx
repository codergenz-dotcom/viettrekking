import { Mountain, Compass, MessageCircle, Bell, Settings, HelpCircle, Plus } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const mainNavItems = [
  { title: 'Chuyến đi của tôi', url: '/my-trips', icon: Compass },
  { title: 'Khám phá', url: '/trips', icon: Mountain },
  { title: 'Tin nhắn', url: '/chat', icon: MessageCircle },
  { title: 'Thông báo', url: '/notifications', icon: Bell },
];

const settingsItems = [
  { title: 'Cài đặt', url: '/settings', icon: Settings },
  { title: 'Trợ giúp', url: '/help', icon: HelpCircle },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border shrink-0 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="p-1.5 rounded-lg bg-primary">
            <Mountain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-lg text-foreground leading-none">VietTrekking</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cộng đồng leo núi</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu chính
            </div>
            <ul className="space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.url}>
                  <NavLink
                    to={item.url}
                    end={item.url === '/trips'}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hỗ trợ
            </div>
            <ul className="space-y-1">
              {settingsItems.map((item) => (
                <li key={item.url}>
                  <NavLink
                    to={item.url}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </nav>

      {/* Footer / Create Trip Button */}
      {/* <div className="p-4 border-t border-border">
        <Button 
          onClick={() => navigate('/create-trip')}
          className="w-full gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo chuyến đi
        </Button>
      </div> */}
    </aside>
  );
}
