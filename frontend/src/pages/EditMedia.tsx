import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editMediaAsync } from '../features/media/mediaSlice';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import type { RootState, AppDispatch } from '../store/store';
import type { Media } from '../types';
import apiClient from '../api/apiClient';
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
  vote_average: string;
  popularity: string;
  original_language: string;
  genres: string[];
  spoken_languages: string[];
};

const STANDARD_GENRES = [
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

const EditMedia = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const trending = useSelector((state: RootState) => state.media.trending);
  const movies = useSelector((state: RootState) => state.media.movies);
  const tvShows = useSelector((state: RootState) => state.media.tvShows);
  const customMovies = useSelector((state: RootState) => state.media.customMovies);

  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '', tagline: '', overview: '', poster_path: '', backdrop_path: '',     
    media_type: 'movie', release_date: '', runtime: '', vote_average: '', popularity: '',
    original_language: 'en', genres: [], spoken_languages: ['en'],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (!id || !type) return;

    const populateForm = (finalMedia: Media) => {
      setMedia(finalMedia);

      const getFullUrl = (path: string | undefined, size: 'w500' | 'original') => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
        return `https://image.tmdb.org/t/p/${size}${path}`;
      };

      // FIX: Safely extract the raw date
      const rawDate = finalMedia.release_date || finalMedia.first_air_date || '';
      
      // FIX: Chop off the time data so the HTML input doesn't crash (takes only the first 10 characters: YYYY-MM-DD)
      const formattedDate = rawDate ? new Date(rawDate).toISOString().substring(0, 10) : '';

      setFormData({
        title: finalMedia.title || finalMedia.name || '',
        tagline: finalMedia.tagline || '',
        overview: finalMedia.overview || '',
        poster_path: getFullUrl(finalMedia.poster_path, 'w500'),
        backdrop_path: getFullUrl(finalMedia.backdrop_path, 'original'),
        media_type: finalMedia.media_type || (type as 'movie' | 'tv'),
        
        // Apply the chopped date here!
        release_date: formattedDate,
        
        runtime: finalMedia.runtime ? finalMedia.runtime.toString() : '',
        vote_average: finalMedia.vote_average ? finalMedia.vote_average.toString() : '',
        popularity: finalMedia.popularity ? finalMedia.popularity.toString() : '',
        original_language: finalMedia.original_language || 'en',
        genres: finalMedia.genres ? finalMedia.genres.map((g) => g.name) : [],
        spoken_languages: finalMedia.spoken_languages ? finalMedia.spoken_languages.map((l) => l.iso_639_1) : ['en'],
      });
      setIsLoading(false);
    };

    const passedMedia = location.state?.fullMedia as Media | undefined;
    if (passedMedia) {
      populateForm(passedMedia);
      return; 
    }

    const fetchMedia = async () => {
      const foundRedux: Media | undefined =
        customMovies.find((m) => String(m.id) === id) ||
        trending.find((m) => String(m.id) === id) ||
        movies.find((m) => String(m.id) === id) ||
        tvShows.find((m) => String(m.id) === id);

      if (foundRedux) {
        populateForm(foundRedux);
      } else {
        navigate('/');
      }
    };

    fetchMedia();
  }, [id, type, trending, movies, tvShows, customMovies, navigate, location.state]);

  const isValidImageSource = (source: string) => {
    if (source.startsWith('data:image/')) return true;
    try { new URL(source); return true; } catch { return false; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'poster_path' | 'backdrop_path') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`Image is too large. Please select an image under 10MB.`);
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

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.overview.trim()) newErrors.overview = 'Overview is required';
    
    if (!formData.poster_path.trim()) newErrors.poster_path = 'Poster Image URL is required';
    else if (!isValidImageSource(formData.poster_path)) newErrors.poster_path = 'Must be a valid URL';

    if (!formData.release_date) newErrors.release_date = 'Release date is required';
    if (formData.genres.length === 0) newErrors.genres = 'Please select at least one genre';
    if (formData.spoken_languages.length === 0) newErrors.spoken_languages = 'Select at least one language';

    if (formData.vote_average) {
      const vote = parseFloat(formData.vote_average);
      if (isNaN(vote) || vote < 0 || vote > 10) newErrors.vote_average = 'Rating must be between 0 and 10';
    }

    if (formData.popularity) {
      const pop = parseFloat(formData.popularity);
      if (isNaN(pop) || pop < 0) newErrors.popularity = 'Popularity must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media || !id) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form.'); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const mappedLanguages = LANGUAGE_OPTIONS
      .filter(lang => formData.spoken_languages.includes(lang.iso))
      .map(lang => ({ iso_639_1: lang.iso, english_name: lang.english_name, name: lang.name }));

    const updatedMedia: Media = {
      ...media, 
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
      popularity: formData.popularity ? parseFloat(formData.popularity) : 0,
      original_language: formData.spoken_languages[0] || 'en',
      genres: formData.genres.map((name, index) => {
        const existing = media.genres?.find(g => g.name === name);
        return existing ? existing : { id: Date.now() + index, name };
      }),
      spoken_languages: mappedLanguages,
    };

    try {
      await dispatch(editMediaAsync(updatedMedia)).unwrap();
      toast.success(`"${formData.title}" updated successfully!`, { duration: 2000 });
      setTimeout(() => navigate(`/details/${formData.media_type}/${media.id}`), 1000);
    } catch (error: unknown) {
      console.error("Failed to update media:", error);
      let errorMessage = 'Failed to update media. Please try again.';
      if (axios.isAxiosError(error)) errorMessage = error.response?.data?.message || errorMessage;
      else if (error instanceof Error) errorMessage = error.message;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

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
          
          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
            <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 font-medium mb-2">Title / Name <span className="text-yellow-500">*</span></label>
                <input name="title" type="text" className={`w-full p-3 bg-gray-900 border ${errors.title ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.title} onChange={handleInputChange} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-gray-400 font-medium mb-2">Tagline</label>
                <input name="tagline" type="text" className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.tagline} onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-medium mb-2">Overview / Description <span className="text-yellow-500">*</span></label>
              <textarea name="overview" rows={5} className={`w-full p-3 bg-gray-900 border ${errors.overview ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.overview} onChange={handleInputChange} />
              {errors.overview && <p className="text-red-500 text-sm mt-1">{errors.overview}</p>}
            </div>
          </div>

          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
             <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Media Details</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Type <span className="text-yellow-500">*</span></label>
                  <select name="media_type" className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.media_type} onChange={handleInputChange}>
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
               </div>
               <div>
                  <label className="block text-gray-400 font-medium mb-2">{formData.media_type === 'tv' ? 'First Air Date' : 'Release Date'} <span className="text-yellow-500">*</span></label>
                  <input name="release_date" type="date" className={`w-full p-3 bg-gray-900 border ${errors.release_date ? 'border-red-500' : 'border-gray-700'} text-white rounded-lg`} value={formData.release_date} onChange={handleInputChange} />
               </div>
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Runtime (mins)</label>
                  <input name="runtime" type="number" className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.runtime} onChange={handleInputChange} />
               </div>
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Rating</label>
                  <input name="vote_average" type="number" step="0.01" max="10" className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.vote_average} onChange={handleInputChange} />
               </div>
               <div>
                  <label className="block text-gray-400 font-medium mb-2">Popularity</label>
                  <input name="popularity" type="number" step="0.01" className="w-full p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.popularity} onChange={handleInputChange} />
               </div>
             </div>

             <div>
                <label className="block text-gray-400 font-medium mb-3">Genres <span className="text-yellow-500">*</span></label>
                <div className="flex flex-wrap gap-3">
                  {ALL_GENRES.map((genre) => (
                    <button type="button" key={genre} onClick={() => toggleGenre(genre)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${formData.genres.includes(genre) ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/30 scale-105' : 'bg-transparent text-gray-400 border-gray-700 hover:text-white'}`}>
                      {genre}
                    </button>
                  ))}
                </div>
             </div>

             <div className="pt-4 border-t border-gray-800">
                <label className="block text-gray-400 font-medium mb-3">Spoken Languages <span className="text-yellow-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button type="button" key={lang.iso} onClick={() => toggleLanguage(lang.iso)} className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.spoken_languages.includes(lang.iso) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {lang.english_name}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800/50">
             <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Media Assets</h3>
             
             <div>
                <label className="block text-gray-400 font-medium mb-2">Poster Image <span className="text-yellow-500">*</span></label>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input name="poster_path" type="text" className="flex-1 p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.poster_path} onChange={handleInputChange} />
                  <label className={`cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap shadow-sm ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Upload File
                    <input type="file" accept="image/*" className="hidden" disabled={isUploadingImage} onChange={(e) => handleFileUpload(e, 'poster_path')} />
                  </label>
                </div>
                {formData.poster_path && isValidImageSource(formData.poster_path) && (
                  <img src={formData.poster_path} alt="Preview" className="w-32 rounded-lg border border-gray-700 shadow-xl mt-2" />
                )}
             </div>

             <div className="pt-4 border-t border-gray-800">
                <label className="block text-gray-400 font-medium mb-2">Background Cover (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input name="backdrop_path" type="text" className="flex-1 p-3 bg-gray-900 border border-gray-700 text-white rounded-lg" value={formData.backdrop_path} onChange={handleInputChange} />
                  <label className={`cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center whitespace-nowrap shadow-sm ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Upload File
                    <input type="file" accept="image/*" className="hidden" disabled={isUploadingImage} onChange={(e) => handleFileUpload(e, 'backdrop_path')} />
                  </label>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800 mt-4">
            <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 rounded-xl font-bold text-gray-400 hover:text-white mr-4 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || isUploadingImage} className="bg-yellow-500 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 disabled:opacity-50 transition-all">
              {isSubmitting ? 'Saving...' : isUploadingImage ? 'Uploading Image...' : 'Update Media Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedia;