import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, User, Compass, Backpack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  type Trip,
  difficultyLabels,
  tripTypeLabels,
  type Difficulty,
} from '@/data/mockTrips';

interface TripCardProps {
  trip: Trip;
  index: number;
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const TripCard = ({ trip, index }: TripCardProps) => {
  const navigate = useNavigate();
  const spotsPercentage = (trip.spotsRemaining / trip.totalSpots) * 100;
  const isLowSpots = spotsPercentage <= 30;

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
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 overflow-hidden">
          {trip.image ? (
            <img
              src={trip.image}
              alt={trip.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 gradient-mountain flex items-center justify-center">
              <Compass className="h-16 w-16 text-primary-foreground/30" />
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
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex-1">
            {/* Title & Location */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {trip.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.location}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-primary">
                  {formatPrice(trip.estimatedPrice)}
                </p>
                <p className="text-xs text-muted-foreground">ước tính</p>
              </div>
            </div>

            {/* Trip Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {formatDate(trip.departureDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Compass className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{trip.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {trip.leaders} leader
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Backpack className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {trip.portersAvailable}/{trip.portersNeeded} porter
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {trip.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLowSpots ? 'bg-accent' : 'bg-primary'
                    }`}
                    style={{
                      width: `${100 - spotsPercentage}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isLowSpots ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  {trip.spotsRemaining}/{trip.totalSpots} chỗ trống
                </span>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              className="gradient-mountain text-primary-foreground shadow-button hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail();
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
