import request from 'supertest';
import app from '../app.js';
import db from '../db.js';
import { users } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import { jest } from '@jest/globals';

describe('Email Verification Tests', () => {
    const testUser = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        gender: 'male',
        birthDate: '2000-01-01'
    };

    beforeEach(async() => {
        // Clean up test data before each test
        await db.delete(users).where(eq(users.email, testUser.email)).run();
    });

    afterAll(async() => {
        // Clean up test data after all tests
        await db.delete(users).where(eq(users.email, testUser.email)).run();
    });

    test('should register user and send verification email', async() => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(response.status).toBe(201);
        expect(response.body.message).toContain('check your email for verification code');
        expect(response.body.user.email).toBe(testUser.email);

        // Verify that user is created with isVerified = false
        const user = await db.select().from(users).where(eq(users.email, testUser.email)).get();
        expect(user.isVerified).toBe(false);
        expect(user.verificationCode).toBeDefined();
    });

    test('should verify email with correct code', async() => {
        // First register the user
        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Get the verification code from the database
        const user = await db.select().from(users).where(eq(users.email, testUser.email)).get();
        const verificationCode = user.verificationCode;

        // Verify the email
        const response = await request(app)
            .post('/api/auth/verify-email')
            .send({
                email: testUser.email,
                code: verificationCode
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Email verified successfully');
        expect(response.body.token).toBeDefined();

        // Verify that user is now marked as verified
        const updatedUser = await db.select().from(users).where(eq(users.email, testUser.email)).get();
        expect(updatedUser.isVerified).toBe(true);
        expect(updatedUser.verificationCode).toBeNull();
    });

    test('should not verify email with incorrect code', async() => {
        // First register the user
        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Try to verify with wrong code
        const response = await request(app)
            .post('/api/auth/verify-email')
            .send({
                email: testUser.email,
                code: '000000' // Wrong code
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid verification code');

        // Verify that user is still not verified
        const user = await db.select().from(users).where(eq(users.email, testUser.email)).get();
        expect(user.isVerified).toBe(false);
    });

    test('should not allow login before email verification', async() => {
        // First register the user
        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Try to login
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Please verify your email first');
    });

    test('should allow login after email verification', async() => {
        // First register the user
        await request(app)
            .post('/api/auth/register')
            .send(testUser);

        // Get the verification code
        const user = await db.select().from(users).where(eq(users.email, testUser.email)).get();
        const verificationCode = user.verificationCode;

        // Verify the email
        await request(app)
            .post('/api/auth/verify-email')
            .send({
                email: testUser.email,
                code: verificationCode
            });

        // Try to login
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
    });
});