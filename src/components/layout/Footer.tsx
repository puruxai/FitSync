import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <Link to="/" className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-brand-600 dark:text-brand-500 font-bold">fit_screen</span>
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">FitSync</span>
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Track. Improve. Compete.</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</Link>
          <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About Us</a>
        </div>

        {/* Copy */}
        <div className="text-xs text-slate-400 dark:text-slate-600 text-center md:text-right">
          &copy; {new Date().getFullYear()} FitSync Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
