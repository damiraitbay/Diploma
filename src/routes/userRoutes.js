import { Router } from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUserById,
    getAllUsers,
    updateUserRole,
    searchUsers,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getLikedPosts
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.get('/search', searchUsers);
router.get('/:id', authenticate, authorize(['super_admin']), getUserById);
router.get('/', authenticate, authorize(['super_admin']), getAllUsers);
router.put('/:id/role', authenticate, authorize(['super_admin']), updateUserRole);

// Following routes
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/unfollow', authenticate, unfollowUser);
router.get('/followers', authenticate, getFollowers);
router.get('/following', authenticate, getFollowing);
router.get('/liked-posts', authenticate, getLikedPosts);

export default router;