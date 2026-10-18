import type { Game } from "~/src/types/game";

export interface ApiResponse<T> {
  data: T;
  _metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface GameApiImage {
  image_type?: "Screenshot" | "Cover" | "Artwork";
  image_url?: string | null;
}

interface GameApiReview {
  id: number | string;
  rating: number;
  review_text?: string | null;
  user?: {
    username?: string | null;
  } | null;
}

export interface GameApiItem {
  id: number | string;
  title: string;
  description?: string | null;
  release_date: string;
  developer?: {
    name?: string | null;
  } | null;
  genre?: {
    name?: string | null;
  } | null;
  images?: GameApiImage[];
  reviews?: GameApiReview[];
  average_rating?: number | null;
  total_reviews?: number | null;
}

export interface GameStats {
  average_rating?: number | null;
  total_reviews?: number | null;
}

export const formatGameItem = (item: GameApiItem, origin: string): Game => {
  const cover =
    item.images?.find((img) => img.image_type === "Cover") ||
    item.images?.[0];
  const image = cover?.image_url
    ? cover.image_url.startsWith("http")
      ? cover.image_url
      : origin + cover.image_url
    : "";
  const reviews = item.reviews || [];
  const count = item.total_reviews ?? reviews.length;
  let average = item.average_rating ?? 0;

  if (!average && reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    average = sum / reviews.length;
  }

  return {
    id: String(item.id),
    title: item.title,
    description: item.description || "",
    releaseDate: item.release_date,
    developer: item.developer?.name || "Unknown",
    genres: item.genre?.name ? [item.genre.name] : [],
    image,
    rating: {
      count,
      average: Math.round(average * 10) / 10,
    },
    reviews: reviews.map((review) => ({
      id: String(review.id),
      username: review.user?.username || "Anonymous",
      rating: review.rating,
      text: review.review_text || "",
    })),
  };
};
