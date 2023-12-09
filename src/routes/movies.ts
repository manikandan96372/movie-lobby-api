import { Router } from 'express';

import { authenticateToken, isAdmin } from '../middlewares/auth';
import { addMovie, deleteMovie, fetchMovies, searchMovies, updateMovie } from '../controllers/movies';

const router = Router();

router.post('/', authenticateToken, isAdmin, addMovie); // Route to add a new movie
router.get('/', authenticateToken, fetchMovies); // Route to fetch movies
router.get('/search', authenticateToken, searchMovies); // Route to search movies
router.put('/:id', authenticateToken, isAdmin, updateMovie); // Route to update a movue
router.delete('/:id', authenticateToken, isAdmin, deleteMovie); // Route to delete a movie

export default router;
