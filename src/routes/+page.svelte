<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { authToken, moviesStore } from '$lib';

  import MovieCard from '$lib/components/MovieCard.svelte';
  import MovieForm from '$lib/components/MovieForm.svelte';

  import type {
    Movie,
    MovieFormSubmit,
    MoviePayload
  } from '$lib/types';

  // Estado local
  let editingMovie = $state<Movie | null>(null);

  let feedbackMessage = $state<
    {
      type: 'error' | 'info';
      text: string;
    } | null
  >(null);

  // LOAD
  onMount(() => {

    if (!browser) return;

    if (!authToken.value) {

      goto('/login');

      return;
    }

    moviesStore.loadMovies();
  });

  // REDIRECT LOGIN
  $effect(() => {

    if (
      browser &&
      !authToken.value &&
      !moviesStore.loading
    ) {

      goto('/login');
    }
  });

  // ERRORS
  $effect(() => {

    if (moviesStore.error) {

      feedbackMessage = {
        type: 'error',
        text: moviesStore.error
      };
    }
  });

  // SUBMIT FORM
  async function handleFormSubmit(
    data: MovieFormSubmit
  ) {

    feedbackMessage = null;

    moviesStore.clearError();

    const {
      id,
      title,
      director,
      year,
      posterUrl
    } = data;

    const payload: MoviePayload = {
      title,
      director,
      year,
      posterUrl
    };

    // UPDATE
    if (id) {

      const ok = await moviesStore.updateMovie(
        id,
        payload
      );

      if (ok) {

        feedbackMessage = {
          type: 'info',
          text:
            'Película actualizada correctamente.'
        };

        editingMovie = null;
      }

    } else {

      // CREATE
      const ok = await moviesStore.createMovie(
        payload
      );

      if (ok) {

        feedbackMessage = {
          type: 'info',
          text:
            'Película guardada correctamente.'
        };
      }
    }
  }

  // DELETE
  async function handleDelete(id: string) {

    feedbackMessage = null;

    moviesStore.clearError();

    const ok = await moviesStore.deleteMovie(id);

    if (ok) {

      feedbackMessage = {
        type: 'info',
        text: 'Película eliminada.'
      };
    }
  }

  // EDIT
  function handleEdit(movie: Movie) {

    editingMovie = movie;
  }

  // CANCEL EDIT
  function handleCancelEdit() {

    editingMovie = null;
  }

  // FAVORITE ❤️
  async function handleToggleFavorite(
    id: string
  ) {

    await moviesStore.toggleFavorite(id);
  }

  // RATING ⭐
  async function handleSetRating(
    id: string,
    rating: number
  ) {

    await moviesStore.setRating(
      id,
      rating
    );
  }
</script>

<section class="container mx-auto px-4 py-8">

  <div class="mb-8 max-w-3xl">

    <h1 class="text-3xl font-bold text-slate-900">
      Mi Videoteca
    </h1>

    <p class="text-slate-600">
      Gestiona tu colección personal
      de películas favoritas.
    </p>

  </div>

  {#if feedbackMessage}

    <div
      class={`mb-6 rounded border px-4 py-3 text-sm ${
        feedbackMessage.type === 'error'
          ? 'border-red-300 bg-red-50 text-red-700'
          : 'border-green-300 bg-green-50 text-green-700'
      }`}
    >
      {feedbackMessage.text}
    </div>

  {/if}

  <div class="grid gap-8 lg:grid-cols-[2fr_1fr]">

    <!-- LISTA -->
    <div>

      {#if moviesStore.loading}

        <div
          class="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm"
        >
          Cargando películas...
        </div>

      {:else if moviesStore.movies.length === 0}

        <div
          class="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm"
        >
          Tu videoteca está vacía.
        </div>

      {:else}

        <div
          class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >

          {#each moviesStore.movies as movie (movie.id)}

            <MovieCard
              {movie}
              ondelete={handleDelete}
              onedit={handleEdit}
              ontogglefavorite={handleToggleFavorite}
              onsetrating={handleSetRating}
            />

          {/each}

        </div>

      {/if}

    </div>

    <!-- FORM -->
    <aside
      class="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >

      <h2
        class="mb-2 text-xl font-semibold text-slate-900"
      >
        {editingMovie
          ? 'Editar película'
          : 'Nueva película'}
      </h2>

      <p class="mb-4 text-sm text-slate-500">

        {editingMovie
          ? 'Actualiza los datos.'
          : 'Añade una nueva película.'}

      </p>

      <MovieForm
        isSubmitting={moviesStore.mutating}
        bind:initialMovie={editingMovie}
        submitLabel={
          editingMovie
            ? 'Guardar cambios'
            : 'Añadir película'
        }
        showCancel={Boolean(editingMovie)}
        onsubmit={handleFormSubmit}
        oncancel={handleCancelEdit}
      />

    </aside>

  </div>

</section>