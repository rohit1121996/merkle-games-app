import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "~/src/types/game";
import { makeGame } from "../fixtures/game";
import { useGames } from "~/src/composables/useGames";

describe("useGames", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("$fetch", fetchMock);
  });

  it("requests games with the selected genre and trimmed search", async () => {
    const response = { games: [] };
    fetchMock.mockResolvedValue(response);
    const { fetchGames } = useGames();

    await expect(fetchGames(7, "  Zelda  ")).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      params: { genre: 7, search: "Zelda" },
    });
  });

  it("omits blank search and zero genre values", async () => {
    fetchMock.mockResolvedValue({});
    const { fetchGames } = useGames();

    await fetchGames(0, " ");

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {});
  });

  it("passes Nuxt's abort signal as a fetch option", async () => {
    fetchMock.mockResolvedValue({});
    const { fetchGames } = useGames();
    const signal = new AbortController().signal;

    await fetchGames(undefined, undefined, signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      signal,
    });
  });

  it("loads genre options", async () => {
    const genres = [{ id: 7, name: "Adventure" }];
    fetchMock.mockResolvedValue(genres);
    const { fetchGenres } = useGames();

    await expect(fetchGenres()).resolves.toBe(genres);
    expect(fetchMock).toHaveBeenCalledWith("/api/genres");
  });

  it("passes an abort signal when loading genre options", async () => {
    fetchMock.mockResolvedValue([]);
    const { fetchGenres } = useGames();
    const signal = new AbortController().signal;

    await fetchGenres(signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/genres", { signal });
  });

  it("loads game details using an encoded ID", async () => {
    const game: Game = makeGame();
    fetchMock.mockResolvedValue(game);
    const { fetchGameDetails } = useGames();

    await expect(fetchGameDetails("game/42")).resolves.toBe(game);
    expect(fetchMock).toHaveBeenCalledWith("/api/games/game%2F42");
  });

  it("passes an abort signal when loading game details", async () => {
    fetchMock.mockResolvedValue(makeGame());
    const { fetchGameDetails } = useGames();
    const signal = new AbortController().signal;

    await fetchGameDetails("42", signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/games/42", { signal });
  });
});
