export type AuthMode = 'login' | 'register';

// Kiểu form giao diện; không phải request DTO của API Auth.
export type AuthValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  terms: boolean;
};

export type AuthErrors = Partial<Record<keyof AuthValues, string>>;

export type UserRole = 'REPORTER' | 'OPERATOR' | 'RESPONDER' | 'COMMANDER' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  unitId: string | null;
};

export type LoginRequest = { email: string; password: string };
export type AccessTokenResponse = { accessToken: string; expiresIn: number };
export type LoginResponse = AccessTokenResponse & { user: AuthUser };
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';
export type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  user: AuthUser | null;
  error: string | null;
};
