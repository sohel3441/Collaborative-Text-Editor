import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/authMiddleware.js';
import { shareDocument, revokeAccess, listSharedUsers } from '../controllers/documentShareController.js';
import { canAccessDocument } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

// must be authenticated
router.use(authMiddleware);

// owner-only routes
router.post('/:id/share', authorizeRoles('owner'), shareDocument);
router.delete('/:id/revoke', authorizeRoles('owner'), revokeAccess);

// any user with access can list shared users
router.get('/:id/shared', canAccessDocument(['viewer', 'editor', 'owner']), listSharedUsers);

export default router;
