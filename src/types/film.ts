export interface MovieResponse {
  id: number;
  title: string;
  genre: string;
  director: string;
  releaseYear: number;
  description: string;
}

export interface MovieRequest {
  title: string;
  genre: string;
  director: string;
  releaseYear: number;
  description: string;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // 0-indexed page number
  size: number;
  first: boolean;
  last: boolean;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface ApiErrorPayload {
  status: number;
  message: string;
  timestamp: string;
}

export type BackendMode = 'live' | 'demo';

export interface UserSession {
  userName: string;
  email: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  statusCode?: number;
}
