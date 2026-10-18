import express, { Router } from 'express';
import reviewController from '../controllers/reviewController';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - game_id
 *         - rating
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the review
 *         game_id:
 *           type: integer
 *           description: ID of the game being reviewed
 *         user_id:
 *           type: integer
 *           description: ID of the user who wrote the review
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 10
 *           description: Rating score (0-10)
 *         review_text:
 *           type: string
 *           description: Review text content
 *         review_date:
 *           type: string
 *           format: date-time
 *           description: Date when review was created
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Returns list of all reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: game_id
 *         schema:
 *           type: integer
 *         description: Filter by game ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: min_rating
 *         schema:
 *           type: number
 *         description: Minimum rating score
 *       - in: query
 *         name: max_rating
 *         schema:
 *           type: number
 *         description: Maximum rating score
 *     responses:
 *       200:
 *         description: The list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/', reviewController.getAllReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The review ID
 *     responses:
 *       200:
 *         description: The review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 */
router.get('/:id', reviewController.getReviewById);

export default router;