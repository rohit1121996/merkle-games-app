import { GraphQLContext } from '../../types';

const userResolvers = {
  Query: {
    users: async (_: any, args: any, { db }: GraphQLContext) => {
      const { limit = 100 } = args;
      return await db.User.findAll({
        limit: Math.min(limit, 1000)
      });
    },
    user: async (_: any, { id }: { id: string }, { db }: GraphQLContext) => {
      return await db.User.findByPk(id);
    }
  },

  User: {
    reviews: async (user: any, _: any, { db }: GraphQLContext) => {
      return await user.getReviews();
    }
  }
};

export default userResolvers;