import type { GenreOption } from "~/src/types/game";
import { getErrorStatusCode } from "~/src/utils/error";
import type { ApiResponse } from "../../utils/game";

export default defineCachedEventHandler(async (event): Promise<GenreOption[]> => {
  const config = useRuntimeConfig(event);
  const apiBase = config.gameApiUrl;

  try {
    const response = await $fetch<ApiResponse<GenreOption[]>>(
      `${apiBase}/genres`,
    );
    return response.data.map(({ id, name }) => ({ id, name }));
  } catch (error) {
    throw createError({
      statusCode: getErrorStatusCode(error) ?? 502,
      statusMessage: "Could not load genres",
    });
  }
}, {
  maxAge: 10 * 60,
  staleMaxAge: 0,
  swr: false,
  getKey: (event) => event.path,
});
