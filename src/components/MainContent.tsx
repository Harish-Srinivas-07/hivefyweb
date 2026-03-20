"use client";
import React from 'react';

import Link from 'next/link';
import { Playlist, Album, Artist } from '@/types';
import { decodeHtml } from '@/services/api';

interface MainContentProps {
  gridPlaylists: Playlist[];
  topLatest: Playlist[];
  topLatestAlbum: Album[];
  fresh: Playlist[];
  freshAlbum: Album[];
  party: Playlist[];
  love: Playlist[];
  artists: Artist[];
}
const MainContent: React.FC<MainContentProps> = ({
  gridPlaylists,
  topLatest,
  topLatestAlbum,
  fresh,
  freshAlbum,
  party,
  love,
  artists
}) => {
  const [activeCategory, setActiveCategory] = React.useState<{ title: string, items: any[], type: 'playlist' | 'album' | 'artist' } | null>(null);

  React.useEffect(() => {
    // When category changes, scroll the main content area to top
    const scrollContainer = document.querySelector('main > div');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeCategory]);

  const getImageUrl = (item: any) => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[item.images.length - 1].url || item.images[item.images.length - 1].link || item.images[0].url || '/assets/icons/logo.png';
    }
    if (item.image) {
      if (typeof item.image === 'string') return item.image;
      if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[item.image.length - 1].url || item.image[item.image.length - 1].link || item.image[0].url || '/assets/icons/logo.png';
      }
    }
    return '/assets/icons/logo.png';
  };

  if (activeCategory) {
    return (
      <div className="relative z-10 pt-4 px-4 pb-32">
        <div className="flex items-center gap-4 mb-8 group">
          <button 
            onClick={() => setActiveCategory(null)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="white"><path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8.53a.75.75 0 0 1 0-1.06L9.97.47a.75.75 0 0 1 1.06 0z"></path></svg>
          </button>
          <h1 className="text-3xl font-black text-white group-hover:underline cursor-pointer" onClick={() => setActiveCategory(null)}>{activeCategory.title}</h1>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-8 justify-start">
          {activeCategory.items.map((item: any, i: number) => {
            const img = getImageUrl(item);
            const type = activeCategory.type;
            const subtitle = type === 'artist' ? 'Artist' : (type === 'playlist' 
                ? (item.artist || (item.songCount ? `${item.songCount} songs` : 'Playlist'))
                : (item.artist || 'Album'));

            return (
              <Link 
                key={item.id || i} 
                href={type === 'artist' ? '#' : `/${type}/${item.id}`} 
                className={`group block bg-[#181818] p-3 md:p-4 rounded-xl transition-all duration-300 cursor-pointer hover:bg-[#282828] active:scale-[0.98] shadow-lg shadow-black/20 w-[calc(50%-10px)] md:w-[calc(25%-15px)] lg:w-[calc(20%-16px)]`}
              >
                <div className={`relative w-full mb-4 overflow-hidden shadow-2xl aspect-square ${type === 'artist' ? 'rounded-full' : 'rounded-lg'}`}>
                  <img src={img} alt={item.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                  {type !== 'artist' && (
                    <div className="absolute right-2 bottom-2 w-12 h-12 flex items-center justify-center transition-all translate-y-3 opacity-0 shadow-[0_8px_16px_rgba(0,0,0,0.5)] rounded-full bg-primary text-black group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-primary-hover active:scale-95">
                      <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                    </div>
                  )}
                </div>
                <div className={`mb-1 text-[15px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors ${type === 'artist' ? 'text-center' : ''}`}>{decodeHtml(item.name || item.title || '')}</div>
                <div className={`text-[13px] leading-relaxed text-text-subdued line-clamp-2 ${type === 'artist' ? 'text-center' : ''}`} dangerouslySetInnerHTML={{ __html: subtitle }} /> 
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-spotify min-h-screen">
      {/* Top Gradient Overlay */}
      <div className="absolute top-[-80px] left-[-32px] right-[-32px] h-[340px] bg-gradient-to-b from-[#1e0a4d]/60 via-[#121212]/80 to-[#121212] pointer-events-none z-0" />

      <div className="relative z-10 pt-2">
        {/* Navigation Tabs */}
        <div className="sticky top-0 z-20 flex gap-2 mb-4 py-3 items-center bg-transparent backdrop-blur-md lg:backdrop-blur-none -mx-2 px-2 lg:mx-0 lg:px-0 transition-colors duration-300">
          <FilterTab label="All" active />
          <FilterTab label="Music" />
          <FilterTab label="Podcasts" />
        </div>

        {/* Featured Grid (4 Columns on Desktop, 2 on Mobile) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-1.5 md:gap-y-3 mb-8">
          <FeaturedCard title="Liked Songs" image="/assets/icons/heart.png" special />
          {gridPlaylists.slice(0, 7).map((p, idx) => {
            const img = getImageUrl(p); 
            return (
              <Link key={`${p.id}-${idx}`} href={`/playlist/${p.id}`}>
                <FeaturedCard title={decodeHtml(p.name || p.title || '')} image={img} />
              </Link>
            );
          })}
        </div>

        {/* Dynamic Sections */}
        {topLatest.length > 0 && (
          <Section title="Made For You" items={topLatest} type="playlist" onShowAll={() => setActiveCategory({ title: "Made For You", items: topLatest, type: 'playlist' })} />
        )}
        
        {topLatestAlbum.length > 0 && (
          <Section title="Recently Played" items={topLatestAlbum} type="album" onShowAll={() => setActiveCategory({ title: "Recently Played", items: topLatestAlbum, type: 'album' })} />
        )}

        {freshAlbum.length > 0 && (
          <Section title="Recommended for today" items={freshAlbum} type="album" onShowAll={() => setActiveCategory({ title: "Recommended for today", items: freshAlbum, type: 'album' })} />
        )}

        {artists.length > 0 && (
          <ArtistSection title="Popular artists" artists={artists} onShowAll={() => setActiveCategory({ title: "Popular artists", items: artists, type: 'artist' })} />
        )}

        {fresh.length > 0 && (
          <Section title="Throwback" items={fresh} type="playlist" onShowAll={() => setActiveCategory({ title: "Throwback", items: fresh, type: 'playlist' })} />
        )}

        {party.length > 0 && (
          <Section title="Party" items={party} type="playlist" onShowAll={() => setActiveCategory({ title: "Party", items: party, type: 'playlist' })} />
        )}

        <div className="h-[120px]" /> {/* Bottom padding */}
      </div>
    </div>
  );
};

const FilterTab = ({ label, active }: { label: string; active?: boolean }) => (
  <button className={`px-4 py-1 rounded-full text-[14px] font-bold transition-all duration-200 ${
    active 
    ? 'bg-white text-black' 
    : 'bg-white/10 text-white hover:bg-white/20'
  }`}>
    {label}
  </button>
);

const FeaturedCard = ({ title, image, special }: { title: string, image: string, special?: boolean }) => (
  <div className="group relative flex items-center h-[48px] md:h-[64px] gap-3 md:gap-4 overflow-hidden transition-all duration-300 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 active:scale-[0.99]">
    <div className={`flex items-center justify-center w-[48px] md:w-[64px] h-full flex-shrink-0 shadow-2xl ${special ? 'bg-gradient-to-br from-[#450af5] to-[#c4efd9] p-3 md:p-4' : 'bg-[#282828]'}`}>
      <img src={image} alt={title} className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${special ? 'invert drop-shadow-md' : ''}`} /> 
    </div>
    <span className="text-[13px] md:text-[15px] font-bold truncate flex-1 pr-12 text-white">{title}</span>
    <div className="absolute flex items-center justify-center transition-all translate-y-2 opacity-0 shadow-2xl right-3 w-8 h-8 md:w-11 md:h-11 rounded-full bg-primary text-black group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 hidden lg:flex">
      <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
    </div>
  </div>
);

const Section = ({ title, items, type, onShowAll }: { title: string, items: any[], type: 'playlist' | 'album', onShowAll: () => void }) => {
  return (
    <section className="mb-10 group/section">
      <div className="flex items-center justify-between mb-5">
        <h2 
          onClick={onShowAll}
          className="text-[22px] md:text-2xl font-bold tracking-tight text-white cursor-pointer hover:underline decoration-2 underline-offset-4"
        >
          {title}
        </h2>
        {items.length > 5 && (
          <button 
            onClick={onShowAll}
            className="text-[14px] font-bold transition-all text-text-subdued hover:underline hover:text-white"
          >
            Show all
          </button>
        )}
      </div>

      <div className="flex gap-5 pb-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
        {items.slice(0, 10).map((item: any, i: number) => {
          let img = '/assets/icons/logo.png';
          if (Array.isArray(item.images) && item.images.length > 0) img = item.images[item.images.length - 1].url || item.images[0].url;
          else if (typeof item.image === 'string') img = item.image;
          else if (Array.isArray(item.image) && item.image.length > 0) img = item.image[item.image.length - 1].url || item.image[0].url;

          const subtitle = type === 'playlist' 
              ? (item.artist || (item.songCount ? `${item.songCount} songs` : 'Playlist'))
              : (item.artist || 'Album');
              
          return (
            <Link 
              key={item.id || i} 
              href={`/${type}/${item.id}`} 
              className="group block min-w-[175px] md:min-w-[170px] bg-[#181818] p-3 md:p-4 rounded-xl transition-all duration-300 cursor-pointer hover:bg-[#282828] active:scale-[0.98] shadow-lg shadow-black/20"
            >
              <div className="relative w-full mb-4 overflow-hidden shadow-2xl aspect-square rounded-lg">
                <img src={img} alt={item.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute right-2 bottom-2 w-12 h-12 flex items-center justify-center transition-all translate-y-3 opacity-0 shadow-[0_8px_16px_rgba(0,0,0,0.5)] rounded-full bg-primary text-black group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-primary-hover active:scale-95">
                  <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                </div>
              </div>
              <div className="mb-1 text-[15px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{decodeHtml(item.name || item.title || '')}</div>
              <div className="text-[13px] leading-relaxed text-text-subdued line-clamp-2" dangerouslySetInnerHTML={{ __html: subtitle }} /> 
            </Link>
          )
        })}
      </div>
    </section>
  );
};

const ArtistSection = ({ title, artists, onShowAll }: { title: string, artists: Artist[], onShowAll: () => void }) => {
  return (
    <section className="mb-10 group/artist">
      <div className="flex items-end justify-between mb-5">
        <h2 
          onClick={onShowAll}
          className="text-2xl font-bold tracking-tight text-white cursor-pointer hover:underline decoration-2 underline-offset-4"
        >
          {title}
        </h2>
        {artists.length > 5 && (
          <button 
            onClick={onShowAll}
            className="text-[13px] font-bold transition-colors text-text-subdued hover:underline hover:text-white mb-1"
          >
            Show all
          </button>
        )}
      </div>
      <div className="flex gap-5 pb-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
        {artists.slice(0, 10).map((artist: any, i) => {
          let img = '/assets/icons/logo.png';
          if (Array.isArray(artist.images) && artist.images.length > 0) img = artist.images[artist.images.length - 1].url || artist.images[0].url;
          else if (typeof artist.image === 'string') img = artist.image;
          else if (Array.isArray(artist.image) && artist.image.length > 0) img = artist.image[artist.image.length - 1].url || artist.image[0].url;

          return (
            <div 
              key={artist.id || i} 
              onClick={onShowAll}
              className="group min-w-[140px] md:min-w-[190px] max-w-[190px] bg-[#181818] p-3 md:p-4 rounded-xl transition-all duration-300 cursor-pointer hover:bg-[#282828] active:scale-[0.98] shadow-lg shadow-black/20"
            >
               <div className="relative w-full mb-5 overflow-hidden shadow-2xl aspect-square rounded-full border-1 border-white/5">
                <img src={img} alt={artist.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="mb-1 text-[15px] font-bold text-base text-center line-clamp-1 group-hover:text-primary transition-colors">{decodeHtml(artist.name || artist.title || '')}</div>
              <div className="text-[13px] leading-relaxed text-text-subdued text-center line-clamp-2">Artist</div>
            </div>
          )
        })}
      </div>
    </section>
  );
};

export default MainContent;
