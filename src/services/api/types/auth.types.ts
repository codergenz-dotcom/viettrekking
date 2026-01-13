export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  full_name: string;
  avatar?: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  fullName: string;
  displayName: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'USER';
  isPorter: boolean;
  porterStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  isNewUser: boolean;
}
