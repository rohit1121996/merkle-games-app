import type { Game } from "~/src/types/game";

export type SortOption = "rating" | "releaseDate";

export const sortGames = (games: Game[], sortBy: SortOption): Game[] => {
  const gamesCopy = [...games];
  return gamesCopy.sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating.average - a.rating.average;
    } else if (sortBy === "releaseDate") {
      return (
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    }
    return 0;
  });
};
