import db from '../db.js';
import { users } from '../models/schema.js';
import { eq } from 'drizzle-orm';

async function verifyUser() {
    try {
        await db.update(users)
            .set({ isVerified: true, verificationCode: null })
            .where(eq(users.email, 'damiraitbay875@gmail.com'));
        console.log('User verified successfully');
    } catch (error) {
        console.error('Error verifying user:', error);
    }
}

verifyUser();