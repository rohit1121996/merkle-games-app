import type { GenreOption, GamesResponse, Game } from "~/types/game";

export const useGames = () => {
  const fetchGames = (
    genreId?: number,
    searchTerm?: string,
    signal?: AbortSignal,
  ): Promise<GamesResponse> => {
    const search = searchTerm?.trim();
    const params: Record<string, string | number> = {
      ...(genreId !== undefined && genreId !== 0 ? { genre: genreId } : {}),
      ...(search ? { search } : {}),
    };

    return $fetch<GamesResponse>("/api/games", {
      ...(Object.keys(params).length > 0 ? { params } : {}),
      ...(signal ? { signal } : {}),
    });
  };

  const fetchGenres = (signal?: AbortSignal): Promise<GenreOption[]> =>
    signal
      ? $fetch("/api/genres", { signal })
      : $fetch("/api/genres");

  const fetchGameDetails = (id: string, signal?: AbortSignal): Promise<Game> =>
    signal
      ? $fetch(`/api/games/${encodeURIComponent(id)}`, { signal })
      : $fetch(`/api/games/${encodeURIComponent(id)}`);

  return {
    fetchGames,
    fetchGenres,
    fetchGameDetails,
  };
};
