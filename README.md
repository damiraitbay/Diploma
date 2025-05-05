# UNIHub Backend
UNIHub is a comprehensive university club and event management platform. This repository contains the backend API for the UNIHub platform built with Node.js, Express.js, SQLite, and Drizzle ORM.

## Overview
UNIHub allows university students to discover clubs, attend events, and interact with club activities. The platform has three main user roles:

1. **Student (Regular User)** - Can browse clubs, attend events, book tickets, and subscribe to clubs
2. **Head Admin (Club Curator)** - Can manage their own clubs and create events
3. **Super Admin (Platform Admin)** - Has full administrative powers to manage clubs and system

## Features

### Authentication System
- User registration with email and password
- JWT-based authentication
- Role-based access control
- Password change functionality
- Different navigation and content based on user role

### User Management
- Three user roles: student, head_admin, and super_admin 
- Default super admin seeding (admin@gmail.com)
- Extended user profiles with personal details
- Role transition when students become head admins
- Search functionality for users by name or surname

### Club Management
- Students can submit club creation requests with detailed information
- Super admins can review and approve/reject club requests
- When a club request is approved, the requester becomes a head admin
- Clubs have ratings based on activity and likes
- Club information includes name, goal, description, financing methods, and more
- Students can subscribe to clubs to stay updated with their activities
- Users can view their subscribed clubs and manage subscriptions
- Search functionality for clubs by name

### Event Management
- Head admins can submit event creation requests
- Super admins can review and approve/reject event requests
- Approved events appear on the platform
- Event details include name, date, location, description, goals, and schedule
- Club-specific event listings

### Poster System
- Head admins can create posters for their approved events
- Posters include details like event title, date, location, time, description, seats, price, and images
- Images are stored as base64 in the database
- Students can browse all available event posters

### Ticket Booking
- Students can book tickets for events by specifying the number of attendees
- Payment proof upload functionality (stored as base64)
- Automatic seat tracking system that updates available seats
- Head admins can approve or reject ticket bookings
- When a ticket is approved, it appears in the student's calendar
- When a ticket is rejected, the seats are restored

### Post System
- Users can create posts with title, content, and images
- Head admins' posts are automatically associated with their clubs
- Posts can be liked by users
- Posts can be filtered by club or user
- Like count tracking for engagement metrics

### User Profiles
- Extended profile information including name, surname, phone, gender, birth date
- Club association for head admins
- Profile editing capabilities
- Admin tools for user management
- User following system
- Track liked posts

### Calendar System
- Users can see their approved events in a calendar view
- Calendar shows event timing and details

### Request System
- Structured request flows for clubs and events
- Status tracking for all requests (pending, approved, rejected)
- Request history for users and admins

### API Documentation
- Comprehensive Swagger documentation
- All endpoints documented with parameters and responses
- API testing through Swagger UI

## Database Schema

The system uses SQLite with Drizzle ORM and includes the following main tables:

- `users`: Store user information and roles
- `clubRequests`: Track club creation requests
- `clubs`: Store approved clubs
- `clubSubscriptions`: Track user subscriptions to clubs
- `eventRequests`: Track event creation requests
- `events`: Store approved events
- `posters`: Store event posters with details
- `ticketBookings`: Track ticket bookings and their status
- `posts`: Store user and club posts
- `postLikes`: Track user likes on posts
- `userFollows`: Track user following relationships

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login
- PUT `/api/auth/change-password` - Change password (protected)

### Users
- GET `/api/users/profile` - Get current user's profile (protected)
- PUT `/api/users/profile` - Update user profile (protected)
- GET `/api/users/search` - Search users by name or surname
- GET `/api/users/:id` - Get a specific user (admin only)
- GET `/api/users` - Get all users (admin only)
- PUT `/api/users/:id/role` - Update user role (admin only)
- POST `/api/users/:id/follow` - Follow a user (protected)
- DELETE `/api/users/:id/unfollow` - Unfollow a user (protected)
- GET `/api/users/followers` - Get user's followers (protected)
- GET `/api/users/following` - Get users the current user is following (protected)
- GET `/api/users/liked-posts` - Get posts liked by the current user (protected)

### Club Requests
- POST `/api/club-requests` - Submit a club request (protected)
- GET `/api/club-requests` - Get all club requests (admin only)
- GET `/api/club-requests/my-requests` - Get user's club requests (protected)
- GET `/api/club-requests/:id` - Get a specific club request (protected)
- PUT `/api/club-requests/:id/approve` - Approve a club request (admin only)
- PUT `/api/club-requests/:id/reject` - Reject a club request (admin only)

