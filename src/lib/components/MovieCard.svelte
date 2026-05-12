<script lang="ts">
  import type { Movie } from '$lib/types';

  let {
    movie,
    showActions = true,
    ondelete,
    onedit,
    ontogglefavorite,
    onsetrating
  }: {
    movie: Movie;
    showActions?: boolean;
    ondelete?: (id: string) => void;
    onedit?: (movie: Movie) => void;
    ontogglefavorite?: (id: string) => void;
    onsetrating?: (id: string, rating: number) => void;
  } = $props();

  function handleDelete() {
    ondelete?.(movie.id);
  }

  function handleEdit() {
    onedit?.(movie);
  }

  function handleFavorite() {
    ontogglefavorite?.(movie.id);
  }

  function handleRating(rating: number) {
    onsetrating?.(movie.id, rating);
  }
</script>

<article class="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

  {#if movie.posterUrl}
    <div class="flex h-64 items-center justify-center bg-slate-100">
      <img
        alt={`Póster de ${movie.title}`}
        class="h-full w-full object-cover"
        src={movie.posterUrl}
        loading="lazy"
      />
    </div>
  {/if}

  <div class="flex flex-1 flex-col gap-3 p-4">

    <div class="flex items-start justify-between gap-2">

      <header>
        <h3 class="text-lg font-semibold text-slate-900">
          {movie.title}
        </h3>

        <p class="text-sm text-slate-600">
          Dirigida por {movie.director}
        </p>
      </header>

      <!-- FAVORITO ❤️ -->
      <button
        type="button"
        class="text-2xl transition hover:scale-110"
        onclick={handleFavorite}
      >
        {movie.isFavorite ? '❤️' : '🤍'}
      </button>

    </div>

    <div class="text-sm text-slate-500">
      {#if movie.year}
        <span>Año: {movie.year}</span>
      {/if}
    </div>

    <!-- ESTRELLAS ⭐ -->
    <div class="flex gap-1 text-2xl">

      {#each [1, 2, 3, 4, 5] as star}

        <button
          type="button"
          class="transition hover:scale-110"
          onclick={() => handleRating(star)}
        >
          {star <= (movie.rating ?? 0)
            ? '⭐'
            : '☆'}
        </button>

      {/each}

    </div>

    {#if showActions}

      <div class="mt-3 flex flex-col gap-2 sm:flex-row">

        <button
          type="button"
          class="w-full rounded border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
          onclick={handleEdit}
        >
          Editar
        </button>

        <button
          type="button"
          class="w-full rounded border border-red-500 px-3 py-2 text-red-600 transition hover:bg-red-50"
          onclick={handleDelete}
        >
          Eliminar
        </button>

      </div>

    {/if}

  </div>

</article>