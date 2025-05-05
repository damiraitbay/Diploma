import { Router } from 'express';
import {
    getAllClubs,
    getClubById,
    getUserClub,
    updateClub,
    subscribeToClub,
    unsubscribeFromClub,
    getUserSubscriptions,
    searchClubs
} from '../controllers/clubController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllClubs);
router.get('/search', searchClubs);
router.get('/my-club', authenticate, authorize(['head_admin']), getUserClub);
router.get('/my-subscriptions', authenticate, getUserSubscriptions);
router.get('/:id', getClubById);
router.put('/:id', authenticate, authorize(['head_admin']), updateClub);
router.post('/:id/subscribe', authenticate, subscribeToClub);
router.delete('/:id/unsubscribe', authenticate, unsubscribeFromClub);

export default router;