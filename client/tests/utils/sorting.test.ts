import { describe, expect, it } from "vitest";
import { sortGames } from "~/utils/sorting";
import { makeGame } from "../fixtures/game";

describe("sortGames", () => {
  it("sorts games by average rating from highest to lowest", () => {
    const games = [
      makeGame({ id: "low", rating: { count: 1, average: 2.1 } }),
      makeGame({ id: "high", rating: { count: 1, average: 4.9 } }),
      makeGame({ id: "middle", rating: { count: 1, average: 3.4 } }),
    ];

    expect(sortGames(games, "rating").map((game) => game.id)).toEqual([
      "high",
      "middle",
      "low",
    ]);
  });

  it("sorts games by release date from newest to oldest", () => {
    const games = [
      makeGame({ id: "old", releaseDate: "2020-01-01" }),
      makeGame({ id: "new", releaseDate: "2025-05-20" }),
      makeGame({ id: "middle", releaseDate: "2022-08-12" }),
    ];

    expect(sortGames(games, "releaseDate").map((game) => game.id)).toEqual([
      "new",
      "middle",
      "old",
    ]);
  });

  it("does not mutate the input array", () => {
    const games = [
      makeGame({ id: "low", rating: { count: 1, average: 1 } }),
      makeGame({ id: "high", rating: { count: 1, average: 5 } }),
    ];

    const result = sortGames(games, "rating");

    expect(result).not.toBe(games);
    expect(games.map((game) => game.id)).toEqual(["low", "high"]);
  });

  it("returns an empty array when given no games", () => {
    expect(sortGames([], "rating")).toEqual([]);
    expect(sortGames([], "releaseDate")).toEqual([]);
  });


});
