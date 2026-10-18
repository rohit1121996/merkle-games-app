import request from 'supertest';
import { Response } from 'supertest';
import { Server } from 'http';
import {
  GameAttributes,
  GenreAttributes,
  CompanyAttributes,
  UserReviewAttributes,
  UserAttributes
} from '@/types';

interface PaginatedGamesResponse {
  data: (GameAttributes & {
    id: number;
    genre: GenreAttributes;
    developer: CompanyAttributes;
    publisher: CompanyAttributes;
  })[];
  _metadata: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
  _links: any[];
}

interface GameWithRelationsResponse {
  data: GameAttributes & {
    id: number;
    genre: GenreAttributes;
    developer: CompanyAttributes;
    publisher: CompanyAttributes;
  };
  _links: any[];
  _embedded: any;
}

interface GenreWithGamesResponse {
  data: GenreAttributes & {
    id: number;
    games: GameAttributes[];
  };
  _links: any[];
  _embedded: any;
}

interface CompanyResponse {
  data: CompanyAttributes & {
    id: number;
  };
  _links?: any[];
}

interface ReviewWithRelationsResponse {
  data: UserReviewAttributes & {
    id: number;
    user: UserAttributes;
    game: GameAttributes;
  };
  _links?: any[];
}

interface HealthResponse {
  status: string;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
}

