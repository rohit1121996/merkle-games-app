import type { Game } from "~/src/types/game";
import { getErrorStatusCode } from "~/src/utils/error";
import {
  formatGameItem,
  type ApiResponse,
  type GameApiItem,
} from "../../utils/game";

export default defineCachedEventHandler(async (event): Promise<Game> => {
  const config = useRuntimeConfig(event);
  const apiBase = config.gameApiUrl;
  const origin = apiBase.replace("/api/v1", "");

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Game ID is required",
    });
  }

  try {
    const res = await $fetch<ApiResponse<GameApiItem>>(
      `${apiBase}/games/${encodeURIComponent(id)}`,
    );
    return formatGameItem(res.data, origin);
  } catch (error) {
    const upstreamStatus = getErrorStatusCode(error);
    throw createError({
      statusCode: upstreamStatus === 404 ? 404 : 502,
      statusMessage:
        upstreamStatus === 404
          ? `Game #${id} not found`
          : "Could not load game details",
    });
  }
}, {
  maxAge: 10 * 60,
  staleMaxAge: 0,
  swr: false,
  getKey: (event) => event.path,
});
