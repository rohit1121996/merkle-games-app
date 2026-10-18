export interface GameRating {
  count: number;
  average: number;
}

export interface GameReview {
  id: string;
  username: string;
  rating: number;
  text: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  releaseDate: string;
  developer: string;
  genres: string[];
  rating: GameRating;
  reviews: GameReview[];
}

export interface GenreOption {
  id: number;
  name: string;
}

export interface GamesResponse {
  games: Game[];
}
