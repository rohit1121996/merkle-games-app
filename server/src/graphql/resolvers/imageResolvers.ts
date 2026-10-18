import { GraphQLContext, ImageQueryArgs } from '../../types';

const imageResolvers = {
  Query: {
    images: async (_: any, args: ImageQueryArgs, { db }: GraphQLContext) => {
      const { relatedType, relatedId } = args;

      if (relatedType && relatedId) {
        const relations = await db.ImageRelation.findAll({
          where: {
            related_type: relatedType,
            related_id: relatedId
          },
          include: [{ model: db.Image, as: 'image' }]
        });
        return relations.map((rel: any) => rel.image);
      }

      return await db.Image.findAll();
    },

    image: async (_: any, { id }: { id: string }, { db }: GraphQLContext) => {
      return await db.Image.findByPk(id);
    }
  },

  Image: {
    relations: async (image: any, _: any, { db }: GraphQLContext) => {
      return await db.ImageRelation.findAll({
        where: { image_id: image.id }
      });
    }
  },

  ImageRelation: {
    image: async (relation: any, _: any, { db }: GraphQLContext) => {
      return await db.Image.findByPk(relation.image_id);
    }
  }
};

export default imageResolvers;