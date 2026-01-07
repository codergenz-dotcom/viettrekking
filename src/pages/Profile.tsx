import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, Award, CheckCircle, Clock, XCircle, Facebook, Instagram, Link2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePorter } from '@/contexts/PorterContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { porterStatus, registerAsPorter } = usePorter();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    displayName: '',
    email: '',
    phone: '',
    facebook: '',
    instagram: '',
    location: '',
    bio: '',
    joinDate: '01/2024',
    avatar: '',
    driveLink: '',
  });

  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.id || localStorage.getItem('firebase_uid') || '';
      const savedProfile = localStorage.getItem(`userProfile_${uid}`);

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(prev => ({
          ...prev,
          name: parsed.name || currentUser.name || '',
          displayName: parsed.displayName || '',
          email: parsed.email || currentUser.email || '',
          phone: parsed.phone || '',
          facebook: parsed.facebook || '',
          instagram: parsed.instagram || '',
          location: parsed.location || '',
          bio: parsed.bio || '',
          avatar: parsed.avatar || currentUser.avatar || '',
          driveLink: parsed.driveLink || '',
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          name: currentUser.name || '',
          email: currentUser.email || '',
          avatar: currentUser.avatar || '',
        }));
      }
    }
  }, [currentUser]);

  const stats = [
    { label: 'Chuyến đi', value: 12 },
    { label: 'Km đã đi', value: '234' },
    { label: 'Đỉnh núi', value: 5 },
  ];

  const handleSave = () => {
    const uid = currentUser?.id || localStorage.getItem('firebase_uid') || '';
    localStorage.setItem(`userProfile_${uid}`, JSON.stringify(profile));
    toast({
      title: "Đã lưu!",
      description: "Thông tin hồ sơ đã được cập nhật.",
    });
    setIsEditing(false);
  };

  const handleRegisterPorter = () => {
    registerAsPorter();
    toast({
      title: "Đã gửi yêu cầu!",
      description: "Yêu cầu đăng ký Porter của bạn đang chờ Admin duyệt.",
    });
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.displayName || profile.name}</h1>
                {porterStatus === 'approved' && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Award className="h-3 w-3 mr-1" />
                    Porter
                  </Badge>
                )}
                {porterStatus === 'pending' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Chờ duyệt Porter
                  </Badge>
                )}
                {porterStatus === 'rejected' && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Bị từ chối
                  </Badge>
                )}
                {porterStatus === 'none' && (
                  <Badge variant="secondary">Thành viên</Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </p>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="shrink-0"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </>
              )}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {profile.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Tên gọi</Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Tên bạn muốn hiển thị"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {profile.displayName || <span className="text-muted-foreground italic">Chưa đặt</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {profile.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                Số điện thoại
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
                  <Lock className="h-3 w-3" /> riêng tư
                </span>
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {profile.phone || <span className="text-muted-foreground italic">Chưa cập nhật</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {profile.location || <span className="text-muted-foreground italic">Chưa cập nhật</span>}
                </div>
              )}
            </div>

            <Separator />

            {/* Social Links */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Liên lạc</Label>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-xs text-muted-foreground font-normal">Facebook</Label>
                {isEditing ? (
                  <Input
                    id="facebook"
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    placeholder="https://facebook.com/username"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    {profile.facebook ? (
                      <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {profile.facebook.replace(/https?:\/\/(www\.)?facebook\.com\/?/, '')}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs text-muted-foreground font-normal">Instagram</Label>
                {isEditing ? (
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    {profile.instagram ? (
                      <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {profile.instagram.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '')}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giới thiệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Tiểu sử</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Tham gia từ tháng {profile.joinDate}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Porter Registration */}
      {porterStatus === 'none' && (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Trở thành Porter</h3>
                <p className="text-sm text-muted-foreground">
                  Đăng ký làm Porter để có thể tạo và tổ chức các chuyến đi leo núi của riêng bạn.
                </p>
              </div>
              <Button onClick={handleRegisterPorter} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Đăng ký Porter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Status */}
      {porterStatus === 'pending' && (
        <Card className="border-dashed border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-700">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Đang chờ duyệt</h3>
                <p className="text-sm text-muted-foreground">
                  Yêu cầu đăng ký Porter của bạn đang được Admin xem xét. Vui lòng chờ trong giây lát.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Status */}
      {porterStatus === 'rejected' && (
        <Card className="border-dashed border-2 border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg">Yêu cầu bị từ chối</h3>
                <p className="text-sm text-muted-foreground">
                  Yêu cầu đăng ký Porter của bạn đã bị từ chối. Vui lòng liên hệ Admin để biết thêm chi tiết.
                </p>
              </div>
              <Button onClick={handleRegisterPorter} variant="outline" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Đăng ký lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Porter Credentials - Only for approved porters */}
      {porterStatus === 'approved' && (
        <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-orange-600" />
              Tài liệu Porter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link Google Drive chứa các tài liệu chứng minh uy tín (chứng chỉ, giấy phép, ảnh hoạt động...)
            </p>
            <div className="space-y-2">
              <Label htmlFor="driveLink">Link Google Drive</Label>
              {isEditing ? (
                <Input
                  id="driveLink"
                  value={profile.driveLink}
                  onChange={(e) => setProfile({ ...profile, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  {profile.driveLink ? (
                    <a href={profile.driveLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Xem tài liệu
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Chưa cập nhật</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
