import db from '../db.js';
import { posts } from '../models/schema.js';

async function createPost() {
    try {
        const newPost = await db.insert(posts).values({
            userId: 2, // ID пользователя Damir
            title: 'Test Post',
            content: 'This is a test post content',
            clubId: null,
            image: null,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Post created successfully:', newPost);
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

createPost();