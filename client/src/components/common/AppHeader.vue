<template>
  <header class="header-container">
    <div class="header-container-inner">
      <NuxtLink to="/" class="logo">
        <span>Markle Games</span>
      </NuxtLink>
      <button
        class="theme-toggle"
        type="button"
        :disabled="!themeReady"
        :aria-label="
          isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
        "
        :aria-pressed="isDarkMode"
        @click="toggleTheme"
      >
        <svg
          v-if="isDarkMode"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
          />
        </svg>
        <svg
          v-else
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isDarkMode = ref(false);
const themeReady = ref(false);

const applyTheme = (dark: boolean) => {
  isDarkMode.value = dark;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);
  themeReady.value = true;
});

const toggleTheme = () => {
  const dark = !isDarkMode.value;
  applyTheme(dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
};
</script>
<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.header-container {
  background-color: $card-bg;
  border-bottom: 1px solid $border-color;
  padding: $spacing-md 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-container-inner {
    max-width: $screen-xl;
    margin: 0 auto;
    padding: 0 $spacing-md;
    @include flex-center;
    justify-content: space-between;
  }

  .theme-toggle {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    padding: 0;
    color: $text-main;
    background: $card-bg;
    border: 1px solid $border-color;
    border-radius: 50%;

    &:hover {
      color: $primary;
      border-color: $primary;
    }

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  .logo {
    text-decoration: none;
    color: $primary;
    span {
      font-size: $font-size-xl;
      margin: 0;
    }
  }
}
</style>
