import { Request, Response } from 'express';
import { fetchTrendingMedia, fetchMovies, fetchTvShows, fetchMediaDetails, searchMedia } from '../services/media.service';

export const getTrending = async (req: Request, res: Response) => {
  try {
    const data = await fetchTrendingMedia();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching trending media:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMovies = async (req: Request, res: Response) => {
  try {
    // Extract page from query, default to 1 if not provided
    const page = parseInt(req.query.page as string) || 1;
    const data = await fetchMovies(page);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTvShows = async (req: Request, res: Response) => {
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
    
    // Now TypeScript knows 'id' is definitely a string
    const tmdbId = parseInt(id);
    
    if (isNaN(tmdbId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    // Now TypeScript knows 'type' is definitely a string
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
    const searchQuery = req.query.query as string;
    
    if (!searchQuery) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const data = await searchMedia(searchQuery);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error searching media:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

