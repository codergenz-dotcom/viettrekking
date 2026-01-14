import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { type Trip } from "@/data/mockTrips";
import { useAuth } from "@/contexts/AuthContext";

import { TripBasicInfo } from "@/components/trip-detail/TripBasicInfo";
import { TripSchedule } from "@/components/trip-detail/TripSchedule";
import { TripServices } from "@/components/trip-detail/TripServices";
import { TripPreparation } from "@/components/trip-detail/TripPreparation";
import { TripMembers } from "@/components/trip-detail/TripMembers";
import { TripReviews } from "@/components/trip-detail/TripReviews";
import { TripActions } from "@/components/trip-detail/TripActions";
import { TripDialogs } from "@/components/trip-detail/TripDialogs";
import { userTripService, reviewService, type JoinTripRequest, type TripReviewResponse, type ReviewSummaryResponse, type TripResponse, type TripStatus } from "@/services/api";

import { Registration, RegistrationStatus, TripStatusData } from "@/components/trip-detail/trip-types";
import {
  convertToTrip,
  saveRegistrations,
} from "@/components/trip-detail/trip-utils";

interface TripDetailProps {
  tripId?: string;
  isModal?: boolean;
  onEdit?: (tripId: string) => void;
}

const TripDetail = ({ tripId: propTripId, isModal = false, onEdit: onEditProp }: TripDetailProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propTripId || paramId;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tripStatus, setTripStatus] = useState<TripStatusData | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [currentUserReg, setCurrentUserReg] = useState<Registration | null>(null);
  const [apiReviews, setApiReviews] = useState<TripReviewResponse[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummaryResponse | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [apiTrip, setApiTrip] = useState<TripResponse | null>(null);
  const [isTripLoading, setIsTripLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTripDetail = async () => {
        setIsTripLoading(true);
        console.log('TripDetail: fetching trip with id:', id);
        try {
          const response = await userTripService.getTripById(id);
          console.log('TripDetail: fetch success', response);
          setApiTrip(response.data);

          if (response.data.status) {
            const status: TripStatusData = {
              tripId: id,
              status: response.data.status.toLowerCase() as any,
              startedAt: response.data.status === 'in_progress' ? new Date().toISOString() : undefined,
              completedAt: response.data.status === 'completed' ? new Date().toISOString() : undefined
            };
            setTripStatus(status);
          }
        } catch (error) {
          console.error("Failed to fetch trip detail:", error);
        } finally {
          setIsTripLoading(false);
        }
      };

      const fetchMembers = async () => {
        try {
          const response = await userTripService.getTripMembers(id);
          if (response.data && Array.isArray(response.data)) {
            const mappedRegs: Registration[] = response.data.map(m => ({
              id: m.id,
              accountId: m.accountId,
              name: m.name,
              email: m.email,
              phone: m.phone,
              status: m.status || 'PENDING',
              registeredAt: m.registeredAt,
              processedAt: m.processedAt,
              rejectReason: m.rejectReason,
            }));
            setRegistrations(mappedRegs);
          }
        } catch (error) {
          console.error("Failed to fetch trip members:", error);
        }
      };

      const fetchMyStatus = async () => {
        if (!currentUser) return;
        try {
          const response = await userTripService.getMyRegistrationStatus(id);
          const m = response.data;

          if (m && m.registrationId) {
            setCurrentUserReg({
              id: m.registrationId,
              accountId: m.accountId,
              name: currentUser.name,
              email: currentUser.email || '',
              phone: currentUser.phone || '',
              status: m.status || 'PENDING',
              registeredAt: m.registeredAt,
              rejectReason: m.rejectReason,
            });
          } else {
            setCurrentUserReg(null);
          }
        } catch (error) {
          console.error("Failed to fetch my registration status:", error);
          setCurrentUserReg(null);
        }
      };

      const fetchReviews = async () => {
        setIsLoadingReviews(true);
        try {
          const response = await reviewService.getReviews(id, { size: 50 });
          setApiReviews(response.data.content);
        } catch (error) {
          console.error("Failed to fetch reviews:", error);
        } finally {
          setIsLoadingReviews(false);
        }
      };

      const fetchReviewSummary = async () => {
        try {
          const response = await reviewService.getReviewSummary(id);
          setReviewSummary(response.data);
        } catch (error) {
          console.error("Failed to fetch review summary:", error);
        }
      };

      fetchTripDetail();
      fetchMembers();
      fetchMyStatus();
      fetchReviews();
      fetchReviewSummary();
    }
  }, [id, currentUser]);

  const trip: Trip | null = apiTrip ? convertToTrip(apiTrip as any) : null;
  const displayTrip = apiTrip;

  if (isTripLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Đang tải thông tin chuyến đi...</p>
        </div>
      </div>
    );
  }

  const isOrganizer = !!(
    (currentUser?.id && trip?.organizerId === currentUser.id) ||
    (currentUser?.username && apiTrip?.creator?.username === currentUser.username) ||
    (currentUser?.email && apiTrip?.creator?.email === currentUser.email)
  );

  const isRegistrationClosed = trip ? new Date(trip.registrationDeadline) < new Date() : false;

  if (!trip) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy chuyến đi</h2>
          <Button onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const handleJoin = async () => {
    if (!currentUser) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để tham gia chuyến đi.",
        variant: "destructive",
      });
      return;
    }

    const existing = registrations.find(r => r.accountId === currentUser.id);
    if (existing) {
      toast({
        title: "Bạn đã đăng ký",
        description: "Bạn đã đăng ký chuyến đi này rồi.",
      });
      return;
    }

    try {
      const joinData: JoinTripRequest = {
        name: currentUser.name,
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      };

      const response = await userTripService.joinTrip(id!, joinData);
      const m = response.data;

      const newReg: Registration = {
        id: m.id,
        accountId: m.accountId,
        name: m.name,
        email: m.email,
        phone: m.phone,
        status: m.status,
        registeredAt: m.registeredAt,
      };

      const updated = [...registrations, newReg];
      setRegistrations(updated);
      setCurrentUserReg(newReg);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to join trip:", error);
      toast({
        title: "Lỗi đăng ký",
        description: "Có lỗi xảy ra khi đăng ký tham gia chuyến đi.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await userTripService.updateRegistrationStatus(id!, registrationId, { status: 'APPROVED' });

      const updated = registrations.map(r =>
        r.id === registrationId ? { ...r, status: "APPROVED" as RegistrationStatus } : r
      );
      setRegistrations(updated);
      saveRegistrations(id!, updated);

      toast({
        title: "Đã duyệt",
        description: "Thành viên đã được duyệt tham gia.",
      });
    } catch (error) {
      console.error("Failed to approve registration:", error);
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await userTripService.updateRegistrationStatus(id!, registrationId, { status: 'REJECTED' });

      const updated = registrations.map(r =>
        r.id === registrationId ? { ...r, status: "REJECTED" as RegistrationStatus } : r
      );
      setRegistrations(updated);
      saveRegistrations(id!, updated);
      toast({
        title: "Đã từ chối",
        description: "Đơn đăng ký đã bị từ chối.",
      });
    } catch (error) {
      console.error("Failed to reject registration:", error);
    }
  };

  const handleStartTrip = async () => {
    try {
      await userTripService.updateTripStatus(id!, { status: 'in_progress' });

      const newStatus: TripStatusData = {
        tripId: id!,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      };
      setTripStatus(newStatus);
      setShowStartDialog(false);
      toast({
        title: "Đã bắt đầu chuyến đi",
        description: "Chuyến đi đã được đánh dấu là đang diễn ra.",
      });
    } catch (error) {
      console.error("Failed to start trip:", error);
      toast({
        title: "Lỗi",
        description: "Không thể bắt đầu chuyến đi.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTrip = async () => {
    try {
      await userTripService.updateTripStatus(id!, { status: 'completed' });

      const newStatus: TripStatusData = {
        tripId: id!,
        status: 'completed',
        startedAt: tripStatus?.startedAt,
        completedAt: new Date().toISOString(),
      };
      setTripStatus(newStatus);
      setShowCompleteDialog(false);

      toast({
        title: "Đã hoàn thành chuyến đi",
        description: "Chuyến đi đã được chuyển vào danh sách hoàn thành.",
      });
    } catch (error) {
      console.error("Failed to complete trip:", error);
      toast({
        title: "Lỗi",
        description: "Không thể hoàn thành chuyến đi.",
        variant: "destructive",
      });
    }
  };

  const pendingRegistrations = registrations.filter((r) => r.status === "PENDING");
  const currentUserRegistration = currentUserReg || registrations.find(r => r.accountId === currentUser?.id);

  return (
    <div className={isModal ? "" : "min-h-[calc(100vh-4rem)] bg-background"}>
      <div className={isModal ? "" : "container mx-auto px-4 py-6 max-w-5xl"}>
        {/* Back button */}
        {!isModal && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <h1 className="text-2xl font-bold text-foreground mb-6">
              Chi tiết chuyến đi
            </h1>
          </>
        )}

        <div className={`border border-border rounded-xl bg-card overflow-hidden ${isModal ? 'border-none shadow-none' : ''}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border px-6 pt-4 overflow-x-auto">
              <TabsList className={`w-full grid ${isOrganizer ? "grid-cols-6" : "grid-cols-5"} bg-transparent h-auto p-0 gap-0 min-w-max`}>
                <TabsTrigger
                  value="basic-info"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 whitespace-nowrap"
                >
                  Thông tin cơ bản
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 whitespace-nowrap"
                >
                  Lịch trình
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 whitespace-nowrap"
                >
                  Dịch vụ
                </TabsTrigger>
                <TabsTrigger
                  value="preparation"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 whitespace-nowrap"
                >
                  Lưu ý chuẩn bị
                </TabsTrigger>
                {isOrganizer && (
                  <TabsTrigger
                    value="members"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 whitespace-nowrap"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Thành viên
                    {pendingRegistrations.length > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {pendingRegistrations.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 whitespace-nowrap"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Đánh giá
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 min-h-[500px]">
              <TabsContent value="basic-info" className="mt-0">
                <TripBasicInfo
                  trip={trip}
                  createdTrip={displayTrip as any}
                  isRegistrationClosed={isRegistrationClosed}
                  actions={
                    <TripActions
                      trip={trip}
                      tripId={id!}
                      isOrganizer={isOrganizer}
                      currentUserRegistration={currentUserRegistration}
                      isRegistrationClosed={isRegistrationClosed}
                      tripStatus={tripStatus}
                      onJoin={handleJoin}
                      onEdit={() => {
                        if (onEditProp) {
                          onEditProp(id!);
                        } else {
                          navigate(`/create-trip/self-organize?edit=${id}`);
                        }
                      }}
                      onCancel={() => setShowCancelDialog(true)}
                      onStart={() => setShowStartDialog(true)}
                      onComplete={() => setShowCompleteDialog(true)}
                    />
                  }
                />
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <TripSchedule createdTrip={displayTrip as any} />
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                <TripServices createdTrip={displayTrip as any} />
              </TabsContent>

              <TabsContent value="preparation" className="mt-0">
                <TripPreparation createdTrip={displayTrip as any} />
              </TabsContent>

              {isOrganizer && (
                <TabsContent value="members" className="mt-0">
                  <TripMembers
                    registrations={registrations}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </TabsContent>
              )}

              <TabsContent value="reviews" className="mt-0">
                <TripReviews
                  isLoading={isLoadingReviews}
                  reviews={apiReviews.map(r => ({
                    id: r.id,
                    tripId: r.tripId,
                    tripName: trip.name,
                    userId: r.userId,
                    userName: r.userFullName,
                    userAvatar: r.userAvatar,
                    rating: r.rating,
                    feedback: r.comment,
                    createdAt: r.createdAt,
                    isVisible: true
                  }))}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <TripDialogs
        showSuccessModal={showSuccessModal}
        showCancelDialog={showCancelDialog}
        showStartDialog={showStartDialog}
        showCompleteDialog={showCompleteDialog}
        onSuccessClose={() => setShowSuccessModal(false)}
        onCancelClose={() => setShowCancelDialog(false)}
        onCancelConfirm={() => {
          toast({
            title: "Đã hủy chuyến đi",
            description: "Chuyến đi đã được hủy thành công.",
          });
          navigate("/my-trips");
        }}
        onStartClose={() => setShowStartDialog(false)}
        onStartConfirm={handleStartTrip}
        onCompleteClose={() => setShowCompleteDialog(false)}
        onCompleteConfirm={handleCompleteTrip}
      />
    </div>
  );
};

export default TripDetail;
