import 'dotenv/config';
import db from '../db.js';
import * as schema from '../models/schema.js';

async function viewDatabase() {
    try {
        console.log('=== Users ===');
        const usersData = await db.select().from(schema.users);
        console.log(usersData);

        console.log('\n=== Clubs ===');
        const clubsData = await db.select().from(schema.clubs);
        console.log(clubsData);

        console.log('\n=== Posts ===');
        const postsData = await db.select().from(schema.posts);
        console.log(postsData);

        console.log('\n=== Events ===');
        const eventsData = await db.select().from(schema.events);
        console.log(eventsData);

        console.log('\n=== Posters ===');
        const postersData = await db.select().from(schema.posters);
        console.log(postersData);

        console.log('\n=== Ticket Bookings ===');
        const ticketBookingsData = await db.select().from(schema.ticketBookings);
        console.log(ticketBookingsData);

        console.log('\n=== Club Requests ===');
        const clubRequestsData = await db.select().from(schema.clubRequests);
        console.log(clubRequestsData);

        console.log('\n=== Event Requests ===');
        const eventRequestsData = await db.select().from(schema.eventRequests);
        console.log(eventRequestsData);

        console.log('\n=== Post Likes ===');
        const postLikesData = await db.select().from(schema.postLikes);
        console.log(postLikesData);

        console.log('\n=== Club Subscriptions ===');
        const clubSubscriptionsData = await db.select().from(schema.clubSubscriptions);
        console.log(clubSubscriptionsData);
    } catch (error) {
        console.error('Error viewing database:', error);
    }
}

viewDatabase();