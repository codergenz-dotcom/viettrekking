import { useState, useMemo } from 'react';
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Ban } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  mockAdminUsers,
  userStatusLabels,
  userRoleLabels,
  type AdminUser,
  type UserStatus,
} from '@/data/mockUsers';

const statusClasses: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  banned: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

const roleClasses: Record<string, string> = {
  user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  porter: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((user) => user.status === statusFilter);
    }

    return result;
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    toast({
      title: 'Đã cập nhật trạng thái',
      description: `Trạng thái tài khoản đã được thay đổi thành "${userStatusLabels[newStatus]}"`,
    });
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    porters: users.filter((u) => u.role === 'porter').length,
    banned: users.filter((u) => u.status === 'banned').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý tài khoản</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Tổng tài khoản</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Porter</p>
            <p className="text-2xl font-bold text-purple-600">{stats.porters}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Đã cấm</p>
            <p className="text-2xl font-bold text-red-600">{stats.banned}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
              <SelectItem value="porter">Porter</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as UserStatus | 'all')}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="banned">Đã cấm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Người dùng
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Vai trò
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Ngày tạo
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Hoạt động
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={roleClasses[user.role]}>
                        {userRoleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusClasses[user.status]}>
                        {userStatusLabels[user.status]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {user.role === 'porter' ? (
                          <span className="text-muted-foreground">
                            {user.tripsCreated} chuyến đã tạo
                          </span>
                        ) : user.role === 'user' ? (
                          <span className="text-muted-foreground">
                            {user.tripsJoined} chuyến đã tham gia
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status !== 'active' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-green-600"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Kích hoạt
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'inactive' && user.role !== 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, 'inactive')}
                              className="text-yellow-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Vô hiệu hóa
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'banned' && user.role !== 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, 'banned')}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Cấm tài khoản
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Không tìm thấy người dùng nào phù hợp
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
