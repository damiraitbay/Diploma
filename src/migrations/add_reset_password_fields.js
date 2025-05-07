import { sql } from 'drizzle-orm';
import db from '../db.js';

export async function up() {
    try {
        // Add reset password fields
        await db.run(sql `
            ALTER TABLE users 
            ADD COLUMN reset_password_code TEXT;
        `);

        await db.run(sql `
            ALTER TABLE users 
            ADD COLUMN reset_password_expires INTEGER;
        `);

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

export async function down() {
    try {
        // Remove reset password fields
        await db.run(sql `
            ALTER TABLE users 
            DROP COLUMN reset_password_code;
        `);

        await db.run(sql `
            ALTER TABLE users 
            DROP COLUMN reset_password_expires;
        `);

        console.log('Rollback completed successfully');
    } catch (error) {
        console.error('Rollback failed:', error);
        throw error;
    }
}