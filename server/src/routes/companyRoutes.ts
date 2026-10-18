import express, { Router } from 'express';
import companyController from '../controllers/companyController';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - company_type
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the company
 *         name:
 *           type: string
 *           description: Company name
 *         country:
 *           type: string
 *           description: Country of origin
 *         founded_year:
 *           type: integer
 *           description: Year the company was founded
 *         logo:
 *           type: string
 *           description: URL to company logo
 *         company_type:
 *           type: string
 *           enum: [Developer, Publisher]
 *           description: Type of company
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Returns list of all companies
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Developer, Publisher]
 *         description: Filter by company type
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in company names
 *     responses:
 *       200:
 *         description: The list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 */
router.get('/', companyController.getAllCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get a company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The company ID
 *     responses:
 *       200:
 *         description: The company details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 */
router.get('/:id', companyController.getCompanyById);

export default router;