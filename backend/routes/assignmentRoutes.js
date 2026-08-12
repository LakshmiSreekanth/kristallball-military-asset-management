import { Router } from 'express';
import {
  getAssignments, createAssignment,
  getExpenditures, createExpenditure
} from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/assignments', enforceBaseScope, getAssignments);
router.post('/assignments', authorizeRoles('ADMIN', 'BASE_COMMANDER'), enforceBaseScope, createAssignment);
router.get('/expenditures', enforceBaseScope, getExpenditures);
router.post('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER'), enforceBaseScope, createExpenditure);

export default router;
