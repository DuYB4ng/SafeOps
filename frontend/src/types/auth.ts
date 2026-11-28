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
