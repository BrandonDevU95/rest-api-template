import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { authenticateJwt, authorizeRoles } from '../middlewares/auth.middleware';

export const usersRouter = Router();

usersRouter.use(authenticateJwt);
usersRouter.get('/', authorizeRoles('admin'), asyncHandler(UserController.list));
usersRouter.delete('/:id', authorizeRoles('admin'), asyncHandler(UserController.delete));
