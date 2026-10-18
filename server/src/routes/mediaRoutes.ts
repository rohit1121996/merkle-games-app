import express, { Router } from 'express';
import mediaController from '../controllers/mediaController';

const router: Router = express.Router();

/**
 * @swagger
 * /media/{seed}:
 *   get:
 *     summary: Generate a deterministic pattern image
 *     description: Creates a unique visual pattern based on the provided seed. The same seed will always produce the same image.
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: seed
 *         schema:
 *           type: string
 *         required: true
 *         description: Seed string for pattern generation (e.g., MD5 hash, game ID, etc.)
 *       - in: query
 *         name: w
 *         schema:
 *           type: integer
 *           default: 400
 *           minimum: 10
 *           maximum: 2000
 *         description: Width in pixels (default 400)
 *       - in: query
 *         name: h
 *         schema:
 *           type: integer
 *           default: 400
 *           minimum: 10
 *           maximum: 2000
 *         description: Height in pixels (default 400)
 *     responses:
 *       200:
 *         description: WebP image
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid dimensions
 *       500:
 *         description: Failed to generate image
 */
router.get('/:seed', mediaController.generatePattern);

export default router;
