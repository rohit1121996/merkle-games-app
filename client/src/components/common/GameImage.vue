<template>
  <div
    class="game-image-wrapper"
    :class="{ 'is-loading': loading, 'has-error': error }"
  >
    <img
      ref="imageElement"
      v-show="!error"
      :src="props.src"
      :alt="props.alt"
      :loading="imageLoading"
      :fetchpriority="fetchPriority"
      @load="onLoad"
      @error="onError"
      class="game-image"
    />
    <div
      v-if="error"
      class="fallback-image"
    >
      <span class="fallback-message">
        {{
          props.alt ? `Image unavailable: ${props.alt}` : "Image unavailable"
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    src: string;
    alt: string;
    priority?: boolean;
  }>(),
  {
    priority: false,
  },
);

const imageLoading = computed(() => (props.priority ? "eager" : "lazy"));
const fetchPriority = computed(() => (props.priority ? "high" : "auto"));
const imageElement = ref<HTMLImageElement | null>(null);
const loading = ref(true);
const error = ref(false);

const onLoad = () => {
  loading.value = false;
};

const onError = () => {
  loading.value = false;
  error.value = true;
};

onMounted(() => {
  if (imageElement.value?.complete && imageElement.value.naturalWidth === 0) {
    onError();
  }
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: $border-color;
  overflow: hidden;

  &.is-loading {
    animation: pulse 1.5s infinite;
  }
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fallback-image {
  @include flex-center;
  width: 100%;
  height: 100%;
  padding: $spacing-sm;
  color: $text-main;
  background-color: $card-bg;

  .fallback-message {
    font-size: $font-size-base;
    text-align: center;
  }
}

@keyframes pulse {
  0% {
    background-color: $border-color;
  }
  50% {
    background-color: color-mix(in srgb, $border-color 90%, black);
  }
  100% {
    background-color: $border-color;
  }
}
</style>
