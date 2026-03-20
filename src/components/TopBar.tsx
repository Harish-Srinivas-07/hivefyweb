"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { SaavnAPI } from '@/services/api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const instanceId = React.useRef(Math.random().toString(36).substring(7)).current;
  
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
    if (target !== '') {
      setShowSuggestions(false);
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
    setShowSuggestions(false); 
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="relative flex-1">
      <input 
        type="text" 
        placeholder="What do you want to play?" 
        className="w-full text-[14px] font-normal text-white bg-transparent border-none outline-none placeholder:text-text-subdued"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim() !== '' && suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="absolute top-[calc(100%+16px)] -left-10 -right-[56px] glass rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden max-h-[480px] overflow-y-auto border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.slice(0, 8).map((s, idx) => (
            <div 
              key={idx} 
              className="px-4 py-3 flex items-center gap-4 text-text-subdued cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-white group"
              onClick={() => handleSuggestionClick(s)}
            >
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 transition-transform rounded-full bg-white/5 group-hover:scale-110">
                <Image src="/assets/icons/search.png" alt="" width={16} height={16} className="transition-opacity invert opacity-70 group-hover:opacity-100" />
              </div>
              <span className="flex-1 font-medium text-[14px]">{s}</span>
              <div className="flex items-center justify-center transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                 <svg viewBox="0 0 16 16" height="16" width="16" fill="currentColor" style={{ transform: 'rotate(45deg)' }}>
                    <path d="M7.25 10a.75.75 0 0 1-1.5 0V4.56L3.53 6.78a.75.75 0 1 1-1.06-1.06l3.5-3.5a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 1 1-1.06 1.06l-2.22-2.22V10z"></path>
                 </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TopBar = () => {
  return (
    <div className="flex items-center justify-between w-full gap-4 px-2 md:px-4 bg-transparent h-topbar font-spotify">
      {/* Brand Logo & Mobile Brand */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
          <Image 
            src="/assets/icons/logo.png" 
            alt="Hivefy" 
            width={32} 
            height={32} 
            className="drop-shadow-[0_0_8px_rgba(30,215,96,0.3)]" 
          />
          <span className="hidden lg:block text-xl font-black tracking-tight text-white transition-colors group-hover:text-primary">Hivefy</span>
        </Link>
      </div>

      {/* Center Nav: Home + Search */}
      <div className="hidden md:flex items-center justify-center flex-1 gap-2 max-w-[600px]">
        <Link href="/" className="transition-all duration-200 hover:scale-110 active:scale-95 group/home">
          <div className="flex items-center justify-center w-12 h-12 transition-all rounded-full bg-surface-elevated group-hover/home:bg-primary group-hover/home:shadow-[0_0_15px_rgba(30,215,96,0.4)]">
            <Image 
              src="/assets/icons/home.png" 
              alt="Home" 
              width={24} 
              height={24} 
              className="transition-all invert opacity-90 group-hover/home:invert-0 group-hover/home:brightness-0" 
            />
          </div>
        </Link>
        <div className="bg-[#1f1f1f] h-12 flex-1 rounded-full flex items-center px-4 gap-3 transition-all duration-300 hover:bg-[#2a2a2a] hover:ring-1 hover:ring-primary/40 focus-within:bg-[#2a2a2a] focus-within:ring-2 focus-within:ring-primary group relative shadow-inner">
          <Image src="/assets/icons/search.png" alt="Search" width={20} height={20} className="transition-opacity invert opacity-60 group-focus-within:opacity-100" />
          <Suspense fallback={<div className="flex-1 h-5 animate-pulse bg-white/5 rounded" />}>
            <SearchInput />
          </Suspense>
          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
          <div className="flex items-center justify-center transition-all rounded-full cursor-pointer w-7 h-7 hover:bg-white/10 group">
             <Image src="/assets/icons/disc.png" alt="Browse" width={20} height={20} className="transition-transform invert opacity-60 group-hover:opacity-100 group-hover:rotate-12" />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <a 
          href="https://github.com/Harish-Srinivas-07/hivefy/releases" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hidden md:flex items-center gap-2 bg-text-base text-black px-4 py-2 rounded-full text-[14px] font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/5"
        >
          <Image src="/assets/icons/complete_download.png" alt="Download" width={16} height={16} className="invert-0" />
          <span>Install App</span>
        </a>
        <button className="hidden sm:flex items-center justify-center transition-all rounded-full w-10 h-10 group text-text-subdued hover:text-text-base hover:bg-white/10 active:scale-90">
          <Image src="/assets/icons/bell.png" alt="Notifications" width={20} height={20} className="transition-all invert opacity-70 group-hover:opacity-100 group-hover:rotate-[15deg]" />
        </button>
        <div className="flex items-center justify-center p-0.5 cursor-pointer transition-all rounded-full w-9 h-9 md:w-10 md:h-10 border-2 border-surface-elevated hover:border-text-subdued overflow-hidden active:scale-95 shadow-lg">
          <Image src="/assets/icons/logo.png" alt="Profile" width={40} height={40} className="object-cover" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
