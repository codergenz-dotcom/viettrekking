import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Mountain, SlidersHorizontal, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTrips, mockCompletedTrips, difficultyLabels, type Trip, type Difficulty, type TripType, type CompletedTrip } from "@/data/mockTrips";
import { CompletedTripCard } from "@/components/CompletedTripCard";
import { ReviewDialog } from "@/components/ReviewDialog";
import { useAuth } from "@/contexts/AuthContext";

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

const getMyJoinedTrips = (userId: string): JoinedTrip[] => {
  try {
    const regStored = localStorage.getItem('tripRegistrations');
    if (!regStored) return [];

    const allRegistrations = JSON.parse(regStored);
    const joinedTrips: JoinedTrip[] = [];

    const createdTripsStored = localStorage.getItem('createdTrips');
    const createdTrips = createdTripsStored ? JSON.parse(createdTripsStored) : [];

    for (const [tripId, regs] of Object.entries(allRegistrations)) {
      const userReg = (regs as { userId: string; status: string; registeredAt: string }[]).find(r => r.userId === userId);
      if (!userReg) continue;

      let trip = mockTrips.find(t => t.id === tripId);
      if (!trip) {
        const created = createdTrips.find((t: { id: string }) => t.id === tripId);
        if (created) {
          trip = {
            id: created.id,
            name: created.name,
            location: created.location,
            image: created.image || created.images?.[0] || '',
            difficulty: created.difficulty || 'medium',
            departureDate: created.departureDate || new Date().toISOString().split('T')[0],
            duration: created.durationType === 'single-day' ? '1 ngày' : `${created.durationDays || 2} ngày`,
            tripType: 'trekking' as TripType,
            spotsRemaining: (created.maxParticipants || 20) - (created.participants || 0),
            totalSpots: created.maxParticipants || 20,
            leaders: 1,
            portersAvailable: 0,
            portersNeeded: 1,
            estimatedPrice: created.estimatedPrice || calculateEstimatedPrice(created.includedCosts || []),
            description: '',
            organizerId: created.createdBy || '',
          } as Trip;
        }
      }

      if (trip) {
        joinedTrips.push({
          ...trip,
          registrationStatus: userReg.status as "pending" | "approved" | "rejected",
          registeredAt: userReg.registeredAt,
        });
      }
    }

    return joinedTrips;
  } catch {
    return [];
  }
};

