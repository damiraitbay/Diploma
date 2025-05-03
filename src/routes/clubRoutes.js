import { Router } from 'express';
import {
    getAllClubs,
    getClubById,
    getUserClub,
    updateClub
} from '../controllers/clubController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllClubs);
router.get('/my-club', authenticate, authorize(['head_admin']), getUserClub);
router.get('/:id', getClubById);
router.put('/:id', authenticate, authorize(['head_admin']), updateClub);

export default router;