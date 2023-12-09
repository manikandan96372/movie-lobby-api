import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import nodeCache from 'node-cache';

import userRoutes from './routes/users';
import movieRoutes from './routes/movies'

const app = express();
const PORT = process.env.PORT || 3000;

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string; email: string, role: string };
        }
    }
}

mongoose.connect('mongodb://localhost/movie_lobby', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as ConnectOptions);

const cache = new nodeCache();

// Caching middleware
app.use((req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);
    if (cachedData) {
        return res.json(cachedData);
    }
    next();
});

app.use(express.json());

app.use('/users', userRoutes);

app.use('/movies', movieRoutes);

app.listen(PORT, () => {
    console.log(`Movie lobby app server is running on http://localhost:${PORT}`);
});
