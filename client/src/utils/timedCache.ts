export const CLIENT_DATA_CACHE_TTL_MS = 10 * 60 * 1000;

export interface TimedCacheEntry<T> {
  data: T;
  expiresAt: number;
}

export type TimedCache<T> = Record<string, TimedCacheEntry<T>>;

export const readTimedCache = <T>(
  cache: TimedCache<T>,
  key: string,
  now = Date.now(),
): T | undefined => {
  const entry = cache[key];
  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= now) {
    delete cache[key];
    return undefined;
  }

  return entry.data;
};

export const writeTimedCache = <T>(
  cache: TimedCache<T>,
  key: string,
  data: T,
  now = Date.now(),
): void => {
  for (const [cachedKey, entry] of Object.entries(cache)) {
    if (entry.expiresAt <= now) {
      delete cache[cachedKey];
    }
  }

  cache[key] = {
    data,
    expiresAt: now + CLIENT_DATA_CACHE_TTL_MS,
  };
};
