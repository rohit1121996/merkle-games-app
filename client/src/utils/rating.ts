export const MAX_GAME_RATING = 10;

export const getRatingStarFill = (
  rating: number,
  starIndex: number,
): number => {
  if (
    !Number.isFinite(rating) ||
    !Number.isInteger(starIndex) ||
    starIndex < 0 ||
    starIndex >= MAX_GAME_RATING
  ) {
    return 0;
  }

  const boundedRating = Math.min(MAX_GAME_RATING, Math.max(0, rating));
  return Math.min(100, Math.max(0, (boundedRating - starIndex) * 100));
};
