import express, { Request, Response, Router } from 'express';
import gameRoutes from './gameRoutes';
import companyRoutes from './companyRoutes';
import genreRoutes from './genreRoutes';
import reviewRoutes from './reviewRoutes';
import userRoutes from './userRoutes';
import rootController from '../controllers/rootController';

const router: Router = express.Router();

// API root endpoint with HATEOAS
router.get('/', rootController.getApiRoot);

// Route registration
router.use('/games', gameRoutes);
router.use('/companies', companyRoutes);
router.use('/genres', genreRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);

export default router;