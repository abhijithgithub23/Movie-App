import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

// IMPORT Theme TYPE ALONG WITH useTheme
import { useTheme,type Theme } from "../../context/ThemeContext"; 

import { Search, Heart, Menu, X, Plus, LogOut, Home, Film, Tv } from "lucide-react";

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const { theme, setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const isAdmin = user?.email === "abhijithksd23@gmail.com";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-lg font-medium transition flex items-center gap-2 ${
      isActive ? "text-text-main" : "text-text-muted hover:text-text-main"
    }`;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-nav/80 backdrop-blur-md border-b border-text-muted/10 transition-colors duration-300">
        <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">
          
          <NavLink to="/" className="text-4xl font-bold text-red-600 tracking-tighter">
            CINEVIA
          </NavLink>

          <div className="hidden md:flex gap-8 items-center">
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

            <div className="flex items-center gap-6 ml-4 border-l border-text-muted/30 pl-6">
              <NavLink
                to="/search"
                title={t("search")}
                className={({ isActive }) =>
                  `transition-colors duration-300 ${
                    isActive ? "text-blue-500" : "text-text-muted hover:text-blue-500"
                  }`
                }
              >
                <Search size={22} strokeWidth={2.5} />
              </NavLink>

              <NavLink
                to="/favorites"
                title={t("favorites")}
                className={({ isActive }) =>
                  `transition-colors duration-300 ${
                    isActive ? "text-red-500" : "text-text-muted hover:text-red-500"
                  }`
                }
              >
                <Heart size={22} strokeWidth={2.5} />
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin/add"
                  title={t("addMedia")}
                  className={({ isActive }) =>
                    `transition-colors ${
                      isActive ? "text-green-400" : "text-text-muted hover:text-green-400"
                    }`
                  }
                >
                  <Plus size={26} strokeWidth={3} />
                </NavLink>
              )}

              {/* FIX: Cast target value to 'Theme' type */}
              <select
                onChange={(e) => setTheme(e.target.value as Theme)}
                value={theme}
                className="bg-nav border border-text-muted/30 text-text-main text-sm px-2 py-1 rounded outline-none focus:border-text-muted transition-colors"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="midnight">Midnight</option>
              </select>

              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-nav border border-text-muted/30 text-text-main text-sm px-2 py-1 rounded outline-none focus:border-text-muted transition-colors"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="ml">ML</option>
                <option value="es">ES</option>
              </select>

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
                  className="bg-btn-bg text-btn-text px-5 py-1.5 rounded-sm font-bold opacity-90 hover:opacity-100 transition-all ml-2"
                >
                  {t("login")}
                </button>
              )}
            </div>
          </div>

          <button
            className="md:hidden text-text-main focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden bg-nav/95 backdrop-blur-xl px-6 pb-8 pt-4 flex flex-col gap-6 border-t border-text-muted/10">

            <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>
              <Home size={24} /> {t("home")}
            </NavLink>

            <NavLink to="/movies" className={linkClass} onClick={() => setIsOpen(false)}>
              <Film size={24} /> {t("movies")}
            </NavLink>

            <NavLink to="/tv" className={linkClass} onClick={() => setIsOpen(false)}>
              <Tv size={24} /> {t("tvShows")}
            </NavLink>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-text-muted/10 text-center">
              <NavLink
                to="/search"
                className="flex flex-col items-center gap-1 text-text-muted"
                onClick={() => setIsOpen(false)}
              >
                <Search size={24} />
                <span className="text-[10px] uppercase tracking-widest">{t("search")}</span>
              </NavLink>

              <NavLink
                to="/favorites"
                className="flex flex-col items-center gap-1 text-text-muted"
                onClick={() => setIsOpen(false)}
              >
                <Heart size={24} />
                <span className="text-[10px] uppercase tracking-widest">{t("favorites")}</span>
              </NavLink>
            </div>

            <div className="flex gap-4">
              {/* FIX: Cast target value to 'Theme' type */}
              <select
                onChange={(e) => setTheme(e.target.value as Theme)}
                value={theme}
                className="flex-1 bg-nav border border-text-muted/30 text-text-main text-sm px-2 py-3 rounded outline-none"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="midnight">Midnight Theme</option>
              </select>

              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="flex-1 bg-nav border border-text-muted/30 text-text-main text-sm px-2 py-3 rounded outline-none"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ml">Malayalam</option>
                <option value="es">Español</option>
              </select>
            </div>

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
                className="bg-btn-bg text-btn-text w-full py-3 rounded-sm font-bold"
              >
                {t("login")}
              </button>
            )}
          </div>
        )}
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card-bg border border-text-muted/20 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
              <LogOut size={32} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-text-main mb-2">
              Ready to leave?
            </h3>
            <p className="text-text-muted mb-8 text-sm">
              Are you sure you want to log out of your Cinevia account?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-text-muted/20 hover:bg-text-muted/30 text-text-main rounded-xl font-medium transition-colors"
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