import { Router } from 'express';
import { joi } from '../middlewares/validate.middleware';
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
 * Registro de rutas de usuarios.
 *
 * Aplica auth JWT en todos los endpoints y combina validaciones por rol con
 * validacion de requests antes de delegar en UserController.
 */
export const usersRouter = Router();

const noQuerySchema = joi.object({});

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Crear un usuario (admin)
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
 *         description: Creado
 *       409:
 *         description: El email ya existe
 */

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Listar usuarios (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por id (admin o propio)
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
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario (admin o propio)
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
 *         description: Actualizado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Conflicto de email
 */

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario (admin)
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
 *         description: Eliminado
 *       404:
 *         description: Usuario no encontrado
 */
usersRouter.use(authenticateJwt);
usersRouter.post('/', authorizeRoles('admin'), validate({ body: createUserSchema, query: noQuerySchema }), asyncHandler(UserController.create));
usersRouter.get('/', authorizeRoles('admin'), validate({ query: noQuerySchema }), asyncHandler(UserController.list));
usersRouter.get('/:id', validate({ params: idParamSchema, query: noQuerySchema }), authorizeAdminOrSelf, asyncHandler(UserController.getById));
usersRouter.put(
	'/:id',
	validate({ params: idParamSchema, body: updateUserSchema, query: noQuerySchema }),
	authorizeAdminOrSelf,
	asyncHandler(UserController.update),
);
usersRouter.delete('/:id', validate({ params: idParamSchema, query: noQuerySchema }), authorizeRoles('admin'), asyncHandler(UserController.delete));

