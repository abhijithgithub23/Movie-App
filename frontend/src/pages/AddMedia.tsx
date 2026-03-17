import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMedia } from '../features/media/mediaSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
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

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 
  'Documentary', 'Crime', 'Mystery', 'Family'
];

const AddMedia = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
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

  // 1. Updated Validation to accept both standard URLs and Base64 strings
  const isValidImageSource = (source: string) => {
    if (source.startsWith('data:image/')) return true; // Accept Base64
    try {
      new URL(source);
      return true;
    } catch { 
      return false;
    }
  };

  // 2. File Upload Handler (Converts file to Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'poster_path' | 'backdrop_path') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 2MB to prevent Redux/localStorage from crashing
    const maxSizeInBytes = 2 * 1024 * 1024; 
    if (file.size > maxSizeInBytes) {
      toast.error(`Image is too large. Please select an image under 2MB.`);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, [fieldName]: base64String }));
      
      // Clear validation error if it exists
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast.error('Failed to process image file.');
    };
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.overview.trim()) newErrors.overview = 'Overview is required';
    if (formData.overview.trim().length < 10) newErrors.overview = 'Overview must be at least 10 characters long';
    
    if (!formData.poster_path.trim()) {
      newErrors.poster_path = 'Poster Image is required';
    } else if (!isValidImageSource(formData.poster_path)) {
      newErrors.poster_path = 'Must be a valid URL or uploaded image';
    }

    if (formData.backdrop_path && !isValidImageSource(formData.backdrop_path)) {
      newErrors.backdrop_path = 'Must be a valid URL or uploaded image';
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

    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newMedia: Partial<Media> = {
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
      vote_count: 0,
      original_language: formData.original_language,
      genres: formData.genres.map((name, index) => ({ id: Date.now() + index, name })),
      genre_ids: formData.genres.map((_, index) => Date.now() + index),
    };

    try {
      dispatch(addMedia(newMedia as Media));
      
      toast.success(`${formData.title} was added successfully!`, {
        duration: 2000, 
      });
      
      setTimeout(() => {
        if (formData.media_type === 'movie') {
          navigate('/movies');
        } else {
          navigate('/tv');
        }
      }, 1000); 
      
    } catch (error) {
      console.log('Error adding media:', error);
      toast.error('Failed to add media. Please try again.');
    }
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

  return (
    <div className="min-h-screen bg-black pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-md border border-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-8 text-white drop-shadow-md">
          Add Custom <span className="text-green-500">Media</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* SECTION 1: Basic Information */}
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
            <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 font-medium mb-2">Title / Name <span className="text-green-500">*</span></label>
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. The Matrix"
                  className={`w-full p-3 bg-gray-900 border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1 transition-colors`}
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
                  className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                  value={formData.tagline}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-2">Overview / Description <span className="text-green-500">*</span></label>
              <textarea
                name="overview"
                placeholder="Write a brief synopsis of the movie or show..."
                rows={4}
                className={`w-full p-3 bg-gray-900 border ${errors.overview ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1 transition-colors`}
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
                  <label className="block text-gray-400 font-medium mb-2">Type <span className="text-green-500">*</span></label>
                  <select
                    name="media_type"
                    className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                    value={formData.media_type}
                    onChange={handleInputChange}
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
               </div>

               <div>
                  <label className="block text-gray-400 font-medium mb-2">{formData.media_type === 'tv' ? 'First Air Date' : 'Release Date'} <span className="text-green-500">*</span></label>
                  <input
                    name="release_date"
                    type="date"
                    className={`w-full p-3 bg-gray-900 border ${errors.release_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1`}
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
                    className={`w-full p-3 bg-gray-900 border ${errors.vote_average ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1`}
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
                    className={`w-full p-3 bg-gray-900 border ${errors.runtime ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1`}
                    value={formData.runtime}
                    onChange={handleInputChange}
                  />
                  {errors.runtime && <p className="text-red-500 text-sm mt-1">{errors.runtime}</p>}
               </div>
             </div>

             <div>
                <label className="block text-gray-400 font-medium mb-3">Genres <span className="text-green-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {GENRE_OPTIONS.map((genre) => {
                    const isSelected = formData.genres.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                          isSelected
                            ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-600/30 scale-105'
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

          {/* SECTION 3: Images (Now with File Uploads) */}
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
             <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Media Assets</h3>
             
             {/* Poster Upload/URL */}
             <div>
                <label className="block text-gray-400 font-medium mb-2">Poster Image <span className="text-green-500">*</span></label>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    name="poster_path"
                    type="text"
                    placeholder="Paste image URL here..."
                    className={`flex-1 p-3 bg-gray-900 border ${errors.poster_path ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1`}
                    value={formData.poster_path}
                    onChange={handleInputChange}
                  />
                  
                  {/* The actual File Input (Hidden) triggered by a Label acting as a button */}
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload File
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'poster_path')}
                    />
                  </label>
                </div>
                {errors.poster_path && <p className="text-red-500 text-sm mt-1 mb-4">{errors.poster_path}</p>}
                
                {formData.poster_path && isValidImageSource(formData.poster_path) && (
                  <div className="relative w-32 rounded-lg overflow-hidden border border-gray-700 shadow-xl mt-2">
                    <img src={formData.poster_path} alt="Poster Preview" className="w-full h-auto object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                  </div>
                )}
             </div>

             {/* Backdrop Upload/URL */}
             <div className="pt-4 border-t border-gray-800">
                <label className="block text-gray-400 font-medium mb-2">Background Cover (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    name="backdrop_path"
                    type="text"
                    placeholder="Paste image URL here..."
                    className={`flex-1 p-3 bg-gray-900 border ${errors.backdrop_path ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-green-500'} text-white rounded-lg focus:outline-none focus:ring-1`}
                    value={formData.backdrop_path}
                    onChange={handleInputChange}
                  />
                  <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload File
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, 'backdrop_path')}
                    />
                  </label>
                </div>
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
              className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-500 shadow-lg shadow-green-600/30 hover:shadow-green-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Save Media Database
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddMedia;