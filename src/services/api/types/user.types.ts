export interface AccountResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  fullName: string;
  avatar: string;
  role: string;
  isPorter?: boolean;
  phone: string;
  bio: string;
  location: string;
  facebookUrl: string;
  instagramUrl: string;
  driveLink: string;
  tripsJoined: number;
  tripsCreated: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  fullName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  driveLink?: string;
}
