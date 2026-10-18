import { toValue, type MaybeRefOrGetter } from "vue";
import {
  readTimedCache,
  writeTimedCache,
  type TimedCache,
} from "~/src/utils/timedCache";

export const useTimedAsyncData = <T>(
  cacheName: string,
  key: MaybeRefOrGetter<string>,
  handler: (signal: AbortSignal) => Promise<T>,
) => {
  const cache = useState<TimedCache<T>>(
    `timed-data-cache:${cacheName}`,
    () => ({}),
  );

  return useAsyncData<T>(
    key,
    async (_nuxtApp, { signal }) => {
      const requestKey = toValue(key);
      const data = await handler(signal);
      writeTimedCache(cache.value, requestKey, data);
      return data;
    },
    {
      getCachedData: (asyncDataKey) =>
        readTimedCache(cache.value, asyncDataKey),
      dedupe: "defer",
    },
  );
};
