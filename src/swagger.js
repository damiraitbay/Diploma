import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UNIHub API Documentation',
            version: '1.0.0',
            description: 'API documentation for UNIHub - University Club and Event Management Platform',
        },
        servers: [{
            url: 'http://localhost:3000',
            description: 'Development server',
        }, ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        image: { type: 'string', description: 'URL to the post image' },
                        userId: { type: 'integer' },
                        clubId: { type: 'integer', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Poster: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        eventId: { type: 'integer' },
                        clubId: { type: 'integer' },
                        headId: { type: 'integer' },
                        eventTitle: { type: 'string' },
                        eventDate: { type: 'string', format: 'date' },
                        location: { type: 'string' },
                        time: { type: 'string' },
                        description: { type: 'string' },
                        seats: { type: 'integer' },
                        seatsLeft: { type: 'integer' },
                        price: { type: 'integer' },
                        image: { type: 'string', description: 'URL to the poster image' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                TicketBooking: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        posterId: { type: 'integer' },
                        userId: { type: 'integer' },
                        numberOfPersons: { type: 'integer' },
                        paymentProof: { type: 'string', description: 'URL to the payment proof image' },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;