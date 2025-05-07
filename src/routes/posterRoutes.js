import { Router } from 'express';
import multer from 'multer';
import {
    createPoster,
    getAllPosters,
    getPosterById,
    getPostersByClubId,
    getUserPosters,
    updatePoster,
    deletePoster
} from '../controllers/posterController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const upload = multer();

/**
 * @swagger
 * /api/posters:
 *   post:
 *     summary: Create a new poster (head admin only)
 *     tags: [Posters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - eventTitle
 *               - eventDate
 *               - location
 *               - time
 *               - description
 *               - seats
 *               - price
 *             properties:
 *               eventId:
 *                 type: integer
 *               eventTitle:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               time:
 *                 type: string
 *               description:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Poster created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize(['head_admin']), upload.single('image'), createPoster);

/**
 * @swagger
 * /api/posters:
 *   get:
 *     summary: Get all posters
 *     tags: [Posters]
 *     responses:
 *       200:
 *         description: List of posters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poster'
 */
router.get('/', getAllPosters);

/**
 * @swagger
 * /api/posters/{id}:
 *   get:
 *     summary: Get a specific poster
 *     tags: [Posters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Poster details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poster'
 *       404:
 *         description: Poster not found
 */
router.get('/:id', getPosterById);

/**
 * @swagger
 * /api/posters/club/{clubId}:
 *   get:
 *     summary: Get all posters for a specific club
 *     tags: [Posters]
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of club posters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poster'
 *       404:
 *         description: Club not found
 */
router.get('/club/:clubId', getPostersByClubId);

/**
 * @swagger
 * /api/posters/my-posters:
 *   get:
 *     summary: Get all posters created by the current user (head admin only)
 *     tags: [Posters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's posters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poster'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/my-posters', authenticate, authorize(['head_admin']), getUserPosters);

/**
 * @swagger
 * /api/posters/{id}:
 *   put:
 *     summary: Update a poster (head admin only)
 *     tags: [Posters]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               eventTitle:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *               time:
 *                 type: string
 *               description:
 *                 type: string
 *               seats:
 *                 type: integer
 *               price:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Poster updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Poster not found
 */
router.put('/:id', authenticate, authorize(['head_admin']), upload.single('image'), updatePoster);

/**
 * @swagger
 * /api/posters/{id}:
 *   delete:
 *     summary: Delete a poster (head admin only)
 *     tags: [Posters]
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
 *         description: Poster deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Poster not found
 */
router.delete('/:id', authenticate, authorize(['head_admin']), deletePoster);

export default router;