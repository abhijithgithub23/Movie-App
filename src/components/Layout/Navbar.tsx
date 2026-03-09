import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
// Added LogOut to the imports
import { Search, Heart, Menu, X, Plus, LogOut } from "lucide-react"; 

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

          {/* Icon Links Group */}
          <div className="flex items-center gap-6 ml-4 border-l border-gray-700 pl-6">
            <NavLink to="/search"
             className={({ isActive }) => 
                `transition-colors duration-300 ${
                  isActive ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                }`
              }
             title="Search">
              <Search size={22} strokeWidth={2.5} />
            </NavLink>
            
            {/* Favorites Icon - CUSTOM HOVER RED */}
            <NavLink 
              to="/favorites" 
              title="Favorites"
              className={({ isActive }) => 
                `transition-colors duration-300 ${
                  isActive ? "text-red-500" : "text-gray-400 hover:text-red-500"
                }`
              }
            >
              <Heart size={22} strokeWidth={2.5} />
            </NavLink>

            {/* Admin Add Icon */}
            {isAdmin && (
              <NavLink
                to="/admin/add"
                className={({ isActive }) => 
                  `transition-colors ${isActive ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`
                }
                title="Add Media"
              >
                <Plus size={26} strokeWidth={3} />
              </NavLink>
            )}

            {/* Logout Icon (Only if authenticated) */}
            {isAuthenticated ? (
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="text-red-500 hover:text-red-400 transition-colors ml-2"
                title="Logout"
              >
                <LogOut size={22} strokeWidth={2.5} />
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
          
          {/* Mobile Icon Grid */}
          <div className={`grid ${isAuthenticated ? (isAdmin ? 'grid-cols-4' : 'grid-cols-3') : 'grid-cols-2'} gap-4 py-4 border-y border-gray-800 text-center`}>
            <NavLink to="/search" className="flex flex-col items-center gap-1 text-gray-400" onClick={() => setIsOpen(false)}>
              <Search size={24} /> <span className="text-[10px] uppercase tracking-widest">Search</span>
            </NavLink>
            <NavLink to="/favorites" className="flex flex-col items-center gap-1 text-gray-400" onClick={() => setIsOpen(false)}>
              <Heart size={24} /> <span className="text-[10px] uppercase tracking-widest">Saved</span>
            </NavLink>
            
            {isAdmin && (
              <NavLink to="/admin/add" className="flex flex-col items-center gap-1 text-yellow-500" onClick={() => setIsOpen(false)}>
                <Plus size={24} /> <span className="text-[10px] uppercase tracking-widest">Add</span>
              </NavLink>
            )}

            {isAuthenticated && (
              <button 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="flex flex-col items-center gap-1 text-red-500"
              >
                <LogOut size={24} /> <span className="text-[10px] uppercase tracking-widest">Exit</span>
              </button>
            )}
          </div>

          {!isAuthenticated && (
            <div className="mt-2">
              <button
                onClick={() => loginWithRedirect()}
                className="bg-white text-black w-full py-3 rounded-sm font-bold"
              >
                LOGIN
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;