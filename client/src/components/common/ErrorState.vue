<template>
  <section class="error-state-container" role="alert" aria-atomic="true">
    <component :is="headingLevel">{{ title }}</component>
    <p>{{ message }}</p>
    <button v-if="retry" type="button" @click="retry" class="retry-btn">
      Try again
    </button>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string;
    title?: string;
    headingLevel?: "h1" | "h2" | "h3";
    retry?: () => void | Promise<void>;
  }>(),
  {
    title: "Unable to load games",
    headingLevel: "h2",
  },
);
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.error-state-container {
  padding: $spacing-xl;
  background-color: var(--color-danger-surface);
  border: 1px solid $danger;
  border-radius: $border-radius;
  color: var(--color-danger-text);
  text-align: center;
  margin: $spacing-xl 0;

  h2 {
    margin-bottom: $spacing-sm;
  }

  .retry-btn {
    margin-top: $spacing-md;
    background-color: $danger;
    color: var(--color-on-primary);
    border: none;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius;

    &:hover {
      background-color: color-mix(in srgb, $danger 85%, black);
    }
  }
}
</style>
