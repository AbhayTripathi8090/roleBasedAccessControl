import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