describe('REST API GET Endpoints', () => {
  let server: Server | undefined;
  const baseURL = `http://localhost:${process.env.PORT || 8000}`;

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Health Check', () => {
    test('GET /health should return status ok', async () => {
      const response: Response = await request(baseURL)
        .get('/health')
        .expect(200);

      const healthResponse: HealthResponse = response.body;
      expect(healthResponse).toHaveProperty('status', 'ok');
      expect(healthResponse).toHaveProperty('timestamp');
    });
  });

  describe('Games Endpoints', () => {
    test('GET /api/v1/games should return paginated games', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games')
        .expect(200);

      const gamesResponse: PaginatedGamesResponse = response.body;
      expect(gamesResponse).toHaveProperty('data');
      expect(gamesResponse).toHaveProperty('_metadata');
      expect(gamesResponse._metadata).toHaveProperty('total');
      expect(gamesResponse._metadata).toHaveProperty('page');
      expect(gamesResponse._metadata).toHaveProperty('totalPages');
      expect(Array.isArray(gamesResponse.data)).toBe(true);
      expect(gamesResponse._metadata.total).toBeGreaterThan(0);
    });

    test('GET /api/v1/games with pagination', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games?page=1&limit=5')
        .expect(200);

      const gamesResponse: PaginatedGamesResponse = response.body;
      expect(gamesResponse.data.length).toBeLessThanOrEqual(5);
      expect(gamesResponse._metadata.page).toBe(1);
    });

    test('GET /api/v1/games/:id should return specific game', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/1')
        .expect(200);

      const game: GameWithRelationsResponse = response.body;
      expect(game.data).toHaveProperty('id', 1);
      expect(game.data).toHaveProperty('title');
      expect(game.data).toHaveProperty('genre');
      expect(game.data).toHaveProperty('developer');
      expect(game.data).toHaveProperty('publisher');
    });

    test('GET /api/v1/games should include images in response', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games?limit=5')
        .expect(200);

      const gamesResponse: PaginatedGamesResponse = response.body;
      expect(gamesResponse.data.length).toBeGreaterThan(0);

      // Check that at least one game has images
      const gamesWithImages = gamesResponse.data.filter((game: any) => game.images && game.images.length > 0);
      expect(gamesWithImages.length).toBeGreaterThan(0);

      // Verify image structure
      const gameWithImages = gamesWithImages[0] as any;
      expect(Array.isArray(gameWithImages.images)).toBe(true);
      expect(gameWithImages.images[0]).toHaveProperty('id');
      expect(gameWithImages.images[0]).toHaveProperty('image_url');
      expect(gameWithImages.images[0]).toHaveProperty('image_type');
    });

    test('GET /api/v1/games/:id with invalid ID should return 404', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/999999')
        .expect(404);

      const errorResponse: ErrorResponse = response.body;
      expect(errorResponse).toHaveProperty('error');
    });

    test('GET /api/v1/games with search filter should return matching games', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games?search=Adventure&limit=5')
        .expect(200);

      const gamesResponse: PaginatedGamesResponse = response.body;
      expect(gamesResponse.data.length).toBeGreaterThan(0);
      expect(gamesResponse.data.length).toBeLessThanOrEqual(5);

      // All games should have 'Adventure' in the title (case-insensitive)
      gamesResponse.data.forEach(game => {
        expect(game.title.toLowerCase()).toContain('adventure');
      });
    });

    test('GET /api/v1/games with platform filter should return matching games', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games?platform=PC&limit=5')
        .expect(200);

      const gamesResponse: PaginatedGamesResponse = response.body;
      expect(gamesResponse.data.length).toBeGreaterThan(0);
      expect(gamesResponse.data.length).toBeLessThanOrEqual(5);

      // All games should have 'PC' in the platform (case-insensitive)
      gamesResponse.data.forEach(game => {
        expect(game.platform?.toLowerCase()).toContain('pc');
      });
    });

    test('GET /api/v1/games with combined search and platform filter', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games?search=Legend&platform=PC&limit=5')
        .expect(200);

      const gamesResponse: PaginatedGamesResponse = response.body;

      // Should return games matching both filters
      gamesResponse.data.forEach(game => {
        expect(game.title.toLowerCase()).toContain('legend');
        expect(game.platform?.toLowerCase()).toContain('pc');
      });
    });

    test('GET /api/v1/games/by-date-range should return game IDs within date range', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/by-date-range?from=2020-01-01&to=2023-12-31')
        .expect(200);

      const body: { ids: number[] } = response.body;
      expect(body).toHaveProperty('ids');
      expect(Array.isArray(body.ids)).toBe(true);
      expect(body.ids.length).toBeGreaterThan(0);

      // All IDs should be numbers
      body.ids.forEach(id => {
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(0);
      });
    });

    test('GET /api/v1/games/by-date-range without parameters should return 400', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/by-date-range')
        .expect(400);

      const errorResponse: ErrorResponse = response.body;
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('Both "from" and "to" date parameters are required');
    });

    test('GET /api/v1/games/by-date-range with invalid date format should return 400', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/by-date-range?from=2020/01/01&to=2023-12-31')
        .expect(400);

      const errorResponse: ErrorResponse = response.body;
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toContain('Invalid date format');
    });

    test('GET /api/v1/games/by-date-range should return IDs in ascending date order', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/by-date-range?from=2020-01-01&to=2020-12-31')
        .expect(200);

      const body: { ids: number[] } = response.body;
      expect(body.ids.length).toBeGreaterThan(0);

      // Verify games are ordered by date (oldest first) by fetching a couple
      if (body.ids.length >= 2) {
        const game1Response: Response = await request(baseURL)
          .get(`/api/v1/games/${body.ids[0]}`)
          .expect(200);
        const game2Response: Response = await request(baseURL)
          .get(`/api/v1/games/${body.ids[1]}`)
          .expect(200);

        const date1 = game1Response.body.data.release_date;
        const date2 = game2Response.body.data.release_date;

        // First game should have earlier or equal release date
        expect(date1 <= date2).toBe(true);
      }
    });

    test('GET /api/v1/games/:id/stats should return game statistics', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/1/stats')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('average_rating');
      expect(response.body.data).toHaveProperty('total_reviews');

      // Verify the statistics are numbers
      expect(typeof response.body.data.average_rating).toBe('number');
      expect(typeof response.body.data.total_reviews).toBe('number');

      // Verify average rating is within valid range (0-5)
      expect(response.body.data.average_rating).toBeGreaterThanOrEqual(0);
      expect(response.body.data.average_rating).toBeLessThanOrEqual(5);

      // Verify total reviews is non-negative
      expect(response.body.data.total_reviews).toBeGreaterThanOrEqual(0);
    });

    test('GET /api/v1/games/:id/stats for non-existent game should return 404', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/games/999999/stats')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Genres Endpoints', () => {
    test('GET /api/v1/genres should return all genres', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/genres')
        .expect(200);

      const genresResponse: { data: GenreAttributes[] } = response.body;
      expect(genresResponse).toHaveProperty('data');
      expect(Array.isArray(genresResponse.data)).toBe(true);
      expect(genresResponse.data.length).toBeGreaterThan(0);
      expect(genresResponse.data[0]).toHaveProperty('id');
      expect(genresResponse.data[0]).toHaveProperty('name');
    });

    test('GET /api/v1/genres/:id should return specific genre with games', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/genres/1')
        .expect(200);

      const genre: GenreWithGamesResponse = response.body;
      expect(genre.data).toHaveProperty('id', 1);
      expect(genre.data).toHaveProperty('name');
      expect(genre.data).toHaveProperty('games');
      expect(Array.isArray(genre.data.games)).toBe(true);
    });

    test('GET /api/v1/genres/:id with invalid ID should return 404', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/genres/999999')
        .expect(404);

      const errorResponse: ErrorResponse = response.body;
      expect(errorResponse).toHaveProperty('error');
    });
  });

  describe('Companies Endpoints', () => {
    test('GET /api/v1/companies should return all companies', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/companies')
        .expect(200);

      const companiesResponse: { data: CompanyAttributes[] } = response.body;
      expect(companiesResponse).toHaveProperty('data');
      expect(Array.isArray(companiesResponse.data)).toBe(true);
      expect(companiesResponse.data.length).toBeGreaterThan(0);
      expect(companiesResponse.data[0]).toHaveProperty('id');
      expect(companiesResponse.data[0]).toHaveProperty('name');
      expect(companiesResponse.data[0]).toHaveProperty('company_type');
    });

    test('GET /api/v1/companies/:id should return specific company', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/companies/1')
        .expect(200);

      const company: CompanyResponse = response.body;
      expect(company.data).toHaveProperty('id', 1);
      expect(company.data).toHaveProperty('name');
      expect(company.data).toHaveProperty('company_type');
    });

    test('GET /api/v1/companies/:id with invalid ID should return 404', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/companies/999999')
        .expect(404);

      const errorResponse: ErrorResponse = response.body;
      expect(errorResponse).toHaveProperty('error');
    });
  });

  describe('Reviews Endpoints', () => {
    test('GET /api/v1/reviews should return all reviews', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/reviews')
        .expect(200);

      const reviewsResponse: { data: any[] } = response.body;
      expect(reviewsResponse).toHaveProperty('data');
      expect(Array.isArray(reviewsResponse.data)).toBe(true);
      expect(reviewsResponse.data.length).toBeGreaterThan(0);
      expect(reviewsResponse.data[0]).toHaveProperty('id');
      expect(reviewsResponse.data[0]).toHaveProperty('rating');
      expect(reviewsResponse.data[0]).toHaveProperty('review_text');
      expect(reviewsResponse.data[0]).toHaveProperty('user');
      expect(reviewsResponse.data[0]).toHaveProperty('game');
    });

    test('GET /api/v1/reviews/:id should return specific review', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/reviews/1')
        .expect(200);

      const review: ReviewWithRelationsResponse = response.body;
      expect(review.data).toHaveProperty('id', 1);
      expect(review.data).toHaveProperty('rating');
      expect(review.data).toHaveProperty('review_text');
      expect(review.data).toHaveProperty('user');
      expect(review.data).toHaveProperty('game');
    });

    test('GET /api/v1/reviews/:id with invalid ID should return 404', async () => {
      const response: Response = await request(baseURL)
        .get('/api/v1/reviews/999999')
        .expect(404);

      const errorResponse: ErrorResponse = response.body;
      expect(errorResponse).toHaveProperty('error');
    });
  });

  describe('Static Endpoints', () => {
    test('GET /api-docs/ should return API documentation', async () => {
      const response: Response = await request(baseURL)
        .get('/api-docs/')
        .expect(200);

      expect(response.text).toContain('swagger');
    });

    test('GET /graphql-sandbox should return GraphQL sandbox', async () => {
      const response: Response = await request(baseURL)
        .get('/graphql-sandbox')
        .expect(200);

      expect(response.text).toContain('GraphQL Sandbox');
      expect(response.text).toContain('embeddable-sandbox');
    });
  });

  describe('Media Endpoints', () => {
    test('GET /media/:seed should return WebP image with default dimensions', async () => {
      const response: Response = await request(baseURL)
        .get('/media/test-seed-123')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['cache-control']).toContain('immutable');
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /media/:seed with width only should return square image', async () => {
      const response: Response = await request(baseURL)
        .get('/media/test-seed-456?w=200')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['etag']).toContain('200x200');
    });

    test('GET /media/:seed with height only should return square image', async () => {
      const response: Response = await request(baseURL)
        .get('/media/test-seed-789?h=300')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['etag']).toContain('300x300');
    });

    test('GET /media/:seed with custom dimensions should return sized image', async () => {
      const response: Response = await request(baseURL)
        .get('/media/test-seed-abc?w=400&h=200')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.headers['etag']).toContain('400x200');
    });

    test('GET /media/:seed should be deterministic (same seed = same image)', async () => {
      const response1: Response = await request(baseURL)
        .get('/media/deterministic-test?w=100')
        .expect(200);

      const response2: Response = await request(baseURL)
        .get('/media/deterministic-test?w=100')
        .expect(200);

      expect(response1.body.equals(response2.body)).toBe(true);
    });

    test('GET /media/:seed should produce different images for different seeds', async () => {
      const response1: Response = await request(baseURL)
        .get('/media/seed-one?w=100')
        .expect(200);

      const response2: Response = await request(baseURL)
        .get('/media/seed-two?w=100')
        .expect(200);

      expect(response1.body.equals(response2.body)).toBe(false);
    });
  });
});