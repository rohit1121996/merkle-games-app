import { Op } from 'sequelize';
import { GraphQLContext, ReviewQueryArgs } from '../../types';

const reviewResolvers = {
  Query: {
    reviews: async (_: any, args: ReviewQueryArgs, { db }: GraphQLContext): Promise<any[]> => {
      const { gameId, userId, minRating, maxRating, limit = 100 } = args;
      const where: any = {};

      if (gameId) where.game_id = gameId;
      if (userId) where.user_id = userId;
      if (minRating) where.rating_score = { ...where.rating_score, [Op.gte]: minRating };
      if (maxRating) where.rating_score = { ...where.rating_score, [Op.lte]: maxRating };

      return await db.UserReview.findAll({
        where,
        order: [['review_date', 'DESC']],
        limit: Math.min(limit, 1000)
      });
    },

    review: async (_: any, { id }: { id: string }, { db }: GraphQLContext): Promise<any> => {
      return await db.UserReview.findByPk(id);
    }
  },

  Review: {
    game: async (review: any, _: any, { db }: GraphQLContext): Promise<any> => {
      return await db.Game.findByPk(review.game_id);
    },
    user: async (review: any, _: any, { db }: GraphQLContext): Promise<any> => {
      return await db.User.findByPk(review.user_id, {
        attributes: { exclude: ['password'] }
      });
    },
    rating: (review: any): number => {
      const rating = parseFloat(review.rating);
      return isNaN(rating) ? 0 : rating;
    },
    ratingScore: (review: any): number => {
      const rating = parseFloat(review.rating);
      return isNaN(rating) ? 0 : rating;
    },
    reviewText: (review: any): string => review.review_text,
    review_text: (review: any): string => review.review_text,
    review_date: (review: any): string => review.review_date
  }
};

export default reviewResolvers;