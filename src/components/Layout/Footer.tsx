import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-gray-400 pt-10 pb-6 border-t border-white/10 mt-12">
      {/* Main Content Area */}
      <div className="w-full px-6 md:px-12 flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
        
        {/* Brand & Socials Section */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <div>
            <span className="text-3xl font-bold text-red-600 tracking-tighter">
              {t('brand')}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-sm">
              {t('description')}
            </p>
          </div>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
              title={t('social.facebook')}
            >
              <Facebook size={16} strokeWidth={2.5} />
            </a>
            <a
              href="#"
              className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
              title={t('social.twitter')}
            >
              <Twitter size={16} strokeWidth={2.5} />
            </a>
            <a
              href="#"
              className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
              title={t('social.instagram')}
            >
              <Instagram size={16} strokeWidth={2.5} />
            </a>
            <a
              href="#"
              className="p-2 bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
              title={t('social.youtube')}
            >
              <Youtube size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-2/3">
          
          {/* Column 1: Explore */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-1">
              {t('links.explore')}
            </h3>
            <a href="/" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.home')}
            </a>
            <a href="/movies" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.movies')}
            </a>
            <a href="/tv" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.tvShows')}
            </a>
            <a href="/favorites" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.favorites')}
            </a>
          </div>

          {/* Column 2: Support */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-1">
              {t('links.support')}
            </h3>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.helpCenter')}
            </a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.contactUs')}
            </a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.devices')}
            </a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.account')}
            </a>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-white font-bold tracking-widest uppercase text-xs mb-1">
              {t('links.legal')}
            </h3>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.privacyPolicy')}
            </a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.termsOfService')}
            </a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.cookies')}
            </a>
            <a href="#" className="text-sm hover:text-red-500 transition-colors w-max">
              {t('links.corporateInfo')}
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="w-full px-6 md:px-12 mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {currentYear} {t('brand')}. {t('footerBottom.rights')}</p>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer transition-colors">
            {t('footerBottom.madeWith')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;