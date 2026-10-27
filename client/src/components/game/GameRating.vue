<template>
  <div
    class="game-rating-container"
    role="img"
    :aria-label="`Average rating ${rating.average} out of ${MAX_GAME_RATING} from ${rating.count} reviews`"
  >
    <RatingStars :rating="rating.average" />
    <span class="rating-text">
      <strong>{{ rating.average }}</strong> ({{ rating.count }})
    </span>
  </div>
</template>

<script setup lang="ts">
import type { GameRating } from "~/types/game";
import RatingStars from "~/components/game/RatingStars.vue";
import { MAX_GAME_RATING } from "~/utils/rating";

defineProps<{
  rating: GameRating;
}>();
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-rating-container {
  @include flex-center;
  justify-content: flex-start;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-muted;

  strong {
    color: $text-main;
  }
}
</style>
