import { Request, Response } from 'express';
import nodeCache from 'node-cache';

import MovieModel from '../models/movies';

const cache = new nodeCache();

const addMovie = async (req: Request, res: Response) => {
    try {
        const { title, genre, rating, streamingLink } = req.body;

        if (!(title && genre && rating && streamingLink)) {
            return res.status(400).json({ error: 'Bad Request - Missing required parameters' });
        }

        const newMovie = new MovieModel({
            title,
            genre,
            rating,
            streamingLink
        });

        const savedMovie = await newMovie.save();

        res.status(201).json(savedMovie);
    } catch (error) {
        res.status(500).json({ error: 'Error occurred while adding movie .' });
    }
}

const fetchMovies = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const key = `${req.originalUrl || req.url}_page${page}_limit${limit}`;

        const cachedData = cache.get(key);
        if (cachedData) {
            return res.json(cachedData);
        }


        const parsedPage = parseInt(page as string, 10);
        const parsedLimit = parseInt(limit as string, 10);

        const skip = (parsedPage - 1) * parsedLimit;

        const movies = await MovieModel.find()
            .skip(skip)
            .limit(parsedLimit);

        cache.set(key, movies, 60);

        res.status(200).json(movies);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error occurred while fetching movies .' });
    }
}

const searchMovies = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Bad Request - Missing search query' });
        }

        const regex = new RegExp(q as string, 'i');

        const movies = await MovieModel.find({
            $or: [{ title: regex }, { genre: regex }],
        });

        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Error occurred while searching movies .' });
    }
}

const updateMovie = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, genre, rating, streamingLink } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Bad Request - Missing movie ID' });
        }

        const updateObject: { [key: string]: any } = {};
        if (title !== undefined) updateObject.title = title;
        if (genre !== undefined) updateObject.genre = genre;
        if (rating !== undefined) updateObject.rating = rating;
        if (streamingLink !== undefined) updateObject.streamingLink = streamingLink;

        const updatedMovie = await MovieModel.findByIdAndUpdate(
            id,
            updateObject,
            { new: true }
        );

        if (!updatedMovie) {
            return res.status(404).json({ error: 'Not Found - Movie not found' });
        }

        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).json({ error: 'Error occurred while updating movie .' });
    }
}

const deleteMovie = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Bad Request - Missing movie ID' });
        }

        const deletedMovie = await MovieModel.findByIdAndDelete(id);

        if (!deletedMovie) {
            return res.status(404).json({ error: 'Not Found - Movie not found' });
        }

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error occurred while deleting the movie .' });
    }
}

export {
    addMovie,
    fetchMovies,
    searchMovies,
    updateMovie,
    deleteMovie
}