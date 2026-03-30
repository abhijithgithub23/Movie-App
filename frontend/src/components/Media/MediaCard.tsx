import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteMedia } from "../../features/media/mediaSlice";
import type { Media } from "../../types";

interface MediaCardProps {
  media: Media;
  isAdmin?: boolean;
}

const MediaCard = ({ media, isAdmin = false }: MediaCardProps) => {
  const dispatch = useDispatch();
  
  // THE FIX: We absolutely need this helper! 
  // It handles existing DB paths (TMDB CDN) AND your new Base64 custom uploads.
  const getPosterUrl = (path?: string) => {
    if (!path) return null;
    // If it's a custom upload (Base64) or an absolute HTTP link, use it directly
    if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
      return path;
    }
    // If it's a relative path from the DB, point it to the TMDB image servers
    const tmdbPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/w500${tmdbPath}`;
  };

  const imageSrc = getPosterUrl(media.poster_path);

  const title = media.title || media.name;
  const mediaType = media.media_type || 'movie';
  const year = (media.release_date || media.first_air_date)?.substring(0, 4) || 'N/A';
  
  const rawRating = Number(media.vote_average);
  const rating = !isNaN(rawRating) && rawRating > 0 ? rawRating.toFixed(1) : null;

  return (
    <div className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20 flex flex-col h-full">
      
      {/* Media Type Badge */}
      <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-white border border-white/10 shadow-sm pointer-events-none">
        {mediaType === 'tv' ? 'TV Show' : 'Movie'}
      </div>

      <Link to={`/details/${mediaType}/${media.id}`} className="flex-1 relative flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-800 shrink-0">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 text-center">
              <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Subtle dark gradient overlay originating from the bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Details Container */}
        <div className="p-4 bg-black flex-1 flex flex-col justify-between z-10">
          <h2 className="font-bold text-base md:text-lg text-white leading-tight line-clamp-2 group-hover:text-red-400 transition-colors duration-200 drop-shadow-md">
            {title}
          </h2>
          
          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-3 text-xs font-medium text-gray-400">
            {rating ? (
              <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                ★ {rating}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700">
                NR
              </span>
            )}
            <span>{year}</span>
          </div>
        </div>
      </Link>
      
      {/* Admin Actions Container */}
      {isAdmin && (
        <div className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2 shrink-0 relative z-20">
          <Link 
            to={`/admin/edit/${mediaType}/${media.id}`}
            className="flex-1 text-center text-xs bg-blue-600/10 text-blue-500 border border-blue-600/30 px-3 py-2.5 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            Edit
          </Link>
          <button 
            onClick={() => dispatch(deleteMedia(media.id))}
            className="flex-1 text-center text-xs bg-red-900/20 text-red-500 border border-red-900/40 px-3 py-2.5 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCard;