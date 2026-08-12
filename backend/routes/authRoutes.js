import { Router } from 'express';
import { login, getProfile, getUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), getUsers);

export default router;
