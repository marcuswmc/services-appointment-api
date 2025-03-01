import { Router } from 'express';
import UserController from '../controllers/userController.js';
import { check } from 'express-validator';
import { checkRole } from '../middlewares/authMiddleware.js';

const router: Router = Router();

// Get all users
router.get('/users', checkRole(['ADMIN']), UserController.getAll);

// Get user by ID
router.get('/users/:id', checkRole(['ADMIN']), UserController.getOne);

// Register a new user
router.post(
  '/register',
  [
    check('name').notEmpty().withMessage('User name is required.'),
    check('email').isEmail().withMessage('Invalid email format'),
    check('password').isStrongPassword(),
    check('role').isIn(['USER', 'ADMIN']).withMessage('Invalid role'),
  ],
  UserController.register,
);

// Login user
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Invalid email format'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  UserController.login,
);

// Update an existing user
router.put('/users/:id', checkRole(['ADMIN']), UserController.update);

// Delete an existing user
router.delete('/users/:id', checkRole(['ADMIN']), UserController.delete);

export default router;
