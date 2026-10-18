import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ParsedQs } from 'qs';
import { User, UserReview, Game } from '../models';
import { UserAttributes } from '../types';
import HATEOASBuilder, { HATEOASCollection, HATEOASResource } from '../utils/hateoas';

interface UserQueryParams extends ParsedQs {
  search?: string;
}

const userController = {
  // Get all users
  async getAllUsers(req: Request<{}, HATEOASCollection<UserAttributes>, {}, UserQueryParams>, res: Response<HATEOASCollection<UserAttributes> | { error: string }>): Promise<void> {
    try {
      const { search } = req.query;
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const users = await User.findAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['username', 'ASC']]
      });

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: users.map(user => user.toJSON()),
        _links: hateoas.usersCollectionLinks()
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Get user by ID
  async getUserById(req: Request<{ id: string }>, res: Response<HATEOASResource<UserAttributes> | { error: string }>): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: UserReview,
            as: 'reviews',
            include: [{ model: Game, as: 'game', attributes: ['id', 'title'] }],
            limit: 10,
            order: [['review_date', 'DESC']]
          }
        ]
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const hateoas = new HATEOASBuilder(req);
      const userData = user.toJSON();

      res.json({
        data: userData,
        _links: hateoas.userLinks(user.id!),
        _embedded: {
          reviews: userData.reviews || []
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Get user reviews
  async getUserReviews(req: Request<{ id: string }>, res: Response<HATEOASCollection<any> | { error: string }>): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const reviews = await UserReview.findAll({
        where: { user_id: req.params.id },
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

export default userController;