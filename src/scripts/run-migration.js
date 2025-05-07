import { up } from '../migrations/add_reset_password_fields.js';

async function runMigration() {
    try {
        await up();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();