import { Router } from 'express';
import { getTransfers, createTransfer, getStockLevels } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', enforceBaseScope, getTransfers);
router.get('/stock', enforceBaseScope, getStockLevels);
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createTransfer);

export default router;
