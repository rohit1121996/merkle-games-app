import { Request } from 'express';

export interface Link {
  href: string;
  rel: string;
  method: string;
  description?: string;
}

export interface HATEOASResource<T = any> {
  data: T;
  _links: Link[];
  _embedded?: { [key: string]: any };
}

export interface HATEOASCollection<T = any> {
  data: T[];
  _links: Link[];
  _embedded?: { [key: string]: any };
  _metadata?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class HATEOASBuilder {
  private baseUrl: string;

  constructor(req: Request) {
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:8000';
    this.baseUrl = `${protocol}://${host}`;
  }

  // Game Links
  gameLinks(gameId: number): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/games/${gameId}`,
        rel: 'self',
        method: 'GET',
        description: 'Get this game'
      },
      {
        href: `${this.baseUrl}/api/v1/games/${gameId}/reviews`,
        rel: 'reviews',
        method: 'GET',
        description: 'Get reviews for this game'
      },
      {
        href: `${this.baseUrl}/api/v1/games/${gameId}/images`,
        rel: 'images',
        method: 'GET',
        description: 'Get images for this game'
      },
      {
        href: `${this.baseUrl}/api/v1/games/${gameId}/stats`,
        rel: 'stats',
        method: 'GET',
        description: 'Get statistics for this game'
      }
    ];
  }

  gamesCollectionLinks(page: number = 1, limit: number = 10, totalPages: number = 1): Link[] {
    const links: Link[] = [
      {
        href: `${this.baseUrl}/api/v1/games?page=${page}&limit=${limit}`,
        rel: 'self',
        method: 'GET',
        description: 'Current page of games'
      }
    ];

    if (page > 1) {
      links.push({
        href: `${this.baseUrl}/api/v1/games?page=1&limit=${limit}`,
        rel: 'first',
        method: 'GET',
        description: 'First page of games'
      });
      links.push({
        href: `${this.baseUrl}/api/v1/games?page=${page - 1}&limit=${limit}`,
        rel: 'prev',
        method: 'GET',
        description: 'Previous page of games'
      });
    }

    if (page < totalPages) {
      links.push({
        href: `${this.baseUrl}/api/v1/games?page=${page + 1}&limit=${limit}`,
        rel: 'next',
        method: 'GET',
        description: 'Next page of games'
      });
      links.push({
        href: `${this.baseUrl}/api/v1/games?page=${totalPages}&limit=${limit}`,
        rel: 'last',
        method: 'GET',
        description: 'Last page of games'
      });
    }

    return links;
  }

  // Genre Links
  genreLinks(genreId: number): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/genres/${genreId}`,
        rel: 'self',
        method: 'GET',
        description: 'Get this genre'
      },
      {
        href: `${this.baseUrl}/api/v1/genres/${genreId}/games`,
        rel: 'games',
        method: 'GET',
        description: 'Get games in this genre'
      },
      {
        href: `${this.baseUrl}/api/v1/genres`,
        rel: 'collection',
        method: 'GET',
        description: 'Get all genres'
      }
    ];
  }

  genresCollectionLinks(): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/genres`,
        rel: 'self',
        method: 'GET',
        description: 'Get all genres'
      },
      {
        href: `${this.baseUrl}/api/v1/games`,
        rel: 'games',
        method: 'GET',
        description: 'Get all games'
      }
    ];
  }

  // Company Links
  companyLinks(companyId: number, companyType?: string): Link[] {
    const links: Link[] = [
      {
        href: `${this.baseUrl}/api/v1/companies/${companyId}`,
        rel: 'self',
        method: 'GET',
        description: 'Get this company'
      },
      {
        href: `${this.baseUrl}/api/v1/companies/${companyId}/games`,
        rel: 'games',
        method: 'GET',
        description: 'Get games by this company'
      }
    ];

    if (companyType === 'Developer') {
      links.push({
        href: `${this.baseUrl}/api/v1/companies/${companyId}/developed`,
        rel: 'developed_games',
        method: 'GET',
        description: 'Get games developed by this company'
      });
    }

    if (companyType === 'Publisher') {
      links.push({
        href: `${this.baseUrl}/api/v1/companies/${companyId}/published`,
        rel: 'published_games',
        method: 'GET',
        description: 'Get games published by this company'
      });
    }

    links.push({
      href: `${this.baseUrl}/api/v1/companies`,
      rel: 'collection',
      method: 'GET',
      description: 'Get all companies'
    });

    return links;
  }

  companiesCollectionLinks(): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/companies`,
        rel: 'self',
        method: 'GET',
        description: 'Get all companies'
      },
      {
        href: `${this.baseUrl}/api/v1/companies?type=Developer`,
        rel: 'developers',
        method: 'GET',
        description: 'Get all developers'
      },
      {
        href: `${this.baseUrl}/api/v1/companies?type=Publisher`,
        rel: 'publishers',
        method: 'GET',
        description: 'Get all publishers'
      }
    ];
  }

  // Review Links
  reviewLinks(reviewId: number, gameId?: number, userId?: number): Link[] {
    const links: Link[] = [
      {
        href: `${this.baseUrl}/api/v1/reviews/${reviewId}`,
        rel: 'self',
        method: 'GET',
        description: 'Get this review'
      }
    ];

    if (gameId) {
      links.push({
        href: `${this.baseUrl}/api/v1/games/${gameId}`,
        rel: 'game',
        method: 'GET',
        description: 'Get the game for this review'
      });
    }

    if (userId) {
      links.push({
        href: `${this.baseUrl}/api/v1/users/${userId}`,
        rel: 'user',
        method: 'GET',
        description: 'Get the user who wrote this review'
      });
    }

    links.push({
      href: `${this.baseUrl}/api/v1/reviews`,
      rel: 'collection',
      method: 'GET',
      description: 'Get all reviews'
    });

    return links;
  }

  reviewsCollectionLinks(page: number = 1, limit: number = 10): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/reviews?page=${page}&limit=${limit}`,
        rel: 'self',
        method: 'GET',
        description: 'Current page of reviews'
      },
      {
        href: `${this.baseUrl}/api/v1/games`,
        rel: 'games',
        method: 'GET',
        description: 'Get all games'
      },
      {
        href: `${this.baseUrl}/api/v1/users`,
        rel: 'users',
        method: 'GET',
        description: 'Get all users'
      }
    ];
  }

  // User Links
  userLinks(userId: number): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/users/${userId}`,
        rel: 'self',
        method: 'GET',
        description: 'Get this user'
      },
      {
        href: `${this.baseUrl}/api/v1/users/${userId}/reviews`,
        rel: 'reviews',
        method: 'GET',
        description: 'Get reviews by this user'
      },
      {
        href: `${this.baseUrl}/api/v1/users`,
        rel: 'collection',
        method: 'GET',
        description: 'Get all users'
      }
    ];
  }

  usersCollectionLinks(): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1/users`,
        rel: 'self',
        method: 'GET',
        description: 'Get all users'
      },
      {
        href: `${this.baseUrl}/api/v1/reviews`,
        rel: 'reviews',
        method: 'GET',
        description: 'Get all reviews'
      }
    ];
  }

  // Root API Links
  rootLinks(): Link[] {
    return [
      {
        href: `${this.baseUrl}/api/v1`,
        rel: 'self',
        method: 'GET',
        description: 'API root'
      },
      {
        href: `${this.baseUrl}/api/v1/games`,
        rel: 'games',
        method: 'GET',
        description: 'Get all games'
      },
      {
        href: `${this.baseUrl}/api/v1/genres`,
        rel: 'genres',
        method: 'GET',
        description: 'Get all genres'
      },
      {
        href: `${this.baseUrl}/api/v1/companies`,
        rel: 'companies',
        method: 'GET',
        description: 'Get all companies'
      },
      {
        href: `${this.baseUrl}/api/v1/reviews`,
        rel: 'reviews',
        method: 'GET',
        description: 'Get all reviews'
      },
      {
        href: `${this.baseUrl}/api/v1/users`,
        rel: 'users',
        method: 'GET',
        description: 'Get all users'
      },
      {
        href: `${this.baseUrl}/api-docs`,
        rel: 'documentation',
        method: 'GET',
        description: 'API documentation (Swagger)'
      },
      {
        href: `${this.baseUrl}/graphql`,
        rel: 'graphql',
        method: 'POST',
        description: 'GraphQL endpoint'
      },
      {
        href: `${this.baseUrl}/graphql-sandbox`,
        rel: 'graphql-sandbox',
        method: 'GET',
        description: 'GraphQL sandbox'
      }
    ];
  }
}

export default HATEOASBuilder;