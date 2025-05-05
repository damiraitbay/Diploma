import { eq, like, or, and, count } from 'drizzle-orm';
import db from '../db.js';
import { users, clubs, userFollows, postLikes, posts } from '../models/schema.js';

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users 👨🏻‍💻]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
export const getUserProfile = async(req, res) => {
    try {
        const userId = req.user.id;

        const user = await db.select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                role: users.role,
                phone: users.phone,
                gender: users.gender,
                birthDate: users.birthDate,
                clubName: users.clubName,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .get();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'head_admin') {
            const club = await db.select().from(clubs).where(eq(clubs.headId, userId)).get();
            if (club) {
                user.clubInfo = {
                    id: club.id,
                    name: club.name,
                    goal: club.goal,
                    description: club.description
                };
            }
        }

        delete user.password;

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users 👨🏻‍💻]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *               clubName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
export const updateUserProfile = async(req, res) => {
    try {
        const userId = req.user.id;

        const { name, surname, phone, gender, birthDate, clubName } = req.body;

        const user = await db.select().from(users).where(eq(users.id, userId)).get();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await db.update(users)
            .set({
                name: name || user.name,
                surname: surname || user.surname,
                phone: phone !== undefined ? phone : user.phone,
                gender: gender !== undefined ? gender : user.gender,
                birthDate: birthDate !== undefined ? birthDate : user.birthDate,
                clubName: clubName !== undefined ? clubName : user.clubName,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .run();

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users 👨🏻‍💻]
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
 *         description: User profile data
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const getUserById = async(req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const userId = req.params.id;

        const user = await db.select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                role: users.role,
                phone: users.phone,
                gender: users.gender,
                birthDate: users.birthDate,
                clubName: users.clubName,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .get();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'head_admin') {
            const club = await db.select().from(clubs).where(eq(clubs.headId, userId)).get();
            if (club) {
                user.clubInfo = {
                    id: club.id,
                    name: club.name,
                    goal: club.goal,
                    description: club.description
                };
            }
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users 👨🏻‍💻]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Unauthorized
 */
export const getAllUsers = async(req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const allUsers = await db.select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .all();

        return res.status(200).json(allUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role (admin only)
 *     tags: [Users 👨🏻‍💻]
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, head_admin, super_admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
export const updateUserRole = async(req, res) => {
    try {
        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const userId = req.params.id;
        const { role } = req.body;

        if (!['student', 'head_admin', 'super_admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await db.select().from(users).where(eq(users.id, userId)).get();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await db.update(users)
            .set({
                role,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .run();

        return res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by name or surname
 *     tags: [Users 👨🏻‍💻]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query for user name or surname
 *     responses:
 *       200:
 *         description: List of users matching the search query
 */
export const searchUsers = async(req, res) => {
    try {
        const searchQuery = req.query.query || '';

        const matchingUsers = await db.select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                role: users.role,
                phone: users.phone,
                gender: users.gender,
                birthDate: users.birthDate,
                clubName: users.clubName,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(
                or(
                    like(users.name, `%${searchQuery}%`),
                    like(users.surname, `%${searchQuery}%`)
                )
            )
            .all();

        // Remove sensitive information
        const sanitizedUsers = matchingUsers.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return res.status(200).json(sanitizedUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users 👨🏻‍💻]
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
 *         description: Successfully followed the user
 *       400:
 *         description: Already following or cannot follow yourself
 *       404:
 *         description: User not found
 */
export const followUser = async(req, res) => {
    try {
        const followingId = parseInt(req.params.id);
        const followerId = req.user.id;

        // Check if trying to follow self
        if (followingId === followerId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        // Check if user exists
        const userToFollow = await db.select().from(users).where(eq(users.id, followingId)).get();
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        const existingFollow = await db.select()
            .from(userFollows)
            .where(
                and(
                    eq(userFollows.followerId, followerId),
                    eq(userFollows.followingId, followingId)
                )
            )
            .get();

        if (existingFollow) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Create follow relationship
        await db.insert(userFollows).values({
            followerId,
            followingId,
        }).run();

        return res.status(200).json({ message: 'Successfully followed the user' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users 👨🏻‍💻]
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
 *         description: Successfully unfollowed the user
 *       404:
 *         description: Not following this user
 */
export const unfollowUser = async(req, res) => {
    try {
        const followingId = parseInt(req.params.id);
        const followerId = req.user.id;

        const follow = await db.select()
            .from(userFollows)
            .where(
                and(
                    eq(userFollows.followerId, followerId),
                    eq(userFollows.followingId, followingId)
                )
            )
            .get();

        if (!follow) {
            return res.status(404).json({ message: 'Not following this user' });
        }

        await db.delete(userFollows)
            .where(eq(userFollows.id, follow.id))
            .run();

        return res.status(200).json({ message: 'Successfully unfollowed the user' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/followers:
 *   get:
 *     summary: Get user's followers
 *     tags: [Users 👨🏻‍💻]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of followers
 */
export const getFollowers = async(req, res) => {
    try {
        const userId = req.user.id;

        const followers = await db.select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                role: users.role,
                createdAt: userFollows.createdAt,
            })
            .from(userFollows)
            .leftJoin(users, eq(userFollows.followerId, users.id))
            .where(eq(userFollows.followingId, userId))
            .all();

        return res.status(200).json(followers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/following:
 *   get:
 *     summary: Get users the current user is following
 *     tags: [Users 👨🏻‍💻]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of following users
 */
export const getFollowing = async(req, res) => {
    try {
        const userId = req.user.id;

        const following = await db.select({
                id: users.id,
                name: users.name,
                surname: users.surname,
                email: users.email,
                role: users.role,
                createdAt: userFollows.createdAt,
            })
            .from(userFollows)
            .leftJoin(users, eq(userFollows.followingId, users.id))
            .where(eq(userFollows.followerId, userId))
            .all();

        return res.status(200).json(following);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * @swagger
 * /api/users/liked-posts:
 *   get:
 *     summary: Get posts liked by the current user
 *     tags: [Users 👨🏻‍💻]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liked posts
 */
export const getLikedPosts = async(req, res) => {
    try {
        const userId = req.user.id;

        const likedPosts = await db.select({
                id: posts.id,
                title: posts.title,
                content: posts.content,
                image: posts.image,
                likes: posts.likes,
                createdAt: posts.createdAt,
                user: {
                    id: users.id,
                    name: users.name,
                    surname: users.surname,
                },
                club: {
                    id: clubs.id,
                    name: clubs.name,
                }
            })
            .from(postLikes)
            .leftJoin(posts, eq(postLikes.postId, posts.id))
            .leftJoin(users, eq(posts.userId, users.id))
            .leftJoin(clubs, eq(posts.clubId, clubs.id))
            .where(eq(postLikes.userId, userId))
            .all();

        return res.status(200).json(likedPosts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};