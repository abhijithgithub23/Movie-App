import { memo, useState, useRef, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import LogoutModal from "../ui/LogoutModal";
import { useTheme, type Theme } from "../../context/ThemeContext"; 
import { Search, Heart, Menu, X, Plus, LogOut, Home, Film, Tv, ChevronDown } from "lucide-react";

// 1. STATIC DATA MOVED OUTSIDE: 
// These arrays will now only be created ONCE when the file loads, saving memory and preserving references.
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

// Reusable static function moved outside
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-lg font-medium transition flex items-center gap-2 ${
    isActive ? "text-text-main" : "text-text-muted hover:text-text-main"
  }`;

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

// 2. WRAPPED IN MEMO: 
// This dropdown will now ONLY re-render if its specific value changes.
const GlassyDropdown = memo(({ value, options, onChange, isMobile = false }: GlassyDropdownProps) => {
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
});
// --- END CUSTOM COMPONENT ---


const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const { theme, setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const isAdmin = user?.email === "abhijithksd23@gmail.com";

  // 3. MEMOIZED HANDLERS:
  // These prevent the GlassyDropdown from thinking it received a "new" function prop
  const handleThemeChange = useCallback((val: string) => {
    setTheme(val as Theme);
  }, [setTheme]);

  const handleLanguageChange = useCallback((val: string) => {
    i18n.changeLanguage(val);
  }, []);

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

      <LogoutModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
      />
    </>
  );
};

export default Navbar;