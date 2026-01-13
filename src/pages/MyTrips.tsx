import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mountain,
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Compass,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TripDetail from './TripDetail';
import { mockTrips, mockCompletedTrips, difficultyLabels, type Trip, type Difficulty, type TripType, type CompletedTrip } from "@/data/mockTrips";
import { CompletedTripCard } from "@/components/CompletedTripCard";
import { ReviewDialog } from "@/components/ReviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { userTripService, reviewService, type TripListItemResponse, type DifficultyLevel, type CreateUserTripPayload, type DurationType } from "@/services/api";
import { toast } from "sonner";
import { BasicInfoTab } from "@/components/create-trip/BasicInfoTab";
import { ScheduleTab } from "@/components/create-trip/ScheduleTab";
import { CostTab } from "@/components/create-trip/CostTab";
import { PreparationTab } from "@/components/create-trip/PreparationTab";
import { SecureImage } from "@/components/ui/SecureImage";

interface TripFormData {
  name: string;
  location: string;
  difficulty: string;
  description: string;
  departureDate: Date | undefined;
  registrationDeadline: Date | undefined;
  contactEmail: string;
  contactPhone: string;
  expectedPorterCount: number;
  discussionLink: string;
  images: string[];
  durationType: "multi-day" | "single-day";
  durationDays: string;
  schedule: { time: string; content: string }[];
  includedCosts: { content: string; cost: string }[];
  additionalCosts: { content: string; cost: string }[];
  costNotes: string;
  preparations: string[];
  isDraft: string;
}

const mapDifficulty = (difficulty: string): DifficultyLevel => {
  const map: Record<string, DifficultyLevel> = {
    'easy': 'EASY',
    'moderate': 'MEDIUM',
    'medium': 'MEDIUM',
    'hard': 'HARD',
    'expert': 'EXTREME',
    'extreme': 'EXTREME',
  };
  return map[difficulty.toLowerCase()] || 'MEDIUM';
};

const mapDurationType = (type: string): DurationType => {
  return type === 'single-day' ? 'SINGLE_DAY' : 'MULTI_DAY';
};

const formDataToPayload = (formData: TripFormData, isDraft: boolean): CreateUserTripPayload => {
  return {
    name: formData.name,
    location: formData.location,
    difficulty: mapDifficulty(formData.difficulty),
    description: formData.description,
    departureDate: formData.departureDate?.toISOString() || new Date().toISOString(),
    registrationDeadline: formData.registrationDeadline?.toISOString() || new Date().toISOString(),
    contactEmail: formData.contactEmail,
    contactPhone: formData.contactPhone,
    expectedPorterCount: formData.expectedPorterCount,
    discussionLink: formData.discussionLink || undefined,
    images: formData.images.length > 0 ? formData.images : undefined,
    durationType: mapDurationType(formData.durationType),
    durationDays: formData.durationDays,
    schedule: formData.schedule
      .filter(s => s.time || s.content)
      .map(s => ({
        time: s.time,
        content: s.content,
      })),
    includedCosts: formData.includedCosts
      .filter(c => c.content)
      .map(c => ({
        content: c.content,
        cost: c.cost,
      })),
    additionalCosts: formData.additionalCosts
      .filter(c => c.content)
      .map(c => ({
        content: c.content,
        cost: c.cost,
      })),
    costNotes: formData.costNotes || undefined,
    preparations: formData.preparations.filter(p => p.trim() !== ''),
    isDraft,
  };
};

type TripStatus = "draft" | "pending" | "open" | "completed";

interface MyTrip extends Trip {
  status: TripStatus;
}

interface JoinedTrip extends Trip {
  registrationStatus: "pending" | "approved" | "rejected";
  registeredAt: string;
}

const parseCostString = (cost: string): number => {
  if (!cost) return 0;
  let cleaned = cost.toLowerCase().replace(/[^\d.,trđk]/g, '');

  if (cleaned.includes('tr')) {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return num * 1000000;
  }

  if (cleaned.includes('k')) {
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ''));
    return num * 1000;
  }

  cleaned = cleaned.replace(/,/g, '').replace('đ', '');
  return parseFloat(cleaned) || 0;
};

const calculateEstimatedPrice = (includedCosts: { content: string; cost: string }[]): number => {
  if (!includedCosts || !Array.isArray(includedCosts)) return 0;
  return includedCosts.reduce((sum, item) => sum + parseCostString(item.cost), 0);
};



const getDifficultyFromApi = (level: DifficultyLevel): Difficulty => {
  const map: Record<DifficultyLevel, Difficulty> = {
    'EASY': 'easy',
    'MEDIUM': 'medium',
    'HARD': 'hard',
    'EXTREME': 'extreme'
  };
  return map[level] || 'medium';
};

const mapApiTripToMyTrip = (apiTrip: TripListItemResponse): MyTrip => {
  return {
    id: apiTrip.id,
    name: apiTrip.name,
    location: apiTrip.location,
    image: apiTrip.images?.[0] || '',
    difficulty: getDifficultyFromApi(apiTrip.difficulty),
    departureDate: apiTrip.departureDate,
    registrationDeadline: apiTrip.registrationDeadline,
    duration: apiTrip.durationType === 'SINGLE_DAY' ? '1 ngày' : `${apiTrip.durationDays} ngày`,
    tripType: 'trekking',
    spotsRemaining: (apiTrip.maxParticipants || 0) - (apiTrip.participants || 0),
    totalSpots: apiTrip.maxParticipants || apiTrip.expectedPorterCount,
    leaders: 1,
    portersAvailable: 0,
    portersNeeded: apiTrip.expectedPorterCount,
    estimatedPrice: apiTrip.estimatedPrice || calculateEstimatedPrice(apiTrip.includedCosts || []),
    description: apiTrip.description,
    organizerId: apiTrip.porter?.id || '',
    status: (apiTrip.isDraft ? 'draft' : 'open') as TripStatus,
  };
};

const mapApiTripToJoinedTrip = (apiTrip: TripListItemResponse): JoinedTrip => {
  return {
    ...mapApiTripToMyTrip(apiTrip),
    registrationStatus: 'approved',
    registeredAt: apiTrip.createdAt,
  };
};

const statusLabels: Record<TripStatus, string> = {
  draft: "Nháp",
  pending: "Chờ duyệt",
  open: "Đang mở đơn",
  completed: "Đã hoàn thành",
};

const statusClasses: Record<TripStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
};

const getDifficultyClass = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return "bg-difficulty-easy/15 text-difficulty-easy border-difficulty-easy/30";
    case "medium":
      return "bg-difficulty-medium/15 text-difficulty-medium border-difficulty-medium/30";
    case "hard":
      return "bg-difficulty-hard/15 text-difficulty-hard border-difficulty-hard/30";
    case "extreme":
      return "bg-difficulty-extreme/15 text-difficulty-extreme border-difficulty-extreme/30";
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const MyTrips = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("created");
  const [myTrips, setMyTrips] = useState<MyTrip[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<JoinedTrip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<CompletedTrip[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTripForReview, setSelectedTripForReview] = useState<CompletedTrip | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripFormData | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editActiveTab, setEditActiveTab] = useState("basic-info");

  const fetchCreatedTrips = async () => {
    try {
      const createdResponse = await userTripService.getMyTrips('CREATED', { search: debouncedSearchQuery });
      setMyTrips(createdResponse.data.content.map(mapApiTripToMyTrip));
    } catch (error) {
      console.error("Failed to fetch created trips", error);
    }
  };

  const fetchJoinedTrips = async () => {
    try {
      const joinedResponse = await userTripService.getMyTrips('APPLIED', { search: debouncedSearchQuery });
      setJoinedTrips(joinedResponse.data.content.map(mapApiTripToJoinedTrip));
    } catch (error) {
      console.error("Failed to fetch joined trips", error);
    }
  };

  const fetchCompletedTrips = async () => {
    if (!currentUser?.id) return;
    try {
      const mockUserCompletedTrips = mockCompletedTrips.filter(
        trip => trip.participantId === currentUser.id
      );

      let organizerCompletedTrips: CompletedTrip[] = [];
      try {
        const stored = localStorage.getItem('completedTripsFromOrganizer');
        if (stored) {
          const allCompleted = JSON.parse(stored);
          organizerCompletedTrips = allCompleted.filter(
            (trip: CompletedTrip) => trip.participantId === currentUser.id
          );
        }
      } catch {
        console.error('Failed to load completed trips from organizer');
      }

      const allCompleted = [...mockUserCompletedTrips, ...organizerCompletedTrips];
      const uniqueCompleted = allCompleted.filter(
        (trip, index, self) => index === self.findIndex(t => t.id === trip.id)
      );

      const storedReviews = localStorage.getItem('tripReviews');
      const reviews = storedReviews ? JSON.parse(storedReviews) : [];
      const reviewedTripIds = reviews
        .filter((r: { userId: string }) => r.userId === currentUser.id)
        .map((r: { tripId: string }) => r.tripId);

      const completedWithReviewStatus = uniqueCompleted.map(trip => ({
        ...trip,
        hasReviewed: reviewedTripIds.includes(trip.id) || reviewedTripIds.includes(trip.originalTripId),
      }));

      setCompletedTrips(completedWithReviewStatus);

    } catch (error) {
      console.error("Failed to fetch completed trips", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'created') {
      fetchCreatedTrips();
    } else if (activeTab === 'joined') {
      fetchJoinedTrips();
    } else if (activeTab === 'completed') {
      fetchCompletedTrips();
    }
  }, [activeTab, debouncedSearchQuery, currentUser?.id]);

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chuyến đi này?")) return;

    setIsDeleting(tripId);
    try {
      await userTripService.deleteTrip(tripId);
      toast.success("Đã xóa chuyến đi thành công");

      const stored = localStorage.getItem('createdTrips');
      if (stored) {
        const trips = JSON.parse(stored);
        const filtered = trips.filter((t: any) => t.id !== tripId);
        localStorage.setItem('createdTrips', JSON.stringify(filtered));
      }

      if (activeTab === 'created') {
        fetchCreatedTrips();
      } else {
        fetchCreatedTrips();
      }
    } catch (error) {
      console.error("Delete trip error:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Server-side filtered
  const filteredTrips = myTrips;
  const filteredJoinedTrips = joinedTrips;

  const filteredCompletedTrips = useMemo(() => {
    if (!debouncedSearchQuery) return completedTrips;
    const query = debouncedSearchQuery.toLowerCase();
    return completedTrips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(query) ||
        trip.location.toLowerCase().includes(query)
    );
  }, [debouncedSearchQuery, completedTrips]);

  const handleReview = (tripId: string) => {
    const trip = completedTrips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTripForReview(trip);
      setReviewDialogOpen(true);
    }
  };

  const handleSubmitReview = async (tripId: string, rating: number, feedback: string) => {
    const trip = completedTrips.find(t => t.id === tripId);
    if (!trip || !currentUser) return;

    try {
      await reviewService.createReview(tripId, {
        rating,
        comment: feedback
      });

      setCompletedTrips(prev =>
        prev.map(t =>
          t.id === tripId ? { ...t, hasReviewed: true } : t
        )
      );

      toast.success('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const handleEditTrip = async (tripId: string) => {
    setIsLoadingEdit(true);
    setEditingTripId(tripId);
    setEditActiveTab("basic-info");
    try {
      const response = await userTripService.getTripById(tripId);
      const tripData = response.data;
      setEditingTrip({
        name: tripData.name || "",
        location: tripData.location || "",
        difficulty: (tripData.difficulty || "").toLowerCase(),
        description: tripData.description || "",
        departureDate: tripData.departureDate ? new Date(tripData.departureDate) : undefined,
        registrationDeadline: tripData.registrationDeadline ? new Date(tripData.registrationDeadline) : undefined,
        contactEmail: tripData.contactEmail || "",
        contactPhone: tripData.contactPhone || "",
        expectedPorterCount: tripData.expectedPorterCount || 1,
        discussionLink: tripData.discussionLink || "",
        images: tripData.images || [],
        durationType: tripData.durationType === 'SINGLE_DAY' ? 'single-day' : 'multi-day',
        durationDays: tripData.durationDays || "2N1D",
        schedule: tripData.schedule?.map((s: { time: string; content: string }) => ({ time: s.time, content: s.content })) || [{ time: "", content: "" }],
        includedCosts: tripData.includedCosts?.map((c: { content: string; cost?: string }) => ({ content: c.content, cost: c.cost || "" })) || [{ content: "", cost: "" }],
        additionalCosts: tripData.additionalCosts?.map((c: { content: string; cost?: string }) => ({ content: c.content, cost: c.cost || "" })) || [{ content: "", cost: "" }],
        costNotes: tripData.costNotes || "",
        preparations: tripData.preparations || [""],
        isDraft: tripData.isDraft ? "true" : "false",
      });
      setIsEditOpen(true);
    } catch (error) {
      console.error("Failed to load trip for editing:", error);
      toast.error("Không thể tải thông tin chuyến đi");
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip || !editingTripId) return;

    if (!editingTrip.name || !editingTrip.location || !editingTrip.difficulty) {
      toast.error("Vui lòng điền đầy đủ thông tin cơ bản");
      setEditActiveTab("basic-info");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = formDataToPayload(editingTrip, false);
      await userTripService.updateTrip(editingTripId, payload);
      toast.success("Đã cập nhật chuyến đi thành công!");
      setIsEditOpen(false);
      setEditingTrip(null);
      setEditingTripId(null);
      fetchCreatedTrips();
    } catch (error) {
      console.error("Update trip error:", error);
      toast.error("Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateEditingTrip = (updates: Partial<TripFormData>) => {
    if (editingTrip) {
      setEditingTrip({ ...editingTrip, ...updates });
    }
  };

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="border-b border-border/60 bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Chuyến đi của tôi
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Quản lý các chuyến đi bạn đã tạo
                </p>
              </div>
              <Button
                onClick={() => navigate("/create-trip")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tạo chuyến đi mới</span>
                <span className="sm:hidden">Tạo mới</span>
              </Button>
            </div>

            {/* Search Row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Tìm kiếm chuyến đi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-4 pr-10"
                />
              </div>

              {/* Mobile Filter Toggle */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden shrink-0 h-12 w-12"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-4">
                  <FilterSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </div>

          {/* Trip List */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="created">
                  Chuyến đi đã tạo ({filteredTrips.length})
                </TabsTrigger>
                <TabsTrigger value="joined">
                  Đang tham gia ({filteredJoinedTrips.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Đã hoàn thành ({filteredCompletedTrips.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="created" className="mt-0">
                {filteredTrips.length > 0 ? (
                  <div className="space-y-4">
                    {filteredTrips.map((trip, index) => (
                      <MyTripCard
                        key={trip.id}
                        trip={trip}
                        index={index}
                        onDelete={handleDeleteTrip}
                        isDeleting={isDeleting === trip.id}
                        onClickDetail={(id) => {
                          setSelectedTripId(id);
                          setIsDetailOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <Mountain className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Chưa có chuyến đi nào
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Bạn chưa tạo chuyến đi nào. Hãy tạo chuyến đi đầu tiên của bạn!
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate("/create-trip")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo chuyến đi mới
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="joined" className="mt-0">
                {filteredJoinedTrips.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJoinedTrips.map((trip, index) => (
                      <JoinedTripCard
                        key={trip.id}
                        trip={trip}
                        index={index}
                        onClickDetail={(id) => {
                          setSelectedTripId(id);
                          setIsDetailOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <Mountain className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Chưa tham gia chuyến đi nào
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Khám phá và tham gia các chuyến đi thú vị!
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/trips")}>
                      Khám phá chuyến đi
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                {filteredCompletedTrips.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCompletedTrips.map((trip, index) => (
                      <CompletedTripCard
                        key={trip.id}
                        trip={trip}
                        index={index}
                        onReview={handleReview}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                      <Mountain className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Chưa có chuyến đi hoàn thành
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Bạn chưa hoàn thành chuyến đi nào.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Trip Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-none">
                <DialogHeader className="sr-only">
                  <DialogTitle>Chi tiết chuyến đi</DialogTitle>
                </DialogHeader>
                {selectedTripId && (
                  <TripDetail
                    tripId={selectedTripId}
                    isModal={true}
                    onEdit={(tripId) => {
                      setIsDetailOpen(false);
                      handleEditTrip(tripId);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        tripName={selectedTripForReview?.name || ''}
        tripId={selectedTripForReview?.id || ''}
        onSubmit={handleSubmitReview}
      />

      {/* Edit Trip Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) {
          setEditingTrip(null);
          setEditingTripId(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến đi</DialogTitle>
          </DialogHeader>
          {isLoadingEdit ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
            </div>
          ) : editingTrip && (
            <Tabs value={editActiveTab} onValueChange={setEditActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
                <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
                <TabsTrigger value="cost">Chi phí</TabsTrigger>
                <TabsTrigger value="preparation">Lưu ý</TabsTrigger>
              </TabsList>

              <div className="border border-border rounded-xl bg-card p-4 min-h-[400px]">
                <TabsContent value="basic-info" className="mt-0">
                  <BasicInfoTab formData={editingTrip} updateFormData={updateEditingTrip} />
                </TabsContent>

                <TabsContent value="schedule" className="mt-0">
                  <ScheduleTab formData={editingTrip} updateFormData={updateEditingTrip} />
                </TabsContent>

                <TabsContent value="cost" className="mt-0">
                  <CostTab formData={editingTrip} updateFormData={updateEditingTrip} />
                </TabsContent>

                <TabsContent value="preparation" className="mt-0">
                  <PreparationTab formData={editingTrip} updateFormData={updateEditingTrip} />
                </TabsContent>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateTrip} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FilterSidebar = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Bộ lọc</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Địa điểm</label>
          <div className="mt-2 space-y-2">
            {["Lào Cai", "Sơn La", "Lai Châu", "Tây Ninh"].map((loc) => (
              <label key={loc} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded" />
                {loc}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Độ khó</label>
          <div className="mt-2 space-y-2">
            {Object.entries(difficultyLabels).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Trạng thái</label>
          <div className="mt-2 space-y-2">
            {Object.entries(statusLabels).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MyTripCardProps {
  trip: MyTrip;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onClickDetail?: (id: string) => void;
}

const MyTripCard = ({ trip, index, onDelete, isDeleting, onClickDetail }: MyTripCardProps) => {
  const navigate = useNavigate();
  const spotsPercentage = (trip.spotsRemaining / trip.totalSpots) * 100;
  const isLowSpots = spotsPercentage <= 30;

  return (
    <article
      className="group bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden animate-fade-in hover:shadow-lg transition-shadow cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onClickDetail ? onClickDetail(trip.id) : navigate(`/trip/${trip.id}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-56 h-40 md:h-auto shrink-0 overflow-hidden">
          <SecureImage
            src={trip.image}
            alt={trip.name}
            className="absolute inset-0 w-full h-full object-cover"
            fallback={
              <div className="absolute inset-0 gradient-mountain flex items-center justify-center">
                <Compass className="h-12 w-12 text-primary-foreground/30" />
              </div>
            }
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {trip.name}
                </h3>
                <Badge className={statusClasses[trip.status]}>
                  {statusLabels[trip.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.location}
                </span>
                <Badge className={`${getDifficultyClass(trip.difficulty)} border text-xs`}>
                  {difficultyLabels[trip.difficulty]}
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary">
                {formatPrice(trip.estimatedPrice)}
              </p>
              <p className="text-xs text-muted-foreground">ước tính</p>
            </div>
          </div>

          {/* Trip Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">Khởi hành:</span>
              <p className="font-medium text-foreground">{formatDate(trip.departureDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Đóng tour:</span>
              <p className="font-medium text-foreground">Trước 3 ngày</p>
            </div>
            <div>
              <span className="text-muted-foreground">Số chỗ còn lại:</span>
              <p className={`font-medium ${isLowSpots ? "text-accent" : "text-foreground"}`}>
                {trip.spotsRemaining}/{trip.totalSpots}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Leader:</span>
              <p className="font-medium text-foreground">{trip.leaders}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <div className="text-sm text-muted-foreground">
              <span>Số Porter hiện có: </span>
              <span className="font-medium text-foreground">
                {trip.portersAvailable}/{trip.portersNeeded}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(trip.id);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Xóa</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClickDetail) {
                    onClickDetail(trip.id);
                  } else {
                    navigate(`/trip/${trip.id}`);
                  }
                }}
              >
                Chi tiết
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const registrationStatusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

const registrationStatusClasses = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
};

interface JoinedTripCardProps {
  trip: JoinedTrip;
  index: number;
  onClickDetail?: (id: string) => void;
}

const JoinedTripCard = ({ trip, index, onClickDetail }: JoinedTripCardProps) => {
  const navigate = useNavigate();
  const spotsPercentage = (trip.spotsRemaining / trip.totalSpots) * 100;
  const isLowSpots = spotsPercentage <= 30;

  return (
    <article
      className="group bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden animate-fade-in hover:shadow-lg transition-shadow cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onClickDetail ? onClickDetail(trip.id) : navigate(`/trip/${trip.id}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-56 h-40 md:h-auto shrink-0 overflow-hidden">
          <SecureImage
            src={trip.image}
            alt={trip.name}
            className="w-full h-full object-cover"
            fallback={
              <div className="absolute inset-0 gradient-mountain flex items-center justify-center">
                <Compass className="h-12 w-12 text-primary-foreground/30" />
              </div>
            }
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {trip.name}
                </h3>
                <Badge className={registrationStatusClasses[trip.registrationStatus]}>
                  {registrationStatusLabels[trip.registrationStatus]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.location}
                </span>
                <Badge className={`${getDifficultyClass(trip.difficulty)} border text-xs`}>
                  {difficultyLabels[trip.difficulty]}
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary">
                {formatPrice(trip.estimatedPrice)}
              </p>
              <p className="text-xs text-muted-foreground">ước tính</p>
            </div>
          </div>

          {/* Trip Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">Khởi hành:</span>
              <p className="font-medium text-foreground">{formatDate(trip.departureDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Thời gian:</span>
              <p className="font-medium text-foreground">{trip.duration}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Số chỗ còn lại:</span>
              <p className={`font-medium ${isLowSpots ? "text-accent" : "text-foreground"}`}>
                {trip.spotsRemaining}/{trip.totalSpots}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Đăng ký lúc:</span>
              <p className="font-medium text-foreground">
                {trip.registeredAt ? formatDate(trip.registeredAt) : "-"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <div className="text-sm text-muted-foreground">
              {trip.registrationStatus === "pending" && (
                <span className="text-yellow-600 dark:text-yellow-500">Đang chờ người tổ chức duyệt đơn</span>
              )}
              {trip.registrationStatus === "approved" && (
                <span className="text-green-600 dark:text-green-500">Bạn đã được xác nhận tham gia</span>
              )}
              {trip.registrationStatus === "rejected" && (
                <span className="text-red-600 dark:text-red-500">Đơn đăng ký đã bị từ chối</span>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trip/${trip.id}`);
              }}
            >
              Chi tiết
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MyTrips;
