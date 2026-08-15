import { Router } from 'express';
import * as auditLogController from './auditLog.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';
import { UserRole } from '../users/user.types';

const router = Router();

// Only ADMIN users are authorized to view system audit logs
router.use(authenticate, authorizeRoles(UserRole.ADMIN));

router.get('/', auditLogController.getAuditLogs);

export default router;
