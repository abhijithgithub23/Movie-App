import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.email === "abhijithksd23@gmail.com";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${
      isActive ? "text-white" : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md">
      {/* CHANGED: Removed 'max-w-7xl mx-auto' and added 'w-full px-6 md:px-12'. 
        This stretches the nav to the edges and perfectly aligns with your Home page content!
      */}
      <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">

        {/* Logo - Pushed to the far left */}
        <NavLink to="/" className="text-3xl font-bold text-red-600 tracking-wider">
          Cinevia
        </NavLink>

        {/* Desktop Menu - Pushed to the far right */}
        <div className="hidden md:flex gap-6 items-center">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/movies" className={linkClass}>Movies</NavLink>
          <NavLink to="/tv" className={linkClass}>TV Shows</NavLink>
          <NavLink to="/search" className={linkClass}>Search</NavLink>
          <NavLink to="/favorites" className={linkClass}>Favorites</NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/add"
              className="text-yellow-400 font-semibold hover:text-yellow-300 ml-4"
            >
              + Add Media
            </NavLink>
          )}

          {isAuthenticated ? (
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="bg-red-600 text-white px-5 py-1.5 rounded-md font-medium hover:bg-red-700 transition-colors ml-2"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-white text-black px-5 py-1.5 rounded-md font-semibold hover:bg-gray-200 transition-colors ml-2"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle - Pushed to the far right on mobile */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md px-6 pb-6 pt-2 flex flex-col gap-4 border-t border-gray-800">
          <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/movies" className={linkClass} onClick={() => setIsOpen(false)}>Movies</NavLink>
          <NavLink to="/tv" className={linkClass} onClick={() => setIsOpen(false)}>TV Shows</NavLink>
          <NavLink to="/search" className={linkClass} onClick={() => setIsOpen(false)}>Search</NavLink>
          <NavLink to="/favorites" className={linkClass} onClick={() => setIsOpen(false)}>Favorites</NavLink>
          
          {isAdmin && (
            <NavLink
              to="/admin/add"
              className="text-yellow-400 font-semibold hover:text-yellow-300"
              onClick={() => setIsOpen(false)}
            >
              + Add Media
            </NavLink>
          )}

          <div className="pt-2">
            {isAuthenticated ? (
              <button
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
                className="bg-red-600 text-white w-full px-4 py-2 rounded-md hover:bg-red-700 font-medium transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-white text-black w-full px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;