export type UserRole = 'admin' | 'main-store-manager' | 'station-manager' | 'sub-station-manager';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  stationId?: string; // For station and sub-station managers
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}