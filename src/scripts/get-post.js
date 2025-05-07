import fetch from 'node-fetch';

async function getPost() {
    try {
        const response = await fetch('http://localhost:3000/api/posts/6');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

getPost();