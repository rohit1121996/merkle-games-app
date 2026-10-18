import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type EventHandler = (event: Record<string, unknown>) => Promise<unknown>;

interface CachedEventHandlerOptions {
  getKey: (event: { path: string }) => string;
}

let getGames: EventHandler;
let getGame: EventHandler;
const cachedOptions: CachedEventHandlerOptions[] = [];

beforeAll(async () => {
  vi.stubGlobal("defineEventHandler", (handler: EventHandler) => handler);
  vi.stubGlobal(
    "defineCachedEventHandler",
    (handler: EventHandler, options: CachedEventHandlerOptions) => {
      cachedOptions.push(options);
      return handler;
    },
  );
  getGames = (await import("~/src/server/api/games/index.get"))
    .default as EventHandler;
  getGame = (await import("~/src/server/api/games/[id].get"))
    .default as EventHandler;
});

const makeHttpError = (options: {
  statusCode: number;
  statusMessage: string;
}) =>
  Object.assign(new Error(options.statusMessage), {
    statusCode: options.statusCode,
    statusMessage: options.statusMessage,
  });

describe("games API handlers", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let runtimeConfigMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    runtimeConfigMock = vi.fn(() => ({
      gameApiUrl: "https://api.example/api/v1",
    }));
    vi.stubGlobal("$fetch", fetchMock);
    vi.stubGlobal("useRuntimeConfig", runtimeConfigMock);
    vi.stubGlobal(
      "getQuery",
      vi.fn(() => ({ page: "2", limit: "5" })),
    );
    vi.stubGlobal(
      "getRouterParam",
      vi.fn((_event: unknown, name: string) =>
        name === "id" ? "42" : undefined,
      ),
    );
    vi.stubGlobal("createError", vi.fn(makeHttpError));
  });

  describe("GET /api/games", () => {
    it("does not share-cache the random featured games list", () => {
      expect(cachedOptions).toHaveLength(1);
      expect(cachedOptions[0]?.getKey({ path: "/api/games?page=2" })).toBe(
        "/api/games?page=2",
      );
    });

    it("filters to 2015-2017 titles and returns a short random shortlist", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.2);
      fetchMock
        .mockResolvedValueOnce({
          data: [
            {
              id: 1,
              title: "Old",
              release_date: "2014-04-01",
              images: [{ image_type: "Cover", image_url: "/old.jpg" }],
            },
            {
              id: 2,
              title: "Best",
              release_date: "2016-04-01",
              images: [{ image_type: "Cover", image_url: "/best.jpg" }],
            },
            {
              id: 3,
              title: "Runner Up",
              release_date: "2017-09-15",
              images: [{ image_type: "Cover", image_url: "/runner.jpg" }],
            },
            {
              id: 4,
              title: "Newer",
              release_date: "2018-01-01",
              images: [{ image_type: "Cover", image_url: "/newer.jpg" }],
            },
          ],
          _metadata: { totalPages: 2 },
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 5,
              title: "From Another Page",
              release_date: "2015-02-10",
              images: [{ image_type: "Cover", image_url: "/page-two.jpg" }],
            },
          ],
          _metadata: { totalPages: 2 },
        })
        .mockResolvedValueOnce({ data: { average_rating: 9.2, total_reviews: 5 } })
        .mockResolvedValueOnce({ data: { average_rating: 8.7, total_reviews: 3 } })
        .mockResolvedValueOnce({ data: { average_rating: 8.1, total_reviews: 2 } });

      const response = await getGames({});

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "https://api.example/api/v1/games",
        { params: { limit: 100 } },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "https://api.example/api/v1/games",
        { params: { limit: 100, page: 2 } },
      );
      expect(fetchMock).toHaveBeenCalledTimes(5);
      expect(response.games).toHaveLength(3);
      expect(response.games.map((game) => game.title).sort()).toEqual([
        "Best",
        "From Another Page",
        "Runner Up",
      ]);
      expect(response.games.map((game) => game.rating.average)).toEqual(
        [...response.games.map((game) => game.rating.average)].sort(
          (a, b) => b - a,
        ),
      );
    });

    it("returns no more than 15 games when many eligible titles exist", async () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const eligibleGames = Array.from({ length: 18 }, (_, index) => ({
        id: index + 1,
        title: `Game ${index + 1}`,
        release_date: `${2015 + (index % 3)}-06-01`,
      }));
      fetchMock
        .mockResolvedValueOnce({
          data: eligibleGames,
          _metadata: { totalPages: 1 },
        })
        .mockResolvedValue({
          data: { average_rating: 5, total_reviews: 1 },
        });

      const response = await getGames({});

      expect(response.games).toHaveLength(15);
      expect(new Set(response.games.map((game) => game.id)).size).toBe(15);
      expect(fetchMock).toHaveBeenCalledTimes(16);
    });

    it("forwards the selected genre ID to the backend", async () => {
      vi.stubGlobal(
        "getQuery",
        vi.fn(() => ({ genre: "7" })),
      );
      fetchMock.mockResolvedValueOnce({ data: [] });

      await getGames({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games",
        { params: { limit: 100, genre: "7" } },
      );
    });

    it("forwards a trimmed search term with the selected genre", async () => {
      vi.stubGlobal(
        "getQuery",
        vi.fn(() => ({
          genre: "7",
          search: "  Zelda  ",
        })),
      );
      fetchMock.mockResolvedValueOnce({ data: [] });

      await getGames({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games",
        {
          params: { limit: 100, genre: "7", search: "Zelda" },
        },
      );
    });

    it("omits empty genres and malformed or whitespace search terms", async () => {
      vi.stubGlobal(
        "getQuery",
        vi.fn(() => ({ genre: "", search: ["Zelda"] })),
      );
      fetchMock.mockResolvedValueOnce({ data: [] });

      await getGames({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games",
        { params: { limit: 100 } },
      );

      vi.stubGlobal(
        "getQuery",
        vi.fn(() => ({ search: "   " })),
      );
      fetchMock.mockResolvedValueOnce({ data: [] });

      await getGames({});

      expect(fetchMock).toHaveBeenLastCalledWith(
        "https://api.example/api/v1/games",
        { params: { limit: 100 } },
      );
    });

    it("uses game review data when an individual stats request fails", async () => {
      fetchMock
        .mockResolvedValueOnce({
          data: [
            {
              id: 8,
              title: "Reviewed",
              release_date: "2017-03-12",
              reviews: [
                { id: 1, rating: 4 },
                { id: 2, rating: 5 },
              ],
            },
          ],
        })
        .mockRejectedValueOnce(new Error("Stats unavailable"));

      const response = await getGames({});

      expect(response).toEqual(
        expect.objectContaining({
          games: [
            expect.objectContaining({
              id: "8",
              rating: { count: 2, average: 4.5 },
            }),
          ],
        }),
      );
    });

    it("returns an empty list when the backend has no eligible games", async () => {
      fetchMock.mockResolvedValueOnce({ data: [] });

      const response = await getGames({});

      expect(response).toEqual({
        games: [],
      });
    });

    it("treats a missing backend game list as an empty list", async () => {
      fetchMock.mockResolvedValueOnce({ data: null });

      await expect(getGames({})).resolves.toEqual({
        games: [],
      });
    });

    it("converts a backend failure into a gateway API error", async () => {
      fetchMock.mockRejectedValue(new Error("Connection refused"));

      await expect(getGames({})).rejects.toMatchObject({
        statusCode: 502,
        statusMessage: "Could not load games",
      });
    });
  });

  describe("GET /api/games/:id", () => {
    it("uses the request path as its cache key", () => {
      expect(cachedOptions[0]?.getKey({ path: "/api/games/42" })).toBe(
        "/api/games/42",
      );
    });

    it("maps and returns one game", async () => {
      fetchMock.mockResolvedValueOnce({
        data: {
          id: 42,
          title: "Example",
          release_date: "2024-04-01",
        },
      });

      const response = await getGame({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games/42",
      );
      expect(response).toEqual(
        expect.objectContaining({
          id: "42",
          title: "Example",
          rating: { count: 0, average: 0 },
        }),
      );
    });

    it("rejects a request without a game ID", async () => {
      vi.stubGlobal(
        "getRouterParam",
        vi.fn(() => undefined),
      );

      await expect(getGame({})).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Game ID is required",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("preserves the upstream status code for a failed game request", async () => {
      fetchMock.mockRejectedValue(
        Object.assign(new Error("Not found"), { statusCode: 404 }),
      );

      await expect(getGame({})).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Game #42 not found",
      });
    });

    it("maps non-404 upstream failures to a gateway error", async () => {
      fetchMock.mockRejectedValue(
        Object.assign(new Error("Unavailable"), { statusCode: 503 }),
      );

      await expect(getGame({})).rejects.toMatchObject({
        statusCode: 502,
        statusMessage: "Could not load game details",
      });
    });
  });
});
