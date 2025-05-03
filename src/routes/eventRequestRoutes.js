import { Router } from 'express';
import {
    createEventRequest,
    getAllEventRequests,
    getEventRequestById,
    approveEventRequest,
    rejectEventRequest,
    getUserEventRequests
} from '../controllers/eventRequestController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, authorize(['head_admin']), createEventRequest);
router.get('/', authenticate, authorize(['super_admin']), getAllEventRequests);
router.get('/my-requests', authenticate, authorize(['head_admin']), getUserEventRequests);
router.get('/:id', authenticate, getEventRequestById);
router.put('/:id/approve', authenticate, authorize(['super_admin']), approveEventRequest);
router.put('/:id/reject', authenticate, authorize(['super_admin']), rejectEventRequest);

export default router;