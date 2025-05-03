import { Router } from 'express';
import {
    bookTicket,
    getUserTickets,
    getPendingTickets,
    approveTicket,
    rejectTicket,
    getUserCalendar
} from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, bookTicket);
router.get('/', authenticate, getUserTickets);
router.get('/pending', authenticate, authorize(['head_admin']), getPendingTickets);
router.get('/calendar', authenticate, getUserCalendar);
router.put('/:id/approve', authenticate, authorize(['head_admin']), approveTicket);
router.put('/:id/reject', authenticate, authorize(['head_admin']), rejectTicket);

export default router;