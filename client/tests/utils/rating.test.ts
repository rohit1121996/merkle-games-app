import { describe, expect, it } from "vitest";
import { getRatingStarFill, MAX_GAME_RATING } from "~/utils/rating";

describe("getRatingStarFill", () => {
  it("uses one star for each point on the ten-point scale", () => {
    expect(MAX_GAME_RATING).toBe(10);
    expect(
      Array.from({ length: MAX_GAME_RATING }, (_, index) =>
        getRatingStarFill(8, index),
      ),
    ).toEqual([100, 100, 100, 100, 100, 100, 100, 100, 0, 0]);
  });

  it("fills fractional ratings proportionally", () => {
    expect(getRatingStarFill(8.25, 7)).toBe(100);
    expect(getRatingStarFill(8.25, 8)).toBe(25);
    expect(getRatingStarFill(8.25, 9)).toBe(0);
  });

  it("bounds ratings to the supported scale", () => {
    expect(getRatingStarFill(-2, 0)).toBe(0);
    expect(getRatingStarFill(12, 9)).toBe(100);
    expect(getRatingStarFill(Number.NaN, 0)).toBe(0);
    expect(getRatingStarFill(8, 0.5)).toBe(0);
    expect(getRatingStarFill(8, -1)).toBe(0);
    expect(getRatingStarFill(8, 10)).toBe(0);
  });
});
