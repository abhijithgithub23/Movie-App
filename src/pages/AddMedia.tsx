import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMedia } from '../features/media/mediaSlice';
import { useNavigate } from 'react-router-dom';
import type { Media } from '../types';

type FormData = {
  title: string;
  overview: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
};

const AddMedia = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    overview: '',
    poster_path: '',
    media_type: 'movie',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMedia: Media = {
      id: Date.now(),
      ...formData,
      genre_ids: [], // Add genre selection logic if needed
    };

    dispatch(addMedia(newMedia));
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-indigo-400">Add New Media</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Title */}
        <label htmlFor="media-title" className="text-white font-semibold">
          Title or Name
        </label>
        <input
          id="media-title"
          type="text"
          placeholder="Title or Name"
          required
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />

        {/* Overview */}
        <label htmlFor="media-overview" className="text-white font-semibold">
          Overview / Description
        </label>
        <textarea
          id="media-overview"
          placeholder="Overview / Description"
          required
          rows={4}
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.overview}
          onChange={e => setFormData({ ...formData, overview: e.target.value })}
        />

        {/* Poster Path */}
        <label htmlFor="media-poster" className="text-white font-semibold">
          Poster Image URL
        </label>
        <input
          id="media-poster"
          type="text"
          placeholder="https://example.com/poster.jpg"
          required
          className="p-3 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.poster_path}
          onChange={e => setFormData({ ...formData, poster_path: e.target.value })}
        />

        {/* Media Type */}
        <label htmlFor="media-type" className="text-white font-semibold">
          Media Type
        </label>
        <select
          id="media-type"
          className="p-3 bg-gray-700 text-white rounded focus:outline-none"
          value={formData.media_type}
          onChange={e =>
            setFormData({ ...formData, media_type: e.target.value as 'movie' | 'tv' })
          }
        >
          <option value="movie">Movie</option>
          <option value="tv">TV Show</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="bg-indigo-600 py-3 rounded font-bold hover:bg-indigo-700 transition"
        >
          Save Media
        </button>
      </form>
    </div>
  );
};

export default AddMedia;