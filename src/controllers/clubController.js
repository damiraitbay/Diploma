import { eq, like } from 'drizzle-orm';
import db from '../db.js';
import { clubs, users, clubSubscriptions } from '../models/schema.js';

/**
 * @swagger
 * /api/clubs:
 *   get:
 *     summary: Get all approved clubs
 *     tags: [Clubs 💃]
 *     responses:
 *       200:
 *         description: List of clubs
 */
export const getAllClubs = async(req, res) => {
    try {
        const allClubs = await db.select({
                id: clubs.id,
                name: clubs.name,
                goal: clubs.goal,
                description: clubs.description,
                rating: clubs.rating,
                createdAt: clubs.createdAt,
                head: {
                    id: users.id,
                    name: users.name,
                    surname: users.surname,
                }
            })
            .from(clubs)
            .leftJoin(users, eq(clubs.headId, users.id))
            .all();

        return res.status(200).json(allClubs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/clubs/{id}:
 *   get:
 *     summary: Get a specific club
 *     tags: [Clubs 💃]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Club details
 *       404:
 *         description: Club not found
 */
export const getClubById = async(req, res) => {
    try {
        const clubId = req.params.id;

        const club = await db.select({
                id: clubs.id,
                name: clubs.name,
                goal: clubs.goal,
                description: clubs.description,
                financing: clubs.financing,
                resources: clubs.resources,
                attractionMethods: clubs.attractionMethods,
                rating: clubs.rating,
                createdAt: clubs.createdAt,
                head: {
                    id: users.id,
                    name: users.name,
                    surname: users.surname,
                    email: users.email,
                }
            })
            .from(clubs)
            .leftJoin(users, eq(clubs.headId, users.id))
            .where(eq(clubs.id, clubId))
            .get();

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        return res.status(200).json(club);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/clubs/my-club:
 *   get:
 *     summary: Get the current user's club (head admin only)
 *     tags: [Clubs 💃]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's club details
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Club not found
 */
export const getUserClub = async(req, res) => {
    try {
        const userId = req.user.id;

        if (req.user.role !== 'head_admin') {
            return res.status(403).json({ message: 'Only head admins can access their club' });
        }

        const club = await db.select()
            .from(clubs)
            .where(eq(clubs.headId, userId))
            .get();

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        return res.status(200).json(club);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/clubs/{id}:
 *   put:
 *     summary: Update a club (head admin only)
 *     tags: [Clubs 💃]
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
 *               goal:
 *                 type: string
 *               description:
 *                 type: string
 *               financing:
 *                 type: string
 *               resources:
 *                 type: string
 *               attractionMethods:
 *                 type: string
 *     responses:
 *       200:
 *         description: Club updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Club not found
 */
export const updateClub = async(req, res) => {
    try {
        const clubId = req.params.id;
        const userId = req.user.id;

        const club = await db.select().from(clubs).where(eq(clubs.id, clubId)).get();

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (req.user.role !== 'head_admin' || club.headId !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const { goal, description, financing, resources, attractionMethods } = req.body;

        await db.update(clubs)
            .set({
                goal: goal || club.goal,
                description: description || club.description,
                financing: financing || club.financing,
                resources: resources || club.resources,
                attractionMethods: attractionMethods || club.attractionMethods,
                updatedAt: new Date()
            })
            .where(eq(clubs.id, clubId))
            .run();

        return res.status(200).json({ message: 'Club updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/clubs/{id}/subscribe:
 *   post:
 *     summary: Subscribe to a club
 *     tags: [Clubs 💃]
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
 *         description: Successfully subscribed to the club
 *       400:
 *         description: Already subscribed
 *       404:
 *         description: Club not found
 */
export const subscribeToClub = async(req, res) => {
    try {
        const clubId = req.params.id;
        const userId = req.user.id;

        // Check if club exists
        const club = await db.select().from(clubs).where(eq(clubs.id, clubId)).get();
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check if already subscribed
        const existingSubscription = await db.select()
            .from(clubSubscriptions)
            .where(eq(clubSubscriptions.userId, userId))
            .where(eq(clubSubscriptions.clubId, clubId))
            .get();

        if (existingSubscription) {
            return res.status(400).json({ message: 'Already subscribed to this club' });
        }

        // Create subscription
        await db.insert(clubSubscriptions).values({
            userId,
            clubId,
        }).run();

        return res.status(200).json({ message: 'Successfully subscribed to the club' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/clubs/{id}/unsubscribe:
 *   delete:
 *     summary: Unsubscribe from a club
 *     tags: [Clubs 💃]
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
 *         description: Successfully unsubscribed from the club
 *       404:
 *         description: Subscription not found
 */
export const unsubscribeFromClub = async(req, res) => {
    try {
        const clubId = req.params.id;
        const userId = req.user.id;

        const subscription = await db.select()
            .from(clubSubscriptions)
            .where(eq(clubSubscriptions.userId, userId))
            .where(eq(clubSubscriptions.clubId, clubId))
            .get();

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        await db.delete(clubSubscriptions)
            .where(eq(clubSubscriptions.id, subscription.id))
            .run();

        return res.status(200).json({ message: 'Successfully unsubscribed from the club' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/clubs/my-subscriptions:
 *   get:
 *     summary: Get all clubs the user is subscribed to
 *     tags: [Clubs 💃]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscribed clubs
 */
export const getUserSubscriptions = async(req, res) => {
    try {
        const userId = req.user.id;

        const subscribedClubs = await db.select({
                id: clubs.id,
                name: clubs.name,
                goal: clubs.goal,
                description: clubs.description,
                rating: clubs.rating,
                createdAt: clubs.createdAt,
                head: {
                    id: users.id,
                    name: users.name,
                    surname: users.surname,
                }
            })
            .from(clubSubscriptions)
            .leftJoin(clubs, eq(clubSubscriptions.clubId, clubs.id))
            .leftJoin(users, eq(clubs.headId, users.id))
            .where(eq(clubSubscriptions.userId, userId))
            .all();

        return res.status(200).json(subscribedClubs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/clubs/search:
 *   get:
 *     summary: Search clubs by name
 *     tags: [Clubs 💃]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for club name
 *     responses:
 *       200:
 *         description: List of clubs matching the search query
 */
export const searchClubs = async(req, res) => {
    try {
        const searchQuery = req.query.query || '';

        const matchingClubs = await db.select({
                id: clubs.id,
                name: clubs.name,
                goal: clubs.goal,
                description: clubs.description,
                rating: clubs.rating,
                createdAt: clubs.createdAt,
                head: {
                    id: users.id,
                    name: users.name,
                    surname: users.surname,
                }
            })
            .from(clubs)
            .leftJoin(users, eq(clubs.headId, users.id))
            .where(like(clubs.name, `%${searchQuery}%`))
            .all();

        return res.status(200).json(matchingClubs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};