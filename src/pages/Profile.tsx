import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, Award, CheckCircle, Clock, XCircle, Facebook, Instagram, Link2, Lock, Loader2, HardDrive, Shield } from 'lucide-react';
import { userService, imageService, userTripService, type AccountResponse, type UpdateProfileRequest, type ApplyStatusResponse } from '@/services/api';
import { useSecureImage } from '@/hooks/useSecureImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RegisterPorterDialog } from '@/components/profile/RegisterPorterDialog';

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPorter, setIsPorter] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    name: '',
    email: '',
    phone: '',
    facebook: '',
    instagram: '',
    driveLink: '',
    location: '',
    bio: '',
    joinDate: '',
    tripsJoined: 0,
    tripsCreated: 0,
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const secureAvatarUrl = useSecureImage(avatarUrl);

  const [porterApplication, setPorterApplication] = useState<ApplyStatusResponse | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getCurrentProfile();
      const data = response.data;

      const uid = localStorage.getItem('firebase_uid') || '';
      const savedRole = localStorage.getItem(`userRole_${uid}`);
      const isPorterRole = data.role === 'PORTER' || data.isPorter || savedRole === 'porter';
      setIsPorter(!!isPorterRole);

      setProfile({
        displayName: data.displayName || '',
        name: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        facebook: data.facebookUrl || '',
        instagram: data.instagramUrl || '',
        driveLink: data.driveLink || '',
        location: data.location || '',
        bio: data.bio || '',
        joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '',
        tripsJoined: data.tripsJoined || 0,
        tripsCreated: data.tripsCreated || 0,
      });
      setAvatarUrl(data.avatar || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải thông tin hồ sơ.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPorterApplication = async () => {
    try {
      const response = await userTripService.getMyPorterApplication();
      if (response.data) {
        setPorterApplication(response.data);
      }
    } catch (error) {
      console.log("No porter application found or error fetching");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchPorterApplication();
    }
  }, [currentUser]);

  const stats = [
    { label: 'Chuyến đi', value: profile.tripsJoined },
    { label: 'Đã tạo', value: profile.tripsCreated },
    { label: 'Đỉnh núi', value: Math.floor(profile.tripsJoined / 3) },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await imageService.uploadImage(file);
      const imageUrl = imageService.getImageUrl(response.data.id);
      setAvatarUrl(imageUrl);
      toast({
        title: "Thành công",
        description: "Đã cập nhật ảnh đại diện",
      });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải ảnh lên.",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: UpdateProfileRequest = {
        displayName: profile.displayName,
        fullName: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
        facebookUrl: profile.facebook,
        instagramUrl: profile.instagram,
        driveLink: profile.driveLink,
      };

      await userService.updateProfile(payload);

      toast({
        title: "Đã lưu!",
        description: "Thông tin hồ sơ đã được cập nhật.",
      });
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật thông tin hồ sơ.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={secureAvatarUrl !== '/placeholder.svg' ? secureAvatarUrl : undefined} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <Badge variant={isPorter ? "default" : "secondary"}>
                  {isPorter ? "Người hỗ trợ" : "Thành viên"}
                </Badge>

                {/* Porter Application Status Badges */}
                {!isPorter && porterApplication?.status === 'PENDING' && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">
                    <Clock className="w-3 h-3 mr-1" />
                    Đang chờ duyệt Porter
                  </Badge>
                )}
                {!isPorter && porterApplication?.status === 'REJECTED' && (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Bị từ chối Porter
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              {/* Register as Porter Button */}
              {!isPorter && (!porterApplication || porterApplication.status === 'REJECTED') && (
                <Button
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary/5"
                  onClick={() => setIsRegisterDialogOpen(true)}
                >
                  <Shield className="h-4 w-4" />
                  Đăng ký làm Người hỗ trợ
                </Button>
              )}

              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
              <Label htmlFor="displayName">Tên hiển thị</Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Tên bạn muốn hiển thị cho người khác"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {profile.displayName || <span className="text-muted-foreground italic">Chưa cập nhật</span>}
                </div>
              )}
            </div>

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
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {profile.email}
              </div>
              <p className="text-[10px] text-muted-foreground">Email không thể thay đổi</p>
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
              <p className="text-xs text-muted-foreground">Chỉ admin và người tổ chức mới thấy thông tin này</p>
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

              {/* Google Drive Link - chỉ hiển thị cho porter */}
              {isPorter && (
                <div className="space-y-2">
                  <Label htmlFor="driveLink" className="text-xs text-muted-foreground font-normal">Google Drive</Label>
                  {isEditing ? (
                    <Input
                      id="driveLink"
                      value={profile.driveLink}
                      onChange={(e) => setProfile({ ...profile, driveLink: e.target.value })}
                      placeholder="https://drive.google.com/..."
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      {profile.driveLink ? (
                        <a href={profile.driveLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px]">
                          {profile.driveLink.replace(/https?:\/\/(www\.)?drive\.google\.com\/?/, 'drive.google.com/')}
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">Chưa cập nhật</span>
                      )}
                    </div>
                  )}
                </div>
              )}
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
              Tham gia từ {profile.joinDate}
            </div>
          </CardContent>
        </Card>
      </div>

      <RegisterPorterDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        onSuccess={fetchPorterApplication}
        currentPhone={profile.phone}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default Profile;
