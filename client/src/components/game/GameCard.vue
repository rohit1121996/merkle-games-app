<template>
  <article class="game-card">
    <div class="image-container">
      <GameImage
        :src="game.image"
        :alt="`${game.title} image`"
        :priority="priority"
      />
    </div>
    <div class="content">
      <h3 class="title">
        <NuxtLink :to="`/games/${game.id}`" class="title-link">
          {{ game.title }}
        </NuxtLink>
      </h3>
      <p class="release-date">{{ formatDate(game.releaseDate) }}</p>
      <div class="meta-data">
        <GameRating :rating="game.rating" />
      </div>
      <GameGenres :genres="game.genres" class="genres" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Game } from "~/types/game";
import { formatDate } from "~/utils/date";
import GameImage from "~/components/common/GameImage.vue";
import GameRating from "~/components/game/GameRating.vue";
import GameGenres from "~/components/game/GameGenres.vue";

withDefaults(
  defineProps<{
    game: Game;
    priority?: boolean;
  }>(),
  {
    priority: false,
  },
);
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-card {
  position: relative;
  display: block;
  background-color: $card-bg;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $box-shadow;
  text-decoration: none;
  color: inherit;
  @include transition(transform, box-shadow);

  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-hover;
    text-decoration: none;
  }

  .image-container {
    height: 200px;
    width: 100%;
  }

  .content {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .title {
      font-size: $font-size-lg;
      color: $text-main;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .title-link {
        color: inherit;
        text-decoration: none;

        &::after {
          position: absolute;
          inset: 0;
          content: "";
        }

        &:focus-visible {
          outline: none;

          &::after {
            border-radius: $border-radius-lg;
            outline: 3px solid var(--color-focus);
            outline-offset: 3px;
          }
        }
      }
    }

    .release-date {
      font-size: $font-size-sm;
      color: $text-muted;
      margin: 0;
    }

    .meta-data {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .genres {
      margin-top: auto;
    }
  }
}
</style>
