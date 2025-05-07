import { eq } from 'drizzle-orm';
import db from '../db.js';
import { posters, events, clubs, users } from '../models/schema.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @swagger
 * /api/posters:
 *   post:
 *     summary: Create a new poster (head admin only)
 *     tags: [Posters 🪧]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *     responses:
 *       201:
 *         description: Poster created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized
 */
export const createPoster = async(req, res) => {
    try {
        if (req.user.role !== 'head_admin') {
            return res.status(403).json({ message: 'Only head admins can create posters' });
        }

        const userId = req.user.id;
        let imagePath = null;

        if (req.file) {
            const uploadDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = path.extname(req.file.originalname);
            const fileName = `poster-${uniqueSuffix}${fileExtension}`;
            imagePath = `/uploads/${fileName}`;

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);
        }

        const {
            eventId,
            eventTitle,
            eventDate,
            location,
            time,
            description,
            seats,
            price
        } = req.body;

        const event = await db.select().from(events).where(eq(events.id, eventId)).get();

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.headId !== userId) {
            return res.status(403).json({ message: 'You can only create posters for your own events' });
        }

        await db.insert(posters).values({
            eventId,
            clubId: event.clubId,
            headId: userId,
            eventTitle,
            eventDate,
            location,
            time,
            description,
            seats,
            seatsLeft: seats,
            price,
            image: imagePath
        }).run();

        return res.status(201).json({ message: 'Poster created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/posters:
 *   get:
 *     summary: Get all posters
 *     tags: [Posters 🪧]
 *     responses:
 *       200:
 *         description: List of posters
 */
export const getAllPosters = async(req, res) => {
    try {
        const allPosters = await db.select({
                id: posters.id,
                eventId: posters.eventId,
                clubId: posters.clubId,
                headId: posters.headId,
                eventTitle: posters.eventTitle,
                eventDate: posters.eventDate,
                location: posters.location,
                time: posters.time,
                description: posters.description,
                seats: posters.seats,
                seatsLeft: posters.seatsLeft,
                price: posters.price,
                image: posters.image,
                createdAt: posters.createdAt,
                club: {
                    id: clubs.id,
                    name: clubs.name
                }
            })
            .from(posters)
            .leftJoin(clubs, eq(posters.clubId, clubs.id))
            .all();

        // Add full URLs for images
        const protocol = req.protocol;
        const host = req.get('host');
        allPosters.forEach(poster => {
            if (poster.image) {
                poster.image = `${protocol}://${host}${poster.image}`;
            }
        });

        return res.status(200).json(allPosters);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/posters/{id}:
 *   get:
 *     summary: Get a specific poster
 *     tags: [Posters 🪧]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Poster details
 *       404:
 *         description: Poster not found
 */
export const getPosterById = async(req, res) => {
    try {
        const posterId = req.params.id;

        const poster = await db.select({
                id: posters.id,
                eventId: posters.eventId,
                clubId: posters.clubId,
                headId: posters.headId,
                eventTitle: posters.eventTitle,
                eventDate: posters.eventDate,
                location: posters.location,
                time: posters.time,
                description: posters.description,
                seats: posters.seats,
                seatsLeft: posters.seatsLeft,
                price: posters.price,
                image: posters.image,
                createdAt: posters.createdAt,
                club: {
                    id: clubs.id,
                    name: clubs.name
                }
            })
            .from(posters)
            .leftJoin(clubs, eq(posters.clubId, clubs.id))
            .where(eq(posters.id, posterId))
            .get();

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        // Add full URL for image
        if (poster.image) {
            const protocol = req.protocol;
            const host = req.get('host');
            poster.image = `${protocol}://${host}${poster.image}`;
        }

        return res.status(200).json(poster);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/posters/club/{clubId}:
 *   get:
 *     summary: Get all posters for a specific club
 *     tags: [Posters 🪧]
 *     parameters:
 *       - in: path
 *         name: clubId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of club posters
 */
export const getPostersByClubId = async(req, res) => {
    try {
        const clubId = req.params.clubId;

        const clubPosters = await db.select({
                id: posters.id,
                eventId: posters.eventId,
                clubId: posters.clubId,
                headId: posters.headId,
                eventTitle: posters.eventTitle,
                eventDate: posters.eventDate,
                location: posters.location,
                time: posters.time,
                description: posters.description,
                seats: posters.seats,
                seatsLeft: posters.seatsLeft,
                price: posters.price,
                image: posters.image,
                createdAt: posters.createdAt
            })
            .from(posters)
            .where(eq(posters.clubId, clubId))
            .all();

        // Add full URLs for images
        const protocol = req.protocol;
        const host = req.get('host');
        clubPosters.forEach(poster => {
            if (poster.image) {
                poster.image = `${protocol}://${host}${poster.image}`;
            }
        });

        return res.status(200).json(clubPosters);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/posters/my-posters:
 *   get:
 *     summary: Get all posters created by the current user (head admin only)
 *     tags: [Posters 🪧]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's posters
 *       403:
 *         description: Unauthorized
 */
export const getUserPosters = async(req, res) => {
    try {
        if (req.user.role !== 'head_admin') {
            return res.status(403).json({ message: 'Only head admins can view their posters' });
        }

        const userId = req.user.id;

        const userPosters = await db.select({
                id: posters.id,
                eventId: posters.eventId,
                clubId: posters.clubId,
                headId: posters.headId,
                eventTitle: posters.eventTitle,
                eventDate: posters.eventDate,
                location: posters.location,
                time: posters.time,
                description: posters.description,
                seats: posters.seats,
                seatsLeft: posters.seatsLeft,
                price: posters.price,
                image: posters.image,
                createdAt: posters.createdAt
            })
            .from(posters)
            .where(eq(posters.headId, userId))
            .all();

        // Add full URLs for images
        const protocol = req.protocol;
        const host = req.get('host');
        userPosters.forEach(poster => {
            if (poster.image) {
                poster.image = `${protocol}://${host}${poster.image}`;
            }
        });

        return res.status(200).json(userPosters);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/posters/{id}:
 *   put:
 *     summary: Update a poster (head admin only)
 *     tags: [Posters 🪧]
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
 *             properties:
 *               eventTitle:
 *                 type: string
 *               eventDate:
 *                 type: string
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
 *     responses:
 *       200:
 *         description: Poster updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Poster not found
 */
export const updatePoster = async(req, res) => {
    try {
        const posterId = req.params.id;
        const userId = req.user.id;

        const poster = await db.select().from(posters).where(eq(posters.id, posterId)).get();

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        if (req.user.role !== 'head_admin' || poster.headId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const {
            eventTitle,
            eventDate,
            location,
            time,
            description,
            seats,
            price
        } = req.body;

        let imagePath = poster.image;

        if (req.file) {
            // Delete old image if it exists
            if (poster.image) {
                const oldImagePath = path.join(__dirname, '../public', poster.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Save new image
            const uploadDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = path.extname(req.file.originalname);
            const fileName = `poster-${uniqueSuffix}${fileExtension}`;
            imagePath = `/uploads/${fileName}`;

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);
        }

        let seatsLeft = poster.seatsLeft;
        if (seats && seats !== poster.seats) {
            const seatsDifference = seats - poster.seats;
            seatsLeft = poster.seatsLeft + seatsDifference;
            if (seatsLeft < 0) seatsLeft = 0;
        }

        await db.update(posters)
            .set({
                eventTitle: eventTitle || poster.eventTitle,
                eventDate: eventDate || poster.eventDate,
                location: location || poster.location,
                time: time || poster.time,
                description: description || poster.description,
                seats: seats || poster.seats,
                seatsLeft: seatsLeft,
                price: price || poster.price,
                image: imagePath,
                updatedAt: new Date()
            })
            .where(eq(posters.id, posterId))
            .run();

        return res.status(200).json({ message: 'Poster updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deletePoster = async(req, res) => {
    try {
        const posterId = req.params.id;
        const userId = req.user.id;

        const poster = await db.select().from(posters).where(eq(posters.id, posterId)).get();

        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        if (req.user.role !== 'head_admin' || poster.headId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Delete image file if it exists
        if (poster.image) {
            const imagePath = path.join(__dirname, '../public', poster.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.delete(posters).where(eq(posters.id, posterId)).run();

        return res.status(200).json({ message: 'Poster deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}