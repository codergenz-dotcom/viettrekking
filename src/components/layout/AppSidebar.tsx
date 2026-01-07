import { Mountain, Calendar, Settings, MapPin, HelpCircle, Compass, Plus, MessageCircle } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNavItems = [
  { title: 'Chuyến đi của tôi', url: '/my-trips', icon: Compass },
  { title: 'Khám phá', url: '/trips', icon: Mountain },
  { title: 'Tin nhắn', url: '/chat', icon: MessageCircle },
  { title: 'Lịch trình', url: '/calendar', icon: Calendar },
  { title: 'Địa điểm', url: '/locations', icon: MapPin },
];

const settingsItems = [
  { title: 'Cài đặt', url: '/settings', icon: Settings },
  { title: 'Trợ giúp', url: '/help', icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isPorter } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="[&[data-state=collapsed]]:w-16">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link 
          to="/" 
          className={cn(
            "flex items-center gap-3 py-3 hover:opacity-80 transition-opacity",
            isCollapsed ? "justify-center px-0" : "px-2"
          )}
        >
          <div className="p-2 rounded-xl gradient-mountain shrink-0">
            <Mountain className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sidebar-foreground truncate">VietTrekking</span>
              <span className="text-xs text-sidebar-foreground/60 truncate">Cộng đồng leo núi</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  className="flex items-center gap-2"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
