"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SaavnAPI, LatestSaavnFetcher, decodeHtml } from '@/services/api';

const Sidebar = () => {
  const pathname = usePathname();
  const [libraryItems, setLibraryItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const [playlists, albums] = await Promise.all([
          LatestSaavnFetcher.getLatestPlaylists("tamil", 10).catch(() => []),
          LatestSaavnFetcher.getLatestAlbums("tamil", 10).catch(() => [])
        ]);
        
        let combined = [
          ...playlists.map(p => ({ ...p, libType: 'playlist' })),
          ...albums.map(a => ({ ...a, libType: 'album' }))
        ];

        // Ensure at least 4 items, if not, fetch global hits
        if (combined.length < 4) {
          const globalRes = await SaavnAPI.searchPlaylists("top hits", 0, 10);
          if (globalRes && globalRes.results) {
            const extra = globalRes.results.map(p => ({ ...p, libType: 'playlist' }));
            combined = [...combined, ...extra];
          }
        }
        
        setLibraryItems(combined.sort(() => 0.5 - Math.random()).slice(0, 15));
      } catch (e) {
        console.error("Failed to fetch library items:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  return (
    <div className="flex flex-col h-full gap-2 font-spotify">
      {/* Top Nav Box */}
      <nav className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-surface-base">
        <Link href="/" className="px-3 pt-4 mb-2 group">
          <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Image 
              src="/assets/icons/logo.png" 
              alt="Hivefy Logo" 
              width={34} 
              height={34} 
              className="drop-shadow-[0_0_10px_rgba(30,215,96,0.4)]" 
            />
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors">Hivefy</span>
          </div>
        </Link>
        <SidebarNavItem 
          href="/" 
          label="Home" 
          icon="/assets/icons/home.png" 
          active={pathname === '/'} 
        />
        <SidebarNavItem 
          href="/search" 
          label="Search" 
          icon="/assets/icons/search.png" 
          active={pathname === '/search'} 
        />
      </nav>

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
            <div className="flex items-center gap-1">
              <button className="flex items-center justify-center transition-all rounded-full w-8 h-8 text-text-subdued hover:text-text-base hover:bg-bg-highlight group">
                <Image src="/assets/icons/add.png" alt="Add" width={16} height={16} className="transition-opacity invert opacity-70 group-hover:opacity-100" />
              </button>
              <button className="flex items-center justify-center transition-all rounded-full w-8 h-8 text-text-subdued hover:text-text-base hover:bg-bg-highlight group">
                <Image src="/assets/icons/next.png" alt="Expand" width={16} height={16} className="transition-opacity invert opacity-70 group-hover:opacity-100 -rotate-90 md:rotate-0" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
             <FilterChip label="Playlists" active />
             <FilterChip label="Artists" />
             <FilterChip label="Albums" />
          </div>
        </header>

        <div className="flex items-center justify-between px-4 pt-1 pb-1">
          <button className="flex items-center justify-center transition-all rounded-full w-8 h-8 text-text-subdued hover:text-text-base hover:bg-white/5 group">
            <Image src="/assets/icons/search.png" alt="Search" width={16} height={16} className="transition-opacity invert opacity-70 group-hover:opacity-100" />
          </button>
          <div className="flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer text-text-subdued hover:text-text-base hover:scale-105">
            <span className="font-medium text-[13px]">Recents</span>
            <Image src="/assets/icons/menu.png" alt="Menu" width={14} height={14} className="invert opacity-70" />
          </div>
        </div>

        <div className="flex-1 px-2 py-1 overflow-y-auto scrollbar-hide">
          <LibraryItem 
            title="Liked Songs" 
            subtitle="Playlist • 385 songs" 
            image="/assets/icons/heart.png" 
            pinned 
            href="/playlist/liked"
          />
          
          {loading ? (
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
          ) : (
            libraryItems.map((item, idx) => {
              const imageObj = item.images && item.images.length > 0 ? item.images[0] : null;
              const imgUrl = imageObj?.url || '/assets/icons/logo.png';
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
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarNavItem = ({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) => (
  <Link href={href} className="group">
    <div className={`flex items-center gap-5 px-3 py-2.5 transition-all duration-300 rounded-lg cursor-pointer ${active ? 'text-text-base' : 'text-text-subdued group-hover:text-text-base hover:bg-white/5'}`}>
      <Image 
        src={icon} 
        alt={label} 
        width={24} 
        height={24} 
        className={`transition-all invert ${active ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-100'}`} 
      />
      <span className={`text-[16px] font-bold ${active ? 'text-glow' : ''}`}>{label}</span>
    </div>
  </Link>
);

const FilterChip = ({ label, active }: { label: string; active?: boolean }) => (
  <button className={`px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-all duration-200 font-medium ${
    active 
    ? 'bg-text-base text-black' 
    : 'bg-surface-elevated text-text-base hover:bg-surface-elevated-hover'
  }`}>
    {label}
  </button>
);

const LibraryItem = ({ title, subtitle, image, pinned, active, href = '#', isRemote }: any) => {
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
