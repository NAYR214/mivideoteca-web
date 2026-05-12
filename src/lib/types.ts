// Tipos compartidos entre componentes Svelte y servicios API.

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends Credentials {
  confirmPassword?: string;
}

export interface Movie {
  id: string;
  title: string;
  director: string;
  posterUrl?: string | null;
  year?: number | null;

  // FAVORITO ❤️
  favorite?: boolean;

  // RATING ⭐
  rating?: number;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MoviePayload {
  title: string;
  director: string;
  posterUrl?: string;

  year: number;

  // FAVORITO ❤️
  favorite?: boolean;

  // RATING ⭐
  rating?: number;
}

export interface MovieFormSubmit extends MoviePayload {
  id?: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  [key: string]: unknown;
}