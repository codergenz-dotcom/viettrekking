export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface CreatedTrip {
    id: string;
    name: string;
    location: string;
    difficulty: string;
    departureDate?: string | Date;
    registrationDeadline?: string | Date;
    contactEmail?: string;
    contactPhone?: string;
    discussionLink?: string;
    images?: string[];
    image?: string;
    durationType?: "multi-day" | "single-day";
    durationDays?: number;
    schedule?: { time: string; content: string }[];
    includedCosts?: { content: string; cost: string }[];
    additionalCosts?: { content: string; cost: string }[];
    costNotes?: string;
    preparations?: string[];
    status: string;
    createdBy?: string;
    createdByName?: string;
    maxParticipants?: number;
    participants?: number;
}

export interface Registration {
    id: string;
    tripId: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    status: RegistrationStatus;
    registeredAt: string;
}

export interface TripReview {
    id: string;
    tripId: string;
    tripName: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    feedback: string;
    createdAt: string;
    isVisible: boolean;
}

export type TripStatus = 'upcoming' | 'in_progress' | 'completed';

export interface TripStatusData {
    tripId: string;
    status: TripStatus;
    startedAt?: string;
    completedAt?: string;
}
