import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import db from '../db.js';
import { users } from '../models/schema.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth 🔐]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User registered successfully. Verification code sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully. Please check your email for verification code.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     surname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input or email already exists
 */
export const register = async(req, res) => {
    try {
        const { name, surname, email, password, phone, gender, birthDate } = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await db.insert(users).values({
            name,
            surname,
            email,
            password: hashedPassword,
            role: 'student',
            phone,
            gender,
            birthDate,
            verificationCode,
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }).run();

        const newUser = await db.select().from(users).where(eq(users.email, email)).get();

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationCode);
        if (!emailSent) {
            return res.status(500).json({ message: 'Error sending verification email' });
        }

        return res.status(201).json({
            message: 'User registered successfully. Please check your email for verification code.',
            user: {
                id: newUser.id,
                name: newUser.name,
                surname: newUser.surname,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user's email with verification code
 *     tags: [Auth 🔐]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               code:
 *                 type: string
 *                 description: 6-digit verification code sent to email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *       400:
 *         description: Invalid verification code
 *       404:
 *         description: User not found
 */
export const verifyEmail = async(req, res) => {
    try {
        const { email, code } = req.body;

        const user = await db.select().from(users).where(eq(users.email, email)).get();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        await db.update(users)
            .set({
                isVerified: true,
                verificationCode: null,
                updatedAt: new Date()
            })
            .where(eq(users.email, email))
            .run();

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user (requires email verification)
 *     tags: [Auth 🔐]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     surname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials or email not verified
 *       400:
 *         description: Invalid input
 */
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.select().from(users).where(eq(users.email, email)).get();
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user's password
 *     tags: [Auth 🔐]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found
 */
export const changePassword = async(req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await db.select().from(users).where(eq(users.id, userId)).get();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .run();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth 🔐]
 *     description: Sends a 6-digit reset code to user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Password reset code sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset code sent to your email
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error or email sending failed
 */
export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        const user = await db.select().from(users).where(eq(users.email, email)).get();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiration time to 1 hour from now
        const resetExpires = new Date(Date.now() + 3600000);

        await db.update(users)
            .set({
                resetPasswordCode: resetCode,
                resetPasswordExpires: resetExpires,
                updatedAt: new Date()
            })
            .where(eq(users.email, email))
            .run();

        // Send reset code via email
        const emailSent = await sendPasswordResetEmail(email, resetCode);
        if (!emailSent) {
            return res.status(500).json({ message: 'Error sending reset code email' });
        }

        return res.status(200).json({ message: 'Password reset code sent to your email' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using reset code
 *     tags: [Auth 🔐]
 *     description: Resets user's password using the code received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               code:
 *                 type: string
 *                 description: 6-digit reset code received via email
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid or expired reset code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reset code has expired
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const resetPassword = async(req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await db.select().from(users).where(eq(users.email, email)).get();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if reset code exists and is valid
        if (!user.resetPasswordCode || !user.resetPasswordExpires) {
            return res.status(400).json({ message: 'No password reset request found' });
        }

        // Check if reset code has expired
        if (new Date() > new Date(user.resetPasswordExpires)) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Check if reset code matches
        if (user.resetPasswordCode !== code) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset code
        await db.update(users)
            .set({
                password: hashedPassword,
                resetPasswordCode: null,
                resetPasswordExpires: null,
                updatedAt: new Date()
            })
            .where(eq(users.email, email))
            .run();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}