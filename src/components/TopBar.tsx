"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { SaavnAPI } from '@/services/api';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguageStore, MusicLanguage } from '@/store/languageStore';

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const instanceId = React.useRef(Math.random().toString(36).substring(7)).current;
  const searchRef = useRef<HTMLDivElement>(null);
  const justSelected = useRef(false);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (justSelected.current) {
        justSelected.current = false;
        return;
      }

      try {
        const results = await SaavnAPI.getSearchBoxSuggestions(query.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (e) {
        console.error(`[SearchInput][${instanceId}] Suggestions fetch failed:`, e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, instanceId]);

  const handleSearch = (q: string) => {
    const target = q.trim();
    justSelected.current = true;
    setShowSuggestions(false);
    if (target !== '') {
      router.push(`/search?q=${encodeURIComponent(target)}`);
    } else {
      router.push('/search');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    justSelected.current = true;
    setShowSuggestions(false);
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="relative flex items-center w-full max-w-[600px]" ref={searchRef}>
      <div className="flex-1 flex items-center bg-[#2a2a2a] hover:bg-[#333333] transition-colors rounded-full px-4 h-11 md:h-12 shadow-2xl group border border-white/[0.05] focus-within:border-white/20">
        <div className="mr-3 transition-transform group-focus-within:scale-110">
          <Image src="/assets/icons/search.png" alt="" width={18} height={18} className="invert opacity-60 md:w-[20px] md:h-[20px]" />
        </div>
        <input
          type="text"
          placeholder="What do you want to play?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() !== '' && suggestions.length > 0 && setShowSuggestions(true)}
          className="flex-1 bg-transparent text-white text-[13px] md:text-[14px] font-bold outline-none placeholder:text-text-subdued/70"
        />
        {query && (
          <>
            <div className="w-[1px] h-6 bg-white/10 mx-2 md:mx-3"></div>
            <button 
              onClick={() => { setQuery(''); setShowSuggestions(false); }}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 transition-all text-text-subdued hover:text-white"
            >
              <svg role="img" height="14" width="14" viewBox="0 0 16 16" fill="currentColor" className="md:w-4 md:h-4"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"></path></svg>
            </button>
          </>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-black/90 md:bg-[#282828] rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden z-[5000] animate-in fade-in slide-in-from-top-2 duration-300">
          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              onClick={() => handleSuggestionClick(s)}
              className="w-full text-left px-4 md:px-5 py-3 md:py-3.5 text-xs md:text-sm font-bold text-text-subdued hover:text-white hover:bg-white/[0.08] flex items-center gap-3 md:gap-4 transition-colors border-b border-white/[0.03] last:border-0"
            >
              <Image src="/assets/icons/search.png" alt="" width={14} height={14} className="invert opacity-30 shrink-0 md:w-[16px] md:h-[16px]" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LanguageMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, availableLanguages } = useLanguageStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1.5 md:p-2 px-2 md:px-3 rounded-full transition-all active:scale-95 group ${isOpen ? 'bg-primary text-black' : 'bg-white/5 text-text-subdued hover:text-white hover:bg-white/10'}`}
      >
        <svg role="img" height="18" width="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
        </svg>
        <span className="text-xs md:text-sm font-black capitalize">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-44 md:w-48 bg-black/90 md:bg-[#282828] rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/[0.05] py-2 z-[6000] animate-in fade-in zoom-in duration-150 overflow-hidden">
           <div className="px-4 py-2 border-b border-white/[0.05] mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subdued">Change Language</span>
           </div>
           
           <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                    document.cookie = `music-language=${lang}; path=/; max-age=31536000`;
                    window.location.reload();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs md:text-sm font-bold flex items-center justify-between transition-colors ${language === lang ? 'text-primary bg-white/[0.05]' : 'text-white/80 hover:bg-white/[0.08] hover:text-white'}`}
                >
                  <span className="capitalize">{lang}</span>
                  {language === lang && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(29,185,84,0.6)]" />}
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-2 md:gap-3 group" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center transition-all rounded-full cursor-pointer w-8 h-8 md:w-10 md:h-10 hover:scale-105 active:scale-95 shadow-lg border-2 border-transparent hover:border-white/10 overflow-hidden bg-white/5"
      >
        <Image src="/assets/icons/logo.png" alt="Profile" width={40} height={40} className="object-cover" />
      </button>

      <Link href="/" className="hidden lg:block">
        <span className="text-white font-black text-xl tracking-tight hover:text-primary transition-colors cursor-pointer">Hivefy</span>
      </Link>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-48 md:w-56 bg-black/90 md:bg-[#282828] rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/[0.05] py-1 z-[4000] animate-in fade-in zoom-in duration-150">
            <div className="px-4 py-3 border-b border-white/[0.05] mb-1">
              <p className="text-white text-[15px] font-black tracking-tight truncate">Harish Srinivas</p>
              <p className="text-text-subdued text-[10px] font-black uppercase tracking-[0.15em] mt-0.5">Software Developer</p>
            </div>
            
            <ProfileLink href="https://github.com/Harish-Srinivas-07/hivefy" label="Hivefy for Android" external />
            <ProfileLink href="https://github.com/Harish-Srinivas-07/hivefyweb" label="Star on GitHub" external />
            <ProfileLink href="https://harishsrinivas.netlify.app" label="Portfolio" external />
            
            <div className="h-[1px] bg-white/[0.05] my-1 mx-3" />
            <div className="px-4 pt-2 pb-2">
               <a 
                 href="https://github.com/Harish-Srinivas-07/hivefy/releases/latest" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 w-full py-2 bg-[#3DDC84] rounded-full text-black font-black text-[11px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg"
               >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17.523 15.3414L20.355 20.2479C20.505 20.5049 20.418 20.8289 20.161 20.9789C19.904 21.1289 19.58 21.0419 19.43 20.7849L16.554 15.8049C15.111 16.4529 13.485 16.8249 11.75 16.8249C10.015 16.8249 8.389 16.4529 6.946 15.8049L4.07 20.7849C3.92 21.0419 3.596 21.1289 3.339 20.9789C3.082 20.8289 2.995 20.5049 3.145 20.2479L5.977 15.3414C2.553 13.4814 0.22 10.0194 0 5.92441H23.5C23.28 10.0194 20.947 13.4814 17.523 15.3414ZM7.045 10.4634C7.045 10.9714 7.458 11.3854 7.965 11.3854C8.472 11.3854 8.885 10.9714 8.885 10.4634C8.885 9.95541 8.472 9.54141 7.965 9.54141C7.458 9.54141 7.045 9.95541 7.045 10.4634ZM16.415 11.3854C16.922 11.3854 17.335 10.9714 17.335 10.4634C17.335 9.95541 16.922 9.54141 16.415 9.54141C15.908 9.54141 15.495 9.95541 15.495 10.4634C15.495 10.9714 15.908 11.3854 16.415 11.3854Z" />
                 </svg>
                 Android App
               </a>
            </div>
            <div className="h-[1px] bg-white/[0.05] my-1 mx-3" />
            <div className="px-4 pb-2 opacity-30 text-center">
               <span className="text-[9px] font-black uppercase tracking-widest text-white">Hivefy &copy; 2026</span>
            </div>
        </div>
      )}
    </div>
  );
};

const ProfileLink = ({ href, label, external }: { href: string; label: string; external?: boolean }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center justify-between px-4 py-3 text-white/90 hover:text-white hover:bg-white/[0.1] transition-colors group"
  >
    <span className="text-sm font-bold tracking-tight">{label}</span>
    {external && (
      <svg role="img" height="15" width="15" viewBox="0 0 16 16" className="fill-text-subdued group-hover:fill-white transition-colors">
        <path d="M11.5 1h-8a.5.5 0 0 0 0 1h6.793l-9.147 9.146a.5.5 0 0 0 .708.707L11 2.707V9.5a.5.5 0 0 0 1 0v-8a.5.5 0 0 0-.5-.5z"></path>
      </svg>
    )}
  </a>
);

export default function TopBar() {
  const router = useRouter();
  const [navHistory, setNavHistory] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setNavHistory(prev => prev + 1);
  }, [pathname]);

  const canGoBack = navHistory > 1;

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    }
  };

  const isSearchPage = pathname.startsWith('/search');
  const isHomePage = pathname === '/';

  return (
    <div className="flex-1 flex items-center justify-between gap-3 md:gap-4 h-full pointer-events-auto">
      {(!isSearchPage || !isHomePage) && (
        <div className={`flex items-center gap-2 md:gap-4 ${isSearchPage ? 'hidden md:flex' : 'flex'}`}>
          <ProfileMenu />
          
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={handleBack} 
              disabled={!canGoBack}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${canGoBack ? 'bg-black/60 hover:bg-black/80 cursor-pointer active:scale-95' : 'bg-black/20 opacity-40 cursor-not-allowed'}`}
            >
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="white"><path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8.53a.75.75 0 0 1 0-1.06L9.97.47a.75.75 0 0 1 1.06 0z"></path></svg>
            </button>
            <button onClick={() => router.forward()} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors active:scale-95">
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="white"><path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8.53a.75.75 0 0 0 0-1.06L6.03.47a.75.75 0 0 0-1.06 0z"></path></svg>
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 flex justify-center max-w-[600px] ${isHomePage ? 'hidden md:flex' : 'flex'}`}>
        <Suspense fallback={<div className="w-full h-11 bg-[#2a2a2a] rounded-full animate-pulse" />}>
           <SearchInput />
        </Suspense>
      </div>

      <div className={`flex items-center gap-2 md:gap-4 shrink-0 ${isSearchPage ? 'hidden md:flex' : 'flex'}`}>
        <LanguageMenu />
        
        <a 
          href="https://github.com/Harish-Srinivas-07/hivefy/releases" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hidden sm:flex items-center gap-2 bg-text-base text-black px-4 py-2 rounded-full text-[14px] font-bold transition-all active:scale-95 shadow-lg shadow-white/5"
        >
          <Image src="/assets/icons/complete_download.png" alt="Download" width={16} height={16} className="invert-0" />
          <span>Install App</span>
        </a>
      </div>
    </div>
  );
}
