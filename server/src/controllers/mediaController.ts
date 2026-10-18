import { Request, Response } from 'express';
import sharp from 'sharp';
import { generatePatternBuffer } from '../utils/patternGenerator';

interface MediaQueryParams {
  w?: string;
  h?: string;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 400;
const MAX_DIMENSION = 2000;
const MIN_DIMENSION = 10;

const mediaController = {
  /**
   * Generate a deterministic pattern image based on seed
   * GET /media/:seed?w=400&h=400
   */
  async generatePattern(
    req: Request<{ seed: string }, Buffer, {}, MediaQueryParams>,
    res: Response
  ): Promise<void> {
    try {
      const { seed } = req.params;
      const { w, h } = req.query;

      // Parse dimensions - if only one is given, make it square (1:1 aspect ratio)
      const parsedW = w ? parseInt(w, 10) : null;
      const parsedH = h ? parseInt(h, 10) : null;

      let width: number;
      let height: number;

      if (parsedW !== null && parsedH !== null) {
        // Both provided
        width = parsedW;
        height = parsedH;
      } else if (parsedW !== null) {
        // Only width provided - make square
        width = parsedW;
        height = parsedW;
      } else if (parsedH !== null) {
        // Only height provided - make square
        width = parsedH;
        height = parsedH;
      } else {
        // Neither provided - use defaults
        width = DEFAULT_WIDTH;
        height = DEFAULT_HEIGHT;
      }

      // Validate dimensions
      if (isNaN(width) || isNaN(height)) {
        res.status(400).json({ error: 'Invalid dimensions. Width and height must be numbers.' });
        return;
      }

      // Clamp dimensions
      width = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, width));
      height = Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, height));

      // Generate deterministic pattern
      const rawBuffer = generatePatternBuffer({ width, height, seed });

      // Convert to WebP using sharp
      const webpBuffer = await sharp(rawBuffer, {
        raw: {
          width,
          height,
          channels: 3
        }
      })
        .webp({ quality: 80 })
        .toBuffer();

      // Set cache headers (patterns are deterministic, so they can be cached indefinitely)
      res.set({
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${seed}-${width}x${height}"`
      });

      res.send(webpBuffer);
    } catch (error) {
      console.error('Error generating pattern:', error);
      res.status(500).json({ error: 'Failed to generate pattern image' });
    }
  }
};

export default mediaController;
