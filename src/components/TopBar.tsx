"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import './TopBar.css';
import { SaavnAPI } from '@/services/api';

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const instanceId = React.useRef(Math.random().toString(36).substring(7)).current;
  
  // Sync query with URL changes only when the URL actually changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
  }, [searchParams]); // Only depend on searchParams

  // Debounce search input and fetch suggestions
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      console.warn(`[SearchBox][${instanceId}] Fetching for: "${query}"`);
      try {
        const results = await SaavnAPI.getSearchBoxSuggestions(query.trim());
        console.warn(`[SearchBox][${instanceId}] Got ${results.length} suggestions:`, results.slice(0, 3));
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (e) {
        console.error(`[SearchInput][${instanceId}] Suggestions fetch failed:`, e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, instanceId]);

  const handleSearch = (q: string, source: string) => {
    console.error(`!!!! [SearchBox][${instanceId}] handleSearch TRIGGERED via [${source}] for: "${q}"`);
    console.trace(`[SearchBox][${instanceId}] Trace for ${source}`);
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
      handleSearch(query, 'ENTER');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.warn(`[SearchBox] Suggestion clicked: ${suggestion}`);
    setShowSuggestions(false); // Close dropdown immediately
    setQuery(suggestion);
    handleSearch(suggestion, 'CLICK');
  };

  return (
    <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
      <input 
        type="text" 
        placeholder="What do you want to play?" 
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim() !== '' && suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          // Keep dropdown open for clicks
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.slice(0, 8).map((s, idx) => (
            <div 
              key={idx} 
              className="suggestion-item"
              onClick={() => handleSuggestionClick(s)}
            >
              <div className="suggestion-icon-circle">
                <Image src="/assets/icons/search.png" alt="" width={16} height={16} className="suggestion-icon-svg" />
              </div>
              <span className="suggestion-text">{s}</span>
              <div className="suggestion-arrow">
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
  const router = useRouter(); // It's fine here as long as we don't use searchParams directly

  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <Image src="/assets/icons/radio.png" alt="Hivefy" width={32} height={32} className="brand-logo" />
      </div>

      <div className="topbar-center">
        <Link href="/" className="home-link">
          <div className="home-button">
            <Image src="/assets/icons/home.png" alt="Home" width={24} height={24} className="icon-invert" />
          </div>
        </Link>
        <div className="search-box">
          <Image src="/assets/icons/search.png" alt="Search" width={20} height={20} className="icon-subdued" />
          <Suspense fallback={<input type="text" placeholder="What do you want to play?" className="search-input" />}>
            <SearchInput />
          </Suspense>
          <div className="search-divider"></div>
          <Image src="/assets/icons/disc.png" alt="Browse" width={20} height={20} className="icon-subdued" />
        </div>
      </div>

      <div className="topbar-right">
        <a 
          href="https://github.com/Harish-Srinivas-07/hivefy/releases" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="install-button"
        >
          <Image src="/assets/icons/complete_download.png" alt="Download" width={16} height={16} className="icon-invert" />
          <span>Install App</span>
        </a>        <button className="icon-btn">
          <Image src="/assets/icons/bell.png" alt="Notifications" width={20} height={20} className="icon-invert" />
        </button>
        <button className="icon-btn">
          <Image src="/assets/icons/artist.png" alt="Social" width={20} height={20} className="icon-invert" />
        </button>
        <div className="profile-container">
          <Image src="/assets/icons/logo.png" alt="Profile" width={32} height={32} className="profile-img" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
