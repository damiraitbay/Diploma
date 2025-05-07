import { Router } from 'express';
import multer from 'multer';
import {
    createTicketBooking,
    getTicketBookingById,
    getUserTicketBookings,
    updateTicketStatus,
    deleteTicketBooking
} from '../controllers/ticketController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const upload = multer();

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Book a ticket for an event
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - posterId
 *               - numberOfPersons
 *             properties:
 *               posterId:
 *                 type: integer
 *               numberOfPersons:
 *                 type: integer
 *               paymentProof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Ticket booked successfully
 *       400:
 *         description: Invalid input or not enough seats available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Poster not found
 */
router.post('/', authenticate, upload.single('paymentProof'), createTicketBooking);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get a specific ticket booking
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketBooking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket booking not found
 */
router.get('/:id', authenticate, getTicketBookingById);

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get all ticket bookings for the current user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's ticket bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketBooking'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-tickets', authenticate, getUserTicketBookings);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   put:
 *     summary: Update ticket booking status (head admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket booking not found
 */
router.put('/:id/status', authenticate, authorize(['head_admin']), updateTicketStatus);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket booking
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket booking not found
 */
router.delete('/:id', authenticate, deleteTicketBooking);

export default router;