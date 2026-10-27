<template>
  <div class="index-page">
    <form class="search-form" role="search" @submit.prevent="submitSearch">
      <label class="visually-hidden" for="game-search">
        Search games by title
      </label>
      <input
        id="game-search"
        v-model="searchInput"
        type="search"
        placeholder="Search games by title..."
        autocomplete="off"
      />
      <button class="search-button" type="submit" :disabled="loading">
        Search
      </button>
      <button
        v-if="searchInput || appliedSearch"
        class="clear-search-button"
        type="button"
        :disabled="loading"
        @click="clearSearch"
      >
        Clear
      </button>
    </form>

    <div class="filters-container">
      <h1>Featured Games</h1>
      <div class="controls-filters">
        <div class="sort-control-filter">
          <label for="sort-select">Sort by:</label>
          <select id="sort-select" v-model="sortBy">
            <option value="rating">Average Rating (Highest)</option>
            <option value="releaseDate">Release Date (Newest)</option>
          </select>
        </div>
        <div class="genre-control-filter">
          <label for="genre-select">Genre:</label>
          <select
            id="genre-select"
            v-model="selectedGenre"
            :disabled="genresLoading || genres.length === 0"
          >
            <option value="">All genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <p v-if="genresError" class="genre-error" role="alert">
      Genre options couldn't be loaded. Genre filtering is unavailable.
    </p>
    <output
      id="results-announcement"
      class="visually-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ resultsAnnouncement }}
    </output>

    <LoadingState v-if="loading && !games.length" message="Loading games..." />
    <ErrorState
      v-else-if="error && !games.length"
      heading-level="h1"
      message="We couldn't load games right now. Please try again."
      :retry="refreshGames"
    />
    <EmptyState v-else-if="!sortedGames.length" message="No games found." />

    <div v-else class="games-results" :aria-busy="loading">
      <GameGrid>
        <li v-for="(game, index) in sortedGames" :key="game.id">
          <GameCard
            :game="game"
            :priority="index === 0"
          />
        </li>
      </GameGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGames } from "~/composables/useGames";
import { sortGames, type SortOption } from "~/utils/sorting";
import GameGrid from "~/components/game/GameGrid.vue";
import GameCard from "~/components/game/GameCard.vue";
import LoadingState from "~/components/common/LoadingState.vue";
import ErrorState from "~/components/common/ErrorState.vue";
import EmptyState from "~/components/common/EmptyState.vue";

const { fetchGames, fetchGenres } = useGames();
const sortBy = ref<SortOption>("rating");
const selectedGenre = ref<number | "">("");
const searchInput = ref("");
const appliedSearch = ref("");

const gamesKey = computed(() =>
  JSON.stringify([
    "games",
    selectedGenre.value === "" ? null : selectedGenre.value,
    appliedSearch.value,
  ]),
);
const gamesRequest = useTimedAsyncData("games", gamesKey, (signal) =>
  fetchGames(
    selectedGenre.value === "" ? undefined : selectedGenre.value,
    appliedSearch.value,
    signal,
  ),
);
const genresRequest = useTimedAsyncData("genres", "genres", (signal) =>
  fetchGenres(signal),
);
await Promise.all([gamesRequest, genresRequest]);

const games = computed(() => gamesRequest.data.value?.games ?? []);
const loading = gamesRequest.pending;
const error = computed(() => gamesRequest.error.value?.message ?? null);
const genres = computed(() => genresRequest.data.value ?? []);
const genresLoading = genresRequest.pending;
const genresError = computed(() => genresRequest.error.value?.message ?? null);
const refreshGames = gamesRequest.refresh;
const resultsAnnouncement = computed(() => {
  if (loading.value) {
    return "Updating game results.";
  }
  if (error.value) {
    return "Could not update game results.";
  }
  if (games.value.length === 0) {
    return "No games found.";
  }
  return `${games.value.length} games shown.`;
});

const sortedGames = computed(() => {
  return sortGames(games.value, sortBy.value);
});

const submitSearch = () => {
  appliedSearch.value = searchInput.value.trim();
};

const clearSearch = () => {
  searchInput.value = "";
  appliedSearch.value = "";
};
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.index-page {
  .search-form {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    max-width: 42rem;
    margin: 0 auto $spacing-xl;
    padding: $spacing-sm;
    background-color: $card-bg;
    border: 1px solid $border-color;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow;

    input {
      flex: 1;
      min-width: 0;
      padding: $spacing-sm $spacing-md;
      color: $text-main;
      background: transparent;
      border: 0;
      font: inherit;

      &:focus-visible {
        outline: 2px solid $primary;
        outline-offset: 2px;
      }
    }

    .search-button,
    .clear-search-button {
      padding: $spacing-sm $spacing-md;
      border: 1px solid transparent;
      border-radius: calc($border-radius - 0.125rem);
      font: inherit;
      font-weight: 600;
      cursor: pointer;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .search-button {
      color: var(--color-on-primary);
      background-color: $primary;

      &:hover:not(:disabled) {
        background-color: $primary-hover;
      }
    }

    .clear-search-button {
      color: $text-muted;
      background-color: transparent;
      border-color: $border-color;

      &:hover:not(:disabled) {
        color: $text-main;
        border-color: $primary;
      }
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .filters-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
    flex-wrap: wrap;
    gap: $spacing-md;
    h1 {
      font-size: $font-size-xl;
      font-weight: 700;
      color: $text-main;
    }
    .controls-filters {
      display: flex;
      gap: $spacing-md;
      flex-wrap: wrap;

      .sort-control-filter,
      .genre-control-filter {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        padding: $spacing-sm $spacing-md;
        background-color: $card-bg;
        border: 1px solid $border-color;
        border-radius: $border-radius;
        box-shadow: $box-shadow;

        label {
          font-size: $font-size-sm;
          font-weight: 600;
          color: $text-muted;
          white-space: nowrap;
        }

        @media (max-width: $screen-sm) {
          .search-form {
            align-items: stretch;

            .search-button,
            .clear-search-button {
              padding-inline: $spacing-sm;
            }
          }
        }

        select {
          min-width: 12rem;
          padding: $spacing-sm 2rem $spacing-sm $spacing-md;
          border: 1px solid $border-color;
          border-radius: calc($border-radius - 0.125rem);
          font-family: inherit;
          font-size: $font-size-sm;
          background-color: $bg-color;
          color: $text-main;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

          &:hover {
            border-color: $primary;
          }

          &:focus-visible {
            border-color: $primary;
            outline: 3px solid var(--color-focus);
            outline-offset: 2px;
          }
        }
      }

      @media (max-width: $screen-sm) {
        align-items: stretch;
        width: 100%;
        min-width: 0;

        .sort-control-filter,
        .genre-control-filter {
          justify-content: space-between;
          width: 100%;
          min-width: 0;

          select {
            min-width: 0;
            flex: 1;
          }
        }
      }
    }
  }

  .genre-error {
    margin: -$spacing-md 0 $spacing-lg;
    color: $danger;
    font-size: $font-size-sm;
  }

}
</style>
