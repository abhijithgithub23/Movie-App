import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-gray-400 pt-10 pb-6 border-t border-white/10 mt-12">
      {/* Main Content Area */}
      <div className="w-full px-6 md:px-12 flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
        
        {/* Brand & Socials Section */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <div>
            <span className="text-3xl font-bold text-red-600 tracking-tighter">
              CINEVIA
            </span>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-sm">
              Your ultimate destination for movies, TV shows, and entertainment. 
              Stream your favorite content anywhere, anytime.
            </p>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300" title="Facebook">
              <Facebook size={16} strokeWidth={2.5} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300" title="Twitter">
              <Twitter size={16} strokeWidth={2.5} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300" title="Instagram">
              <Instagram size={16} strokeWidth={2.5} />
            </a>
            <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300" title="YouTube">
              <Youtube size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-2/3">
          
          {/* Column 1: Explore */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-1">
              Explore
            </h3>
            <a href="/" className="text-sm hover:text-red-500 transition-colors w-max">Home</a>
            <a href="/movies" className="text-sm hover:text-red-500 transition-colors w-max">Movies</a>
            <a href="/tv" className="text-sm hover:text-red-500 transition-colors w-max">TV Shows</a>
            <a href="/favorites" className="text-sm hover:text-red-500 transition-colors w-max">Favorites</a>
          </div>

          {/* Column 2: Support */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-1">
              Support
            </h3>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Help Center</a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Contact Us</a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Devices</a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Account</a>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-1">
              Legal
            </h3>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Privacy Policy</a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Terms of Service</a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Cookies</a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">Corporate Info</a>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="w-full px-6 md:px-12 mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {currentYear} CINEVIA. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer transition-colors">Made with React & Tailwind</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;