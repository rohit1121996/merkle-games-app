import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ParsedQs } from 'qs';
import { UserReview, User, Game, Genre } from '../models';
import { UserReviewAttributes, AuthenticatedUser } from '../types';
import HATEOASBuilder, { HATEOASCollection, HATEOASResource } from '../utils/hateoas';

interface ReviewQueryParams extends ParsedQs {
  game_id?: string;
  user_id?: string;
  min_rating?: string;
  max_rating?: string;
}

interface ReviewCreateRequest {
  game_id: number;
  rating: number;
  review_text?: string;
}

interface ReviewUpdateRequest {
  rating?: number;
  review_text?: string;
}

const reviewController = {
  // Get all reviews
  async getAllReviews(req: Request<{}, HATEOASCollection<UserReviewAttributes>, {}, ReviewQueryParams>, res: Response<HATEOASCollection<UserReviewAttributes> | { error: string }>): Promise<void> {
    try {
      const { game_id, user_id, min_rating, max_rating } = req.query;
      const where: any = {};

      if (game_id) where.game_id = game_id;
      if (user_id) where.user_id = user_id;
      if (min_rating) where.rating = { ...where.rating, [Op.gte]: min_rating };
      if (max_rating) where.rating = { ...where.rating, [Op.lte]: max_rating };

      const reviews = await UserReview.findAll({
        where,
        include: [
          {
            model: Game,
            as: 'game',
            attributes: ['id', 'title'],
            include: [{ model: Genre, as: 'genre', attributes: ['id', 'name'] }]
          },
          { model: User, as: 'user', attributes: ['id', 'username'] }
        ],
        order: [['review_date', 'DESC']]
      });

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: reviews.map(review => review.toJSON()),
        _links: hateoas.reviewsCollectionLinks()
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  },

  // Get review by ID
  async getReviewById(req: Request<{ id: string }>, res: Response<HATEOASResource<UserReviewAttributes> | { error: string }>): Promise<void> {
    try {
      const review = await UserReview.findByPk(req.params.id, {
        include: [
          { model: Game, as: 'game' },
          { model: User, as: 'user', attributes: { exclude: ['password'] } }
        ]
      });

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      const hateoas = new HATEOASBuilder(req);
      const reviewData = review.toJSON();

      res.json({
        data: reviewData,
        _links: hateoas.reviewLinks(review.id!, reviewData.game_id, reviewData.user_id),
        _embedded: {
          game: reviewData.game,
          user: reviewData.user
        }
      });
    } catch (error) {
      console.error('Error fetching review:', error);
      res.status(500).json({ error: 'Failed to fetch review' });
    }
  },

  // Create new review
  async createReview(req: Request<{}, HATEOASResource<UserReviewAttributes>, ReviewCreateRequest>, res: Response<HATEOASResource<UserReviewAttributes> | { error: string }>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Check if user already reviewed this game
      const existingReview = await UserReview.findOne({
        where: {
          user_id: req.user.id,
          game_id: req.body.game_id
        }
      });

      if (existingReview) {
        res.status(400).json({ error: 'You have already reviewed this game' });
        return;
      }

      const review = await UserReview.create({
        ...req.body,
        user_id: req.user.id,
        review_date: new Date()
      });

      const createdReview = await UserReview.findByPk(review.id, {
        include: [
          { model: Game, as: 'game' },
          { model: User, as: 'user', attributes: { exclude: ['password'] } }
        ]
      });

      const hateoas = new HATEOASBuilder(req);
      const reviewData = createdReview!.toJSON();

      res.status(201).json({
        data: reviewData,
        _links: hateoas.reviewLinks(review.id!, reviewData.game_id, reviewData.user_id),
        _embedded: {
          game: reviewData.game,
          user: reviewData.user
        }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(400).json({ error: 'Failed to create review' });
    }
  },

  // Update review
  async updateReview(req: Request<{ id: string }, HATEOASResource<UserReviewAttributes>, ReviewUpdateRequest>, res: Response<HATEOASResource<UserReviewAttributes> | { error: string }>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const review = await UserReview.findByPk(req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      // Check if user owns this review
      if (review.user_id !== req.user.id) {
        res.status(403).json({ error: 'You can only edit your own reviews' });
        return;
      }

      await review.update({
        rating: req.body.rating,
        review_text: req.body.review_text
      });

      const updatedReview = await UserReview.findByPk(review.id, {
        include: [
          { model: Game, as: 'game' },
          { model: User, as: 'user', attributes: { exclude: ['password'] } }
        ]
      });

      const hateoas = new HATEOASBuilder(req);
      const reviewData = updatedReview!.toJSON();

      res.json({
        data: reviewData,
        _links: hateoas.reviewLinks(review.id!, reviewData.game_id, reviewData.user_id),
        _embedded: {
          game: reviewData.game,
          user: reviewData.user
        }
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(400).json({ error: 'Failed to update review' });
    }
  },

  // Delete review
  async deleteReview(req: Request<{ id: string }>, res: Response<{ message: string } | { error: string }>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const review = await UserReview.findByPk(req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      // Check if user owns this review
      if (review.user_id !== req.user.id) {
        res.status(403).json({ error: 'You can only delete your own reviews' });
        return;
      }

      await review.destroy();
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  },

  // Get user's reviews
  async getUserReviews(req: Request, res: Response<HATEOASCollection<UserReviewAttributes> | { error: string }>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const reviews = await UserReview.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: Game, as: 'game' }
        ],
        order: [['review_date', 'DESC']]
      });

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: reviews.map(review => review.toJSON()),
        _links: hateoas.reviewsCollectionLinks()
      });
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
  }
};

export default reviewController;