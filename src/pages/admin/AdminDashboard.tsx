import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Users, Backpack, Star } from 'lucide-react';

const stats = [
  { title: 'Tổng chuyến đi', value: '24', icon: Mountain, color: 'text-primary' },
  { title: 'Người dùng', value: '156', icon: Users, color: 'text-blue-500' },
  { title: 'Porter chờ duyệt', value: '4', icon: Backpack, color: 'text-amber-500' },
  { title: 'Đánh giá mới', value: '12', icon: Star, color: 'text-yellow-500' },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan hệ thống quản trị VietTrekking
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
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
