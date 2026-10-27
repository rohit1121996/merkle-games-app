import type { Game } from "~/types/game";

export const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: "game-1",
  title: "Sample Game",
  description: "A sample game",
  image: "/sample.jpg",
  releaseDate: "2024-01-15",
  developer: "Sample Studio",
  genres: ["Adventure"],
  rating: {
    count: 3,
    average: 4.5,
  },
  reviews: [],
  ...overrides,
});
