"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SaavnAPI, LatestSaavnFetcher, decodeHtml } from '@/services/api';
import { historyService } from '@/services/history';
import { useLikesStore } from '@/store/likesStore';
import { useLanguageStore } from '@/store/languageStore';

const Sidebar = () => {
  const pathname = usePathname();
  const { getLikedSongs, getLikedAlbums, getLikedPlaylists, likedItems } = useLikesStore();
  const { language, availableLanguages } = useLanguageStore();
  
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    const fetchLibrary = async () => {
      try {
        const likedAlbums = getLikedAlbums();
        const likedPlaylists = getLikedPlaylists();
        
        // Start with Liked items at the top
        let items: any[] = [
          ...likedPlaylists.map(p => ({ ...p, libType: 'playlist', isLiked: true })),
          ...likedAlbums.map(a => ({ ...a, libType: 'album', isLiked: true }))
        ];

        const recentHistory = await historyService.getHistory();
        const historyItems = recentHistory.map(h => ({ ...h, libType: h.type }));
        
        const seenIds = new Set(items.map(i => i.id));
        for (const h of historyItems) {
           if (!seenIds.has(h.id)) {
              items.push(h);
              seenIds.add(h.id);
           }
        }

        if (items.length < 15) {
          const userLang = language;
          const [playlists, albums] = await Promise.all([
             LatestSaavnFetcher.getLatestPlaylists(userLang, 10).catch(() => []),
             LatestSaavnFetcher.getLatestAlbums(userLang, 10).catch(() => [])
          ]);
          
          const latestItems = [
            ...playlists.map(p => ({ ...p, libType: 'playlist' })),
            ...albums.map(a => ({ ...a, libType: 'album' }))
          ];

          for (const li of latestItems) {
            if (!seenIds.has(li.id)) {
               items.push(li);
               seenIds.add(li.id);
            }
            if (items.length >= 25) break;
          }
        }

        if (items.length < 4) {
          const global = await SaavnAPI.searchPlaylists(`top hits ${language}`, 0, 10);
          if (global?.results) {
            const extra = global.results.map(p => ({ ...p, libType: 'playlist' }));
            items = [...items, ...extra];
          }
        }

        const finalItems = items.filter(item => {
          const idStr = String(item.id).toLowerCase();
          const nameStr = (item.name || item.title || '').toLowerCase();
          return idStr !== 'liked' && nameStr !== 'liked songs';
        });
        
        setLibraryItems(finalItems);
      } catch (e) {
        console.error("Failed to fetch library items:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [pathname, language, likedItems]);

  // Filtering and Sorting
  const filteredItems = libraryItems
    .filter(item => {
      const title = (item.name || item.title || '').toLowerCase();
      const artist = (item.primaryArtists || item.artist || '').toLowerCase();
      return title.includes(searchQuery.toLowerCase()) || artist.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        const titleA = (a.name || a.title || '').toLowerCase();
        const titleB = (b.name || b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      }
      return 0; // 'recent' is default order from API/History
    });

  return (
    <div className="flex flex-col h-full gap-2 font-spotify">
      {/* Library Box */}
      <div className="flex flex-col flex-1 overflow-hidden rounded-xl bg-surface-base">
        <header className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 font-bold transition-all duration-200 cursor-pointer group text-text-subdued hover:text-text-base">
              <Image 
                src="/assets/icons/playlist.png" 
                alt="Library" 
                width={24} 
                height={24} 
                className={`transition-all invert ${pathname.includes('library') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} 
              />
              <span className="text-base">Your Library</span>
            </div>
          </div>
        </header>

        {/* Search and Sort Sub-header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className={`flex items-center transition-all duration-300 rounded-full h-8 overflow-hidden ${isSearchOpen ? 'bg-white/10 w-full mr-2' : 'w-8 hover:bg-white/5'}`}>
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
                else setSearchQuery('');
              }}
              className={`flex items-center justify-center transition-all rounded-full shrink-0 ${isSearchOpen ? 'w-9 h-8' : 'w-8 h-8'} text-text-subdued hover:text-text-base group`}
            >
              <Image src="/assets/icons/search.png" alt="Search" width={16} height={16} className="transition-opacity invert opacity-70 group-hover:opacity-100" />
            </button>
            {isSearchOpen && (
              <>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search in Your Library"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-text-subdued px-1 font-medium"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-text-subdued hover:text-white transition-colors mr-1"
                  >
                    <svg role="img" height="14" width="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.47 1.47a.75.75 0 0 1 1.06 0L8 6.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L9.06 8l5.47 5.47a.75.75 0 1 1-1.06 1.06L8 9.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L6.94 8 1.47 2.53a.75.75 0 0 1 0-1.06z"></path></svg>
                  </button>
                )}
              </>
            )}
          </div>

          {!isSearchOpen && (
            <div className="relative" ref={sortMenuRef}>
              <div 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer text-text-subdued hover:text-text-base hover:scale-105"
              >
                <span className="font-medium text-[13px] capitalize">{sortBy === 'recent' ? 'Recents' : 'Alphabetical'}</span>
                <Image src="/assets/icons/menu.png" alt="Menu" width={14} height={14} className="invert opacity-70" />
              </div>

              {isSortMenuOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-40 bg-[#282828] rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/[0.05] py-1 z-[2000] animate-in fade-in zoom-in duration-150">
                   <div className="px-3 py-1.5 border-b border-white/[0.05] mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-subdued">Sort by</span>
                   </div>
                   <SortOption active={sortBy === 'recent'} onClick={() => { setSortBy('recent'); setIsSortMenuOpen(false); }} label="Recents" />
                   <SortOption active={sortBy === 'alphabetical'} onClick={() => { setSortBy('alphabetical'); setIsSortMenuOpen(false); }} label="Alphabetical" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 px-2 py-1 overflow-y-auto scrollbar-hide">
          <LibraryItem 
            title="Liked Songs" 
            subtitle={`Playlist • ${mounted ? getLikedSongs().length : 0} songs`} 
            image="/assets/icons/heart.png" 
            pinned 
            href="/playlist/liked"
          />
          
          {loading ? (
            <SkeletonLoader />
          ) : (
            filteredItems.map((item, idx) => {
              const imageObj = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;
              const imgUrl = (typeof item.image === 'string' && item.image) || imageObj?.url || imageObj?.link || '/assets/icons/logo.png';
              const typeLabel = item.libType === 'playlist' ? 'Playlist' : 'Album';
              const artistLabel = item.primaryArtists || item.artist || 'Various Artists';
              
              return (
                <LibraryItem 
                  key={`${item.id}-${idx}`}
                  title={decodeHtml(item.name || item.title)} 
                  subtitle={decodeHtml(`${typeLabel} • ${artistLabel}`)} 
                  image={imgUrl} 
                  href={`/${item.libType}/${item.id}`}
                  isRemote
                  isLiked={item.isLiked}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const SortOption = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-3 py-2 text-[13px] font-bold transition-colors flex items-center justify-between ${active ? 'text-primary bg-white/[0.05]' : 'text-white/80 hover:bg-white/[0.08] hover:text-white'}`}
  >
    <span>{label}</span>
    {active && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
  </button>
);

const SkeletonLoader = () => (
  <div className="flex flex-col gap-2 p-2">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-md bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/5 rounded w-3/4" />
          <div className="h-2 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const LibraryItem = ({ title, subtitle, image, pinned, active, href = '#', isRemote, isLiked }: any) => {
  const content = (
    <div className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-white/10 shadow-sm' : 'hover:bg-white/5'}`}>
      <div className={`flex items-center justify-center w-12 h-12 overflow-hidden rounded-md ${pinned ? 'bg-gradient-to-br from-[#450af5] to-[#c4efd9]' : 'bg-bg-highlight'} shadow-md transition-transform group-hover:scale-105 relative`}>
        <Image 
          src={image} 
          alt={title} 
          fill
          className={`object-cover transition-all ${pinned ? 'p-2.5 invert brightness-110' : (isRemote ? 'opacity-100' : 'p-2.5 invert opacity-90 group-hover:opacity-100')}`} 
        />
      </div>
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-[14px] truncate ${active ? 'text-primary' : 'text-text-base'}`}>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-text-subdued">
          {pinned && <span className="text-primary text-[10px] transform rotate-[15deg]">📌</span>}
          {isLiked && <span className="text-primary text-[10px]">❤️</span>}
          <span className="truncate">{subtitle}</span>
        </div>
      </div>
      {active && (
        <div className="flex items-center pr-1">
          <Image 
            src="/assets/icons/player.gif" 
            alt="Playing" 
            width={14} 
            height={14} 
            unoptimized 
            className="invert sepia saturate-[5] hue-rotate-[90deg] brightness-125 shadow-lg shadow-primary/20" 
          />
        </div>
      )}
    </div>
  );

  return <Link href={href}>{content}</Link>;
};

export default Sidebar;
