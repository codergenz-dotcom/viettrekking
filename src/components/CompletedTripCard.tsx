import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Compass, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  type CompletedTrip,
  difficultyLabels,
  tripTypeLabels,
  type Difficulty,
} from '@/data/mockTrips';

interface CompletedTripCardProps {
  trip: CompletedTrip;
  index: number;
  onReview: (tripId: string) => void;
}

const getDifficultyClass = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-difficulty-easy/15 text-difficulty-easy border-difficulty-easy/30';
    case 'medium':
      return 'bg-difficulty-medium/15 text-difficulty-medium border-difficulty-medium/30';
    case 'hard':
      return 'bg-difficulty-hard/15 text-difficulty-hard border-difficulty-hard/30';
    case 'extreme':
      return 'bg-difficulty-extreme/15 text-difficulty-extreme border-difficulty-extreme/30';
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const CompletedTripCard = ({ trip, index, onReview }: CompletedTripCardProps) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/trip/${trip.id}`);
  };

  return (
    <article
      className="group bg-card rounded-2xl border border-border/60 shadow-card card-hover-lift overflow-hidden animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={handleViewDetail}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-48 h-36 md:h-auto shrink-0 overflow-hidden">
          {trip.image ? (
            <img
              src={trip.image}
              alt={trip.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 gradient-mountain flex items-center justify-center opacity-60">
              <Compass className="h-12 w-12 text-primary-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-card/90 backdrop-blur-sm text-foreground font-medium"
            >
              {tripTypeLabels[trip.tripType]}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3">
            <Badge
              className={`${getDifficultyClass(trip.difficulty)} border font-medium`}
            >
              {difficultyLabels[trip.difficulty]}
            </Badge>
          </div>
          {/* Completed overlay */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500/90 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Hoàn thành
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            {/* Title & Location */}
            <div className="mb-2">
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {trip.name}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {trip.location}
              </p>
            </div>

            {/* Trip Info */}
            <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Hoàn thành: {formatDate(trip.completedDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>{trip.duration}</span>
              </div>
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail();
              }}
            >
              Chi tiết
            </Button>
            <Button
              variant={trip.hasReviewed ? "secondary" : "default"}
              size="sm"
              className={trip.hasReviewed ? "" : "bg-amber-500 hover:bg-amber-600 text-white"}
              onClick={(e) => {
                e.stopPropagation();
                onReview(trip.id);
              }}
            >
              <Star className="h-3.5 w-3.5 mr-1" />
              {trip.hasReviewed ? "Đã đánh giá" : "Đánh giá"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
