// FitSync Component: SocialLinks
// Displays clickable badges with icons for Website, Instagram, and Twitter/X

import React from 'react';

interface SocialLinksProps {
  website?: string;
  instagram?: string;
  twitter?: string;
  className?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  website,
  instagram,
  twitter,
  className = ''
}) => {
  const sanitizeUrl = (url: string, prefix: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    // If it's a handle (like twitter handle), resolve it
    if (trimmed.startsWith('@')) {
      return `${prefix}${trimmed.substring(1)}`;
    }
    return `${prefix}${trimmed}`;
  };

  const formattedWebsite = website?.trim() && !website.trim().startsWith('http') 
    ? `https://${website.trim()}` 
    : website?.trim();

  const formattedInsta = sanitizeUrl(instagram || '', 'https://instagram.com/');
  const formattedTwitter = sanitizeUrl(twitter || '', 'https://x.com/');

  const hasLinks = website?.trim() || instagram?.trim() || twitter?.trim();

  if (!hasLinks) return null;

  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {website?.trim() && (
        <a
          href={formattedWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25em]">language</span>
          <span>Website</span>
        </a>
      )}

      {instagram?.trim() && (
        <a
          href={formattedInsta}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-pink-500 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25em]">photo_camera</span>
          <span>Instagram</span>
        </a>
      )}

      {twitter?.trim() && (
        <a
          href={formattedTwitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-500 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25em]">alternate_email</span>
          <span>Twitter/X</span>
        </a>
      )}
    </div>
  );
};

export default SocialLinks;
