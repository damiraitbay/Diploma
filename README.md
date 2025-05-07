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

## Email Verification System

The application includes a secure email verification system that requires users to verify their email addresses before they can log in. Here's how it works:

### Registration Process
1. User registers with their email and other details
2. A 6-digit verification code is generated and sent to their email
3. User must verify their email using this code before they can log in

### API Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "string",
    "surname": "string",
    "email": "string",
    "password": "string",
    "phone": "string",
    "gender": "string",
    "birthDate": "string"
}
```

Response:
```json
{
    "message": "User registered successfully. Please check your email for verification code.",
    "user": {
        "id": "number",
        "name": "string",
        "surname": "string",
        "email": "string",
        "role": "string"
    }
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
    "email": "string",
    "code": "string" // 6-digit verification code
}
```

Response:
```json
{
    "message": "Email verified successfully",
    "token": "JWT_TOKEN"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "string",
    "password": "string"
}
```

Response:
```json
{
    "message": "Login successful",
    "token": "JWT_TOKEN"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "string"
}
```

Response:
```json
{
    "message": "Password reset code sent to your email"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
    "email": "string",
    "code": "string", // 6-digit reset code from email
    "newPassword": "string"
}
```

Response:
```json
{
    "message": "Password reset successful"
}
```

### Password Reset Flow
1. User requests password reset by providing their email
2. System generates a 6-digit code and sends it to user's email
3. Code expires after 1 hour
4. User enters the code and new password to reset their account

### Email Configuration
To enable email sending, you need to set up the following environment variables in your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

For Gmail:
1. Enable 2-factor authentication in your Google Account
2. Generate an App Password in Google Account Security settings
3. Use this App Password as EMAIL_PASS in your .env file

### Security Notes
- Email verification is mandatory before login
- Verification codes expire after 24 hours
- Users cannot log in until their email is verified
- JWT tokens are issued only after successful email verification

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
- GET `/api/auth/me` - Get current user's profile (protected)

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
- DELETE `/api/clubs/:id` - Delete club (head admin only)
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
- DELETE `/api/posters/:id` - Delete a poster (head admin only)

### Tickets
- POST `/api/tickets` - Book a ticket (protected)
- GET `/api/tickets` - Get user's tickets (protected)
- GET `/api/tickets/pending` - Get pending tickets for approval (head admin only)
- GET `/api/tickets/calendar` - Get calendar events (protected)
- PUT `/api/tickets/:id/approve` - Approve a ticket (head admin only)
- PUT `/api/tickets/:id/reject` - Reject a ticket (head admin only)
- GET `/api/tickets/:id` - Get a specific ticket (protected)
- DELETE `/api/tickets/:id` - Delete a ticket (protected)

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

## Работа с изображениями

### Загрузка изображений
Все изображения (посты, постеры, доказательства оплаты билетов) сохраняются в директории `src/public/uploads/`. При загрузке файла:

1. Создается уникальное имя файла с префиксом:
   - `post-` для изображений постов
   - `poster-` для изображений постеров
   - `payment-` для доказательств оплаты билетов

2. Файл сохраняется в директории `src/public/uploads/`

3. В базе данных сохраняется относительный путь к файлу вида `/uploads/filename.ext`

### Получение изображений
При получении данных (посты, постеры, билеты) возвращаются полные URL для изображений в формате:
```
http://localhost:3000/uploads/post-1234567890.png
http://localhost:3000/uploads/poster-1234567890.png
http://localhost:3000/uploads/payment-1234567890.png
```

### Удаление изображений
При удалении сущности (пост, постер, билет) также удаляется связанный файл изображения из файловой системы.

## Тестирование API

### Примеры запросов

#### Создание поста с изображением
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Post" \
  -F "content=Test Content" \
  -F "image=@/path/to/image.jpg"
```

#### Создание постера с изображением
```bash
curl -X POST http://localhost:3000/api/posters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "eventTitle=Test Event" \
  -F "eventDate=2024-03-20" \
  -F "location=Test Location" \
  -F "time=19:00" \
  -F "description=Test Description" \
  -F "seats=100" \
  -F "price=1000" \
  -F "image=@/path/to/image.jpg"
```

#### Бронирование билета с доказательством оплаты
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "posterId=1" \
  -F "numberOfPersons=2" \
  -F "paymentProof=@/path/to/payment.jpg"
```

## Технологии
- Node.js
- Express
- Drizzle ORM
- SQLite
- JWT для аутентификации
- Multer для загрузки файлов