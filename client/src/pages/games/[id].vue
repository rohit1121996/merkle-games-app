<template>
  <div class="detail-page">
    <div class="back-navigation">
      <NuxtLink
        to="/"
        class="back-button"
        aria-label="Back to games"
      >
        &larr; Back to Games
      </NuxtLink>
    </div>

    <LoadingState v-if="pending" message="Loading game details..." />
    <ErrorState
      v-else-if="error"
      title="Unable to load game details"
      message="We couldn't load this game's details right now. Please try again."
      :retry="refresh"
    />
    <EmptyState v-else-if="!game" message="Game not found." />

    <div v-else class="game-details">
      <div class="hero-image">
        <GameImage
          :src="game.image"
          :alt="`${game.title} cover art`"
          priority
        />
      </div>

      <div class="content-wrapper">
        <header class="header-info">
          <h1>{{ game.title }}</h1>
          <div class="meta-row">
            <GameRating :rating="game.rating" />
            <span class="release-date">{{ formatDate(game.releaseDate) }}</span>
            <span class="developer">{{ game.developer }}</span>
          </div>
          <GameGenres :genres="game.genres" class="genres" />
        </header>

        <section class="description-section">
          <h2>About this game</h2>
          <p class="description">{{ game.description }}</p>
        </section>

        <section class="reviews-section">
          <h2>Player Reviews ({{ game.reviews.length }})</h2>
          <div class="reviews-list">
            <GameReview
              v-for="review in game.reviews"
              :key="review.id"
              :review="review"
            />
            <p v-if="game.reviews.length === 0" class="empty-reviews">
              No reviews yet.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGames } from "~/src/composables/useGames";
import { useTimedAsyncData } from "~/src/composables/useTimedAsyncData";
import { formatDate } from "~/src/utils/date";
import LoadingState from "~/src/components/common/LoadingState.vue";
import ErrorState from "~/src/components/common/ErrorState.vue";
import EmptyState from "~/src/components/common/EmptyState.vue";
import GameImage from "~/src/components/common/GameImage.vue";
import GameRating from "~/src/components/game/GameRating.vue";
import GameGenres from "~/src/components/game/GameGenres.vue";
import GameReview from "~/src/components/game/GameReview.vue";

const route = useRoute();
const { fetchGameDetails } = useGames();
const gameId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? (id[0] ?? "") : (id ?? "");
});
const gameKey = computed(() => `game:${gameId.value}`);
const {
  data: game,
  pending,
  error,
  refresh,
} = await useTimedAsyncData("game-details", gameKey, (signal) =>
  fetchGameDetails(gameId.value, signal),
);

const pageTitle = computed(() =>
  game.value
    ? `${game.value.title} | Markle Games`
    : "Game Details | Markle Games",
);
const pageDescription = computed(() => {
  const description = game.value?.description.trim();
  if (!description) {
    return "View game details, ratings, developers, and player reviews on Markle Games.";
  }
  return description.length > 160
    ? `${description.slice(0, 157).trimEnd()}...`
    : description;
});

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: "article",
  twitterCard: "summary",
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.detail-page {
  .back-navigation {
    margin-bottom: $spacing-lg;

    .back-button {
      display: inline-block;
      background: none;
      border: none;
      color: $primary;
      font-size: $font-size-base;
      font-weight: 500;
      padding: $spacing-xs 0;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .game-details {
    background-color: $card-bg;
    border-radius: $border-radius-lg;
    overflow: hidden;
    box-shadow: $box-shadow;

    .hero-image {
      width: 100%;
      height: 400px;

      @media (max-width: $screen-md) {
        height: 250px;
      }
    }

    .content-wrapper {
      padding: $spacing-xl;

      @media (max-width: $screen-md) {
        padding: $spacing-md;
      }
    }

    .header-info {
      margin-bottom: $spacing-xl;

      h1 {
        font-size: $font-size-xxl;
        margin-bottom: $spacing-sm;
        color: $text-main;
      }

      .meta-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: $spacing-sm;
        margin-bottom: $spacing-md;
        color: $text-muted;

        .dot-separator {
          color: $border-color;
        }
      }
    }

    .description-section {
      margin-bottom: $spacing-xl;

      h2 {
        font-size: $font-size-xl;
        margin-bottom: $spacing-md;
      }

      .description {
        white-space: pre-line;
        color: $text-main;
      }
    }

    .reviews-section {
      h2 {
        font-size: $font-size-xl;
        margin-bottom: $spacing-md;
      }
    }
  }
}
</style>
