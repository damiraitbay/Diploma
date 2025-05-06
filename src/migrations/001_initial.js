import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../models/schema.js';

const client = createClient({
    url: 'file:unihub.db'
});

const db = drizzle(client);

async function main() {
    console.log('Running migrations...');

    // Create tables
    await client.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            phone TEXT,
            gender TEXT,
            birth_date TEXT,
            club_name TEXT,
            verification_code TEXT,
            is_verified INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS club_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            head_id INTEGER NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            communication TEXT NOT NULL,
            club_name TEXT NOT NULL,
            goal TEXT NOT NULL,
            description TEXT NOT NULL,
            financing TEXT NOT NULL,
            resources TEXT,
            attraction_methods TEXT NOT NULL,
            comment TEXT,
            status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (head_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            head_id INTEGER NOT NULL,
            goal TEXT NOT NULL,
            description TEXT NOT NULL,
            financing TEXT NOT NULL,
            resources TEXT,
            attraction_methods TEXT NOT NULL,
            rating INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (head_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS club_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            club_id INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (club_id) REFERENCES clubs(id)
        );

        CREATE TABLE IF NOT EXISTS event_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER NOT NULL,
            head_id INTEGER NOT NULL,
            event_name TEXT NOT NULL,
            event_date TEXT NOT NULL,
            location TEXT NOT NULL,
            short_description TEXT NOT NULL,
            goal TEXT NOT NULL,
            organizers TEXT NOT NULL,
            schedule TEXT NOT NULL,
            sponsorship TEXT,
            club_head TEXT NOT NULL,
            phone TEXT NOT NULL,
            comment TEXT,
            status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (club_id) REFERENCES clubs(id),
            FOREIGN KEY (head_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER NOT NULL,
            head_id INTEGER NOT NULL,
            event_name TEXT NOT NULL,
            event_date TEXT NOT NULL,
            location TEXT NOT NULL,
            short_description TEXT NOT NULL,
            goal TEXT NOT NULL,
            organizers TEXT NOT NULL,
            schedule TEXT NOT NULL,
            sponsorship TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (club_id) REFERENCES clubs(id),
            FOREIGN KEY (head_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS posters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            club_id INTEGER NOT NULL,
            head_id INTEGER NOT NULL,
            event_title TEXT NOT NULL,
            event_date TEXT NOT NULL,
            location TEXT NOT NULL,
            time TEXT NOT NULL,
            description TEXT NOT NULL,
            seats INTEGER NOT NULL,
            seats_left INTEGER NOT NULL,
            price INTEGER NOT NULL,
            image TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events(id),
            FOREIGN KEY (club_id) REFERENCES clubs(id),
            FOREIGN KEY (head_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS ticket_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poster_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            number_of_persons INTEGER NOT NULL,
            payment_proof TEXT,
            status TEXT DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (poster_id) REFERENCES posters(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image TEXT,
            likes INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (club_id) REFERENCES clubs(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS post_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS user_follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (follower_id) REFERENCES users(id),
            FOREIGN KEY (following_id) REFERENCES users(id)
        );
    `);

    console.log('Migrations completed successfully');
    process.exit(0);
}

main().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});