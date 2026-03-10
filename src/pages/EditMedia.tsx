import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editMedia } from '../features/media/mediaSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { tmdbApi } from '../api/tmdb';
import type { RootState, AppDispatch } from '../store/store';
import type { Media } from '../types';

const EditMedia = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Removed the 'favorites' selector here
  const trending = useSelector((state: RootState) => state.media.trending);
  const movies = useSelector((state: RootState) => state.media.movies);
  const tvShows = useSelector((state: RootState) => state.media.tvShows);
  const customMovies = useSelector((state: RootState) => state.media.customMovies);

  const [media, setMedia] = useState<Media | null>(null);

  const [formData, setFormData] = useState<Partial<Media>>({
    title: '',
    overview: '',
    poster_path: '',
    media_type: 'movie',
  });

  useEffect(() => {
    if (!id || !type) return;

    const fetchMedia = async () => {
      // Removed the 'favorites' check from this chain
      let found: Media | undefined =
        customMovies.find((m) => String(m.id) === id) ||
        trending.find((m) => String(m.id) === id) ||
        movies.find((m) => String(m.id) === id) ||
        tvShows.find((m) => String(m.id) === id);

      if (!found && !id.startsWith('custom-')) {
        try {
          const res = await tmdbApi.get<Media>(`/${type}/${id}`);
          found = res.data;
        } catch (err) {
          console.error('Failed to fetch media', err);
          navigate('/');
          return;
        }
      }

      if (!found) {
        console.error('Media not found');
        navigate('/');
        return;
      }

      setMedia(found);

      setFormData({
        title: found.title || found.name,
        overview: found.overview,
        poster_path: found.poster_path,
        media_type: found.media_type || (type as 'movie' | 'tv'),
      });
    };

    fetchMedia();
  // Removed 'favorites' from the dependency array below
  }, [id, type, trending, movies, tvShows, customMovies, navigate]);

  if (!id || !type)
    return (
      <div className="text-white flex justify-center items-center h-screen">
        Invalid URL
      </div>
    );

  if (!media)
    return (
      <div className="text-white flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!media || !id) return;

    const updatedMedia: Media = {
      ...media,
      overview: formData.overview || media.overview,
      poster_path: formData.poster_path || media.poster_path,
      media_type: formData.media_type || media.media_type,
      ...(formData.media_type === 'movie'
        ? { title: formData.title, name: undefined }
        : { name: formData.title, title: undefined }),
    };

    dispatch(editMedia(updatedMedia));

    navigate(`/details/${type}/${media.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">Edit Media</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title or Name"
          required
          className="p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-yellow-500 outline-none"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <textarea
          placeholder="Overview / Description"
          required
          rows={4}
          className="p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-yellow-500 outline-none"
          value={formData.overview || ''}
          onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
        />

        <input
          type="text"
          placeholder="Poster Image URL"
          required
          className="p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-yellow-500 outline-none"
          value={formData.poster_path || ''}
          onChange={(e) => setFormData({ ...formData, poster_path: e.target.value })}
        />

        <select
          className="p-3 bg-gray-700 text-white rounded outline-none"
          value={formData.media_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              media_type: e.target.value as 'movie' | 'tv',
            })
          }
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>

        <button
          type="submit"
          className="bg-yellow-500 text-gray-900 py-3 rounded font-bold hover:bg-yellow-400 transition"
        >
          Update Media
        </button>
      </form>
    </div>
  );
};

export default EditMedia;