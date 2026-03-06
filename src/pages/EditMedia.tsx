import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editMedia } from '../features/media/mediaSlice';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from '../store/store';
import type { Media } from '../types';

const EditMedia = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Grab media to edit from Redux
  const mediaToEdit = useSelector((state: RootState) =>
    state.media.trending.find((m) => String(m.id) === id)
  );

  // Initialize state directly from mediaToEdit
  const [formData, setFormData] = useState<Partial<Media>>(() => {
    if (!mediaToEdit) {
      return { title: '', overview: '', poster_path: '', media_type: 'movie' };
    }

    return {
      title: mediaToEdit.title || mediaToEdit.name,
      overview: mediaToEdit.overview,
      poster_path: mediaToEdit.poster_path,
      media_type: mediaToEdit.media_type || 'movie',
    };
  });

  // Only handle navigation if media not found
  useEffect(() => {
    if (!mediaToEdit) {
      navigate('/');
    }
  }, [mediaToEdit, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaToEdit) return;

    const updatedMedia: Media = {
      ...mediaToEdit,
      ...formData,
      title: formData.media_type === 'movie' ? formData.title : undefined,
      name: formData.media_type === 'tv' ? formData.title : undefined,
    };

    dispatch(editMedia(updatedMedia));
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400">Edit Media</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="sr-only" htmlFor="title">Title or Name</label>
        <input
          id="title"
          type="text"
          placeholder="Title or Name"
          required
          className="p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-yellow-500 outline-none"
          value={formData.title || ''}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />

        <label className="sr-only" htmlFor="overview">Overview</label>
        <textarea
          id="overview"
          placeholder="Overview / Description"
          required
          rows={4}
          className="p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-yellow-500 outline-none"
          value={formData.overview || ''}
          onChange={e => setFormData({ ...formData, overview: e.target.value })}
        />

        <label className="sr-only" htmlFor="poster">Poster Image URL</label>
        <input
          id="poster"
          type="text"
          placeholder="Poster Image URL"
          required
          className="p-3 bg-gray-700 text-white rounded focus:ring-2 focus:ring-yellow-500 outline-none"
          value={formData.poster_path || ''}
          onChange={e => setFormData({ ...formData, poster_path: e.target.value })}
        />

        <label htmlFor="media_type" className="text-gray-300">Media Type</label>
        <select
          id="media_type"
          className="p-3 bg-gray-700 text-white rounded outline-none"
          value={formData.media_type}
          onChange={e =>
            setFormData({ ...formData, media_type: e.target.value as 'movie' | 'tv' })
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