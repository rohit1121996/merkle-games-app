import request from 'supertest';
import { Response } from 'supertest';
import {
  GameAttributes,
  GenreAttributes,
  CompanyAttributes,
  UserReviewAttributes,
  UserAttributes
} from '@/types';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

describe('GraphQL API Integration Tests', () => {
  const baseURL = `http://localhost:${process.env.PORT || 8000}`;

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  // Helper function to make GraphQL requests
  const graphqlRequest = async <T = any>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<GraphQLResponse<T>> => {
    const requestBody: GraphQLRequest = { query, variables };
    const response: Response = await request(baseURL)
      .post('/graphql')
      .send(requestBody)
      .set('Content-Type', 'application/json')
      .expect(200);

    return response.body as GraphQLResponse<T>;
  };

  describe('Games Queries', () => {
    test('Should fetch paginated games with all fields including releaseDate', async () => {
      const query = `
        query GetGames {
          games(limit: 5) {
            games {
              id
              title
              description
              platform
              releaseDate
              genre {
                genreName
              }
              developer {
                name
                companyType
              }
              publisher {
                name
                companyType
              }
              averageRating
              totalReviews
            }
            total
            page
            totalPages
          }
        }
      `;

      const result = await graphqlRequest<{ games: any }>(query);

      // Should not have errors
      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.games).toBeDefined();
      expect(result.data?.games.games).toBeInstanceOf(Array);
      expect(result.data?.games.games.length).toBeGreaterThan(0);
      expect(result.data?.games.games.length).toBeLessThanOrEqual(5);

      // Check first game has all required fields
      const firstGame = result.data?.games.games[0];
      expect(firstGame).toHaveProperty('id');
      expect(firstGame).toHaveProperty('title');
      expect(firstGame).toHaveProperty('platform');
      expect(firstGame).toHaveProperty('releaseDate');
      expect(firstGame).toHaveProperty('genre');
      expect(firstGame.genre).toHaveProperty('genreName');

      // Verify releaseDate is a valid date string or null
      if (firstGame.releaseDate) {
        expect(typeof firstGame.releaseDate).toBe('string');
        // Should match YYYY-MM-DD format
        expect(firstGame.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }

      // Check pagination metadata
      expect(result.data?.games.total).toBeGreaterThan(0);
      expect(result.data?.games.page).toBe(1);
      expect(result.data?.games.totalPages).toBeGreaterThan(0);
    });

    test('Should fetch games with images included', async () => {
      const query = `
        query GetGamesWithImages {
          games(limit: 10) {
            games {
              id
              title
              images {
                id
                image_url
                image_type
              }
            }
            total
          }
        }
      `;

      const result = await graphqlRequest<{ games: any }>(query);

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.games.games).toBeInstanceOf(Array);

      // Find at least one game with images
      const gamesWithImages = result.data?.games.games.filter((game: any) => game.images && game.images.length > 0);
      expect(gamesWithImages.length).toBeGreaterThan(0);

      // Verify image structure
      const gameWithImages = gamesWithImages[0];
      expect(Array.isArray(gameWithImages.images)).toBe(true);
      expect(gameWithImages.images[0]).toHaveProperty('id');
      expect(gameWithImages.images[0]).toHaveProperty('image_url');
      expect(gameWithImages.images[0]).toHaveProperty('image_type');
    });

    test('Should fetch a specific game with reviews', async () => {
      const query = `
        query GetGameWithReviews($id: ID!) {
          game(id: $id) {
            id
            title
            description
            platform
            releaseDate
            reviews {
              id
              ratingScore
              reviewText
              user {
                username
              }
            }
            averageRating
            totalReviews
          }
        }
      `;

      const result = await graphqlRequest<{ game: any }>(query, { id: "1" });

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.game).toBeDefined();
      expect(result.data?.game.id).toBe("1");
      expect(result.data?.game.title).toBeDefined();
      expect(result.data?.game).toHaveProperty('releaseDate');

      // Verify releaseDate works
      if (result.data?.game.releaseDate) {
        expect(typeof result.data.game.releaseDate).toBe('string');
        expect(result.data.game.releaseDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    test('Should search games by title', async () => {
      const query = `
        query SearchGames($search: String!, $limit: Int) {
          games(search: $search, limit: $limit) {
            games {
              id
              title
              releaseDate
              genre {
                genreName
              }
            }
            total
          }
        }
      `;

      const result = await graphqlRequest<{ games: any }>(query, {
        search: "Adventure",
        limit: 3
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.games.games).toBeInstanceOf(Array);

      // All results should contain "Adventure" in the title
      result.data?.games.games.forEach((game: any) => {
        expect(game.title.toLowerCase()).toContain('adventure');
        expect(game).toHaveProperty('releaseDate');
      });
    });

    test('Should fetch recent game IDs sorted by release date', async () => {
      const query = `
        query GetRecentGameIds {
          recentGameIds
        }
      `;

      const result = await graphqlRequest<{ recentGameIds: string[] }>(query);

      expect(result.errors).toBeUndefined();
      expect(result.data?.recentGameIds).toBeInstanceOf(Array);
      expect(result.data?.recentGameIds.length).toBeGreaterThan(0);
      expect(result.data?.recentGameIds.length).toBeLessThanOrEqual(100);

      // Should be array of ID strings
      result.data?.recentGameIds.forEach((id: string) => {
        expect(typeof id).toBe('string');
        expect(parseInt(id)).toBeGreaterThan(0);
      });
    });

    test('Should fetch game IDs by date range', async () => {
      const query = `
        query GetGameIdsByDateRange($from: String!, $to: String!) {
          gameIdsByDateRange(from: $from, to: $to)
        }
      `;

      const result = await graphqlRequest<{ gameIdsByDateRange: string[] }>(query, {
        from: '2020-01-01',
        to: '2023-12-31'
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.gameIdsByDateRange).toBeInstanceOf(Array);
      expect(result.data?.gameIdsByDateRange.length).toBeGreaterThan(0);

      // Should be array of ID strings
      result.data?.gameIdsByDateRange.forEach((id: string) => {
        expect(typeof id).toBe('string');
        expect(parseInt(id)).toBeGreaterThan(0);
      });
    });

    test('Should reject date range query with invalid date format', async () => {
      const query = `
        query GetGameIdsByDateRange($from: String!, $to: String!) {
          gameIdsByDateRange(from: $from, to: $to)
        }
      `;

      const result = await graphqlRequest<{ gameIdsByDateRange: string[] }>(query, {
        from: '2020/01/01',
        to: '2023-12-31'
      });

      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('Invalid date format');
    });

    test('Should return empty array for date range with no games', async () => {
      const query = `
        query GetGameIdsByDateRange($from: String!, $to: String!) {
          gameIdsByDateRange(from: $from, to: $to)
        }
      `;

      const result = await graphqlRequest<{ gameIdsByDateRange: string[] }>(query, {
        from: '1900-01-01',
        to: '1900-12-31'
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.gameIdsByDateRange).toBeInstanceOf(Array);
      expect(result.data?.gameIdsByDateRange.length).toBe(0);
    });

    test('Should filter games by genre', async () => {
      const query = `
        query GetGamesByGenre($genreId: ID!) {
          games(genreId: $genreId, limit: 5) {
            games {
              id
              title
              releaseDate
              genre {
                id
                genreName
              }
            }
            total
          }
        }
      `;

      const result = await graphqlRequest<{ games: any }>(query, { genreId: "1" });

      expect(result.errors).toBeUndefined();
      expect(result.data?.games.games).toBeInstanceOf(Array);

      // All games should have the specified genre
      result.data?.games.games.forEach((game: any) => {
        expect(game.genre.id).toBe("1");
      });
    });

    test('Should filter games by platform', async () => {
      const query = `
        query GetGamesByPlatform($platform: String!) {
          games(platform: $platform, limit: 5) {
            games {
              id
              title
              platform
              releaseDate
            }
            total
          }
        }
      `;

      const result = await graphqlRequest<{ games: any }>(query, { platform: "PC" });

      expect(result.errors).toBeUndefined();
      expect(result.data?.games.games).toBeInstanceOf(Array);

      // All games should have PC in platform
      result.data?.games.games.forEach((game: any) => {
        expect(game.platform.toLowerCase()).toContain('pc');
      });
    });
  });

  describe('Genres Queries', () => {
    test('Should fetch all genres with games', async () => {
      const query = `
        query GetGenres {
          genres {
            id
            genreName
            games {
              id
              title
              platform
              releaseDate
            }
            createdAt
            updatedAt
          }
        }
      `;

      const result = await graphqlRequest<{ genres: any[] }>(query);

      expect(result.errors).toBeUndefined();
      expect(result.data?.genres).toBeInstanceOf(Array);
      expect(result.data?.genres.length).toBeGreaterThan(0);

      const firstGenre = result.data?.genres[0];
      expect(firstGenre).toHaveProperty('id');
      expect(firstGenre).toHaveProperty('genreName');
      expect(firstGenre).toHaveProperty('games');
      expect(firstGenre.games).toBeInstanceOf(Array);

      // Check games have releaseDate
      if (firstGenre.games.length > 0) {
        expect(firstGenre.games[0]).toHaveProperty('releaseDate');
      }
    });

    test('Should fetch a specific genre by ID', async () => {
      const query = `
        query GetGenre($id: ID!) {
          genre(id: $id) {
            id
            genreName
            games {
              id
              title
              releaseDate
            }
          }
        }
      `;

      const result = await graphqlRequest<{ genre: any }>(query, { id: "1" });

      expect(result.errors).toBeUndefined();
      expect(result.data?.genre).toBeDefined();
      expect(result.data?.genre.id).toBe("1");
      expect(result.data?.genre.genreName).toBeDefined();
    });
  });

  describe('Companies Queries', () => {
    test('Should fetch all companies', async () => {
      const query = `
        query GetCompanies {
          companies {
            id
            name
            companyType
            country
          }
        }
      `;

      const result = await graphqlRequest<{ companies: any[] }>(query);

      expect(result.errors).toBeUndefined();
      expect(result.data?.companies).toBeInstanceOf(Array);
      expect(result.data?.companies.length).toBeGreaterThan(0);

      const firstCompany = result.data?.companies[0];
      expect(firstCompany).toHaveProperty('id');
      expect(firstCompany).toHaveProperty('name');
      expect(firstCompany).toHaveProperty('companyType');
    });

    test('Should fetch developers with their games including releaseDate', async () => {
      const query = `
        query GetDevelopers {
          companies(type: Developer) {
            id
            name
            companyType
            country
            developedGames {
              id
              title
              releaseDate
            }
          }
        }
      `;

      const result = await graphqlRequest<{ companies: any[] }>(query);

      expect(result.errors).toBeUndefined();
      expect(result.data?.companies).toBeInstanceOf(Array);

      // All should be developers
      result.data?.companies.forEach((company: any) => {
        expect(company.companyType).toBe('Developer');

        // Check developed games have releaseDate
        if (company.developedGames && company.developedGames.length > 0) {
          company.developedGames.forEach((game: any) => {
            expect(game).toHaveProperty('releaseDate');
          });
        }
      });
    });

    test('Should fetch publishers', async () => {
      const query = `
        query GetPublishers {
          companies(type: Publisher) {
            id
            name
            companyType
            publishedGames {
              id
              title
              releaseDate
            }
          }
        }
      `;

      const result = await graphqlRequest<{ companies: any[] }>(query);

      expect(result.errors).toBeUndefined();
      expect(result.data?.companies).toBeInstanceOf(Array);

      // All should be publishers
      result.data?.companies.forEach((company: any) => {
        expect(company.companyType).toBe('Publisher');
      });
    });

    test('Should fetch a specific company by ID', async () => {
      const query = `
        query GetCompany($id: ID!) {
          company(id: $id) {
            id
            name
            companyType
            country
          }
        }
      `;

      const result = await graphqlRequest<{ company: any }>(query, { id: "1" });

      expect(result.errors).toBeUndefined();
      expect(result.data?.company).toBeDefined();
      expect(result.data?.company.id).toBe("1");
    });
  });

  describe('Reviews Queries', () => {
    test('Should fetch all reviews', async () => {
      const query = `
        query GetReviews($limit: Int) {
          reviews(limit: $limit) {
            id
            ratingScore
            reviewText
            user {
              username
            }
            game {
              title
              releaseDate
            }
          }
        }
      `;

      const result = await graphqlRequest<{ reviews: any[] }>(query, { limit: 50 });

      expect(result.errors).toBeUndefined();
      expect(result.data?.reviews).toBeInstanceOf(Array);
      expect(result.data?.reviews.length).toBeGreaterThan(0);

      const firstReview = result.data?.reviews[0];
      expect(firstReview).toHaveProperty('id');
      expect(firstReview).toHaveProperty('ratingScore');
      expect(firstReview).toHaveProperty('user');
      expect(firstReview).toHaveProperty('game');
      expect(firstReview.game).toHaveProperty('releaseDate');
    });

    test('Should filter reviews by game ID', async () => {
      const query = `
        query GetGameReviews($gameId: ID!, $limit: Int) {
          reviews(gameId: $gameId, limit: $limit) {
            id
            ratingScore
            game {
              id
              title
            }
          }
        }
      `;

      const result = await graphqlRequest<{ reviews: any[] }>(query, { gameId: "1", limit: 50 });

      expect(result.errors).toBeUndefined();
      expect(result.data?.reviews).toBeInstanceOf(Array);

      // All reviews should be for game 1
      result.data?.reviews.forEach((review: any) => {
        expect(review.game.id).toBe("1");
      });
    });

    test('Should fetch a specific review by ID', async () => {
      const query = `
        query GetReview($id: ID!) {
          review(id: $id) {
            id
            ratingScore
            reviewText
            user {
              username
              email
            }
            game {
              title
              releaseDate
            }
          }
        }
      `;

      const result = await graphqlRequest<{ review: any }>(query, { id: "1" });

      expect(result.errors).toBeUndefined();
      expect(result.data?.review).toBeDefined();
      expect(result.data?.review.id).toBe("1");
      expect(result.data?.review.game).toHaveProperty('releaseDate');
    });
  });

  describe('Users Queries', () => {
    test('Should fetch all users', async () => {
      const query = `
        query GetUsers($limit: Int) {
          users(limit: $limit) {
            id
            username
            email
          }
        }
      `;

      const result = await graphqlRequest<{ users: any[] }>(query, { limit: 20 });

      expect(result.errors).toBeUndefined();
      expect(result.data?.users).toBeInstanceOf(Array);
      expect(result.data?.users.length).toBeGreaterThan(0);

      const firstUser = result.data?.users[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('username');
      expect(firstUser).toHaveProperty('email');
    });

    test('Should fetch a specific user by ID', async () => {
      const query = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            username
            email
            reviews {
              id
              ratingScore
            }
          }
        }
      `;

      const result = await graphqlRequest<{ user: any }>(query, { id: "1" });

      expect(result.errors).toBeUndefined();
      expect(result.data?.user).toBeDefined();
      expect(result.data?.user.id).toBe("1");
    });
  });

  describe('GraphQL Sandbox', () => {
    test('Should serve GraphQL sandbox HTML', async () => {
      const response: Response = await request(baseURL)
        .get('/graphql-sandbox')
        .expect(200);

      expect(response.text).toContain('GraphQL Sandbox');
      expect(response.text).toContain('embeddable-sandbox');
      expect(response.text).toContain('GetGames');
      expect(response.text).toContain('releaseDate');
    });
  });
});
