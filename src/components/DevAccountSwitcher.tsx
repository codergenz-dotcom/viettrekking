import { useAuth, mockUsers } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Mountain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleIcons = {
  user: User,
  porter: Mountain,
  admin: Shield,
};

const roleLabels = {
  user: 'User',
  porter: 'Porter',
  admin: 'Admin',
};

const roleColors = {
  user: 'bg-blue-500',
  porter: 'bg-green-500',
  admin: 'bg-red-500',
};

export function DevAccountSwitcher() {
  const { currentUser, switchAccount, logout } = useAuth();
  const navigate = useNavigate();

  const handleAccountChange = (value: string) => {
    if (value === 'none') {
      logout();
    } else {
      switchAccount(value);
      const selectedUser = mockUsers.find(u => u.id === value);
      if (selectedUser?.role === 'admin') {
        navigate('/admin');
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-3 space-y-2">
      <div className="text-xs font-medium text-muted-foreground">🔧 Dev Account Switcher</div>
      <Select
        value={currentUser?.id || 'none'}
        onValueChange={handleAccountChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Chọn account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">Chưa đăng nhập</span>
          </SelectItem>
          {mockUsers.map((user) => {
            const Icon = roleIcons[user.role];
            return (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{user.name}</span>
                  <Badge variant="secondary" className={`${roleColors[user.role]} text-white text-[10px] px-1.5 py-0`}>
                    {roleLabels[user.role]}
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {currentUser && (
        <div className="text-xs text-muted-foreground">
          Email: {currentUser.email}
        </div>
      )}
    </div>
  );
}
