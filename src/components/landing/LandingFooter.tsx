import { Link } from "react-router-dom";
import { Mountain, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">VietTrekking</span>
            </div>
            <p className="text-slate-400 mb-4">
              Khám phá những cung đường trekking tuyệt vời nhất Việt Nam. Chúng tôi mang đến trải nghiệm an toàn, chuyên nghiệp và đáng nhớ.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-400 hover:text-primary transition-colors">Trang chủ</Link></li>
              <li><Link to="/trips" className="text-slate-400 hover:text-primary transition-colors">Trekking Tours</Link></li>
              <li><Link to="#destinations" className="text-slate-400 hover:text-primary transition-colors">Điểm đến</Link></li>
              <li><Link to="#about" className="text-slate-400 hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-slate-400 hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="#" className="text-slate-400 hover:text-primary transition-colors">Hướng dẫn đặt tour</Link></li>
              <li><Link to="#contact" className="text-slate-400 hover:text-primary transition-colors">Liên hệ</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-slate-400">123 Đường Lê Lai, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-slate-400">+84 90 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-slate-400">info@viettrekking.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500">
            © 2024 VietTrekking. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};
