import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import {
	authenticateJwt,
	authorizeAdminOrSelf,
	authorizeRoles,
} from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
	createUserSchema,
	idParamSchema,
	updateUserSchema,
} from '../validators/user.validators';

/**
 * User route registrations.
 *
 * Applies JWT auth for all endpoints and combines role-based checks with
 * request validation before delegating to UserController.
 */
export const usersRouter = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a user (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: Created
 *       409:
 *         description: Email already exists
 */

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 */

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by id (admin or self)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update user (admin or self)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: User not found
 *       409:
 *         description: Email conflict
 */

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete user (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: User not found
 */
usersRouter.use(authenticateJwt);
usersRouter.post('/', authorizeRoles('admin'), validate({ body: createUserSchema }), asyncHandler(UserController.create));
usersRouter.get('/', authorizeRoles('admin'), asyncHandler(UserController.list));
usersRouter.get('/:id', validate({ params: idParamSchema }), authorizeAdminOrSelf, asyncHandler(UserController.getById));
usersRouter.put(
	'/:id',
	validate({ params: idParamSchema, body: updateUserSchema }),
	authorizeAdminOrSelf,
	asyncHandler(UserController.update),
);
usersRouter.delete('/:id', validate({ params: idParamSchema }), authorizeRoles('admin'), asyncHandler(UserController.delete));
