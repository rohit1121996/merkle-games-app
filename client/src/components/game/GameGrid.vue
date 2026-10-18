<template>
  <ul class="game-grid-container" aria-label="Games">
    <slot></slot>
  </ul>
</template>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-grid-container {
  @include responsive-grid(280px, $spacing-xl);
  list-style: none;
  padding: 0;
}
</style>
