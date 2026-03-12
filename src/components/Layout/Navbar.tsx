import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

// IMPORT Theme TYPE ALONG WITH useTheme
import { useTheme, type Theme } from "../../context/ThemeContext"; 

import { Search, Heart, Menu, X, Plus, LogOut, Home, Film, Tv, ChevronDown } from "lucide-react";

// --- CUSTOM GLASSY DROPDOWN COMPONENT ---
interface DropdownOption {
  value: string;
  label: string;
}

interface GlassyDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  isMobile?: boolean;
}

const GlassyDropdown = ({ value, options, onChange, isMobile = false }: GlassyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || options[0].label;

  return (
    <div className={`relative ${isMobile ? "flex-1" : ""}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 bg-text-main/5 backdrop-blur-md border border-text-main/10 shadow-sm text-text-main text-sm rounded-xl outline-none hover:bg-text-main/10 focus:ring-2 focus:ring-text-main/20 transition-all duration-300 ${
          isMobile ? "px-3 py-3" : "px-3 py-1.5"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute left-0 mt-2 min-w-[140px] w-full bg-nav/70 backdrop-blur-xl border border-text-main/10 rounded-xl shadow-2xl py-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ${
            isMobile ? "bottom-full mb-2 mt-0" : "top-full"
          }`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === opt.value
                  ? "bg-text-main/15 text-text-main font-semibold"
                  : "text-text-muted hover:bg-text-main/10 hover:text-text-main"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
// --- END CUSTOM COMPONENT ---


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

  // Options arrays for the custom dropdowns
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

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-nav/80 backdrop-blur-md border-b border-text-muted/10 transition-colors duration-300">
        <div className="w-full flex justify-between items-center px-6 md:px-12 py-4">
          
          <NavLink to="/" className="text-4xl font-bold text-red-600 tracking-tighter mr-2">
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

              {/* CUSTOM GLASSY THEME DROPDOWN */}
              <GlassyDropdown 
                value={theme}
                options={themeOptions}
                onChange={(val) => setTheme(val as Theme)}
              />

              {/* CUSTOM GLASSY LANGUAGE DROPDOWN */}
              <GlassyDropdown 
                value={i18n.language}
                options={languageOptionsDesktop}
                onChange={(val) => i18n.changeLanguage(val)}
              />

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
              {/* CUSTOM GLASSY THEME DROPDOWN (MOBILE) */}
              <GlassyDropdown 
                value={theme}
                options={themeOptions.map(opt => ({ ...opt, label: `${opt.label} Theme` }))}
                onChange={(val) => setTheme(val as Theme)}
                isMobile={true}
              />

              {/* CUSTOM GLASSY LANGUAGE DROPDOWN (MOBILE) */}
              <GlassyDropdown 
                value={i18n.language}
                options={languageOptionsMobile}
                onChange={(val) => i18n.changeLanguage(val)}
                isMobile={true}
              />
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
          <div className="bg-[#0a0a0a] border border-text-muted/20 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
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