import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Backpack, Users } from "lucide-react";

type SelectedRole = 'trekker' | 'porter' | null;

const Register = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);

  const handleRegisterClick = () => {
    setShowRoleDialog(true);
  };

  const handleRoleSelect = async (role: 'trekker' | 'porter') => {
    setSelectedRole(role);
    setShowRoleDialog(false);

    try {
      setError(null);
      await loginWithGoogle();

      const uid = localStorage.getItem('firebase_uid') || Date.now().toString();

      const profileCompleted = localStorage.getItem(`profileCompleted_${uid}`);

      if (profileCompleted) {
        navigate("/my-trips");
      } else {
        localStorage.setItem(`userRole_${uid}`, role);
        navigate("/profile/setup");
      }
    } catch (err) {
      console.error("Register failed:", err);
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Mountain pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M0,600 L200,300 L400,450 L600,200 L800,400 L800,600 Z"
              fill="currentColor"
              className="text-white"
            />
            <path
              d="M0,600 L150,400 L350,500 L550,300 L800,500 L800,600 Z"
              fill="currentColor"
              className="text-white opacity-50"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">VietTrekking</h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Khám phá những đỉnh núi tuyệt đẹp cùng cộng đồng trekking Việt Nam
          </p>

          {/* Decorative elements */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>500+ Chuyến đi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>10,000+ Thành viên</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-foreground">VietTrekking</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Đăng ký</h2>
            <p className="mt-2 text-muted-foreground">
              Tham gia cộng đồng trekking lớn nhất Việt Nam
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Google register button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 text-base font-medium"
            onClick={handleRegisterClick}
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 mr-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {loading ? "Đang xử lý..." : "Đăng ký với Google"}
          </Button>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-sm text-muted-foreground">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a href="#" className="text-primary hover:underline">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-primary hover:underline">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Bạn tham gia dưới tư cách là?
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Trekker Option */}
            <button
              onClick={() => handleRoleSelect('trekker')}
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Người tham gia (Trekker)</h3>
                <p className="text-sm text-muted-foreground">
                  Tham gia các chuyến đi trekking
                </p>
              </div>
            </button>

            {/* Porter Option */}
            <button
              onClick={() => handleRoleSelect('porter')}
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="p-3 rounded-full bg-orange-100">
                <Backpack className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Người hỗ trợ (Porter)</h3>
                <p className="text-sm text-muted-foreground">
                  Tổ chức và dẫn đoàn trekking
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
