<template>
  <ul class="game-genres-container" aria-label="Genres">
    <li v-for="genre in genres" :key="genre" class="tag-genres">
      {{ genre }}
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  genres: string[];
}>();
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.game-genres-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  list-style: none;

  .tag-genres {
    background-color: $primary;
    color: var(--color-on-primary);
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
}
</style>
