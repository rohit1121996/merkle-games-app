import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type EventHandler = (event: Record<string, unknown>) => Promise<unknown>;

interface CachedEventHandlerOptions {
  getKey: (event: { path: string }) => string;
}

let getGenres: EventHandler;
let cachedOptions: CachedEventHandlerOptions | undefined;

beforeAll(async () => {
  vi.stubGlobal(
    "defineCachedEventHandler",
    (handler: EventHandler, options: CachedEventHandlerOptions) => {
      cachedOptions = options;
      return handler;
    },
  );
  getGenres = (await import("~/server/api/genres/index.get"))
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

describe("genres API handler", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("$fetch", fetchMock);
    vi.stubGlobal(
      "useRuntimeConfig",
      vi.fn(() => ({ gameApiUrl: "https://api.example/api/v1" })),
    );
    vi.stubGlobal("createError", vi.fn(makeHttpError));
  });

  it("returns genre IDs and names from the backend", async () => {
    fetchMock.mockResolvedValue({
      data: [
        { id: 7, name: "Adventure", created_at: "2024-01-01" },
        { id: 9, name: "Puzzle" },
      ],
    });

    await expect(getGenres({})).resolves.toEqual([
      { id: 7, name: "Adventure" },
      { id: 9, name: "Puzzle" },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example/api/v1/genres",
    );
  });

  it("surfaces backend failures as a genres API error", async () => {
    fetchMock.mockRejectedValue(new Error("Connection refused"));

    await expect(getGenres({})).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: "Could not load genres",
    });
  });
});
