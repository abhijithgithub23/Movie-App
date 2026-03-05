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
  // Determine if it's a custom local image or a TMDB image
  const imageSrc = media.poster_path 
    ? (media.poster_path.startsWith('http') ? media.poster_path : `https://image.tmdb.org/t/p/w500${media.poster_path}`) 
    : '/placeholder.jpg';

  const title = media.title || media.name;
  const mediaType = media.media_type || 'movie';

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform flex flex-col">
      <Link to={`/details/${mediaType}/${media.id}`} className="flex-1">
        <img src={imageSrc} alt={title} className="w-full h-auto object-cover aspect-[2/3]" />
        <div className="p-4">
          <h2 className="font-bold text-lg truncate text-white">{title}</h2>
        </div>
      </Link>
      
      {isAdmin && (
        <div className="p-4 pt-0 flex gap-2 justify-between bg-gray-800">
          <Link 
            to={`/admin/edit/${media.id}`}
            className="text-xs bg-blue-600 px-3 py-2 rounded text-white font-bold hover:bg-blue-700 w-full text-center"
          >
            Edit
          </Link>
          <button 
            onClick={() => dispatch(deleteMedia(media.id))}
            className="text-xs bg-red-600 px-3 py-2 rounded text-white font-bold hover:bg-red-700 w-full"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCard;