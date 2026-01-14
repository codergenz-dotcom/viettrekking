export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
export type DurationType = 'SINGLE_DAY' | 'MULTI_DAY';

export interface ScheduleItem {
  time: string;
  content: string;
}

export interface CostItem {
  content: string;
  cost: string;
}

export interface OrganizerInfo {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  difficulty: string;
  departureDate: string;
}

export interface CreateTripPayload {
  name: string;
  location: string;
  difficulty: string;
  departureDate: string;
  registrationDeadline: string;
}

export interface GetTripsParams {
  page?: number;
  pageSize?: number;
  location?: string;
  difficulty?: string;
  search?: string;
}

export interface CreateUserTripPayload {
  name: string;
  location: string;
  difficulty: DifficultyLevel;
  description: string;
  departureDate: string;
  registrationDeadline: string;
  contactEmail: string;
  contactPhone: string;
  expectedPorterCount: number;
  discussionLink?: string;
  images?: string[];
  durationType: DurationType;
  durationDays: string;
  schedule?: ScheduleItem[];
  includedCosts?: CostItem[];
  additionalCosts?: CostItem[];
  costNotes?: string;
  preparations?: string[];
  isDraft: boolean;
}

export interface TripListItemResponse {
  id: string;
  porter?: OrganizerInfo;
  creator?: OrganizerInfo;
  name: string;
  location: string;
  difficulty: DifficultyLevel;
  description: string;
  departureDate: string;
  registrationDeadline: string;
  contactEmail: string;
  contactPhone: string;
  expectedPorterCount: number;
  durationType: DurationType;
  durationDays: string;
  isDraft: boolean;
  estimatedPrice?: number;
  includedCosts?: CostItem[];
  createdAt: string;
  updatedAt: string;
  images?: string[];
  participants?: number;
  maxParticipants?: number;
}

export interface TripResponse extends TripListItemResponse {
  discussionLink?: string;
  images?: string[];
  schedule?: ScheduleItem[];
  includedCosts?: CostItem[];
  additionalCosts?: CostItem[];
  costNotes?: string;
  preparations?: string[];
  createdBy: string;
  updatedBy: string;
  status?: TripStatus;
}

export interface SearchTripsParams {
  search?: string;
  difficulty?: DifficultyLevel;
  location?: string;
  date_from?: string;
}

export interface JoinTripRequest {
  phone: string;
  email: string;
  name: string;
  note?: string;
}

export interface TripRegistrationResponse {
  id: string;
  tripId: string;
  accountId: string;
  name: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredAt: string;
  processedAt?: string | null;
  rejectReason?: string | null;
  note?: string;
}

export interface UpdateRegistrationStatusRequest {
  status: 'APPROVED' | 'REJECTED';
}

export interface MyRegistrationStatusResponse {
  registrationId: string;
  tripId: string;
  accountId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredAt: string;
  rejectReason?: string | null;
}

export type TripStatus = 'OPEN' | 'closed' | 'in_progress' | 'completed';

export interface UpdateTripStatusRequest {
  status: TripStatus;
}

export type PorterApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SubmitPorterApplicationRequest {
  name: string;
  phone: string;
  experience: string;
  cvUrl: string;
}

export interface ApplyStatusResponse {
  id: string;
  userId: string;
  status: PorterApplicationStatus;
  name: string;
  phone: string;
  experience: string;
  cvUrl: string;
  appliedAt: string;
}

export interface PorterApplicationListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  experience: string;
  status: PorterApplicationStatus;
  appliedAt: string;
  rejectReason?: string;
}

export interface RejectPorterApplicationRequest {
  reason: string;
}

export interface RejectTripRequest {
  reason: string;
}

export interface TripApprovalStatusResponse {
  id: string;
  tripId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
}

export interface ImageResponse {
  id: string;
  url?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export interface ImageMetadata {
  id: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  fileSizeDisplay: string;
  mimeType: string;
  fileExtension: string;
  imageUrl: string;
  uploadedBy: string;
  uploadedByUsername: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface TripReviewResponse {
  id: string;
  tripId: string;
  userId: string;
  userFullName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isVisible?: boolean;
}

export interface ReviewSummaryResponse {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}
