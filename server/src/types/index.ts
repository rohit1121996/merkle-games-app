export interface GameAttributes {
  id?: number;
  title: string;
  description?: string;
  genre_id: number;
  platform: string;
  release_date: Date;
  developer_id: number;
  publisher_id: number;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  genre?: GenreAttributes;
  developer?: CompanyAttributes;
  publisher?: CompanyAttributes;
  reviews?: UserReviewAttributes[];
  images?: ImageAttributes[];
}

export interface CompanyAttributes {
  id?: number;
  name: string;
  country?: string;
  founded_year?: number;
  logo?: string;
  company_type: 'Developer' | 'Publisher';
  created_at?: Date;
  updated_at?: Date;
  // Relations
  developedGames?: GameAttributes[];
  publishedGames?: GameAttributes[];
}

export interface GenreAttributes {
  id?: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  games?: GameAttributes[];
}

export interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  registration_date: Date;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  reviews?: UserReviewAttributes[];
}

export interface UserReviewAttributes {
  id?: number;
  game_id: number;
  user_id: number;
  rating: number;
  review_text?: string;
  review_date: Date;
  created_at?: Date;
  updated_at?: Date;
  // Relations
  game?: GameAttributes;
  user?: UserAttributes;
}

export interface ImageAttributes {
  id?: number;
  image_url: string;
  image_type: 'Screenshot' | 'Cover' | 'Artwork';
  created_at?: Date;
  updated_at?: Date;
}

export interface ImageRelationAttributes {
  id?: number;
  image_id: number;
  related_type: 'Game' | 'Company' | 'Genre' | 'Rating' | 'User';
  related_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaginationOptions {
  limit?: number;
  page?: number;
  offset?: number;
}

export interface SearchOptions extends PaginationOptions {
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
}

// GraphQL Context Type
export interface GraphQLContext {
  db: any; // Database models
  user?: AuthenticatedUser;
}

// GraphQL Arguments Types
export interface GameQueryArgs {
  page?: number;
  limit?: number;
  genreId?: string;
  platform?: string;
  search?: string;
}

export interface CompanyQueryArgs {
  type?: 'Developer' | 'Publisher';
  country?: string;
  search?: string;
}

export interface ReviewQueryArgs {
  gameId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  limit?: number;
}

export interface ImageQueryArgs {
  relatedType?: 'Game' | 'Company' | 'Genre' | 'Rating' | 'User';
  relatedId?: number;
}

// GraphQL Response Types
export interface PaginatedGamesResult {
  games: any[];
  total: number;
  page: number;
  totalPages: number;
}

// Extend Express Request to include authenticated user and pagination
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}