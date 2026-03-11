import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

import { Search, Heart, Menu, X, Plus, LogOut, Home, Film, Tv } from "lucide-react";

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  const [isOpen, setIsOpen] = useState(false);
  // NEW: State for controlling the logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const isAdmin = user?.email === "abhijithksd23@gmail.com";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-lg font-medium transition flex items-center gap-2 ${
      isActive ? "text-white" : "text-gray-400 hover:text-white"
    }`;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">
          
          {/* Logo */}
          <NavLink to="/" className="text-4xl font-bold text-red-600 tracking-tighter">
            CINEVIA
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">

            {/* Main Links */}
            <NavLink to="/" className={linkClass}>
              <Home size={22} strokeWidth={2.5} />
              <span className="hidden lg:block">{t("home")}</span>
            </NavLink>

            <NavLink to="/movies" className={linkClass}>
              <Film size={22} strokeWidth={2.5} />
              <span className="hidden lg:block">{t("movies")}</span>
            </NavLink>

            <NavLink to="/tv" className={linkClass}>
              <Tv size={22} strokeWidth={2.5} />
              <span className="hidden lg:block">{t("tvShows")}</span>
            </NavLink>

            {/* Icon Group */}
            <div className="flex items-center gap-6 ml-4 border-l border-gray-700 pl-6">

              {/* Search */}
              <NavLink
                to="/search"
                title={t("search")}
                className={({ isActive }) =>
                  `transition-colors duration-300 ${
                    isActive ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                  }`
                }
              >
                <Search size={22} strokeWidth={2.5} />
              </NavLink>

              {/* Favorites */}
              <NavLink
                to="/favorites"
                title={t("favorites")}
                className={({ isActive }) =>
                  `transition-colors duration-300 ${
                    isActive ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  }`
                }
              >
                <Heart size={22} strokeWidth={2.5} />
              </NavLink>

              {/* Admin Add */}
              {isAdmin && (
                <NavLink
                  to="/admin/add"
                  title={t("addMedia")}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-green-400" : "text-gray-400 hover:text-green-400"
                    }`
                  }
                >
                  <Plus size={26} strokeWidth={3} />
                </NavLink>
              )}

              {/* Language Selector */}
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-black border border-gray-700 text-white text-sm px-2 py-1 rounded outline-none focus:border-gray-500 transition-colors"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="ml">ML</option>
                <option value="es">ES</option>
              </select>

              {/* Auth */}
              {isAuthenticated ? (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-red-500 hover:text-red-400 transition-colors ml-2"
                  title={t("logout") || "Logout"}
                >
                  <LogOut size={22} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={() => loginWithRedirect()}
                  className="bg-white text-black px-5 py-1.5 rounded-sm font-bold hover:bg-gray-200 transition-all ml-2"
                >
                  {t("login")}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl px-6 pb-8 pt-4 flex flex-col gap-6 border-t border-gray-800">

            <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>
              <Home size={24} /> {t("home")}
            </NavLink>

            <NavLink to="/movies" className={linkClass} onClick={() => setIsOpen(false)}>
              <Film size={24} /> {t("movies")}
            </NavLink>

            <NavLink to="/tv" className={linkClass} onClick={() => setIsOpen(false)}>
              <Tv size={24} /> {t("tvShows")}
            </NavLink>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-800 text-center">
              <NavLink
                to="/search"
                className="flex flex-col items-center gap-1 text-gray-400"
                onClick={() => setIsOpen(false)}
              >
                <Search size={24} />
                <span className="text-[10px] uppercase tracking-widest">{t("search")}</span>
              </NavLink>

              <NavLink
                to="/favorites"
                className="flex flex-col items-center gap-1 text-gray-400"
                onClick={() => setIsOpen(false)}
              >
                <Heart size={24} />
                <span className="text-[10px] uppercase tracking-widest">{t("favorites")}</span>
              </NavLink>
            </div>

            {/* Mobile Language Switch */}
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="bg-black border border-gray-700 text-white text-sm px-2 py-3 rounded outline-none"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ml">Malayalam</option>
              <option value="es">Español</option>
            </select>

            {/* Mobile Auth */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors w-full py-3 rounded-sm font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                {t("logout") || "Logout"}
              </button>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-white text-black w-full py-3 rounded-sm font-bold"
              >
                {t("login")}
              </button>
            )}
          </div>
        )}
      </nav>

      {/* NEW: Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
              <LogOut size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to leave?
            </h3>
            <p className="text-gray-400 mb-8 text-sm">
              Are you sure you want to log out of your Cinevia account?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;