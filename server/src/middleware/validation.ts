import { Request, Response, NextFunction } from 'express';

export const validateGameInput = (req: Request, res: Response, next: NextFunction): void => {
  const { title, genre_id } = req.body;

  if (!title || !genre_id) {
    res.status(400).json({
      error: 'Title and genre_id are required fields'
    });
    return;
  }

  next();
};

export const validateReviewInput = (req: Request, res: Response, next: NextFunction): void => {
  const { game_id, rating } = req.body;

  if (!game_id || rating === undefined) {
    res.status(400).json({
      error: 'game_id and rating are required fields'
    });
    return;
  }

  if (rating < 0 || rating > 10) {
    res.status(400).json({
      error: 'rating must be between 0 and 10'
    });
    return;
  }

  next();
};

export const validatePaginationParams = (req: Request, res: Response, next: NextFunction): void => {
  const page = parseInt(String(req.query.page)) || 1;
  const limit = parseInt(String(req.query.limit)) || 10;

  if (page < 1 || limit < 1 || limit > 100) {
    res.status(400).json({
      error: 'Invalid pagination parameters'
    });
    return;
  }

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
};