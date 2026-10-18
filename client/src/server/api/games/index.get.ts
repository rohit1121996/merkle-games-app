import type { Game, GamesResponse } from "~/src/types/game";
import { getErrorStatusCode } from "~/src/utils/error";
import {
  formatGameItem,
  type ApiResponse,
  type GameApiItem,
  type GameStats,
} from "../../utils/game";

export default defineEventHandler(async (event): Promise<GamesResponse> => {
  const config = useRuntimeConfig(event);
  const apiBase = config.gameApiUrl;
  const origin = apiBase.replace("/api/v1", "");
  const { genre, search } = getQuery(event);

  try {
    const params = {
      limit: 100,
      ...(genre ? { genre } : {}),
      ...(typeof search === "string" && search.trim()
        ? { search: search.trim() }
        : {}),
    };
    const firstPage = await $fetch<ApiResponse<GameApiItem[]>>(
      `${apiBase}/games`,
      { params },
    );
    const totalPages = Math.max(
      1,
      Number(firstPage._metadata?.totalPages ?? 1),
    );
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        $fetch<ApiResponse<GameApiItem[]>>(`${apiBase}/games`, {
          params: { ...params, page: index + 2 },
        }),
      ),
    );
    const sourceGames = [firstPage, ...remainingPages].flatMap((page) =>
      Array.isArray(page.data) ? page.data : [],
    );
    const eligibleGames = sourceGames.filter((item) => {
      const year = Number.parseInt(item.release_date?.slice(0, 4) || "", 10);
      return Number.isFinite(year) && year >= 2015 && year <= 2017;
    });

    const shuffledGames = [...eligibleGames];
    for (let index = shuffledGames.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledGames[index], shuffledGames[swapIndex]] = [
        shuffledGames[swapIndex],
        shuffledGames[index],
      ];
    }

    const selectedGames: Game[] = await Promise.all(
      shuffledGames.slice(0, 15).map(async (item) => {
        try {
          const stats = await $fetch<ApiResponse<GameStats>>(
            `${apiBase}/games/${item.id}/stats`,
          );
          return formatGameItem({ ...item, ...stats.data }, origin);
        } catch (error) {
          console.warn(`Could not load stats for game ${item.id}`, error);
          return formatGameItem(item, origin);
        }
      }),
    );
    selectedGames.sort((a, b) => b.rating.average - a.rating.average);

    return {
      games: selectedGames,
    };
  } catch (error) {
    throw createError({
      statusCode: getErrorStatusCode(error) ?? 502,
      statusMessage: "Could not load games",
    });
  }
});
