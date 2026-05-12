/**
 * MOVIES STORE - Gestión centralizada de películas (Svelte 5 Runes)
 * 
 * Equivalente a MovieProvider en Flutter.
 * Usa runes para estado reactivo global.
 */

import { api } from './api.service';
import type { Movie, MoviePayload } from './types';

// Estado reactivo global con Svelte 5 runes
let movies = $state<Movie[]>([]);
let loading = $state(false);
let mutating = $state(false);
let error = $state<string | null>(null);

// API pública del store
export const moviesStore = {

  // Getters reactivos
  get movies() { return movies; },
  get loading() { return loading; },
  get mutating() { return mutating; },
  get error() { return error; },

  // Cargar todas las películas
  async loadMovies() {
    loading = true;
    error = null;

    try {

      movies = await api.getMovies();

    } catch (err) {

      error = err instanceof Error
        ? err.message
        : 'Error al cargar películas';

    } finally {

      loading = false;
    }
  },

  // Crear película
  async createMovie(payload: MoviePayload): Promise<boolean> {

    mutating = true;
    error = null;

    try {

      const newMovie = await api.createMovie(payload);

      movies = [...movies, newMovie];

      return true;

    } catch (err) {

      error = err instanceof Error
        ? err.message
        : 'Error al crear película';

      return false;

    } finally {

      mutating = false;
    }
  },

  // Actualizar película
  async updateMovie(
    id: string,
    payload: MoviePayload
  ): Promise<boolean> {

    mutating = true;
    error = null;

    try {

      const updatedMovie = await api.updateMovie(id, payload);

      movies = movies.map(movie =>
        movie.id === id
          ? updatedMovie
          : movie
      );

      return true;

    } catch (err) {

      error = err instanceof Error
        ? err.message
        : 'Error al actualizar película';

      return false;

    } finally {

      mutating = false;
    }
  },

  // Eliminar película
  async deleteMovie(id: string): Promise<boolean> {

    mutating = true;
    error = null;

    try {

      await api.deleteMovie(id);

      movies = movies.filter(movie =>
        movie.id !== id
      );

      return true;

    } catch (err) {

      error = err instanceof Error
        ? err.message
        : 'Error al eliminar película';

      return false;

    } finally {

      mutating = false;
    }
  },

  // FAVORITO ❤️
  async toggleFavorite(id: string): Promise<void> {

    try {

      const updatedMovie = await api.toggleFavorite(id);

      movies = movies.map(movie =>
        movie.id === id
          ? updatedMovie
          : movie
      );

    } catch (err) {

      error = err instanceof Error
        ? err.message
        : 'Error al actualizar favorito';
    }
  },

  // RATING ⭐
  async setRating(
    id: string,
    rating: number
  ): Promise<void> {

    try {

      const updatedMovie = await api.setRating(
        id,
        rating
      );

      movies = movies.map(movie =>
        movie.id === id
          ? updatedMovie
          : movie
      );

    } catch (err) {

      error = err instanceof Error
        ? err.message
        : 'Error al actualizar rating';
    }
  },

  // Limpiar estado completo
  reset() {

    movies = [];
    loading = false;
    mutating = false;
    error = null;
  },

  // Limpiar solo el error
  clearError() {

    error = null;
  }
};