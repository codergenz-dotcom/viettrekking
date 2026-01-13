import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { adminService, userTripService } from '@/services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Mountain,
  Calendar,
  MapPin,
  Users,
  Eye,
  Check,
  X,
  Search,
  Clock,
  Phone,
  Mail,
  DollarSign,
  ClipboardList,
  Package,
  PackageX,
  ListChecks,
  FileText,
  Info
} from 'lucide-react';
import { SecureImage } from '@/components/ui/SecureImage';

type TripStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

interface ScheduleDay {
  day: number;
  title: string;
  activities: string[];
}

interface CostItem {
  name: string;
  amount: number;
  note?: string;
}

interface PendingTrip {
  id: string;
  name: string;
  location: string;
  difficulty: string;
  departureDate: string;
  endDate?: string;
  estimatedPrice: number;
  maxParticipants: number;
  description: string;
  organizerId: string;
  organizerName: string;
  organizerPhone?: string;
  organizerEmail?: string;
  createdAt: string;
  status: TripStatus;
  rejectReason?: string;
  images?: string[];
  schedule?: ScheduleDay[];
  includedServices?: string[];
  excludedServices?: string[];
  preparations?: string[];
  costs?: CostItem[];
  meetingPoint?: string;
  notes?: string;
}

const difficultyLabels: Record<string, string> = {
  easy: 'Dễ',
  moderate: 'Trung bình',
  hard: 'Khó',
  extreme: 'Cực khó',
};



