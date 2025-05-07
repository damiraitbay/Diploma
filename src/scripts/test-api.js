import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function testAPI() {
    try {
        // 1. Login
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'damiraitbay875@gmail.com',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        if (!loginData.token) {
            throw new Error('No token received');
        }

        // 2. Create a test image file
        const testImagePath = path.join(process.cwd(), 'test-image.txt');
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='; // 1x1 pixel transparent PNG
        fs.writeFileSync(testImagePath, testImageBase64);

        // 3. Create post with image
        const postResponse = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                title: 'Post with Image',
                content: 'This post contains an image',
                image: testImageBase64,
                clubId: null
            })
        });
        const postData = await postResponse.json();
        console.log('Create post response:', postData);

        // 4. Get all posts
        const getPostsResponse = await fetch('http://localhost:3000/api/posts', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        const postsData = await getPostsResponse.json();
        console.log('All posts:', postsData);

        // 5. Clean up
        fs.unlinkSync(testImagePath);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAPI();