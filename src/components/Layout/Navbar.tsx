import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.email === 'abhijithksd23@gmail.com';

  const linkClasses = (isActive: boolean) =>
    `block py-2 px-3 rounded ${
      isActive ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold text-indigo-500">CineApp</NavLink>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        <div className={`${isOpen ? 'block' : 'hidden'} absolute top-16 left-0 w-full bg-gray-800 md:static md:flex md:w-auto md:gap-6 p-4 md:p-0`}>
          <NavLink to="/" className={({ isActive }) => linkClasses(isActive)}>Home</NavLink>
          <NavLink to="/movies" className={({ isActive }) => linkClasses(isActive)}>Movies</NavLink>
          <NavLink to="/tv" className={({ isActive }) => linkClasses(isActive)}>TV Shows</NavLink>
          <NavLink to="/search" className={({ isActive }) => linkClasses(isActive)}>Search</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => linkClasses(isActive)}>Favorites</NavLink>

          {isAdmin && (
            <NavLink to="/admin/add" className="block py-2 text-yellow-400 font-bold hover:text-yellow-300">
              + Add Media
            </NavLink>
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