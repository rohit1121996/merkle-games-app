import express, { Router } from 'express';
import userController from '../controllers/userController';

const router: Router = express.Router();

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/reviews', userController.getUserReviews);

export default router;