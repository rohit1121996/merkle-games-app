import { Op, where as seqWhere, fn, col } from 'sequelize';
import { GraphQLContext, GameQueryArgs, PaginatedGamesResult } from '../../types';

const gameResolvers = {
  Query: {
    games: async (_: any, args: GameQueryArgs, { db }: GraphQLContext): Promise<PaginatedGamesResult> => {
      const { page = 1, limit = 10, genreId, platform, search } = args;
      const offset = (page - 1) * limit;

      const where: any = {};
      if (genreId) where.genre_id = genreId;

      // Use Sequelize fn and col for case-insensitive search in SQLite
      if (platform) {
        where.platform = seqWhere(fn('LOWER', col('platform')), Op.like, `%${platform.toLowerCase()}%`);
      }
      if (search) {
        where.title = seqWhere(fn('LOWER', col('title')), Op.like, `%${search.toLowerCase()}%`);
      }

      const result = await db.Game.findAndCountAll({
        where,
        limit,
        offset,
        order: [['release_date', 'DESC']]
      });

      // Fetch images for all games in this page using the resolver
      // GraphQL will call the images resolver for each game automatically

      return {
        games: result.rows,
        total: result.count,
        page,
        totalPages: Math.ceil(result.count / limit)
      };
    },

    game: async (_: any, { id }: { id: string }, { db }: GraphQLContext): Promise<any> => {
      return await db.Game.findByPk(id);
    },

    gameStats: async (_: any, { id }: { id: string }, { db }: GraphQLContext): Promise<any> => {
      const game = await db.Game.findByPk(id, {
        include: [{
          model: db.UserReview,
          as: 'reviews',
          attributes: []
        }],
        attributes: [
          'id',
          'title',
          [db.sequelize.fn('AVG', db.sequelize.col('reviews.rating_score')), 'averageRating'],
          [db.sequelize.fn('COUNT', db.sequelize.col('reviews.id')), 'totalReviews']
        ],
        group: ['Game.id']
      });

      return game;
    },

    recentGameIds: async (_: any, __: any, { db }: GraphQLContext): Promise<string[]> => {
      const games = await db.Game.findAll({
        attributes: ['id'],
        order: [['release_date', 'DESC']],
        limit: 100
      });

      return games.map((game: any) => game.id.toString());
    },

    gameIdsByDateRange: async (_: any, { from, to }: { from: string; to: string }, { db }: GraphQLContext): Promise<string[]> => {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(from) || !dateRegex.test(to)) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD (e.g., 2020-01-01)');
      }

      const games = await db.Game.findAll({
        attributes: ['id'],
        where: {
          release_date: {
            [Op.between]: [from, to]
          }
        },
        order: [['release_date', 'ASC']]
      });

      return games.map((game: any) => game.id.toString());
    }
  },

  Game: {
    genre: async (game: any, _: any, { db }: GraphQLContext): Promise<any> => {
      return await game.getGenre();
    },
    developer: async (game: any, _: any, { db }: GraphQLContext): Promise<any> => {
      return await game.getDeveloper();
    },
    publisher: async (game: any, _: any, { db }: GraphQLContext): Promise<any> => {
      return await game.getPublisher();
    },
    reviews: async (game: any, _: any, { db }: GraphQLContext): Promise<any[]> => {
      return await game.getReviews();
    },
    images: async (game: any, _: any, { db }: GraphQLContext): Promise<any[]> => {
      const imageRelations = await db.ImageRelation.findAll({
        where: {
          related_type: 'Game',
          related_id: game.id
        },
        include: [{ model: db.Image, as: 'image' }]
      });
      return imageRelations.map((rel: any) => rel.image);
    },
    releaseDate: (game: any): string | null => {
      return game.release_date || null;
    },
    averageRating: async (game: any, _: any, { db }: GraphQLContext): Promise<number | null> => {
      const result = await db.UserReview.findOne({
        where: { game_id: game.id },
        attributes: [[db.sequelize.fn('AVG', db.sequelize.col('rating_score')), 'avg']],
        raw: true
      });
      return result && result.avg !== null ? parseFloat(result.avg) : null;
    },
    totalReviews: async (game: any, _: any, { db }: GraphQLContext): Promise<number> => {
      return await db.UserReview.count({
        where: { game_id: game.id }
      });
    }
  }
};

export default gameResolvers;