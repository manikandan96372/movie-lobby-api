import { Schema, model, Document } from 'mongoose';

interface IMovie extends Document {
  title: string;
  genre: string;
  rating: number;
  streamingLink: string;
}

const movieSchema = new Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  streamingLink: { type: String, required: true },
});

const MovieModel = model<IMovie>('Movie', movieSchema);

export default MovieModel;
