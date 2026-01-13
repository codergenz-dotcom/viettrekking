import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Mountain, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar, type Filters } from '@/components/FilterSidebar';
import { TripCard } from '@/components/TripCard';
import { type Trip, type Difficulty, type TripType } from '@/data/mockTrips';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TripDetail from './TripDetail';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { userTripService, type TripListItemResponse, type DifficultyLevel, type SearchTripsParams } from '@/services/api';

const initialFilters: Filters = {
  locations: [],
  difficulties: [],
  dateFrom: '',
  dateTo: '',
};

const mapDifficultyFromApi = (difficulty: DifficultyLevel): Difficulty => {
  const map: Record<DifficultyLevel, Difficulty> = {
    'EASY': 'easy',
    'MEDIUM': 'medium',
    'HARD': 'hard',
    'EXTREME': 'extreme',
  };
  return map[difficulty] || 'medium';
};

const mapDifficultyToApi = (difficulty: Difficulty): DifficultyLevel => {
  const map: Record<Difficulty, DifficultyLevel> = {
    'easy': 'EASY',
    'medium': 'MEDIUM',
    'hard': 'HARD',
    'extreme': 'EXTREME',
  };
  return map[difficulty];
};

const mapApiTripToTrip = (apiTrip: TripListItemResponse): Trip => {
  const durationDays = parseInt(apiTrip.durationDays) || 2;
  const duration = apiTrip.durationType === 'SINGLE_DAY'
    ? '1 ngày'
    : `${durationDays} ngày ${durationDays - 1} đêm`;

  return {
    id: apiTrip.id,
    name: apiTrip.name,
    location: apiTrip.location,
    image: apiTrip.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    difficulty: mapDifficultyFromApi(apiTrip.difficulty),
    departureDate: (apiTrip.departureDate || '').split(' ')[0],
    registrationDeadline: (apiTrip.registrationDeadline || '').split(' ')[0],
    duration,
    tripType: 'trekking' as TripType,
    spotsRemaining: apiTrip.expectedPorterCount,
    totalSpots: apiTrip.expectedPorterCount,
    leaders: 1,
    portersAvailable: 0,
    portersNeeded: apiTrip.expectedPorterCount,
    estimatedPrice: apiTrip.estimatedPrice || (apiTrip.includedCosts || []).reduce((sum, item) => sum + (parseInt(item.cost) || 0), 0),
    description: apiTrip.description,
    organizerId: apiTrip.porter?.id || '',
  };
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const hasSearchOrFilters =
          searchQuery.trim() !== '' ||
          filters.locations.length > 0 ||
          filters.difficulties.length > 0 ||
          filters.dateFrom !== '';

        let response;
        if (hasSearchOrFilters) {
          const searchParams: SearchTripsParams = {
            search: searchQuery || undefined,
            location: filters.locations.length > 0 ? filters.locations[0] : undefined,
            difficulty: filters.difficulties.length > 0 ? mapDifficultyToApi(filters.difficulties[0]) : undefined,
            date_from: filters.dateFrom || undefined,
          };
          response = await userTripService.searchTrips(searchParams, { size: 100 });
        } else {
          response = await userTripService.getActiveTrips({
            page: 1,
            size: 100,
            sortBy: 'id',
            sortDirection: 'ASC'
          } as any);
        }

        const mappedTrips = response.data.content.map(mapApiTripToTrip);
        setTrips(mappedTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchTrips, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.locations, filters.difficulties, filters.dateFrom]);

  useEffect(() => {
    const location = searchParams.get('location');
    const difficulty = searchParams.get('difficulty');
    const date = searchParams.get('date');

    setFilters(prev => ({
      ...prev,
      locations: location ? [location] : prev.locations,
      difficulties: difficulty ? [difficulty as Filters['difficulties'][0]] : prev.difficulties,
      dateFrom: date || prev.dateFrom,
    }));
  }, [searchParams]);

  const handleReview = (tripId: string) => {
    toast({
      title: "Đánh giá chuyến đi",
      description: "Chức năng đánh giá sẽ được cập nhật sớm!",
    });
  };

  const filteredTrips = useMemo(() => {
    let result = [...trips];

    if (currentUser?.id) {
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.name.toLowerCase().includes(query) ||
          trip.location.toLowerCase().includes(query) ||
          trip.description.toLowerCase().includes(query)
      );
    }

    if (filters.locations.length > 0) {
      result = result.filter((trip) => filters.locations.includes(trip.location));
    }

    if (filters.difficulties.length > 0) {
      result = result.filter((trip) =>
        filters.difficulties.includes(trip.difficulty)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((trip) => new Date(trip.departureDate) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      result = result.filter((trip) => new Date(trip.departureDate) <= toDate);
    }

    result.sort(
      (a, b) =>
        new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
    );

    return result;
  }, [searchQuery, filters, trips, currentUser?.username]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFilterCount =
    filters.locations.length +
    filters.difficulties.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="bg-background">
      <div className="border-b border-border/60 bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Danh sách chuyến đi hiện tại
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Tìm và tham gia các chuyến leo núi phù hợp với bạn
                </p>
              </div>
              <Button
                onClick={() => navigate('/create-trip')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tạo chuyến đi mới</span>
                <span className="sm:hidden">Tạo mới</span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />

              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden shrink-0 h-12 w-12 relative"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClear={clearFilters}
                    />
                  </div>
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
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onClear={clearFilters}
            />
          </div>

          {/* Trip List */}
          <div className="flex-1 min-w-0">
            {/* Results Count */}
            {!isLoading && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy{' '}
                  <span className="font-semibold text-foreground">
                    {filteredTrips.length}
                  </span>{' '}
                  chuyến đi
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Xóa bộ lọc ({activeFilterCount})
                  </Button>
                )}
              </div>
            )}

            {/* Trip Cards */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách chuyến đi...</p>
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="space-y-4">
                {filteredTrips.map((trip, index) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    index={index}
                    onClick={(id) => {
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
                  Không tìm thấy chuyến đi
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để xem thêm
                  các chuyến đi khác.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    clearFilters();
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}

            {/* Trip Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-none">
                <DialogHeader className="sr-only">
                  <DialogTitle>Chi tiết chuyến đi</DialogTitle>
                </DialogHeader>
                {selectedTripId && (
                  <TripDetail tripId={selectedTripId} isModal={true} />
                )}
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
