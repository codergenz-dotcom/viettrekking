import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Ban, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { SecureAvatar } from '@/components/ui/SecureAvatar';
import {
  adminAccountService,
  type AdminAccountSummary,
  type AccountStatus,
  type AccountStatistics
} from '@/services/api';

const statusClasses: Record<AccountStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  INACTIVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  LOCKED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  PENDING_ACTIVATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
};

const statusLabels: Record<AccountStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Vô hiệu hóa',
  LOCKED: 'Đã khóa',
  PENDING_ACTIVATION: 'Chờ kích hoạt',
};

const roleClasses: Record<string, string> = {
  USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  ADMIN: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
};

const roleLabels: Record<string, string> = {
  USER: 'Người dùng',
  ADMIN: 'Quản trị viên',
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminAccountSummary[]>([]);
  const [stats, setStats] = useState<AccountStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminAccountService.getAccounts({
        page,
        size: 10,
        search: searchQuery || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : (statusFilter as AccountStatus),
      });
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách tài khoản.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, roleFilter, statusFilter, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminAccountService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleAction = async (userId: string, action: 'activate' | 'deactivate' | 'ban') => {
    setIsActionLoading(true);
    try {
      if (action === 'activate') {
        await adminAccountService.activateAccount(userId);
      } else if (action === 'deactivate') {
        await adminAccountService.deactivateAccount(userId);
      } else {
        await adminAccountService.banAccount(userId);
      }

      toast({
        title: 'Thành công',
        description: `Đã thực hiện thao tác thành công.`,
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Thao tác thất bại. Vui lòng thử lại.',
      });
    } finally {
      setIsActionLoading(false);
    }
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
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Tổng tài khoản</p>
            <p className="text-2xl font-bold text-foreground">{stats?.totalAccounts || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-600">{stats?.activeAccounts || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Porter</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalPorters || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Bị khóa/Cấm</p>
            <p className="text-2xl font-bold text-red-600">{stats?.lockedAccounts || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="USER">Người dùng</SelectItem>
              <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              <SelectItem value="LOCKED">Đã khóa</SelectItem>
              <SelectItem value="PENDING_ACTIVATION">Chờ kích hoạt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Người dùng
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Vai trò
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Ngày tham gia
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Hoạt động
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <SecureAvatar
                            src={user.avatarUrl}
                            className="h-10 w-10 border border-border"
                            fallback={
                              <span className="bg-primary/10 text-primary font-medium">
                                {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                              </span>
                            }
                          />
                          <div>
                            <p className="font-medium text-foreground text-sm">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={roleClasses[user.role]}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={statusClasses[user.status]}>
                          {statusLabels[user.status] || user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDate(user.joinDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          {user.isPorter ? (
                            <span className="text-muted-foreground">
                              {user.tripsCreated} chuyến đã tạo
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {user.tripsJoined} chuyến đã tham gia
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isActionLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.status !== 'ACTIVE' && (
                              <DropdownMenuItem
                                onClick={() => handleAction(user.id, 'activate')}
                                className="text-green-600"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Kích hoạt
                              </DropdownMenuItem>
                            )}
                            {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                              <DropdownMenuItem
                                onClick={() => handleAction(user.id, 'deactivate')}
                                className="text-yellow-600"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Vô hiệu hóa
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'LOCKED' && user.role !== 'ADMIN' && (
                              <DropdownMenuItem
                                onClick={() => handleAction(user.id, 'ban')}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-muted-foreground">
                        Không tìm thấy người dùng nào phù hợp
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center p-4 border-t border-border gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || isLoading}
              >
                Trước
              </Button>
              <div className="text-sm text-muted-foreground px-4">
                Trang {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || isLoading}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