const AdminTrips = () => {
  const [trips, setTrips] = useState<PendingTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<PendingTrip | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TripStatus | 'all'>('pending');

  const mapDifficulty = (d: string): string => {
    const lower = d.toLowerCase();
    if (lower === 'medium') return 'moderate';
    return lower;
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 100,
        search: searchQuery,
      };

      if (activeTab === 'pending') params.status = 'PENDING';
      if (activeTab === 'approved') params.status = 'APPROVED';
      if (activeTab === 'rejected') params.status = 'REJECTED';
      if (activeTab === 'cancelled') params.status = 'CANCELLED';
      if (activeTab === 'completed') params.status = 'COMPLETED';

      const response = await adminService.getTripsForAdmin(params);

      const mapped: PendingTrip[] = response.data.content.map(t => ({
        id: t.id,
        name: t.name,
        location: t.location,
        difficulty: mapDifficulty(t.difficulty),
        departureDate: t.departureDate,
        estimatedPrice: 0,
        maxParticipants: t.expectedPorterCount || 0,
        description: t.description,
        organizerId: t.creator?.id || t.porter?.id || '',
        organizerName: t.creator?.fullName || t.porter?.fullName || 'N/A',
        organizerPhone: t.contactPhone || '',
        organizerEmail: t.contactEmail || t.creator?.email || '',
        createdAt: t.createdAt,
        status: activeTab !== 'all' ? activeTab : (t.isDraft ? 'pending' : 'approved'),
        images: t.images,
      }));
      setTrips(mapped);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Không thể tải danh sách chuyến đi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const handleApprove = async (trip: PendingTrip) => {
    try {
      await adminService.approveTrip(trip.id);
      toast.success(`Đã duyệt chuyến đi "${trip.name}"`);
      setIsDetailOpen(false);
      fetchTrips();
    } catch (error) {
      console.error('Approve trip error:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedTrip || !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await adminService.rejectTrip(selectedTrip.id, { reason: rejectReason });
      toast.success(`Đã từ chối chuyến đi "${selectedTrip.name}"`);
      setIsRejectOpen(false);
      setIsDetailOpen(false);
      setRejectReason('');
      fetchTrips();
    } catch (error) {
      console.error('Reject trip error:', error);
    }
  };

  const openRejectModal = (trip: PendingTrip) => {
    setSelectedTrip(trip);
    setIsRejectOpen(true);
  };

  const openDetailModal = async (trip: PendingTrip) => {
    setSelectedTrip(trip);
    setIsDetailOpen(true);

    try {
      const response = await userTripService.getTripById(trip.id);
      const fullTrip = response.data;

      setSelectedTrip(prev => {
        if (!prev || prev.id !== trip.id) return prev;

        return {
          ...prev,
          meetingPoint: fullTrip.location,
          notes: fullTrip.costNotes,
          schedule: fullTrip.schedule?.map(s => ({
            day: 1,
            title: s.time,
            activities: [s.content]
          })),
          costs: (fullTrip.includedCosts || []).map(c => ({
            name: c.content,
            amount: parseInt(c.cost) || 0
          })),
          includedServices: (fullTrip.includedCosts || []).map(c => c.content),
          preparations: fullTrip.preparations,
          estimatedPrice: (fullTrip.includedCosts || []).reduce((sum, c) => sum + (parseInt(c.cost) || 0), 0)
        };
      });
    } catch (error) {
      console.error('Error fetching full trip details:', error);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.organizerName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && trip.status === activeTab;
  });

  const pendingCount = trips.filter((t) => t.status === 'pending').length;
  const approvedCount = trips.filter((t) => t.status === 'approved').length;
  const rejectedCount = trips.filter((t) => t.status === 'rejected').length;

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Từ chối</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">Đã hủy</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Hoàn thành</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý chuyến đi</h1>
          <p className="text-muted-foreground">
            Duyệt và quản lý các chuyến đi được tạo bởi Porter
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Mountain className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trips.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng số</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Đã duyệt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-muted-foreground">Từ chối</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Danh sách chuyến đi</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="grid w-full grid-cols-6 h-auto">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
                <TabsTrigger value="rejected">Từ chối</TabsTrigger>
                <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
                <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Mountain className="h-12 w-12 text-primary animate-pulse mb-4" />
                    <p className="text-muted-foreground">Đang tải danh sách chuyến đi...</p>
                  </div>
                ) : filteredTrips.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mountain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Không có chuyến đi nào</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chuyến đi</TableHead>
                        <TableHead>Địa điểm</TableHead>
                        <TableHead>Ngày khởi hành</TableHead>
                        <TableHead>Người tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Mountain className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{trip.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {difficultyLabels[trip.difficulty] || trip.difficulty}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {trip.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {trip.departureDate
                                ? format(new Date(trip.departureDate), 'dd/MM/yyyy', { locale: vi })
                                : 'Chưa xác định'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {trip.organizerName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(trip.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetailModal(trip)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {trip.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(trip)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openRejectModal(trip)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTrip && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Mountain className="h-5 w-5 text-primary" />
                    {selectedTrip.name}
                  </DialogTitle>
                  {getStatusBadge(selectedTrip.status)}
                </div>
                <DialogDescription>
                  Chi tiết đầy đủ chuyến đi
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info" className="flex items-center gap-1.5">
                    <Info className="h-4 w-4" />
                    Thông tin
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4" />
                    Lịch trình
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" />
                    Dịch vụ
                  </TabsTrigger>
                  <TabsTrigger value="costs" className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    Chi phí
                  </TabsTrigger>
                </TabsList>

                <div className="h-[400px] overflow-y-auto mt-4">
                  {/* Tab: Thông tin cơ bản */}
                  <TabsContent value="info" className="space-y-4 mt-0">
                    {selectedTrip.images && selectedTrip.images.length > 0 && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <SecureImage
                          src={selectedTrip.images[0]}
                          alt={selectedTrip.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Địa điểm</p>
                        <p className="font-medium flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          {selectedTrip.location}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Độ khó</p>
                        <p className="font-medium">
                          {difficultyLabels[selectedTrip.difficulty] || selectedTrip.difficulty}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ngày khởi hành</p>
                        <p className="font-medium flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {selectedTrip.departureDate
                            ? format(new Date(selectedTrip.departureDate), 'dd/MM/yyyy', { locale: vi })
                            : 'Chưa xác định'}
                          {selectedTrip.endDate && (
                            <span className="text-muted-foreground">
                              - {format(new Date(selectedTrip.endDate), 'dd/MM/yyyy', { locale: vi })}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Số người tối đa</p>
                        <p className="font-medium flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          {selectedTrip.maxParticipants || 'Không giới hạn'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Giá ước tính</p>
                        <p className="font-medium text-primary text-lg">
                          {selectedTrip.estimatedPrice?.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ngày tạo</p>
                        <p className="font-medium">
                          {format(new Date(selectedTrip.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </p>
                      </div>
                    </div>

                    {/* Organizer Info */}
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm font-medium mb-3">Thông tin người tổ chức</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedTrip.organizerName || 'N/A'}</span>
                        </div>
                        {selectedTrip.organizerPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedTrip.organizerPhone}</span>
                          </div>
                        )}
                        {selectedTrip.organizerEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedTrip.organizerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedTrip.meetingPoint && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          Điểm tập trung
                        </p>
                        <p className="text-sm p-3 rounded-lg bg-muted/50">{selectedTrip.meetingPoint}</p>
                      </div>
                    )}

                    {selectedTrip.description && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <FileText className="h-4 w-4" />
                          Mô tả
                        </p>
                        <p className="text-sm p-3 rounded-lg bg-muted/50">{selectedTrip.description}</p>
                      </div>
                    )}

                    {selectedTrip.notes && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Info className="h-4 w-4" />
                          Ghi chú
                        </p>
                        <p className="text-sm p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                          {selectedTrip.notes}
                        </p>
                      </div>
                    )}

                    {selectedTrip.status === 'rejected' && selectedTrip.rejectReason && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-medium text-red-800">Lý do từ chối:</p>
                        <p className="text-sm text-red-700 mt-1">{selectedTrip.rejectReason}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Lịch trình */}
                  <TabsContent value="schedule" className="space-y-4 mt-0">
                    {selectedTrip.schedule && selectedTrip.schedule.length > 0 ? (
                      <div className="space-y-4">
                        {selectedTrip.schedule.map((day, index) => (
                          <div key={index} className="p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{day.day}</span>
                              </div>
                              <h4 className="font-medium">{day.title}</h4>
                            </div>
                            <ul className="space-y-2 ml-10">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có lịch trình chi tiết</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Dịch vụ */}
                  <TabsContent value="services" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Included Services */}
                      <div className="p-4 rounded-lg border bg-green-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-800">Dịch vụ bao gồm</h4>
                        </div>
                        {selectedTrip.includedServices && selectedTrip.includedServices.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedTrip.includedServices.map((service, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                {service}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Chưa có thông tin</p>
                        )}
                      </div>

                      {/* Excluded Services */}
                      <div className="p-4 rounded-lg border bg-red-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <PackageX className="h-5 w-5 text-red-600" />
                          <h4 className="font-medium text-red-800">Không bao gồm</h4>
                        </div>
                        {selectedTrip.excludedServices && selectedTrip.excludedServices.length > 0 ? (
                          <ul className="space-y-2">
                            {selectedTrip.excludedServices.map((service, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <X className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                {service}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Chưa có thông tin</p>
                        )}
                      </div>
                    </div>

                    {/* Preparations */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <ListChecks className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Cần chuẩn bị</h4>
                      </div>
                      {selectedTrip.preparations && selectedTrip.preparations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTrip.preparations.map((item, index) => (
                            <Badge key={index} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Chưa có thông tin</p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab: Chi phí */}
                  <TabsContent value="costs" className="space-y-4 mt-0">
                    {selectedTrip.costs && selectedTrip.costs.length > 0 ? (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hạng mục</TableHead>
                              <TableHead className="text-right">Số tiền</TableHead>
                              <TableHead>Ghi chú</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedTrip.costs.map((cost, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{cost.name}</TableCell>
                                <TableCell className="text-right">
                                  {cost.amount.toLocaleString('vi-VN')}đ
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {cost.note || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">Tổng cộng</TableCell>
                              <TableCell className="text-right font-bold text-primary">
                                {selectedTrip.costs.reduce((sum, c) => sum + c.amount, 0).toLocaleString('vi-VN')}đ
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                          <strong>Giá niêm yết:</strong> {selectedTrip.estimatedPrice?.toLocaleString('vi-VN')}đ/người
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có bảng chi phí chi tiết</p>
                        <p className="text-lg font-medium text-primary mt-2">
                          Giá ước tính: {selectedTrip.estimatedPrice?.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="mt-6">
                {selectedTrip.status === 'pending' && (
                  <>
                    <Button variant="outline" onClick={() => openRejectModal(selectedTrip)}>
                      <X className="h-4 w-4 mr-2" />
                      Từ chối
                    </Button>
                    <Button onClick={() => handleApprove(selectedTrip)}>
                      <Check className="h-4 w-4 mr-2" />
                      Duyệt chuyến đi
                    </Button>
                  </>
                )}
                {selectedTrip.status !== 'pending' && (
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Đóng
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối chuyến đi</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối chuyến đi "{selectedTrip?.name}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTrips;
