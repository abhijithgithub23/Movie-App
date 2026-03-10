import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMedia } from '../features/media/mediaSlice';
import { useNavigate } from 'react-router-dom';
import type { Media } from '../types';

type FormData = {
  title: string;
  overview: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  release_date: string;
  genres: string[];
};

const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Animation',
  'Documentary',
];

const AddMedia = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    overview: '',
    poster_path: '',
    media_type: 'movie',
    release_date: '',
    genres: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TMDB uses 'title' for movies and 'name' for TV shows. 
    // We map the form's title input to both to ensure your UI displays it correctly either way.
    const newMedia = {
      ...formData,
      name: formData.media_type === 'tv' ? formData.title : undefined,
      genres: formData.genres.map((name, index) => ({ id: index + 1, name })),
    } as unknown as Media;

    // Dispatch directly as the Media object to match PayloadAction<Media> in your slice
    dispatch(addMedia(newMedia));

    navigate('/');
  };

  // Toggle genre in the array
  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400">Add New Media</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <label htmlFor="media-title" className="text-white font-semibold">Title or Name</label>
        <input
          id="media-title"
          type="text"
          placeholder="Title or Name"
          required
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        {/* Overview */}
        <label htmlFor="media-overview" className="text-white font-semibold">Overview / Description</label>
        <textarea
          id="media-overview"
          placeholder="Overview / Description"
          required
          rows={4}
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.overview}
          onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
        />

        {/* Poster */}
        <label htmlFor="media-poster" className="text-white font-semibold">Poster Image URL</label>
        <input
          id="media-poster"
          type="text"
          placeholder="https://example.com/poster.jpg"
          required
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.poster_path}
          onChange={(e) => setFormData({ ...formData, poster_path: e.target.value })}
        />

        {/* Poster Preview */}
        {formData.poster_path && (
          <div className="mt-2">
            <img
              src={formData.poster_path}
              alt="Poster Preview"
              className="w-48 h-auto rounded shadow-lg border border-gray-600"
              onError={(e) => ((e.target as HTMLImageElement).src = '')} // hides if invalid URL
            />
          </div>
        )}

        {/* Media Type */}
        <label htmlFor="media-type" className="text-white font-semibold">Media Type</label>
        <select
          id="media-type"
          className="p-3 bg-gray-700 text-white rounded focus:outline-none"
          value={formData.media_type}
          onChange={(e) =>
            setFormData({ ...formData, media_type: e.target.value as 'movie' | 'tv' })
          }
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>

        {/* Release Date */}
        <label htmlFor="media-date" className="text-white font-semibold">Release Date</label>
        <input
          id="media-date"
          type="date"
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.release_date}
          onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
        />

        {/* Genres as toggle buttons */}
        <label className="text-white font-semibold">Genres</label>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((genre) => {
            const isSelected = formData.genres.includes(genre);
            return (
              <button
                type="button"
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 rounded-full border transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-700 text-white border-gray-500 hover:bg-gray-600'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-indigo-600 py-3 rounded font-bold hover:bg-indigo-700 transition mt-4"
        >
          Save Media
        </button>
      </form>
    </div>
  );
};

export default AddMedia;