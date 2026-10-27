<template>
  <span class="rating-stars" aria-hidden="true">
    <span v-for="(fill, index) in starFills" :key="index" class="star">
      ★
      <span class="star-fill" :style="{ width: `${fill}%` }">★</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getRatingStarFill, MAX_GAME_RATING } from "~/utils/rating";

const props = defineProps<{
  rating: number;
}>();

const starFills = computed(() =>
  Array.from({ length: MAX_GAME_RATING }, (_, index) =>
    getRatingStarFill(props.rating, index),
  ),
);
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.rating-stars {
  display: inline-flex;
  gap: 0.05em;
  white-space: nowrap;

  .star {
    position: relative;
    color: $border-color;
  }

  .star-fill {
    position: absolute;
    inset: 0 auto 0 0;
    overflow: hidden;
    color: $warning;
    white-space: nowrap;
  }
}
</style>
