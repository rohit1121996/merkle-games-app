import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import type { MaybeRefOrGetter } from "vue";
import type { TimedCache } from "~/utils/timedCache";
import { CLIENT_DATA_CACHE_TTL_MS } from "~/utils/timedCache";

type AsyncDataHandler<T> = (
  nuxtApp: unknown,
  context: { signal: AbortSignal },
) => Promise<T>;

interface AsyncDataOptions<T> {
  getCachedData: (key: string) => T | undefined;
  dedupe: string;
}

describe("useTimedAsyncData", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("runs the handler with the active key and caches successful data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const cache: TimedCache<number> = {};
    let stateKey = "";
    let handler: AsyncDataHandler<number> | undefined;
    let options: AsyncDataOptions<number> | undefined;
    const result = { data: ref<number | undefined>() };

    vi.stubGlobal("useState", <T>(key: string, initialize: () => T) => {
      stateKey = key;
      initialize();
      return { value: cache } as { value: T };
    });
    vi.stubGlobal(
      "useAsyncData",
      <T>(
        _key: MaybeRefOrGetter<string>,
        load: AsyncDataHandler<T>,
        config: AsyncDataOptions<T>,
      ) => {
        handler = load as AsyncDataHandler<number>;
        options = config as AsyncDataOptions<number>;
        return result;
      },
    );

    const { useTimedAsyncData } =
      await import("~/composables/useTimedAsyncData");
    const activeKey = ref("games:page-1");
    const request = useTimedAsyncData("games", computed(() => activeKey.value), async (signal) => {
      expect(signal).toBe(abortController.signal);
      return 42;
    });
    const abortController = new AbortController();

    expect(request).toBe(result);
    expect(stateKey).toBe("timed-data-cache:games");
    expect(handler).toBeDefined();
    expect(options?.dedupe).toBe("defer");
    await expect(handler?.({}, { signal: abortController.signal })).resolves.toBe(
      42,
    );
    expect(options?.getCachedData("games:page-1")).toBe(42);

    activeKey.value = "games:page-2";
    await handler?.({}, { signal: abortController.signal });
    expect(options?.getCachedData("games:page-2")).toBe(42);

    vi.setSystemTime(1_000 + CLIENT_DATA_CACHE_TTL_MS);
    expect(options?.getCachedData("games:page-1")).toBeUndefined();
    expect(cache["games:page-1"]).toBeUndefined();
  });
});
