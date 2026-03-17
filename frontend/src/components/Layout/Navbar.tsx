import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import LogoutModal from "../ui/LogoutModal";
import GlassyDropdown from "../ui/GlassyDropdown"; 
import { useTheme, type Theme } from "../../context/ThemeContext"; 
import { Search, Heart, Menu, X, Plus, LogOut, Home, Film, Tv, User } from "lucide-react";

// --- STATIC DATA ---
const themeOptions = [
  { value: "dark", label: "Dark" },
  { value: "midnight", label: "Midnight" },
  { value: "dracula", label: "Dracula" },
  { value: "forest", label: "Forest" },
  { value: "solarized", label: "Solarized" },
];

const languageOptionsDesktop = [
  { value: "en", label: "EN" },
  { value: "hi", label: "HI" },
  { value: "ml", label: "ML" },
  { value: "es", label: "ES" },
];

const languageOptionsMobile = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ml", label: "Malayalam" },
  { value: "es", label: "Español" },
];

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-lg font-medium transition flex items-center gap-2 ${
    isActive ? "text-text-main" : "text-text-muted hover:text-text-main"
  }`;

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const { theme, setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = user?.email === "abhijithksd23@gmail.com";

  const handleThemeChange = useCallback((val: string) => {
    setTheme(val as Theme);
  }, [setTheme]);

  const handleLanguageChange = useCallback((val: string) => {
    i18n.changeLanguage(val);
  }, []);

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutsideProfile = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () => document.removeEventListener("mousedown", handleClickOutsideProfile);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-nav/80 backdrop-blur-md border-b border-text-muted/10 transition-colors duration-300">
        <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">
          
          <NavLink to="/" className="text-4xl font-bold text-red-600 tracking-tighter mr-2">
            CINEVIA
          </NavLink>

          {/* DESKTOP NAVIGATION */}
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

              <GlassyDropdown 
                value={theme}
                options={themeOptions}
                onChange={handleThemeChange}
              />

              <GlassyDropdown 
                value={i18n.language}
                options={languageOptionsDesktop}
                onChange={handleLanguageChange}
              />

              {isAuthenticated ? (
                <div className="relative ml-2" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-text-main/50 transition-colors focus:outline-none focus:ring-2 focus:ring-text-main/20"
                    title={user?.name || "Profile"}
                  >
                    <img
                      src={user?.picture || DEFAULT_AVATAR}
                      alt="Profile"
                      className="w-full h-full object-cover bg-text-main/10"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 min-w-[160px] bg-nav/90 backdrop-blur-xl border border-text-main/10 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 mb-1 border-b border-text-muted/10">
                        <p className="text-sm font-semibold text-text-main truncate">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      
                      <NavLink
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={({ isActive }) =>
                          `w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            isActive ? "bg-text-main/15 text-text-main font-semibold" : "text-text-muted hover:bg-text-main/10 hover:text-text-main"
                          }`
                        }
                      >
                        <User size={16} />
                        {t("profile") || "Profile"}
                      </NavLink>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        {t("logout") || "Logout"}
                      </button>
                    </div>
                  )}
                </div>
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

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden text-text-main focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* MOBILE MENU */}
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
              <GlassyDropdown 
                value={theme}
                options={themeOptions}
                onChange={handleThemeChange}
                isMobile={true}
              />

              <GlassyDropdown 
                value={i18n.language}
                options={languageOptionsMobile}
                onChange={handleLanguageChange}
                isMobile={true}
              />
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={user?.picture || DEFAULT_AVATAR}
                      alt="Profile"
                      className="w-full h-full object-cover bg-text-main/10"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-main truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="bg-text-main/5 border border-text-main/10 text-text-main hover:bg-text-main/10 transition-colors w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <User size={20} />
                  {t("profile") || "Profile"}
                </NavLink>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  {t("logout") || "Logout"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-btn-bg text-btn-text w-full py-3 rounded-xl font-bold"
              >
                {t("login")}
              </button>
            )}
          </div>
        )}
      </nav>

      <LogoutModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
      />
    </>
  );
};

export default Navbar;