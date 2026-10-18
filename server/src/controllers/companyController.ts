import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ParsedQs } from 'qs';
import { Company, Game } from '../models';
import { CompanyAttributes } from '../types';
import HATEOASBuilder, { HATEOASCollection, HATEOASResource } from '../utils/hateoas';

interface CompanyQueryParams extends ParsedQs {
  type?: 'Developer' | 'Publisher';
  country?: string;
  search?: string;
}

const companyController = {
  // Get all companies
  async getAllCompanies(req: Request<{}, HATEOASCollection<CompanyAttributes>, {}, CompanyQueryParams>, res: Response<HATEOASCollection<CompanyAttributes> | { error: string }>): Promise<void> {
    try {
      const { type, country, search } = req.query;
      const where: any = {};

      if (type) where.company_type = type;
      if (country) where.country = country;
      if (search) where.name = { [Op.iLike]: `%${search}%` };

      const companies = await Company.findAll({
        where,
        order: [['name', 'ASC']]
      });

      const hateoas = new HATEOASBuilder(req);

      res.json({
        data: companies.map(company => company.toJSON()),
        _links: hateoas.companiesCollectionLinks()
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  },

  // Get company by ID
  async getCompanyById(req: Request<{ id: string }>, res: Response<HATEOASResource<CompanyAttributes> | { error: string }>): Promise<void> {
    try {
      const company = await Company.findByPk(req.params.id, {
        include: [
          { model: Game, as: 'developedGames' },
          { model: Game, as: 'publishedGames' }
        ]
      });

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      const hateoas = new HATEOASBuilder(req);
      const companyData = company.toJSON();

      res.json({
        data: companyData,
        _links: hateoas.companyLinks(company.id!, companyData.company_type),
        _embedded: {
          developedGames: companyData.developedGames || [],
          publishedGames: companyData.publishedGames || []
        }
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  },

  // Create new company
  async createCompany(req: Request<{}, HATEOASResource<CompanyAttributes>, CompanyAttributes>, res: Response<HATEOASResource<CompanyAttributes> | { error: string }>): Promise<void> {
    try {
      const company = await Company.create(req.body);

      const hateoas = new HATEOASBuilder(req);
      const companyData = company.toJSON();

      res.status(201).json({
        data: companyData,
        _links: hateoas.companyLinks(company.id!, companyData.company_type)
      });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(400).json({ error: 'Failed to create company' });
    }
  },

  // Update company
  async updateCompany(req: Request<{ id: string }, HATEOASResource<CompanyAttributes>, Partial<CompanyAttributes>>, res: Response<HATEOASResource<CompanyAttributes> | { error: string }>): Promise<void> {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      await company.update(req.body);

      const hateoas = new HATEOASBuilder(req);
      const companyData = company.toJSON();

      res.json({
        data: companyData,
        _links: hateoas.companyLinks(company.id!, companyData.company_type)
      });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(400).json({ error: 'Failed to update company' });
    }
  },

  // Delete company
  async deleteCompany(req: Request<{ id: string }>, res: Response<{ message: string } | { error: string }>): Promise<void> {
    try {
      const company = await Company.findByPk(req.params.id);
      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      await company.destroy();
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('Error deleting company:', error);
      res.status(500).json({ error: 'Failed to delete company' });
    }
  }
};

export default companyController;