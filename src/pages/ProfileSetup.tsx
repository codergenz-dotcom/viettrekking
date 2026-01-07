import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Camera, Facebook, Instagram, Link2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPorterRole, setIsPorterRole] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    displayName: '',
    email: '',
    phone: '',
    facebook: '',
    instagram: '',
    location: '',
    bio: '',
    avatar: '',
    driveLink: '',
  });

  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.id || localStorage.getItem('firebase_uid') || '';
      const userRole = localStorage.getItem(`userRole_${uid}`);
      setIsPorterRole(userRole === 'porter');

      setProfile(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.phone.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uid = currentUser?.id || localStorage.getItem('firebase_uid') || '';
      const userProfile = {
        ...profile,
        uid,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(`userProfile_${uid}`, JSON.stringify(userProfile));
      localStorage.setItem(`profileCompleted_${uid}`, 'true');

      const userRole = localStorage.getItem(`userRole_${uid}`);
      if (userRole === 'porter') {
        const pendingPorters = JSON.parse(localStorage.getItem('pendingPorters') || '[]');
        const newPorter = {
          odId: uid,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          driveLink: profile.driveLink,
          registeredAt: new Date().toISOString(),
          status: 'pending'
        };
        pendingPorters.push(newPorter);
        localStorage.setItem('pendingPorters', JSON.stringify(pendingPorters));

        toast({
          title: "Đăng ký thành công!",
          description: "Hồ sơ Porter của bạn đang chờ được duyệt",
        });
        navigate('/register/pending');
      } else {
        toast({
          title: "Hoàn tất!",
          description: "Hồ sơ của bạn đã được tạo thành công",
        });
        navigate('/my-trips');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu hồ sơ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tạo hồ sơ cá nhân</CardTitle>
          <CardDescription>
            Hoàn tất thông tin để bắt đầu tham gia các chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Name - Pre-filled from Google */}
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="pl-10"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Tên gọi</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="pl-10"
                  placeholder="Tên bạn muốn hiển thị (VD: Minh Trekker)"
                />
              </div>
              <p className="text-xs text-muted-foreground">Nếu không nhập sẽ dùng Họ và tên</p>
            </div>

            {/* Email - Pre-filled from Google, readonly */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  className="pl-10 bg-muted"
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">Email được lấy từ tài khoản Google</p>
            </div>

            {/* Phone - Required */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                Số điện thoại <span className="text-destructive">*</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
                  <Lock className="h-3 w-3" /> riêng tư
                </span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10"
                  placeholder="0901234567"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Chỉ admin và porter mới thấy thông tin này</p>
            </div>

            <Separator className="my-2" />

            {/* Social Links Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Liên lạc</Label>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-sm font-normal">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    className="pl-10"
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm font-normal">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    className="pl-10"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="pl-10"
                  placeholder="Hà Nội, Việt Nam"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu bản thân</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Chia sẻ đôi điều về bản thân và sở thích trekking của bạn..."
                rows={3}
              />
            </div>

            {/* Porter Section - Only show for Porter role */}
            {isPorterRole && (
              <>
                <Separator className="my-2" />
                <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-orange-600" />
                    Tài liệu Porter
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Cung cấp link Google Drive chứa các tài liệu chứng minh uy tín của bạn (chứng chỉ, giấy phép, ảnh hoạt động...)
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="driveLink" className="text-sm font-normal">Link Google Drive</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="driveLink"
                        value={profile.driveLink}
                        onChange={(e) => setProfile({ ...profile, driveLink: e.target.value })}
                        className="pl-10"
                        placeholder="https://drive.google.com/drive/folders/..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Hoàn tất đăng ký'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
