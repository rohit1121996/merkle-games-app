import { Op } from 'sequelize';
import { GraphQLContext, CompanyQueryArgs } from '../../types';

const companyResolvers = {
  Query: {
    companies: async (_: any, args: CompanyQueryArgs, { db }: GraphQLContext): Promise<any[]> => {
      const { type, country, search } = args;
      const where: any = {};

      if (type) where.company_type = type;
      if (country) where.country = country;
      if (search) where.name = { [Op.iLike]: `%${search}%` };

      return await db.Company.findAll({
        where,
        order: [['name', 'ASC']]
      });
    },

    company: async (_: any, { id }: { id: string }, { db }: GraphQLContext): Promise<any> => {
      return await db.Company.findByPk(id);
    }
  },

  Company: {
    companyType: (company: any): string => {
      return company.company_type;
    },
    company_type: (company: any): string => {
      return company.company_type;
    },
    founded_year: (company: any): number => company.founded_year,
    developedGames: async (company: any, _: any, { db }: GraphQLContext): Promise<any[]> => {
      return await db.Game.findAll({
        where: { developer_id: company.id }
      });
    },
    publishedGames: async (company: any, _: any, { db }: GraphQLContext): Promise<any[]> => {
      return await db.Game.findAll({
        where: { publisher_id: company.id }
      });
    }
  }
};

export default companyResolvers;