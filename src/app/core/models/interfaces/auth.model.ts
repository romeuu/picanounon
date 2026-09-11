export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  pictureUrl?: string | null;
  provider: AuthProvider;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface GoogleTokenRequest {
  idToken: string;
}
