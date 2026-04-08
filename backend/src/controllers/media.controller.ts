import { Request, Response } from 'express';
import { 
  fetchTrendingMedia,
  fetchMovies,
  fetchTvShows,
  fetchMediaDetails,
  searchMedia,
  createMedia,
  MediaInsertDTO,
  SearchFilters, 
  updateMedia,
  deleteMediaRecord 
} from '../services/media.service';

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchTrendingMedia();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching trending media:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await fetchMovies(page);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTvShows = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await fetchTvShows(page);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMediaDetails = async (
  req: Request<{ type: string; id: string }>, 
  res: Response
): Promise<void> => {
  try {
    const { type, id } = req.params;
    
    const tmdbId = parseInt(id);
    if (isNaN(tmdbId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const details = await fetchMediaDetails(type, tmdbId);

    if (!details) {
      res.status(404).json({ message: 'Media details not found' });
      return;
    }

    res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching media details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchMediaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, mediaType, year, rating, language, genre } = req.query;
    
    if (!query) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // CRITICAL FIX: Dynamically build the object to satisfy exactOptionalPropertyTypes
    const filters: SearchFilters = {};
    
    if (mediaType) filters.mediaType = mediaType as string;
    if (year) filters.year = year as string;
    if (rating) filters.rating = Number(rating);
    if (language) filters.language = language as string;
    if (genre) filters.genre = Number(genre);

    const data = await searchMedia(query as string, filters);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error searching media:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const mediaData: MediaInsertDTO = req.body;
    
    const newMedia = await createMedia(mediaData);
    
    res.status(201).json(newMedia);
  } catch (error: unknown) { 
    console.error('Error adding media:', error);
    
    let errorMessage = 'Server error creating media';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
};

export const editMediaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const mediaData: MediaInsertDTO = req.body;
    
    const updated = await updateMedia(id, mediaData);
    res.status(200).json(updated);
  } catch (error: unknown) {
    console.error('Error updating media:', error);
    let errorMessage = 'Server error updating media';
    if (error instanceof Error) errorMessage = error.message;
    res.status(500).json({ message: errorMessage });
  }
};

export const deleteMediaController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    
    await deleteMediaRecord(id);
    res.status(200).json({ message: 'Media and associated assets deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting media:', error);
    let errorMessage = 'Server error deleting media';
    if (error instanceof Error) errorMessage = error.message;
    res.status(500).json({ message: errorMessage });
  }
};