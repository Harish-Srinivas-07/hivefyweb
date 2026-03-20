"use client";
import React from 'react';

import Link from 'next/link';
import { Playlist, Album, Artist } from '@/types';
import { decodeHtml } from '@/services/api';
import MainFooter from './MainFooter';
import MobileAppBanner from './MobileAppBanner';

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

        <div className="flex flex-wrap gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-6 justify-start">
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
                className={`group block bg-transparent p-2 md:p-3 rounded-lg transition-all duration-300 cursor-pointer hover:bg-white/5 active:scale-[0.98] w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]`}
              >
                <div className={`relative w-full mb-3 overflow-hidden shadow-2xl aspect-square ${type === 'artist' ? 'rounded-full' : 'rounded-md'}`}>
                  <img src={img} alt={item.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  {type !== 'artist' && (
                    <div className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center transition-all translate-y-3 opacity-0 shadow-[0_8px_16px_rgba(0,0,0,0.5)] rounded-full bg-primary text-black group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-primary-hover active:scale-95">
                      <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                    </div>
                  )}
                </div>
                <div className={`mb-0.5 text-[14px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors ${type === 'artist' ? 'text-center' : ''}`}>{decodeHtml(item.name || item.title || '')}</div>
                <div className={`text-[12px] leading-snug text-text-subdued line-clamp-2 ${type === 'artist' ? 'text-center' : ''}`} dangerouslySetInnerHTML={{ __html: subtitle }} /> 
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

      <div className="relative z-10 pt-4 px-4 md:px-8 mt-10">
        {/* Featured Grid (4 Columns on Desktop, 2 on Mobile) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 md:gap-x-4 gap-y-1.5 md:gap-y-3 mb-8">
          <Link href="/playlist/liked">
            <FeaturedCard title="Liked Songs" image="/assets/icons/heart.png" special />
          </Link>
          {gridPlaylists.slice(0, 7).map((p, idx) => {
            const img = getImageUrl(p); 
            return (
              <Link key={`${p.id}-${idx}`} href={`/playlist/${p.id}`}>
                <FeaturedCard title={decodeHtml(p.name || p.title || '')} image={img} />
              </Link>
            );
          })}
        </div>
        
        <div className="md:hidden mb-8 mx-[-8px]">
           <MobileAppBanner />
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

        <div className="hidden md:block mb-8">
           <MobileAppBanner />
        </div>

        {fresh.length > 0 && (
          <Section title="Throwback" items={fresh} type="playlist" onShowAll={() => setActiveCategory({ title: "Throwback", items: fresh, type: 'playlist' })} />
        )}

        {party.length > 0 && (
          <Section title="Party" items={party} type="playlist" onShowAll={() => setActiveCategory({ title: "Party", items: party, type: 'playlist' })} />
        )}

        <MainFooter />
      </div>
    </div>
  );
};

const FeaturedCard = ({ title, image, special }: { title: string, image: string, special?: boolean }) => (
  <div className="group relative flex items-center h-[48px] md:h-[64px] gap-3 md:gap-4 overflow-hidden transition-all duration-300 rounded-md cursor-pointer bg-white/5 hover:bg-white/10 active:scale-[0.99] pr-3">
    <div className={`flex items-center justify-center w-[48px] md:w-[64px] h-full flex-shrink-0 shadow-2xl ${special ? 'bg-gradient-to-br from-[#450af5] to-[#c4efd9] p-3 md:p-4' : 'bg-[#282828]'}`}>
      <img src={image} alt={title} className={`object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 ${special ? 'invert drop-shadow-md' : ''}`} /> 
    </div>
    <span className="text-[12px] md:text-[14px] font-bold line-clamp-2 leading-tight flex-1 md:pr-10 text-white">{title}</span>
    <div className="absolute flex items-center justify-center transition-all translate-y-2 opacity-0 shadow-2xl right-3 w-8 h-8 md:w-11 md:h-11 rounded-full bg-primary text-black group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 hidden lg:flex">
      <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
    </div>
  </div>
);

const Section = ({ title, items, type, onShowAll }: { title: string, items: any[], type: 'playlist' | 'album', onShowAll: () => void }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10 group/section relative">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 
          onClick={onShowAll}
          className="text-[20px] md:text-[22px] font-bold tracking-tight text-white cursor-pointer hover:underline decoration-2 underline-offset-4"
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

      <div className="relative">
        <div className={`absolute left-[-12px] top-0 bottom-4 w-64 z-20 flex items-center justify-start pointer-events-none opacity-0 lg:group-hover/section:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#121212] to-transparent ${!showLeft ? '!opacity-0 pointer-events-none' : ''}`}>
            <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-[#333]/90 hover:bg-[#444] flex items-center justify-center transition-all active:scale-95 shadow-2xl pointer-events-auto ml-2 md:ml-4"
            >
                <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="white"><path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8.53a.75.75 0 0 1 0-1.06L9.97.47a.75.75 0 0 1 1.06 0z"></path></svg>
            </button>
        </div>

        <div className={`absolute right-[-12px] top-0 bottom-4 w-64 z-20 flex items-center justify-end pointer-events-none opacity-0 lg:group-hover/section:opacity-100 transition-opacity duration-300 bg-gradient-to-l from-[#121212] to-transparent ${!showRight ? '!opacity-0 pointer-events-none' : ''}`}>
            <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-[#333]/90 hover:bg-[#444] flex items-center justify-center transition-all active:scale-95 shadow-2xl pointer-events-auto mr-2 md:mr-4"
            >
                <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="white"><path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8.53a.75.75 0 0 0 0-1.06L6.03.47a.75.75 0 0 0-1.06 0z"></path></svg>
            </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide -mx-2 px-2 scroll-smooth"
        >
          {items.slice(0, 15).map((item: any, i: number) => {
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
                className="group block min-w-[160px] md:min-w-[180px] bg-transparent p-2 md:p-3 rounded-lg transition-all duration-300 cursor-pointer hover:bg-white/5 active:scale-[0.98]"
              >
                <div className="relative w-full mb-3 overflow-hidden shadow-2xl aspect-square rounded-md">
                  <img src={img} alt={item.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute right-2 bottom-2 w-10 h-10 flex items-center justify-center transition-all translate-y-3 opacity-0 shadow-[0_8px_16px_rgba(0,0,0,0.5)] rounded-full bg-primary text-black group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-primary-hover active:scale-95">
                    <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                  </div>
                </div>
                <div className="mb-0.5 text-[14px] font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{decodeHtml(item.name || item.title || '')}</div>
                <div className="text-[12px] leading-snug text-text-subdued line-clamp-2" dangerouslySetInnerHTML={{ __html: subtitle }} /> 
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ArtistSection = ({ title, artists, onShowAll }: { title: string, artists: Artist[], onShowAll: () => void }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10 group/artist relative">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 
          onClick={onShowAll}
          className="text-[20px] md:text-[22px] font-bold tracking-tight text-white cursor-pointer hover:underline decoration-2 underline-offset-4"
        >
          {title}
        </h2>
        <div className="flex items-center gap-4">
          {artists.length > 5 && (
            <button 
              onClick={onShowAll}
              className="text-[13px] font-bold transition-all text-text-subdued hover:underline hover:text-white"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div className={`absolute left-[-12px] top-0 bottom-4 w-64 z-20 flex items-center justify-start pointer-events-none opacity-0 lg:group-hover/artist:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#121212] to-transparent ${!showLeft ? '!opacity-0 pointer-events-none' : ''}`}>
            <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full bg-[#333]/90 hover:bg-[#444] flex items-center justify-center transition-all active:scale-95 shadow-2xl pointer-events-auto ml-2 md:ml-4"
            >
                <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="white"><path d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8.53a.75.75 0 0 1 0-1.06L9.97.47a.75.75 0 0 1 1.06 0z"></path></svg>
            </button>
        </div>

        <div className={`absolute right-[-12px] top-0 bottom-4 w-64 z-20 flex items-center justify-end pointer-events-none opacity-0 lg:group-hover/artist:opacity-100 transition-opacity duration-300 bg-gradient-to-l from-[#121212] to-transparent ${!showRight ? '!opacity-0 pointer-events-none' : ''}`}>
            <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full bg-[#333]/90 hover:bg-[#444] flex items-center justify-center transition-all active:scale-95 shadow-2xl pointer-events-auto mr-2 md:mr-4"
            >
                <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="white"><path d="M4.97.47a.75.75 0 0 0 0 1.06L11.44 8l-6.47 6.47a.75.75 0 1 0 1.06 1.06L13.56 8.53a.75.75 0 0 0 0-1.06L6.03.47a.75.75 0 0 0-1.06 0z"></path></svg>
            </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide -mx-2 px-2 scroll-smooth"
        >
          {artists.slice(0, 15).map((artist: any, i) => {
            let img = '/assets/icons/logo.png';
            if (Array.isArray(artist.images) && artist.images.length > 0) img = artist.images[artist.images.length - 1].url || artist.images[0].url;
            else if (typeof artist.image === 'string') img = artist.image;
            else if (Array.isArray(artist.image) && artist.image.length > 0) img = artist.image[artist.image.length - 1].url || artist.image[0].url;

            return (
              <div 
                key={artist.id || i} 
                onClick={onShowAll}
                className="group min-w-[140px] md:min-w-[180px] bg-transparent p-2 md:p-3 rounded-lg transition-all duration-300 cursor-pointer hover:bg-white/5 active:scale-[0.98]"
              >
                <div className="relative w-full mb-3 overflow-hidden shadow-2xl aspect-square rounded-full border border-white/5">
                  <img src={img} alt={artist.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mb-0.5 text-[14px] font-bold text-center line-clamp-1 group-hover:text-primary transition-colors">{decodeHtml(artist.name || artist.title || '')}</div>
                <div className="text-[12px] leading-snug text-text-subdued text-center line-clamp-2">Artist</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MainContent;
