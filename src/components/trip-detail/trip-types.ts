export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

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
    durationType?: "multi-day" | "single-day" | "SINGLE_DAY" | "MULTI_DAY";
    durationDays?: string | number;
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
    description?: string;
    expectedPorterCount?: number;
    creator?: { id: string; fullName: string };
    porter?: { id: string; fullName: string };
}

export interface Registration {
    id: string;
    accountId: string;
    name: string;
    email: string;
    phone: string;
    status: RegistrationStatus;
    registeredAt: string;
    processedAt?: string | null;
    rejectReason?: string | null;
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
