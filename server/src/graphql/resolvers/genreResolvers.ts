import { GraphQLContext } from '../../types';

const genreResolvers = {
  Query: {
    genres: async (_: any, __: any, { db }: GraphQLContext): Promise<any[]> => {
      return await db.Genre.findAll({
        order: [['name', 'ASC']]
      });
    },

    genre: async (_: any, { id }: { id: string }, { db }: GraphQLContext): Promise<any> => {
      return await db.Genre.findByPk(id);
    }
  },

  Genre: {
    genreName: (genre: any): string => {
      return genre.name;
    },
    games: async (genre: any, _: any, { db }: GraphQLContext): Promise<any[]> => {
      return await db.Game.findAll({
        where: { genre_id: genre.id },
        limit: 20,
        order: [['release_date', 'DESC']]
      });
    }
  }
};

export default genreResolvers;