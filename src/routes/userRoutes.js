import { Router } from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUserById,
    getAllUsers,
    updateUserRole,
    searchUsers
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.get('/search', searchUsers);
router.get('/:id', authenticate, authorize(['super_admin']), getUserById);
router.get('/', authenticate, authorize(['super_admin']), getAllUsers);
router.put('/:id/role', authenticate, authorize(['super_admin']), updateUserRole);

export default router;