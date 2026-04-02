import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMediaAsync } from '../features/media/mediaSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import apiClient from '../api/apiClient';
import type { AppDispatch } from '../store/store';
import type { Media } from '../types';
import axios from 'axios';

type FormData = {
  title: string;
  tagline: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  release_date: string;
  runtime: string;
  number_of_seasons: string;
  number_of_episodes: string;
  vote_average: string;
  popularity: string; 
  original_language: string;
  genres: string[];
  spoken_languages: string[];
};

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 
  'Documentary', 'Crime', 'Mystery', 'Family'
];

const LANGUAGE_OPTIONS = [
  { iso: 'en', english_name: 'English', name: 'English' },
  { iso: 'hi', english_name: 'Hindi', name: 'हिन्दी' },
  { iso: 'es', english_name: 'Spanish', name: 'Español' },
  { iso: 'fr', english_name: 'French', name: 'Français' },
  { iso: 'ja', english_name: 'Japanese', name: '日本語' },
  { iso: 'ko', english_name: 'Korean', name: '한국어/조선말' },
  { iso: 'it', english_name: 'Italian', name: 'Italiano' },
  { iso: 'kn', english_name: 'Kannada', name: 'ಕನ್ನಡ' },
  { iso: 'ml', english_name: 'Malayalam', name: 'മലയാളം' },
  { iso: 'ta', english_name: 'Tamil', name: 'தமிழ்' },
  { iso: 'te', english_name: 'Telugu', name: 'తెలుగు' }
];

