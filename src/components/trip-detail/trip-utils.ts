import { type Trip, type Difficulty } from "@/data/mockTrips";
import { CreatedTrip, Registration, TripReview, TripStatusData } from "./trip-types";

export const parseCostString = (cost: string): number => {
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

export const calculateEstimatedPrice = (includedCosts: { content: string; cost: string }[]): number => {
    return includedCosts.reduce((sum, item) => sum + parseCostString(item.cost), 0);
};

export const getCreatedTripById = (id: string): CreatedTrip | null => {
    try {
        const stored = localStorage.getItem('createdTrips');
        if (!stored) return null;
        const trips: CreatedTrip[] = JSON.parse(stored);
        return trips.find(t => t.id === id) || null;
    } catch {
        return null;
    }
};

export const convertToTrip = (created: CreatedTrip): Trip => {
    const departureDate = created.departureDate
        ? (typeof created.departureDate === 'string'
            ? created.departureDate
            : new Date(created.departureDate).toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0];

    const registrationDeadline = created.registrationDeadline
        ? (typeof created.registrationDeadline === 'string'
            ? created.registrationDeadline
            : new Date(created.registrationDeadline).toISOString().split('T')[0])
        : departureDate;

    const mapDifficulty = (d: string): Difficulty => {
        if (!d) return 'medium';
        const lower = d.toLowerCase();
        if (['easy', 'medium', 'hard', 'extreme'].includes(lower)) return lower as Difficulty;
        return 'medium';
    };

    return {
        id: created.id,
        name: created.name,
        location: created.location,
        image: created.image || created.images?.[0] || '',
        difficulty: mapDifficulty(created.difficulty),
        departureDate,
        registrationDeadline,
        duration: created.durationType === 'SINGLE_DAY' || created.durationType === 'single-day' ? '1 ngày' : `${created.durationDays || 2} ngày`,
        tripType: 'trekking',
        spotsRemaining: (created.maxParticipants || created.expectedPorterCount || 20) - (created.participants || 0),
        totalSpots: created.maxParticipants || created.expectedPorterCount || 20,
        leaders: 1,
        portersAvailable: 0,
        portersNeeded: created.expectedPorterCount || 1,
        estimatedPrice: calculateEstimatedPrice(created.includedCosts || []),
        description: created.description || '',
        organizerId: created.creator?.id || created.porter?.id || created.createdBy || '',
    };
};

export const getRegistrationsByTripId = (tripId: string): Registration[] => {
    try {
        const stored = localStorage.getItem('tripRegistrations');
        if (!stored) return [];
        const all = JSON.parse(stored);
        return all[tripId] || [];
    } catch {
        return [];
    }
};

export const saveRegistrations = (tripId: string, registrations: Registration[]) => {
    try {
        const stored = localStorage.getItem('tripRegistrations');
        const all = stored ? JSON.parse(stored) : {};
        all[tripId] = registrations;
        localStorage.setItem('tripRegistrations', JSON.stringify(all));
    } catch {
        console.error('Failed to save registrations');
    }
};

export const getReviewsByTripId = (tripId: string): TripReview[] => {
    try {
        const stored = localStorage.getItem('tripReviews');
        if (!stored) return [];
        const reviews = JSON.parse(stored);
        return reviews.filter((r: TripReview) => r.tripId === tripId);
    } catch {
        return [];
    }
};

export const getTripStatus = (tripId: string): TripStatusData | null => {
    try {
        const stored = localStorage.getItem('tripStatuses');
        if (!stored) return null;
        const statuses: TripStatusData[] = JSON.parse(stored);
        return statuses.find(s => s.tripId === tripId) || null;
    } catch {
        return null;
    }
};

export const saveTripStatus = (data: TripStatusData) => {
    try {
        const stored = localStorage.getItem('tripStatuses');
        const statuses: TripStatusData[] = stored ? JSON.parse(stored) : [];
        const existingIndex = statuses.findIndex(s => s.tripId === data.tripId);
        if (existingIndex >= 0) {
            statuses[existingIndex] = data;
        } else {
            statuses.push(data);
        }
        localStorage.setItem('tripStatuses', JSON.stringify(statuses));
    } catch {
        console.error('Failed to save trip status');
    }
};

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
};

export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const getDifficultyClass = (difficulty: Trip["difficulty"]) => {
    switch (difficulty) {
        case "easy":
            return "bg-difficulty-easy/15 text-difficulty-easy border-difficulty-easy/30";
        case "medium":
            return "bg-difficulty-medium/15 text-difficulty-medium border-difficulty-medium/30";
        case "hard":
            return "bg-difficulty-hard/15 text-difficulty-hard border-difficulty-hard/30";
        case "extreme":
            return "bg-difficulty-extreme/15 text-difficulty-extreme border-difficulty-extreme/30";
        default:
            return "bg-difficulty-medium/15 text-difficulty-medium border-difficulty-medium/30";
    }
};
