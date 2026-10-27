<template>
  <article class="game-review">
    <header class="review-header">
      <div class="reviewer-info">
        <strong>{{ review.username }}</strong>
        <div
          class="review-rating"
          role="img"
          :aria-label="`Rated ${review.rating} out of ${MAX_GAME_RATING}`"
        >
          <RatingStars :rating="review.rating" />
        </div>
      </div>
    </header>
    <p class="review-text">{{ review.text }}</p>
  </article>
</template>

<script setup lang="ts">
import type { GameReview } from "~/types/game";
import RatingStars from "~/components/game/RatingStars.vue";
import { MAX_GAME_RATING } from "~/utils/rating";

defineProps<{
  review: GameReview;
}>();
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.game-review {
  background-color: $bg-color;
  padding: $spacing-md;
  border-radius: $border-radius;
  border: 1px solid $border-color;
  margin-bottom: $spacing-md;

  .review-header {
    margin-bottom: $spacing-sm;

    .reviewer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      strong {
        color: $text-main;
      }
    }
  }

  .review-rating {
    font-size: $font-size-sm;
  }

  .review-text {
    color: $text-muted;
    font-size: $font-size-sm;
  }
}
</style>
