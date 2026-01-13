import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, MapPin, Calendar, Award, Facebook, Instagram, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { chatService } from '@/services/api';
import { SecureImage } from '@/components/ui/SecureImage';
import { MessageSquare, Loader2 } from 'lucide-react';
import { mockAdminUsers } from '@/data/mockUsers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { mockTrips, difficultyLabels, type Trip } from '@/data/mockTrips';

interface CreatedTrip {
  id: string;
  name: string;
  location: string;
  difficulty: string;
  departureDate?: string | Date;
  image?: string;
  images?: string[];
  status: string;
  createdBy?: string;
}

const getCreatedTrips = (): CreatedTrip[] => {
  try {
    const stored = localStorage.getItem('createdTrips');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const formatDate = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để nhắn tin');
      return;
    }
    if (!userId) return;

    setIsStartingChat(true);
    try {
      const response = await chatService.createDirectConversation({ recipientUserId: userId });
      navigate(`/chat?roomId=${response.data.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Không thể tạo cuộc hội thoại');
    } finally {
      setIsStartingChat(false);
    }
  };

  const user = mockAdminUsers.find(u => u.id === userId);

  const savedProfile = userId ? localStorage.getItem(`userProfile_${userId}`) : null;
  const profileData = savedProfile ? JSON.parse(savedProfile) : null;

  const mockOrganizedTrips = mockTrips.filter(t => t.organizerId === userId);
  const createdTrips = getCreatedTrips().filter(t => t.createdBy === userId);

  const organizedTrips = [
    ...mockOrganizedTrips,
    ...createdTrips.map(t => ({
      id: t.id,
      name: t.name,
      location: t.location,
      difficulty: t.difficulty as Trip['difficulty'],
      departureDate: typeof t.departureDate === 'string' ? t.departureDate : t.departureDate?.toISOString().split('T')[0] || '',
      image: t.image || t.images?.[0] || '',
    }))
  ];

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy người dùng</h2>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const displayName = profileData?.displayName || profileData?.name || user.name;
  const bio = profileData?.bio || 'Chưa có thông tin giới thiệu.';
  const location = profileData?.location || 'Việt Nam';
  const facebook = profileData?.facebook || '';
  const instagram = profileData?.instagram || '';

  const stats = [
    { label: 'Chuyến đi', value: user.tripsJoined + user.tripsCreated },
    { label: 'Đã tạo', value: organizedTrips.length || user.tripsCreated },
    { label: 'Tham gia', value: user.createdAt ? new Date(user.createdAt).getFullYear() : '2024' },
  ];

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
              <AvatarImage src={profileData?.avatar || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {displayName ? displayName.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {user.role === 'porter' && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Award className="h-3 w-3 mr-1" />
                    Porter
                  </Badge>
                )}
                {user.role === 'admin' && (
                  <Badge variant="destructive">
                    Admin
                  </Badge>
                )}
                {user.role === 'user' && (
                  <Badge variant="secondary">Thành viên</Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {location}
              </p>
            </div>
            {currentUser && currentUser.id !== userId && (
              <Button onClick={handleStartChat} disabled={isStartingChat} className="gap-2">
                {isStartingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Nhắn tin
              </Button>
            )}
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
            <CardTitle className="text-lg">Thông tin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user.name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{location}</span>
            </div>

            <Separator />

            {/* Social Links */}
            {(facebook || instagram) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Liên lạc</p>
                {facebook && (
                  <div className="flex items-center gap-2 text-sm">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Facebook
                    </a>
                  </div>
                )}
                {instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Instagram
                    </a>
                  </div>
                )}
              </div>
            )}

            {!facebook && !instagram && (
              <p className="text-sm text-muted-foreground italic">Chưa có thông tin liên lạc</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giới thiệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{bio}</p>

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Tham gia từ {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) : 'tháng 1/2024'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organized Trips - Only show for porters with trips */}
      {(user.role === 'porter' || user.role === 'admin') && organizedTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mountain className="h-5 w-5 text-primary" />
              Chuyến đi đã tổ chức ({organizedTrips.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    <SecureImage
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center">
                          <Mountain className="h-6 w-6 text-muted-foreground" />
                        </div>
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{trip.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {trip.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {difficultyLabels[trip.difficulty as keyof typeof difficultyLabels] || trip.difficulty}
                      </Badge>
                      {trip.departureDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(trip.departureDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for porters with no trips */}
      {(user.role === 'porter' || user.role === 'admin') && organizedTrips.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mountain className="h-5 w-5 text-primary" />
              Chuyến đi đã tổ chức
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có chuyến đi nào được tổ chức.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicProfile;
