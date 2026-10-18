import gql from 'graphql-tag';

const typeDefs = gql`
  type Genre {
    id: ID!
    name: String!
    genreName: String!
    games: [Game]
    createdAt: String
    updatedAt: String
  }

  type Company {
    id: ID!
    name: String!
    country: String
    founded_year: Int
    logo: String
    company_type: CompanyType!
    companyType: CompanyType!
    developedGames: [Game]
    publishedGames: [Game]
    createdAt: String
    updatedAt: String
  }

  type User {
    id: ID!
    username: String!
    email: String!
    registration_date: String
    reviews: [Review]
    createdAt: String
    updatedAt: String
  }

  type Game {
    id: ID!
    title: String!
    description: String
    genre: Genre
    platform: String
    release_date: String
    releaseDate: String  # Can be null for games without release dates
    developer: Company
    publisher: Company
    reviews: [Review]
    images: [Image]
    averageRating: Float
    totalReviews: Int
    createdAt: String
    updatedAt: String
  }

  type Review {
    id: ID!
    game: Game!
    user: User!
    rating: Float
    ratingScore: Float
    review_text: String
    reviewText: String
    review_date: String
    createdAt: String
    updatedAt: String
  }

  type Image {
    id: ID!
    image_url: String!
    image_type: ImageType!
    relations: [ImageRelation]
    createdAt: String
    updatedAt: String
  }

  type ImageRelation {
    id: ID!
    image: Image!
    related_type: RelatedType!
    related_id: Int!
    createdAt: String
    updatedAt: String
  }

  type GameStats {
    id: ID!
    title: String!
    averageRating: Float
    totalReviews: Int
  }

  type PaginatedGames {
    games: [Game]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  enum CompanyType {
    Developer
    Publisher
  }

  enum ImageType {
    Screenshot
    Cover
    Artwork
  }

  enum RelatedType {
    Game
    Company
    Genre
    Rating
    User
  }

  type Query {
    # Games
    games(page: Int, limit: Int, genreId: ID, platform: String, search: String): PaginatedGames!
    game(id: ID!): Game
    gameStats(id: ID!): GameStats
    recentGameIds: [ID!]!
    gameIdsByDateRange(from: String!, to: String!): [ID!]!

    # Companies
    companies(type: CompanyType, country: String, search: String): [Company]!
    company(id: ID!): Company

    # Genres
    genres: [Genre]!
    genre(id: ID!): Genre

    # Reviews
    reviews(gameId: ID, userId: ID, minRating: Float, maxRating: Float, limit: Int): [Review]!
    review(id: ID!): Review

    # Users
    users(limit: Int): [User]!
    user(id: ID!): User

    # Images
    images(relatedType: RelatedType, relatedId: Int): [Image]!
    image(id: ID!): Image
  }
`;

export default typeDefs;