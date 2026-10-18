// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  srcDir: "./src",
  serverDir: "./src/server",
  dir: {
    pages: "pages",
  },
  app: {
    baseURL: "/",
    head: {
      title: "Markle Games",
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        {
          name: "description",
          content: "Browse and explore video games from the Markle Games API.",
        },
        { property: "og:site_name", content: "Markle Games" },
        { property: "og:title", content: "Markle Games" },
        {
          property: "og:description",
          content: "Browse and explore video games from the Markle Games API.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    },
  },
  devtools: { enabled: process.env.NUXT_DEVTOOLS === "true" },
  alias: {
    "~": fileURLToPath(new URL("./", import.meta.url)),
    "@": fileURLToPath(new URL("./", import.meta.url)),
    "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
    "@scss": fileURLToPath(new URL("./assets/scss", import.meta.url)),
  },
  css: ["~/assets/scss/main.scss"],
  runtimeConfig: {
    gameApiUrl: process.env.NUXT_GAME_API_URL || "http://localhost:8000/api/v1",
  },
});
