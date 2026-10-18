import { Request, Response } from 'express';
import { ParsedQs } from 'qs';
import { Genre, Game } from '../models';
import { GenreAttributes } from '../types';
import HATEOASBuilder, { HATEOASCollection, HATEOASResource } from '../utils/hateoas';

interface GenreCreateRequest {
  genre_name?: string;
  genreName?: string;
  name?: string;
}

const genreController = {
  // Get all genres
  async getAllGenres(req: Request, res: Response<HATEOASCollection<GenreAttributes> | { error: string }>): Promise<void> {
    try {
      const genres = await Genre.findAll({
        order: [['name', 'ASC']]
      });

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: genres.map(genre => genre.toJSON()),
        _links: hateoas.genresCollectionLinks()
      });
    } catch (error) {
      console.error('Error fetching genres:', error);
      res.status(500).json({ error: 'Failed to fetch genres' });
    }
  },

  // Get genre by ID with games
  async getGenreById(req: Request<{ id: string }>, res: Response<HATEOASResource<GenreAttributes> | { error: string }>): Promise<void> {
    try {
      const genre = await Genre.findByPk(req.params.id, {
        include: [{
          model: Game,
          as: 'games',
          limit: 20,
          order: [['release_date', 'DESC']]
        }]
      });

      if (!genre) {
        res.status(404).json({ error: 'Genre not found' });
        return;
      }

      const hateoas = new HATEOASBuilder(req);
      const genreData = genre.toJSON();

      res.json({
        data: genreData,
        _links: hateoas.genreLinks(genre.id!),
        _embedded: {
          games: genreData.games || []
        }
      });
    } catch (error) {
      console.error('Error fetching genre:', error);
      res.status(500).json({ error: 'Failed to fetch genre' });
    }
  },

  // Create new genre
  async createGenre(req: Request<{}, HATEOASResource<GenreAttributes>, GenreCreateRequest>, res: Response<HATEOASResource<GenreAttributes> | { error: string }>): Promise<void> {
    try {
      const genre = await Genre.create({
        name: req.body.genre_name || req.body.genreName || req.body.name || ''
      });

      const hateoas = new HATEOASBuilder(req);

      res.status(201).json({
        data: genre.toJSON(),
        _links: hateoas.genreLinks(genre.id!)
      });
    } catch (error: any) {
      console.error('Error creating genre:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Genre already exists' });
        return;
      }
      res.status(400).json({ error: 'Failed to create genre' });
    }
  },

  // Update genre
  async updateGenre(req: Request<{ id: string }, HATEOASResource<GenreAttributes>, GenreCreateRequest>, res: Response<HATEOASResource<GenreAttributes> | { error: string }>): Promise<void> {
    try {
      const genre = await Genre.findByPk(req.params.id);
      if (!genre) {
        res.status(404).json({ error: 'Genre not found' });
        return;
      }

      await genre.update({
        name: req.body.genre_name || req.body.genreName || req.body.name
      });

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: genre.toJSON(),
        _links: hateoas.genreLinks(genre.id!)
      });
    } catch (error: any) {
      console.error('Error updating genre:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Genre name already exists' });
        return;
      }
      res.status(400).json({ error: 'Failed to update genre' });
    }
  },

  // Delete genre
  async deleteGenre(req: Request<{ id: string }>, res: Response<{ message: string } | { error: string; gamesCount?: number }>): Promise<void> {
    try {
      const genre = await Genre.findByPk(req.params.id);
      if (!genre) {
        res.status(404).json({ error: 'Genre not found' });
        return;
      }

      // Check if genre has associated games
      const gamesCount = await Game.count({ where: { genre_id: req.params.id } });
      if (gamesCount > 0) {
        res.status(400).json({
          error: 'Cannot delete genre with associated games',
          gamesCount
        });
        return;
      }

      await genre.destroy();
      res.json({ message: 'Genre deleted successfully' });
    } catch (error) {
      console.error('Error deleting genre:', error);
      res.status(500).json({ error: 'Failed to delete genre' });
    }
  }
};

export default genreController;