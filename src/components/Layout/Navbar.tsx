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
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <NavLink to="/" className="text-3xl font-bold text-red-600">
          CineApp
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/movies" className={linkClass}>Movies</NavLink>
          <NavLink to="/tv" className={linkClass}>TV Shows</NavLink>
          <NavLink to="/search" className={linkClass}>Search</NavLink>
          <NavLink to="/favorites" className={linkClass}>Favorites</NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/add"
              className="text-yellow-400 font-semibold hover:text-yellow-300"
            >
              + Add Media
            </NavLink>
          )}

          {isAuthenticated ? (
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="bg-white text-black px-4 py-1 rounded font-semibold hover:bg-gray-200"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black px-6 pb-4 flex flex-col gap-3">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/movies" className={linkClass}>Movies</NavLink>
          <NavLink to="/tv" className={linkClass}>TV Shows</NavLink>
          <NavLink to="/search" className={linkClass}>Search</NavLink>
          <NavLink to="/favorites" className={linkClass}>Favorites</NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;