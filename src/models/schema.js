import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// USERS
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    surname: text('surname').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role', { enum: ['student', 'head_admin', 'super_admin'] }).default('student'),
    phone: text('phone'),
    gender: text('gender'),
    birthDate: text('birth_date'),
    clubName: text('club_name'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// CLUBS
export const clubRequests = sqliteTable('club_requests', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    headId: integer('head_id').notNull().references(() => users.id),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    communication: text('communication').notNull(),
    clubName: text('club_name').notNull(),
    goal: text('goal').notNull(),
    description: text('description').notNull(),
    financing: text('financing').notNull(),
    resources: text('resources'),
    attractionMethods: text('attraction_methods').notNull(),
    comment: text('comment'),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const clubs = sqliteTable('clubs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    headId: integer('head_id').notNull().references(() => users.id),
    goal: text('goal').notNull(),
    description: text('description').notNull(),
    financing: text('financing').notNull(),
    resources: text('resources'),
    attractionMethods: text('attraction_methods').notNull(),
    rating: integer('rating').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// EVENTS
export const eventRequests = sqliteTable('event_requests', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clubId: integer('club_id').notNull().references(() => clubs.id),
    headId: integer('head_id').notNull().references(() => users.id),
    eventName: text('event_name').notNull(),
    eventDate: text('event_date').notNull(),
    location: text('location').notNull(),
    shortDescription: text('short_description').notNull(),
    goal: text('goal').notNull(),
    organizers: text('organizers').notNull(),
    schedule: text('schedule').notNull(),
    sponsorship: text('sponsorship'),
    clubHead: text('club_head').notNull(),
    phone: text('phone').notNull(),
    comment: text('comment'),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const events = sqliteTable('events', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clubId: integer('club_id').notNull().references(() => clubs.id),
    headId: integer('head_id').notNull().references(() => users.id),
    eventName: text('event_name').notNull(),
    eventDate: text('event_date').notNull(),
    location: text('location').notNull(),
    shortDescription: text('short_description').notNull(),
    goal: text('goal').notNull(),
    organizers: text('organizers').notNull(),
    schedule: text('schedule').notNull(),
    sponsorship: text('sponsorship'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// POSTERS
export const posters = sqliteTable('posters', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventId: integer('event_id').notNull().references(() => events.id),
    clubId: integer('club_id').notNull().references(() => clubs.id),
    headId: integer('head_id').notNull().references(() => users.id),
    eventTitle: text('event_title').notNull(),
    eventDate: text('event_date').notNull(),
    location: text('location').notNull(),
    time: text('time').notNull(),
    description: text('description').notNull(),
    seats: integer('seats').notNull(),
    seatsLeft: integer('seats_left').notNull(),
    price: integer('price').notNull(),
    image: text('image'), // For base64 images
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// TICKETS
export const ticketBookings = sqliteTable('ticket_bookings', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    posterId: integer('poster_id').notNull().references(() => posters.id),
    userId: integer('user_id').notNull().references(() => users.id),
    numberOfPersons: integer('number_of_persons').notNull(),
    paymentProof: text('payment_proof'), // For base64 payment proof documents
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// POSTS
export const posts = sqliteTable('posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clubId: integer('club_id').references(() => clubs.id),
    userId: integer('user_id').notNull().references(() => users.id),
    title: text('title').notNull(),
    content: text('content').notNull(),
    image: text('image'), // For base64 images
    likes: integer('likes').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const postLikes = sqliteTable('post_likes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});