const AddMedia = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '', tagline: '', overview: '', poster_path: '', backdrop_path: '',
    media_type: 'movie', release_date: '', runtime: '', 
    number_of_seasons: '', number_of_episodes: '',
    vote_average: '', popularity: '', original_language: 'en', genres: [],
    spoken_languages: ['en'],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const todayDateString = new Date().toISOString().split('T')[0];

  const isValidImageSource = (source: string) => {
    if (source.startsWith('data:image/')) return true; 
    try { new URL(source); return true; } catch { return false; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'poster_path' | 'backdrop_path') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Image is too large. Please select an image under 10MB.`);
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    const toastId = toast.loading('Uploading Image...');

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((prev) => ({ ...prev, [fieldName]: response.data.url }));
      if (errors[fieldName]) setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      toast.success('Image uploaded securely!', { id: toastId });
      
    } catch (error: unknown) { 
      console.error('Upload Error:', error);
      let errorMessage = 'Failed to upload image.';
      if (axios.isAxiosError(error)) errorMessage = error.response?.data?.message || errorMessage;
      else if (error instanceof Error) errorMessage = error.message;
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; 
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Type Validation
    if (formData.media_type !== 'movie' && formData.media_type !== 'tv') {
      newErrors.media_type = 'Invalid media type selected';
    }

    // Title Validation
    if (!formData.title.trim()) newErrors.title = 'Title is required';

    // Overview Validation
    const overviewTrimmed = formData.overview.trim();
    if (!overviewTrimmed) {
      newErrors.overview = 'Overview is required';
    } else if (overviewTrimmed.length < 10) {
      newErrors.overview = 'Overview must be at least 10 characters long';
    } else if (overviewTrimmed.split(/\s+/).length < 3) {
      newErrors.overview = 'Overview must contain at least 3 words';
    }

    // Release Date Validation
    if (!formData.release_date) {
      newErrors.release_date = 'Date is required';
    } else if (new Date(formData.release_date) > new Date()) {
      newErrors.release_date = 'Release date cannot be in the future';
    }

    // Number Validations
    if (formData.media_type === 'movie' && formData.runtime) {
      const runtime = Number(formData.runtime);
      if (isNaN(runtime) || runtime <= 0) newErrors.runtime = 'Runtime must be a valid positive number';
    }

    if (formData.media_type === 'tv') {
      if (formData.number_of_seasons) {
        const seasons = Number(formData.number_of_seasons);
        if (isNaN(seasons) || seasons < 0) newErrors.number_of_seasons = 'Must be a valid positive number';
      }
      if (formData.number_of_episodes) {
        const episodes = Number(formData.number_of_episodes);
        if (isNaN(episodes) || episodes < 0) newErrors.number_of_episodes = 'Must be a valid positive number';
      }
    }

    // Rating & Popularity Validations (Max 2 decimal places)
    if (formData.vote_average) {
      const vote = Number(formData.vote_average);
      if (isNaN(vote) || vote < 0 || vote > 10) {
        newErrors.vote_average = 'Rating must be between 0 and 10';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.vote_average.trim())) {
        newErrors.vote_average = 'Rating can have at most 2 decimal places';
      }
    }

    if (formData.popularity) {
      const pop = Number(formData.popularity);
      if (isNaN(pop) || pop < 0) {
        newErrors.popularity = 'Popularity must be a valid positive number';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.popularity.trim())) {
        newErrors.popularity = 'Popularity can have at most 2 decimal places';
      }
    }

    // Genres & Languages Validations
    if (formData.genres.length === 0) newErrors.genres = 'Select at least one genre';
    if (formData.spoken_languages.length === 0) newErrors.spoken_languages = 'Select at least one language';
    
    // Image Validations
    if (!formData.poster_path.trim()) {
      newErrors.poster_path = 'Poster Image URL is required';
    } else if (!isValidImageSource(formData.poster_path.trim())) {
      newErrors.poster_path = 'Must be a valid URL or uploaded image';
    }

    if (formData.backdrop_path.trim() && !isValidImageSource(formData.backdrop_path.trim())) {
      newErrors.backdrop_path = 'Must be a valid URL or uploaded image';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);

    const mappedLanguages = LANGUAGE_OPTIONS
      .filter(lang => formData.spoken_languages.includes(lang.iso))
      .map(lang => ({
        iso_639_1: lang.iso,
        english_name: lang.english_name,
        name: lang.name
      }));

    const newMedia: Partial<Media> = {
      type: formData.media_type,
      title: formData.media_type === 'movie' ? formData.title.trim() : undefined,
      original_name: formData.media_type === 'tv' ? formData.title.trim() : undefined,
      tagline: formData.tagline.trim(),
      overview: formData.overview.trim(),
      poster_path: formData.poster_path.trim(), 
      backdrop_path: formData.backdrop_path.trim() || undefined,
      release_date: formData.media_type === 'movie' ? formData.release_date : undefined,
      first_air_date: formData.media_type === 'tv' ? formData.release_date : undefined,
      runtime: formData.media_type === 'movie' && formData.runtime ? parseInt(formData.runtime, 10) : undefined,
      number_of_seasons: formData.media_type === 'tv' && formData.number_of_seasons ? parseInt(formData.number_of_seasons, 10) : undefined,
      number_of_episodes: formData.media_type === 'tv' && formData.number_of_episodes ? parseInt(formData.number_of_episodes, 10) : undefined,
      vote_average: formData.vote_average ? parseFloat(formData.vote_average) : 0,
      popularity: formData.popularity ? parseFloat(formData.popularity) : 0,
      genres: formData.genres.map((name, index) => ({ id: Date.now() + index, name })), 
      spoken_languages: mappedLanguages,
    };

    try {
      await dispatch(addMediaAsync(newMedia)).unwrap();
      toast.success(`"${formData.title.trim()}" added to database!`);
      navigate(formData.media_type === 'movie' ? '/movies' : '/tv');
    } catch (error: unknown) { 
      const errorMessage = typeof error === 'string' ? error : 'Failed to add media to database.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const genres = prev.genres.includes(genre) ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre];
      if (genres.length > 0) setErrors((errs) => ({ ...errs, genres: undefined }));
      return { ...prev, genres };
    });
  };

  const toggleLanguage = (iso: string) => {
    setFormData((prev) => {
      const langs = prev.spoken_languages.includes(iso) ? prev.spoken_languages.filter(l => l !== iso) : [...prev.spoken_languages, iso];
      if (langs.length > 0) setErrors((errs) => ({ ...errs, spoken_languages: undefined }));
      return { ...prev, spoken_languages: langs };
    });
  };

  return (
    <div className="min-h-screen bg-black pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-md border border-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-8 text-white drop-shadow-md">Add Custom <span className="text-green-500">Media</span></h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Type *</label>
                  <select name="media_type" className={`w-full p-3 bg-gray-900 border ${errors.media_type ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.media_type} onChange={handleInputChange}>
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
                  {errors.media_type && <p className="text-red-500 text-sm mt-1">{errors.media_type}</p>}
               </div>
               <div className="col-span-1 md:col-span-1 lg:col-span-3">
                  <label className="block text-gray-400 font-medium mb-2">Title *</label>
                  <input name="title" type="text" className={`w-full p-3 bg-gray-900 border ${errors.title ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.title} onChange={handleInputChange} />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-400 font-medium mb-2">{formData.media_type === 'tv' ? 'First Air Date *' : 'Release Date *'}</label>
                  <input 
                    name="release_date" 
                    type="date" 
                    max={todayDateString}
                    className={`w-full p-3 bg-gray-900 border ${errors.release_date ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} 
                    value={formData.release_date} 
                    onChange={handleInputChange} 
                  />
                  {errors.release_date && <p className="text-red-500 text-sm mt-1">{errors.release_date}</p>}
                </div>
                
                {formData.media_type === 'movie' ? (
                  <div>
                    <label className="block text-gray-400 font-medium mb-2">Runtime (mins)</label>
                    <input name="runtime" type="number" min="1" className={`w-full p-3 bg-gray-900 border ${errors.runtime ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.runtime} onChange={handleInputChange} />
                    {errors.runtime && <p className="text-red-500 text-sm mt-1">{errors.runtime}</p>}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">Seasons</label>
                      <input name="number_of_seasons" type="number" min="1" className={`w-full p-3 bg-gray-900 border ${errors.number_of_seasons ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.number_of_seasons} onChange={handleInputChange} />
                      {errors.number_of_seasons && <p className="text-red-500 text-sm mt-1">{errors.number_of_seasons}</p>}
                    </div>
                    <div>
                      <label className="block text-gray-400 font-medium mb-2">Episodes</label>
                      <input name="number_of_episodes" type="number" min="1" className={`w-full p-3 bg-gray-900 border ${errors.number_of_episodes ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.number_of_episodes} onChange={handleInputChange} />
                      {errors.number_of_episodes && <p className="text-red-500 text-sm mt-1">{errors.number_of_episodes}</p>}
                    </div>
                  </>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Rating (0-10)</label>
                  <input 
                    name="vote_average" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    max="10" 
                    placeholder="e.g. 7.28"
                    className={`w-full p-3 bg-gray-900 border ${errors.vote_average ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} 
                    value={formData.vote_average} 
                    onChange={handleInputChange} 
                  />
                  {errors.vote_average && <p className="text-red-500 text-sm mt-1">{errors.vote_average}</p>}
               </div>
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Popularity</label>
                  <input 
                    name="popularity" 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="e.g. 101.23"
                    className={`w-full p-3 bg-gray-900 border ${errors.popularity ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} 
                    value={formData.popularity} 
                    onChange={handleInputChange} 
                  />
                  {errors.popularity && <p className="text-red-500 text-sm mt-1">{errors.popularity}</p>}
               </div>
             </div>

             <div>
                <label className="block text-gray-400 font-medium mb-2">Overview *</label>
                <textarea name="overview" rows={3} className={`w-full p-3 bg-gray-900 border ${errors.overview ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.overview} onChange={handleInputChange} />
                {errors.overview && <p className="text-red-500 text-sm mt-1">{errors.overview}</p>}
             </div>

             <div>
                <label className="block text-gray-400 font-medium mb-3">Genres *</label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((g) => (
                    <button type="button" key={g} onClick={() => toggleGenre(g)} className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.genres.includes(g) ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{g}</button>
                  ))}
                </div>
                {errors.genres && <p className="text-red-500 text-sm mt-2">{errors.genres}</p>}
             </div>

             <div className="pt-4 border-t border-gray-800">
                <label className="block text-gray-400 font-medium mb-3">Spoken Languages *</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button 
                      type="button" 
                      key={lang.iso} 
                      onClick={() => toggleLanguage(lang.iso)} 
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.spoken_languages.includes(lang.iso) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {lang.english_name}
                    </button>
                  ))}
                </div>
                {errors.spoken_languages && <p className="text-red-500 text-sm mt-2">{errors.spoken_languages}</p>}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Poster URL or Upload *</label>
                  <input name="poster_path" type="text" className={`w-full p-3 mb-2 bg-gray-900 border ${errors.poster_path ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.poster_path} onChange={handleInputChange} />
                  <input type="file" accept="image/*" className="text-sm text-gray-400" disabled={isUploadingImage} onChange={(e) => handleFileUpload(e, 'poster_path')} />
                  {errors.poster_path && <p className="text-red-500 text-sm mt-1">{errors.poster_path}</p>}
               </div>
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Backdrop URL or Upload</label>
                  <input name="backdrop_path" type="text" className={`w-full p-3 mb-2 bg-gray-900 border ${errors.backdrop_path ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.backdrop_path} onChange={handleInputChange} />
                  <input type="file" accept="image/*" className="text-sm text-gray-400" disabled={isUploadingImage} onChange={(e) => handleFileUpload(e, 'backdrop_path')} />
                  {errors.backdrop_path && <p className="text-red-500 text-sm mt-1">{errors.backdrop_path}</p>}
               </div>
             </div>
          </div>

          <div className="flex justify-end mt-4">
            <button 
              type="submit" 
              disabled={isSubmitting || isUploadingImage} 
              className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-500 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving to Database...' : isUploadingImage ? 'Uploading Image...' : 'Save Media Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedia;