import { authToken } from './auth.store.svelte';
import type {
  ApiErrorPayload,
  Credentials,
  LoginResponse,
  Movie,
  MoviePayload,
  RegisterPayload,
} from './types';

// Configuración base del servicio API
const FALLBACK_API_URL = 'https://mivideoteca-api.onrender.com';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}

// Excepción personalizada para errores de API
export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, options?: { status?: number; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.details = options?.details;
  }
}

// Limpia la URL base
function sanitizeBaseUrl(url: string): string {
  const trimmed = url.trim();

  if (!trimmed) {
    return FALLBACK_API_URL;
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

// URL base desde variables de entorno
const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_API_URL ?? FALLBACK_API_URL
);

// Función genérica para peticiones HTTP
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers = new Headers();

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = authToken.value;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError('No se pudo conectar con el servidor.', {
      details: error,
    });
  }

  let payload: unknown = null;

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');

  if (response.status !== 204 && isJson) {
    try {
      payload = await response.json();
    } catch (error) {
      throw new ApiError('El servidor devolvió una respuesta inválida.', {
        status: response.status,
        details: error,
      });
    }
  } else if (response.status !== 204) {
    payload = await response.text();
  }

  if (!response.ok) {
    const errorPayload = (payload ?? {}) as ApiErrorPayload;

    const serverMessage =
      typeof errorPayload === 'object'
        ? errorPayload.error ?? errorPayload.message
        : undefined;

    throw new ApiError(
      serverMessage ?? 'Ocurrió un error inesperado.',
      {
        status: response.status,
        details: payload,
      }
    );
  }

  return payload as T;
}

export const api = {
  // Login
  login: (credentials: Credentials) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials,
      auth: false,
    }),

  // Registro
  register: (payload: RegisterPayload) =>
    request<void>('/api/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  // Obtener películas
  getMovies: () => request<Movie[]>('/api/movies'),

  // Crear película
  createMovie: (payload: MoviePayload) =>
    request<Movie>('/api/movies', {
      method: 'POST',
      body: payload,
    }),

  // Actualizar película
  updateMovie: (id: string, payload: MoviePayload) =>
    request<Movie>(`/api/movies/${id}`, {
      method: 'PUT',
      body: payload,
    }),

  // Eliminar película
  deleteMovie: (id: string) =>
    request<void>(`/api/movies/${id}`, {
      method: 'DELETE',
    }),
};