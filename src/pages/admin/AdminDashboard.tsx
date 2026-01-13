import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Backpack, Loader2, ShieldCheck, UserX } from 'lucide-react';
import { adminAccountService, type AccountStatistics } from '@/services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AccountStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAccountService.getStatistics();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { title: 'Tổng người dùng', value: stats.totalAccounts, icon: Users, color: 'text-blue-500' },
    { title: 'Tài khoản hoạt động', value: stats.activeAccounts, icon: ShieldCheck, color: 'text-green-500' },
    { title: 'Tài khoản bị khóa', value: stats.lockedAccounts, icon: UserX, color: 'text-destructive' },
    { title: 'Đơn Porter chờ duyệt', value: stats.pendingPorterApplications, icon: Backpack, color: 'text-amber-500' },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan hệ thống quản trị VietTrekking
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Porter <strong>Nguyễn Văn Hùng</strong> đã đăng ký</span>
                <span className="text-xs text-muted-foreground ml-auto">2 giờ trước</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Chuyến đi <strong>Fansipan Express</strong> được tạo mới</span>
                <span className="text-xs text-muted-foreground ml-auto">5 giờ trước</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Đánh giá mới từ <strong>Trần Thị B</strong></span>
                <span className="text-xs text-muted-foreground ml-auto">1 ngày trước</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
