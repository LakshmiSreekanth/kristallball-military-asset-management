import { Router } from 'express';
import { getDashboardMetrics, getBases, getEquipmentTypes, getAuditLogs } from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', enforceBaseScope, getDashboardMetrics);
router.get('/bases', getBases);
router.get('/equipment-types', getEquipmentTypes);
router.get('/audit-logs', enforceBaseScope, getAuditLogs);

export default router;
