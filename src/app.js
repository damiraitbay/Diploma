import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import {
    authRoutes,
    clubRequestRoutes,
    clubRoutes,
    eventRequestRoutes,
    eventRoutes,
    posterRoutes,
    ticketRoutes,
    postRoutes,
    userRoutes
} from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

//! MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//! STATIC FILES
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

//! SWAGGER DOCS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//! ROUTES
app.get('/', (_, res) => res.send("Hey! It's working fine!"));
app.use('/api/auth', authRoutes);
app.use('/api/club-requests', clubRequestRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/event-requests', eventRequestRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

//! ERROR
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'File too large. Maximum size is 50MB' });
    }
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

export default app;