import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  Mountain, 
  Users, 
  Backpack, 
  Star, 
  Settings 
} from 'lucide-react';

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Chuyến đi', url: '/admin/trips', icon: Mountain },
  { title: 'Người dùng', url: '/admin/users', icon: Users },
  { title: 'Porter', url: '/admin/porters', icon: Backpack },
  { title: 'Đánh giá', url: '/admin/reviews', icon: Star },
  { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <Mountain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">VietTrekking</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {adminMenuItems.map((item) => (
            <li key={item.url}>
              <NavLink
                to={item.url}
                end={item.url === '/admin'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary font-medium"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
