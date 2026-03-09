import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
// Import the icons
import { Search, Heart, Menu, X } from "lucide-react"; 

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.email === "abhijithksd23@gmail.com";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-lg font-medium transition flex items-center gap-2 ${
      isActive ? "text-white" : "text-gray-400 hover:text-white"
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">
        
        {/* Logo */}
        <NavLink to="/" className="text-4xl font-bold text-red-600 tracking-tighter">
          CINEVIA
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/movies" className={linkClass}>Movies</NavLink>
          <NavLink to="/tv" className={linkClass}>TV Shows</NavLink>

          {/* Icon Links */}
          <div className="flex items-center gap-5 ml-4 border-l border-gray-700 pl-6">
            <NavLink to="/search" className={linkClass} title="Search">
              <Search size={22} strokeWidth={2} />
            </NavLink>
            <NavLink to="/favorites" className={linkClass} title="Favorites">
              <Heart size={22} strokeWidth={2} />
            </NavLink>
          </div>

          {isAdmin && (
            <NavLink
              to="/admin/add"
              className="text-yellow-400 text-sm font-bold uppercase tracking-wider hover:text-yellow-300 ml-2"
            >
              + Add Media
            </NavLink>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-red-600 text-white px-5 py-1.5 rounded-sm font-medium hover:bg-red-700 transition-all ml-2"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-white text-black px-5 py-1.5 rounded-sm font-bold hover:bg-gray-200 transition-all ml-2"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl px-6 pb-8 pt-4 flex flex-col gap-6 border-t border-gray-800 animate-in fade-in slide-in-from-top-4">
          <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/movies" className={linkClass} onClick={() => setIsOpen(false)}>Movies</NavLink>
          <NavLink to="/tv" className={linkClass} onClick={() => setIsOpen(false)}>TV Shows</NavLink>
          
          <div className="flex gap-8 py-2 border-y border-gray-800">
            <NavLink to="/search" className={linkClass} onClick={() => setIsOpen(false)}>
              <Search size={24} /> <span className="text-sm uppercase tracking-widest">Search</span>
            </NavLink>
            <NavLink to="/favorites" className={linkClass} onClick={() => setIsOpen(false)}>
              <Heart size={24} /> <span className="text-sm uppercase tracking-widest">Favorites</span>
            </NavLink>
          </div>
          
          {isAdmin && (
            <NavLink
              to="/admin/add"
              className="text-yellow-400 font-bold"
              onClick={() => setIsOpen(false)}
            >
              + ADD MEDIA
            </NavLink>
          )}

          <div className="mt-2">
            {isAuthenticated ? (
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="bg-red-600 text-white w-full py-3 rounded-sm font-bold"
              >
                LOGOUT
              </button>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-white text-black w-full py-3 rounded-sm font-bold"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;