import { useNavigate } from 'react-router-dom';
import { Clock, Mail, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPending = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-yellow-100">
                <Clock className="h-12 w-12 text-yellow-600" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Đăng ký thành công!
              </h1>
              <p className="text-lg text-muted-foreground">
                Tài khoản đang chờ được duyệt
              </p>
            </div>

            {/* Description */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Chúng tôi sẽ gửi email thông báo đến{' '}
                  <span className="font-medium text-foreground">
                    {currentUser?.email || 'email của bạn'}
                  </span>{' '}
                  khi tài khoản được duyệt.
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-4">
              <p>
                Quá trình xét duyệt thường mất từ <strong>1-3 ngày làm việc</strong>.
                Cảm ơn bạn đã kiên nhẫn chờ đợi!
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleGoHome}
                className="w-full h-12"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPending;