### Clubs
- GET `/api/clubs` - Get all clubs
- GET `/api/clubs/search` - Search clubs by name
- GET `/api/clubs/:id` - Get specific club
- GET `/api/clubs/my-club` - Get user's club (head admin only)
- PUT `/api/clubs/:id` - Update club (head admin only)
- POST `/api/clubs/:id/subscribe` - Subscribe to a club
- DELETE `/api/clubs/:id/unsubscribe` - Unsubscribe from a club
- GET `/api/clubs/my-subscriptions` - Get user's subscribed clubs

### Event Requests
- POST `/api/event-requests` - Submit an event request (head admin only)
- GET `/api/event-requests` - Get all event requests (admin only)
- GET `/api/event-requests/my-requests` - Get user's event requests (head admin only)
- GET `/api/event-requests/:id` - Get a specific event request (protected)
- PUT `/api/event-requests/:id/approve` - Approve an event request (admin only)
- PUT `/api/event-requests/:id/reject` - Reject an event request (admin only)

### Events
- GET `/api/events` - Get all approved events
- GET `/api/events/my-events` - Get user's club events (head admin only)
- GET `/api/events/club/:clubId` - Get all events for a specific club
- GET `/api/events/:id` - Get a specific event

### Posters
- POST `/api/posters` - Create a poster (head admin only)
- GET `/api/posters` - Get all posters
- GET `/api/posters/my-posters` - Get user's posters (head admin only)
- GET `/api/posters/club/:clubId` - Get all posters for a specific club
- GET `/api/posters/:id` - Get a specific poster
- PUT `/api/posters/:id` - Update a poster (head admin only)

### Tickets
- POST `/api/tickets` - Book a ticket (protected)
- GET `/api/tickets` - Get user's tickets (protected)
- GET `/api/tickets/pending` - Get pending tickets for approval (head admin only)
- GET `/api/tickets/calendar` - Get calendar events (protected)
- PUT `/api/tickets/:id/approve` - Approve a ticket (head admin only)
- PUT `/api/tickets/:id/reject` - Reject a ticket (head admin only)

### Posts
- POST `/api/posts` - Create a new post (protected)
- GET `/api/posts` - Get all posts
- GET `/api/posts/my-posts` - Get user's posts (protected)
- GET `/api/posts/:id` - Get a specific post
- PUT `/api/posts/:id` - Update a post (protected)
- DELETE `/api/posts/:id` - Delete a post (protected)
- POST `/api/posts/:id/like` - Like/unlike a post (protected)

## Installation

```bash
# Clone the repository
git clone https://github.com/mutasim77/unihub-backend.git
cd unihub-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate database migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push

# Start the development server
npm run dev

# Or simply u can use makefile
make run
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
DB_FILE_NAME=file:unihub.db
```

## Getting Started

1. After installation, seed the default admin:
   ```bash
   node src/seeders/adminSeed.js
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Access the Swagger documentation at:
   ```
   http://localhost:3000/api-docs
   ```

4. Login with the default admin:
   - Email: admin@gmail.com
   - Password: admin123

## Summary of Key Features

1. **Authentication System**
   - User registration and login with JWT tokens
   - Role-based access control with three user levels
   - Password management and security

2. **User Profiles**
   - Extended profile information (name, surname, phone, gender, birth date)
   - Club association for head admins
   - Profile editing capabilities
   - Admin tools for user management

3. **Club Management**
   - Club request submission with detailed information
   - Admin review process for club creation
   - Automatic role transition when becoming a head admin

4. **Event Management**
   - Event request creation by head admins
   - Admin approval workflow for events
   - Comprehensive event details and organization

5. **Poster System**
   - Head admins can create posters for their approved events
   - Posters include detailed event information and images
   - Students can browse all available event posters

6. **Ticket Booking**
   - Students can book tickets for events
   - Payment proof upload and verification
   - Seat tracking and management
   - Head admin approval process for tickets

7. **Post System**
   - Create posts with text content and images
   - Like/unlike functionality
   - Club-specific posts
   - Social engagement features

8. **Calendar Integration**
   - Approved tickets appear in student calendars
   - Event timing and scheduling views

9. **Comprehensive Admin Tools**
   - Request management and approval workflows
   - User role management
   - System monitoring and control

10. **API Documentation**
    - Complete Swagger documentation
    - Testing interface for all endpoints

## Security Considerations
- All sensitive routes are protected by JWT authentication
- Role-based authorization for different user types
- Password hashing using bcrypt
- Input validation for all API endpoints
- Error handling and logging