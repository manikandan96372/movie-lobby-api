import { Request, Response } from 'express';

import { addMovie, fetchMovies, searchMovies, updateMovie, deleteMovie } from '../src/controllers/movies';
import MovieModel from '../src/models/movies';

jest.mock('../src/models/movies'); 

describe('Movie controller - addMovie', () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
    });

    it('should add a movie successfully', async () => {
        req.body = {
            title: 'Back to the Future',
            genre: 'Sci-fi',
            rating: 7.0,
            streamingLink: 'https://example.com',
        };

        const saveSpy = jest.spyOn(MovieModel.prototype, 'save').mockResolvedValueOnce(req.body);

        await addMovie(req, res);

        expect(saveSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it('should handle missing parameters', async () => {
        req.body = {
            genre: 'Sci-fi',
            rating: 7.0,
            streamingLink: 'https://example.com',
        };

        await addMovie(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request - Missing required parameters' });
    });

    it('should handle add movie failure', async () => {
        req.body = {
            title: 'Back to the Future',
            genre: 'Sci-fi',
            rating: 7.0,
            streamingLink: 'https://example.com',
        };

        const saveSpy = jest.spyOn(MovieModel.prototype, 'save').mockRejectedValueOnce(new Error('DB Error'));

        await addMovie(req, res);

        
        expect(saveSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error occurred while adding movie .' });
    });

    it('should handle unexpected errors', async () => {
        req.body = {
            title: 'Back to the Future',
            genre: 'Sci-fi',
            rating: 7.0,
            streamingLink: 'https://example.com',
        };

        const saveSpy = jest.spyOn(MovieModel.prototype, 'save').mockImplementationOnce(() => {
            throw new Error('Unexpected Error');
        });

        await addMovie(req, res);

        expect(saveSpy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error occurred while adding movie .' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});


describe('Movie controller - fetchMovies', () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
    });

    it('should fetch movies successfully', async () => {
        req.query = {
            page: '1',
            limit: '10',
        };

        const findMock = jest.spyOn(MovieModel, 'find') as jest.Mock;
        const skipMock = jest.fn().mockReturnThis();
        const limitMock = jest.fn().mockResolvedValueOnce(['Back to the future 1', 'Back to the future 2']);

        findMock.mockReturnValueOnce({
            skip: skipMock,
            limit: limitMock,
        } as any);

        await fetchMovies(req, res);

        expect(findMock).toHaveBeenCalledWith();
        expect(skipMock).toHaveBeenCalledWith(0); 
        expect(limitMock).toHaveBeenCalledWith(10);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(['Back to the future 1', 'Back to the future 2']);
    });

    it('should handle fetch movies failure', async () => {
        req.query = {
            page: '2',
            limit: '10',
        };

        const findMock = jest.spyOn(MovieModel, 'find') as jest.Mock;
        const skipMock = jest.fn().mockReturnThis();
        const limitMock = jest.fn().mockRejectedValueOnce(new Error('DB Error'));

        findMock.mockReturnValueOnce({
            skip: skipMock,
            limit: limitMock,
        } as any);

        await fetchMovies(req, res);

        expect(findMock).toHaveBeenCalledWith();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error occurred while fetching movies .' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});


describe('Movie controller - searchMovies', () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
    });

    it('should search movies with a valid query', async () => {
        req.query = { q: 'Action' };

        const findMock = jest.spyOn(MovieModel, 'find').mockResolvedValueOnce([{ title: 'Rambo' }]);

        await searchMovies(req, res);

        expect(findMock).toHaveBeenCalledWith({
            $or: [{ title: expect.any(RegExp) }, { genre: expect.any(RegExp) }],
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ title: 'Rambo' }]);
    });

    it('should handle missing search query', async () => {
        req.query = {}; 

        await searchMovies(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request - Missing search query' });
    });

    it('should handle error during movie search', async () => {
        req.query = { q: 'Action' };

        const errorMock = new Error('DB error');
        const findMock = jest.spyOn(MovieModel, 'find').mockRejectedValueOnce(errorMock);

        await searchMovies(req, res);

        expect(findMock).toHaveBeenCalledWith({
            $or: [{ title: expect.any(RegExp) }, { genre: expect.any(RegExp) }],
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error occurred while searching movies .' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

describe('Movie controller - updateMovie', () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
    });

    it('should update a movie with a valid ID and parameters', async () => {
        req.params = { id: '123' };
        req.body = { title: 'Stuart little', genre: 'Comedy' };

        const findByIdAndUpdateMock = jest.spyOn(MovieModel, 'findByIdAndUpdate').mockResolvedValueOnce({
            _id: '123',
            title: 'Stuart little',
            genre: 'Comedy',
        });

        await updateMovie(req, res);

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            '123',
            { title: 'Stuart little', genre: 'Comedy' },
            { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: '123', title: 'Stuart little', genre: 'Comedy' });
    });

    it('should handle missing movie ID', async () => {
        req.body = { title: 'Rambo' };

        await updateMovie(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request - Missing movie ID' });
    });

    it('should handle error during movie update', async () => {
        req.params = { id: '123' };
        req.body = { title: 'Rambo' };

        const errorMock = new Error('DB error');
        const findByIdAndUpdateMock = jest.spyOn(MovieModel, 'findByIdAndUpdate').mockRejectedValueOnce(errorMock);

        await updateMovie(req, res);

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith('123', { title: 'Rambo' }, { new: true });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error occurred while updating movie .' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

describe('Movie controller - deleteMovie', () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = {
            params: {},
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        } as any;
    });

    it('should delete a movie with a valid ID', async () => {
        req.params = { id: '123' };

        const findByIdAndDeleteMock = jest.spyOn(MovieModel, 'findByIdAndDelete').mockResolvedValueOnce({
            _id: '123',
            title: 'Rambo',
        });

        await deleteMovie(req, res);

        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('123');
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.end).toHaveBeenCalled();
    });

    it('should handle missing movie ID', async () => {
        await deleteMovie(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request - Missing movie ID' });
    });

    it('should handle error during movie deletion', async () => {
        req.params = { id: '123' };

        const errorMock = new Error('Db error');
        const findByIdAndDeleteMock = jest.spyOn(MovieModel, 'findByIdAndDelete').mockRejectedValueOnce(errorMock);

        await deleteMovie(req, res);

        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('123');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error occurred while deleting the movie .' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
