import { Request, Response } from 'express';
import { Op, where as seqWhere, fn, col, Sequelize } from 'sequelize';
import { ParsedQs } from 'qs';
import { Game, Genre, Company, UserReview, User, Image, ImageRelation } from '../models';
import { GameAttributes, ApiResponse, SearchOptions } from '../types';
import HATEOASBuilder, { HATEOASCollection, HATEOASResource } from '../utils/hateoas';

interface GameQueryParams extends ParsedQs {
  genre?: string;
  platform?: string;
  search?: string;
  sort?: string;
  order?: string;
  page?: string;
  limit?: string;
}

interface GameWithStats extends GameAttributes {
  average_rating?: number;
  total_reviews?: number;
}

const gameController = {
  // Get all games
  async getAllGames(req: Request<{}, HATEOASCollection<GameAttributes>, {}, GameQueryParams>, res: Response<HATEOASCollection<GameAttributes> | { error: string }>): Promise<void> {
    try {
      const { page = 1, limit = 10, genre, platform, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (genre) where.genre_id = genre;

      // Use Sequelize fn and col for case-insensitive search in SQLite
      if (platform) {
        where.platform = seqWhere(fn('LOWER', col('platform')), Op.like, `%${platform.toLowerCase()}%`);
      }
      if (search) {
        where.title = seqWhere(fn('LOWER', col('title')), Op.like, `%${search.toLowerCase()}%`);
      }

      const games = await Game.findAndCountAll({
        where,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
        include: [
          { model: Genre, as: 'genre' },
          { model: Company, as: 'developer' },
          { model: Company, as: 'publisher' }
        ],
        order: [['release_date', 'DESC']]
      });

      // Fetch images for all games in this page
      const gameIds = games.rows.map(game => game.id).filter((id): id is number => id !== undefined);
      const imageRelations = await ImageRelation.findAll({
        where: {
          related_type: 'Game',
          related_id: { [Op.in]: gameIds }
        },
        include: [{ model: Image, as: 'image' }]
      });

      // Group images by game_id
      const imagesByGame = new Map<number, any[]>();
      imageRelations.forEach((rel: any) => {
        if (!imagesByGame.has(rel.related_id)) {
          imagesByGame.set(rel.related_id, []);
        }
        imagesByGame.get(rel.related_id)!.push(rel.image);
      });

      // Add images to games
      const gamesWithImages = games.rows.map(game => {
        const gameJSON = game.toJSON();
        return {
          ...gameJSON,
          images: imagesByGame.get(game.id as number) || []
        };
      });

      const hateoas = new HATEOASBuilder(req);
      const totalPages = Math.ceil(games.count / Number(limit));
      const currentPage = parseInt(String(page));

      res.json({
        data: gamesWithImages,
        _links: hateoas.gamesCollectionLinks(currentPage, parseInt(String(limit)), totalPages),
        _metadata: {
          total: games.count,
          page: currentPage,
          limit: parseInt(String(limit)),
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ error: 'Failed to fetch games' });
    }
  },

  // Get game by ID
  async getGameById(req: Request<{ id: string }>, res: Response<HATEOASResource<GameAttributes & { images?: any[] }> | { error: string }>): Promise<void> {
    try {
      const game = await Game.findByPk(req.params.id, {
        include: [
          { model: Genre, as: 'genre' },
          { model: Company, as: 'developer' },
          { model: Company, as: 'publisher' },
          {
            model: UserReview,
            as: 'reviews',
            include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
          }
        ]
      });

      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      // Get images for this game
      const images = await Image.findAll({
        include: [{
          model: ImageRelation,
          as: 'relations',
          where: {
            related_type: 'Game',
            related_id: game.id
          }
        }]
      });

      const hateoas = new HATEOASBuilder(req);
      const gameData = { ...game.toJSON(), images: images.map(img => img.toJSON()) };

      res.json({
        data: gameData,
        _links: hateoas.gameLinks(game.id!),
        _embedded: {
          genre: gameData.genre,
          developer: gameData.developer,
          publisher: gameData.publisher,
          images: gameData.images
        }
      });
    } catch (error) {
      console.error('Error fetching game:', error);
      res.status(500).json({ error: 'Failed to fetch game' });
    }
  },

  // Create new game
  async createGame(req: Request<{}, HATEOASResource<GameAttributes>, GameAttributes>, res: Response<HATEOASResource<GameAttributes> | { error: string }>): Promise<void> {
    try {
      const game = await Game.create(req.body);
      const createdGame = await Game.findByPk(game.id, {
        include: [
          { model: Genre, as: 'genre' },
          { model: Company, as: 'developer' },
          { model: Company, as: 'publisher' }
        ]
      });

      const hateoas = new HATEOASBuilder(req);
      const gameData = createdGame!.toJSON();

      res.status(201).json({
        data: gameData,
        _links: hateoas.gameLinks(game.id!),
        _embedded: {
          genre: gameData.genre,
          developer: gameData.developer,
          publisher: gameData.publisher
        }
      });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(400).json({ error: 'Failed to create game' });
    }
  },

  // Update game
  async updateGame(req: Request<{ id: string }, HATEOASResource<GameAttributes>, Partial<GameAttributes>>, res: Response<HATEOASResource<GameAttributes> | { error: string }>): Promise<void> {
    try {
      const game = await Game.findByPk(req.params.id);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      await game.update(req.body);
      const updatedGame = await Game.findByPk(game.id, {
        include: [
          { model: Genre, as: 'genre' },
          { model: Company, as: 'developer' },
          { model: Company, as: 'publisher' }
        ]
      });

      const hateoas = new HATEOASBuilder(req);
      const gameData = updatedGame!.toJSON();

      res.json({
        data: gameData,
        _links: hateoas.gameLinks(game.id!),
        _embedded: {
          genre: gameData.genre,
          developer: gameData.developer,
          publisher: gameData.publisher
        }
      });
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(400).json({ error: 'Failed to update game' });
    }
  },

  // Delete game
  async deleteGame(req: Request<{ id: string }>, res: Response<{ message: string } | { error: string }>): Promise<void> {
    try {
      const game = await Game.findByPk(req.params.id);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      await game.destroy();
      res.json({ message: 'Game deleted successfully' });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({ error: 'Failed to delete game' });
    }
  },

  // Get 100 most recent game IDs by release date
  async getRecentGameIds(req: Request, res: Response<{ ids: number[] } | { error: string }>): Promise<void> {
    try {
      const games = await Game.findAll({
        attributes: ['id'],
        order: [['release_date', 'DESC']],
        limit: 100
      });

      res.json({ ids: games.map(game => game.id as number) });
    } catch (error) {
      console.error('Error fetching recent game IDs:', error);
      res.status(500).json({ error: 'Failed to fetch recent game IDs' });
    }
  },

  // Get game IDs by release date range
  async getGameIdsByDateRange(req: Request, res: Response<{ ids: number[] } | { error: string }>): Promise<void> {
    try {
      const { from, to } = req.query;

      // Validate required parameters
      if (!from || !to) {
        res.status(400).json({
          error: 'Both "from" and "to" date parameters are required. Format: YYYY-MM-DD (e.g., ?from=2020-01-01&to=2023-12-31)'
        });
        return;
      }

      // Validate date format (basic check)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(from as string) || !dateRegex.test(to as string)) {
        res.status(400).json({
          error: 'Invalid date format. Please use YYYY-MM-DD (e.g., 2020-01-01)'
        });
        return;
      }

      const games = await Game.findAll({
        attributes: ['id'],
        where: {
          release_date: {
            [Op.between]: [from as string, to as string]
          }
        },
        order: [['release_date', 'ASC']]
      });

      res.json({ ids: games.map(game => game.id as number) });
    } catch (error) {
      console.error('Error fetching games by date range:', error);
      res.status(500).json({ error: 'Failed to fetch games by date range' });
    }
  },

  // Get game statistics
  async getGameStats(req: Request<{ id: string }>, res: Response<HATEOASResource<GameWithStats> | { error: string }>): Promise<void> {
    try {
      const game = await Game.findByPk(req.params.id, {
        include: [{
          model: UserReview,
          as: 'reviews',
          attributes: []
        }],
        attributes: [
          'id',
          'title',
          [fn('AVG', col('reviews.rating_score')), 'average_rating'],
          [fn('COUNT', col('reviews.id')), 'total_reviews']
        ],
        group: ['Game.id']
      });

      if (!game) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: game.toJSON(),
        _links: hateoas.gameLinks(parseInt(req.params.id))
      });
    } catch (error) {
      console.error('Error fetching game stats:', error);
      res.status(500).json({ error: 'Failed to fetch game statistics' });
    }
  }
};

export default gameController;