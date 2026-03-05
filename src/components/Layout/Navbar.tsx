import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.email === 'abhijithksd23@gmail.com';

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-500">CineApp</Link>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        {/* Links */}
        <div className={`${isOpen ? 'block' : 'hidden'} absolute top-16 left-0 w-full bg-gray-800 md:static md:flex md:w-auto md:gap-6 p-4 md:p-0`}>
          <Link to="/" className="block py-2 text-gray-300 hover:text-white">Home</Link>
          <Link to="/movies" className="block py-2 text-gray-300 hover:text-white">Movies</Link>
          <Link to="/tv" className="block py-2 text-gray-300 hover:text-white">TV Shows</Link>
          <Link to="/search" className="block py-2 text-gray-300 hover:text-white">Search</Link>
          <Link to="/favorites" className="block py-2 text-gray-300 hover:text-white">Favorites</Link>
          
          {isAdmin && (
            <Link to="/admin/add" className="block py-2 text-yellow-400 font-bold hover:text-yellow-300">
              + Add Media
            </Link>
          )}

          {isAuthenticated ? (
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="mt-2 md:mt-0 bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700 w-full md:w-auto"
            >
              Logout
            </button>
          ) : (
            <button 
              onClick={() => loginWithRedirect()}
              className="mt-2 md:mt-0 bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700 w-full md:w-auto"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;