const getMyCreatedTrips = (userId: string): MyTrip[] => {
  try {
    const stored = localStorage.getItem('createdTrips');
    if (!stored) return [];
    const trips = JSON.parse(stored);
    return trips
      .filter((t: { createdBy?: string }) => t.createdBy === userId)
      .map((t: {
        id: string;
        name: string;
        location: string;
        image?: string;
        images?: string[];
        difficulty: string;
        departureDate?: string;
        durationDays?: number;
        durationType?: string;
        maxParticipants?: number;
        participants?: number;
        status: string;
        estimatedPrice?: number;
        includedCosts?: { content: string; cost: string }[];
      }): MyTrip => ({
        id: t.id,
        name: t.name,
        location: t.location,
        image: t.image || t.images?.[0] || '',
        difficulty: (t.difficulty || 'medium') as Difficulty,
        departureDate: t.departureDate || new Date().toISOString().split('T')[0],
        registrationDeadline: t.departureDate || new Date().toISOString().split('T')[0],
        duration: t.durationType === 'single-day' ? '1 ngày' : `${t.durationDays || 2} ngày`,
        tripType: 'trekking' as TripType,
        spotsRemaining: (t.maxParticipants || 20) - (t.participants || 0),
        totalSpots: t.maxParticipants || 20,
        leaders: 1,
        portersAvailable: 0,
        portersNeeded: 1,
        estimatedPrice: t.estimatedPrice || calculateEstimatedPrice(t.includedCosts || []),
        description: '',
        organizerId: userId,
        status: (t.status === 'approved' ? 'open' : t.status) as TripStatus,
      }));
  } catch {
    return [];
  }
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
  const { isPorter, currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isPorter ? "created" : "joined");
  const [myTrips, setMyTrips] = useState<MyTrip[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<JoinedTrip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<CompletedTrip[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTripForReview, setSelectedTripForReview] = useState<CompletedTrip | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      setMyTrips(getMyCreatedTrips(currentUser.id));
      setJoinedTrips(getMyJoinedTrips(currentUser.id));
      
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
    }
  }, [currentUser?.id]);

  const filteredTrips = useMemo(() => {
    if (!searchQuery) return myTrips;
    const query = searchQuery.toLowerCase();
    return myTrips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(query) ||
        trip.location.toLowerCase().includes(query)
    );
  }, [searchQuery, myTrips]);

  const filteredCompletedTrips = useMemo(() => {
    if (!searchQuery) return completedTrips;
    const query = searchQuery.toLowerCase();
    return completedTrips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(query) ||
        trip.location.toLowerCase().includes(query)
    );
  }, [searchQuery, completedTrips]);

  const filteredJoinedTrips = useMemo(() => {
    if (!searchQuery) return joinedTrips;
    const query = searchQuery.toLowerCase();
    return joinedTrips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(query) ||
        trip.location.toLowerCase().includes(query)
    );
  }, [searchQuery, joinedTrips]);

  const handleReview = (tripId: string) => {
    const trip = completedTrips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTripForReview(trip);
      setReviewDialogOpen(true);
    }
  };

  const handleSubmitReview = (tripId: string, rating: number, feedback: string) => {
    const trip = completedTrips.find(t => t.id === tripId);
    if (!trip || !currentUser) return;

    setCompletedTrips(prev => 
      prev.map(t => 
        t.id === tripId ? { ...t, hasReviewed: true } : t
      )
    );
    
    const storedReviews = localStorage.getItem('tripReviews');
    const reviews = storedReviews ? JSON.parse(storedReviews) : [];
    
    const newReview = {
      id: `review-${Date.now()}`,
      tripId,
      tripName: trip.name,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar || '',
      organizerId: trip.organizerId,
      rating,
      feedback,
      createdAt: new Date().toISOString(),
      isVisible: true,
    };
    
    reviews.push(newReview);
    localStorage.setItem('tripReviews', JSON.stringify(reviews));
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
              {isPorter && (
                <Button
                  onClick={() => navigate("/create-trip")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Tạo chuyến đi mới</span>
                  <span className="sm:hidden">Tạo mới</span>
                </Button>
              )}
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
                {isPorter && (
                  <TabsTrigger value="created">
                    Chuyến đi đã tạo ({filteredTrips.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="joined">
                  Đang tham gia ({filteredJoinedTrips.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Đã hoàn thành ({filteredCompletedTrips.length})
                </TabsTrigger>
              </TabsList>

              {isPorter && (
                <TabsContent value="created" className="mt-0">
                  {filteredTrips.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTrips.map((trip, index) => (
                        <MyTripCard key={trip.id} trip={trip} index={index} />
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
              )}

              <TabsContent value="joined" className="mt-0">
                {filteredJoinedTrips.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJoinedTrips.map((trip, index) => (
                      <JoinedTripCard key={trip.id} trip={trip} index={index} />
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
}

const MyTripCard = ({ trip, index }: MyTripCardProps) => {
  const navigate = useNavigate();
  const spotsPercentage = (trip.spotsRemaining / trip.totalSpots) * 100;
  const isLowSpots = spotsPercentage <= 30;

  return (
    <article
      className="group bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden animate-fade-in hover:shadow-lg transition-shadow cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => navigate(`/trip/${trip.id}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-56 h-40 md:h-auto shrink-0 overflow-hidden">
          {trip.image ? (
            <img
              src={trip.image}
              alt={trip.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 gradient-mountain flex items-center justify-center">
              <Compass className="h-12 w-12 text-primary-foreground/30" />
            </div>
          )}
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
}

const JoinedTripCard = ({ trip, index }: JoinedTripCardProps) => {
  const navigate = useNavigate();
  const spotsPercentage = (trip.spotsRemaining / trip.totalSpots) * 100;
  const isLowSpots = spotsPercentage <= 30;

  return (
    <article
      className="group bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden animate-fade-in hover:shadow-lg transition-shadow cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => navigate(`/trip/${trip.id}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-56 h-40 md:h-auto shrink-0 overflow-hidden">
          {trip.image ? (
            <img
              src={trip.image}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 gradient-mountain flex items-center justify-center">
              <Compass className="h-12 w-12 text-primary-foreground/30" />
            </div>
          )}
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
