import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editMedia } from '../features/media/mediaSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { tmdbApi } from '../api/tmdb';
import type { RootState, AppDispatch } from '../store/store';
import type { Media } from '../types';

type FormData = {
  title: string;
  tagline: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  release_date: string;
  runtime: string;
  vote_average: string;
  original_language: string;
  genres: string[];
};

const STANDARD_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 
  'Documentary', 'Crime', 'Mystery', 'Family'
];

const EditMedia = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const trending = useSelector((state: RootState) => state.media.trending);
  const movies = useSelector((state: RootState) => state.media.movies);
  const tvShows = useSelector((state: RootState) => state.media.tvShows);
  const customMovies = useSelector((state: RootState) => state.media.customMovies);

  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    tagline: '',
    overview: '',
    poster_path: '',
    backdrop_path: '',
    media_type: 'movie',
    release_date: '',
    runtime: '',
    vote_average: '',
    original_language: 'en',
    genres: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (!id || !type) return;

    const fetchMedia = async () => {
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

      // Convert TMDB relative image paths to full URLs for the form validation
      const getFullUrl = (path: string | undefined, size: 'w500' | 'original') => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/${size}${path}`;
      };

      setFormData({
        title: found.title || found.name || '',
        tagline: found.tagline || '',
        overview: found.overview || '',
        poster_path: getFullUrl(found.poster_path, 'w500'),
        backdrop_path: getFullUrl(found.backdrop_path, 'original'),
        media_type: found.media_type || (type as 'movie' | 'tv'),
        release_date: found.release_date || found.first_air_date || '',
        runtime: found.runtime ? found.runtime.toString() : '',
        vote_average: found.vote_average ? found.vote_average.toString() : '',
        original_language: found.original_language || 'en',
        genres: found.genres ? found.genres.map((g) => g.name) : [],
      });
      
      setIsLoading(false);
    };

    fetchMedia();
  }, [id, type, trending, movies, tvShows, customMovies, navigate]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.overview.trim()) newErrors.overview = 'Overview is required';
    if (formData.overview.trim().length < 10) newErrors.overview = 'Overview must be at least 10 characters long';
    
    if (!formData.poster_path.trim()) {
      newErrors.poster_path = 'Poster Image URL is required';
    } else if (!isValidUrl(formData.poster_path)) {
      newErrors.poster_path = 'Must be a valid URL (e.g., https://...)';
    }

    if (formData.backdrop_path && !isValidUrl(formData.backdrop_path)) {
      newErrors.backdrop_path = 'Must be a valid URL (e.g., https://...)';
    }

    if (!formData.release_date) newErrors.release_date = 'Release date is required';
    if (formData.genres.length === 0) newErrors.genres = 'Please select at least one genre';

    if (formData.vote_average) {
      const vote = parseFloat(formData.vote_average);
      if (isNaN(vote) || vote < 0 || vote > 10) {
        newErrors.vote_average = 'Rating must be a number between 0 and 10';
      }
    }

    if (formData.runtime) {
      const time = parseInt(formData.runtime, 10);
      if (isNaN(time) || time <= 0) {
        newErrors.runtime = 'Runtime must be a valid positive number in minutes';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!media || !id) return;

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const updatedMedia: Media = {
      ...media, // Preserve ID and other original properties
      title: formData.media_type === 'movie' ? formData.title : undefined,
      name: formData.media_type === 'tv' ? formData.title : undefined,
      tagline: formData.tagline,
      overview: formData.overview,
      poster_path: formData.poster_path,
      backdrop_path: formData.backdrop_path,
      media_type: formData.media_type,
      release_date: formData.media_type === 'movie' ? formData.release_date : undefined,
      first_air_date: formData.media_type === 'tv' ? formData.release_date : undefined,
      runtime: formData.runtime ? parseInt(formData.runtime, 10) : undefined,
      vote_average: formData.vote_average ? parseFloat(formData.vote_average) : 0,
      original_language: formData.original_language,
      genres: formData.genres.map((name, index) => {
        // Try to keep original genre ID if it exists, otherwise generate a new one
        const existing = media.genres?.find(g => g.name === name);
        return existing ? existing : { id: Date.now() + index, name };
      }),
    };

    dispatch(editMedia(updatedMedia));
    navigate(`/details/${type}/${media.id}`);
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      
      if (genres.length > 0) setErrors((errs) => ({ ...errs, genres: undefined }));
      return { ...prev, genres };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Combine standard genres with any unique genres this specific media might have
  const ALL_GENRES = Array.from(new Set([...STANDARD_GENRES, ...formData.genres]));

  if (!id || !type) return <div className="text-white flex justify-center items-center h-screen">Invalid URL</div>;
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[80vh] bg-black">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-transparent border-t-yellow-500 border-b-yellow-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-md border border-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl shadow-yellow-900/10">
        <h1 className="text-4xl font-extrabold mb-8 text-white drop-shadow-md">
          Edit <span className="text-yellow-500">Media</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* SECTION 1: Basic Information */}
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
            <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 font-medium mb-2">Title / Name <span className="text-yellow-500">*</span></label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. The Matrix"
                  className={`w-full p-3 bg-gray-900 border ${errors.title ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors`}
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-2">Tagline</label>
                <input
                  name="tagline"
                  type="text"
                  placeholder="e.g. Welcome to the Real World"
                  className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  value={formData.tagline}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-2">Overview / Description <span className="text-yellow-500">*</span></label>
              <textarea
                name="overview"
                placeholder="Write a brief synopsis of the movie or show..."
                rows={5}
                className={`w-full p-3 bg-gray-900 border ${errors.overview ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors`}
                value={formData.overview}
                onChange={handleInputChange}
              />
              {errors.overview && <p className="text-red-500 text-sm mt-1">{errors.overview}</p>}
            </div>
          </div>

          {/* SECTION 2: Media Details */}
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
             <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Media Details</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Type <span className="text-yellow-500">*</span></label>
                  <select
                    name="media_type"
                    className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    value={formData.media_type}
                    onChange={handleInputChange}
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
               </div>

               <div>
                  <label className="block text-gray-400 font-medium mb-2">{formData.media_type === 'tv' ? 'First Air Date' : 'Release Date'} <span className="text-yellow-500">*</span></label>
                  <input
                    name="release_date"
                    type="date"
                    className={`w-full p-3 bg-gray-900 border ${errors.release_date ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500`}
                    value={formData.release_date}
                    onChange={handleInputChange}
                  />
                  {errors.release_date && <p className="text-red-500 text-sm mt-1">{errors.release_date}</p>}
               </div>

               <div>
                  <label className="block text-gray-400 font-medium mb-2">Rating (0-10)</label>
                  <input
                    name="vote_average"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.5"
                    className={`w-full p-3 bg-gray-900 border ${errors.vote_average ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500`}
                    value={formData.vote_average}
                    onChange={handleInputChange}
                  />
                  {errors.vote_average && <p className="text-red-500 text-sm mt-1">{errors.vote_average}</p>}
               </div>

               <div>
                  <label className="block text-gray-400 font-medium mb-2">Runtime (mins)</label>
                  <input
                    name="runtime"
                    type="number"
                    placeholder="e.g. 120"
                    className={`w-full p-3 bg-gray-900 border ${errors.runtime ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500`}
                    value={formData.runtime}
                    onChange={handleInputChange}
                  />
                  {errors.runtime && <p className="text-red-500 text-sm mt-1">{errors.runtime}</p>}
               </div>
             </div>

             <div>
                <label className="block text-gray-400 font-medium mb-3">Genres <span className="text-yellow-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {ALL_GENRES.map((genre) => {
                    const isSelected = formData.genres.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                          isSelected
                            ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/30 scale-105'
                            : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
                {errors.genres && <p className="text-red-500 text-sm mt-2">{errors.genres}</p>}
             </div>
          </div>

          {/* SECTION 3: Images */}
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
             <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Media Assets</h3>
             
             <div>
                <label className="block text-gray-400 font-medium mb-2">Poster Image URL <span className="text-yellow-500">*</span></label>
                <input
                  name="poster_path"
                  type="text"
                  placeholder="https://example.com/poster.jpg"
                  className={`w-full p-3 bg-gray-900 border ${errors.poster_path ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 mb-4`}
                  value={formData.poster_path}
                  onChange={handleInputChange}
                />
                {errors.poster_path && <p className="text-red-500 text-sm mt-1 mb-4">{errors.poster_path}</p>}
                
                {formData.poster_path && isValidUrl(formData.poster_path) && (
                  <div className="relative w-32 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
                    <img src={formData.poster_path} alt="Poster Preview" className="w-full h-auto object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                  </div>
                )}
             </div>

             <div className="pt-4">
                <label className="block text-gray-400 font-medium mb-2">Background Cover URL (Optional)</label>
                <input
                  name="backdrop_path"
                  type="text"
                  placeholder="https://example.com/cover.jpg"
                  className={`w-full p-3 bg-gray-900 border ${errors.backdrop_path ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500`}
                  value={formData.backdrop_path}
                  onChange={handleInputChange}
                />
                {errors.backdrop_path && <p className="text-red-500 text-sm mt-1">{errors.backdrop_path}</p>}
             </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4 border-t border-gray-800 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-xl font-bold text-gray-400 hover:text-white mr-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              Update Media Database
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditMedia;