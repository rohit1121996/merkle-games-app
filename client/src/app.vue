<template>
  <div class="app">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <AppHeader />
    <main id="main-content" class="main-content" tabindex="-1">
      <NuxtPage />
    </main>
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "~/src/components/common/AppHeader.vue";
</script>
