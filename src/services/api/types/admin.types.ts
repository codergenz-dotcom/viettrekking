import type { PaginationRequest } from './common.types';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'PENDING_ACTIVATION';
export type PorterStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccountStatistics {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  lockedAccounts: number;
  totalPorters: number;
  pendingPorterApplications: number;
}

export interface AdminAccountSummary {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  isPorter: boolean;
  status: AccountStatus;
  joinDate: string;
  lastLoginAt: string;
  tripsCreated: number;
  tripsJoined: number;
}

export interface AdminAccountDetail extends AdminAccountSummary {
  displayName: string;
  phone: string;
  location: string;
  bio: string;
  facebookUrl: string;
  instagramUrl: string;
  driveLink: string;
  porterStatus: PorterStatus;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface AdminAccountListParams extends PaginationRequest {
  role?: string;
  status?: AccountStatus;
  search?: string;
}
