import { describe, expect, it } from "vitest";
import {
  CLIENT_DATA_CACHE_TTL_MS,
  readTimedCache,
  writeTimedCache,
  type TimedCache,
} from "~/utils/timedCache";

describe("timed cache", () => {
  it("returns undefined when the requested key is not cached", () => {
    expect(readTimedCache({}, "missing", 1_000)).toBeUndefined();
  });

  it("returns cached data until its ten-minute expiry", () => {
    const cache: TimedCache<string> = {};
    const createdAt = 1_000;

    writeTimedCache(cache, "games:page-1", "first page", createdAt);

    expect(
      readTimedCache(
        cache,
        "games:page-1",
        createdAt + CLIENT_DATA_CACHE_TTL_MS - 1,
      ),
    ).toBe("first page");
    expect(
      readTimedCache(
        cache,
        "games:page-1",
        createdAt + CLIENT_DATA_CACHE_TTL_MS,
      ),
    ).toBeUndefined();
    expect(cache["games:page-1"]).toBeUndefined();
  });

  it("stores separate responses for separate query keys", () => {
    const cache: TimedCache<string> = {};

    writeTimedCache(cache, "games:page-1", "first page", 1_000);
    writeTimedCache(cache, "games:page-2", "second page", 1_000);

    expect(readTimedCache(cache, "games:page-1", 1_001)).toBe("first page");
    expect(readTimedCache(cache, "games:page-2", 1_001)).toBe("second page");
  });

  it("prunes expired entries when writing a new response", () => {
    const cache: TimedCache<string> = {
      expired: { data: "old", expiresAt: 1_000 },
    };

    writeTimedCache(cache, "fresh", "new", 1_000);

    expect(cache.expired).toBeUndefined();
    expect(cache.fresh.data).toBe("new");
  });
});
