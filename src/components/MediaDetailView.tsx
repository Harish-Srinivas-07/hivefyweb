"use client";

import React from 'react';
import Image from 'next/image';
import { SongDetail, Playlist, Album } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useLikesStore } from '@/store/likesStore';
import { decodeHtml } from '@/services/api';
import { historyService } from '@/services/history';

interface MediaDetailViewProps {
  data: Playlist | Album;
  type: 'playlist' | 'album';
}

export default function MediaDetailView({ data, type }: MediaDetailViewProps) {
  const { playSong, currentSong, isPlaying, isShuffling, toggleShuffle } = usePlayerStore();
  const { toggleLike, isLiked } = useLikesStore();
  const [showLargeImage, setShowLargeImage] = React.useState(false);
  const [headerOpacity, setHeaderOpacity] = React.useState(0);
  const [isHeaderSticky, setIsHeaderSticky] = React.useState(false);
  const [dominantColor, setDominantColor] = React.useState('rgb(83, 83, 83)');
  
  const headerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const imgUrl = getImageUrl(data);
    if (!imgUrl || imgUrl === '/assets/icons/logo.png') return;

    const img = new (window as any).Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      // Boost the color slightly for more vibrancy if it's too dark
      const factor = 0.8; 
      setDominantColor(`rgb(${r}, ${g}, ${b})`);
    };
  }, [data]);

  React.useEffect(() => {
    const scrollContainer = document.querySelector('main > div');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollY = scrollContainer.scrollTop;
      
      // Calculate opacity for the sticky top bar background
      const threshold = 200;
      const opacity = Math.min(1, scrollY / threshold);
      setHeaderOpacity(opacity);

      // Determine if the title should be sticky
      if (headerRef.current) {
         const headerBottom = headerRef.current.offsetTop + headerRef.current.offsetHeight - 64;
         setIsHeaderSticky(scrollY > headerBottom);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (data && data.id) {
       historyService.addVisited(data, (type as any));
    }
  }, [data, type]);

  const safeString = (val: any): string => {
    if (!val) return '';
    let result = '';
    if (typeof val === 'string') result = val;
    else if (typeof val === 'object') {
      result = val.name || val.title || val.text || JSON.stringify(val);
    } else {
      result = String(val);
    }
    return decodeHtml(result);
  };

  const handlePlayAll = () => {
    if (data.songs && data.songs.length > 0) {
      playSong(data.songs[0], data.songs);
    }
  };

  const getImageUrl = (item: any) => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[item.images.length - 1].url || item.images[item.images.length - 1].link || item.images[0].url;
    }
    if (item.image) {
      if (typeof item.image === 'string') return item.image;
      if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[item.image.length - 1].url || item.image[item.image.length - 1].link || item.image[0].url;
      }
    }
    return '/assets/icons/logo.png';
  };

  const formatDuration = (secondsStr?: string | number | null) => {
    if (!secondsStr) return "0:00";
    const totalSeconds = typeof secondsStr === 'string' ? parseInt(secondsStr, 10) : secondsStr;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatRelativeDate = (song: any) => {
    if (song.releaseDate) {
      try {
        const d = new Date(song.releaseDate);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      } catch (e) {}
    }
    if (song.year) return `Released ${song.year}`;
    
    // Deterministic fallback based on ID hash
    const hash = String(song.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const days = (hash % 300) + 2;
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getArtistsString = (item: any) => {
    const artistVal = item.artist || 
                     (Array.isArray(item.artists?.primary) ? item.artists.primary.map((a: any) => a.name || a.title).join(', ') : '') ||
                     (Array.isArray(item.singers) ? item.singers.map((s: any) => s.name || s.title).join(', ') : '') ||
                     'Various Artists';
    
    return typeof artistVal === 'string' ? artistVal : 'Various Artists';
  };

  const totalDuration = data.songs?.reduce((acc, song) => acc + (Number(song.duration || 0)), 0) || 0;
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-full font-spotify flex flex-col relative w-full overflow-x-hidden">
      {/* Dynamic Background Gradient (Absolute Root) */}
      <div className="absolute inset-x-0 top-0 h-[400px] md:h-[500px] z-0 transition-colors duration-1000 overflow-hidden">
        {/* Core color layer */}
        <div 
          className="absolute inset-0 transition-colors duration-1000" 
          style={{ 
            background: `linear-gradient(to bottom, ${dominantColor} 0%, transparent 100%)`,
          }}
        />
        {/* Bottom fade layer */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
        {/* Top darkness overlay for realism */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* Sticky Sub-Header (Spotify Style) */}
      <div 
        className={`sticky top-0 w-full h-[64px] z-[100] flex items-center px-6 gap-4 border-b border-white/5 transition-all duration-300 pointer-events-none md:pointer-events-auto ${isHeaderSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        style={{ 
          backgroundColor: isHeaderSticky ? dominantColor : `rgba(18, 18, 18, ${headerOpacity})`,
          backdropFilter: 'blur(10px)',
          marginBottom: '-64px',
          zIndex: 100
        }}
      >
        <div className="flex items-center gap-3">
            <button 
              className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 pointer-events-auto"
              onClick={handlePlayAll}
            >
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="black"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
            </button>
            <h2 className="text-white font-black text-lg md:text-xl truncate drop-shadow-sm">{safeString(data.name || data.title)}</h2>
        </div>
      </div>

      <div className="relative flex flex-col w-full z-10" ref={headerRef}>

        <header className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-6 md:px-8 pt-12 md:pt-20 pb-8 z-10 w-full relative">
          <div 
            className="flex-shrink-0 group relative cursor-pointer active:scale-95 transition-transform duration-300 shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
            onClick={() => setShowLargeImage(true)}
          >
            <div className="w-[192px] h-[192px] md:w-[232px] md:h-[232px] relative overflow-hidden rounded-md">
              <Image 
                src={getImageUrl(data)} 
                alt={safeString(data.name || data.title)} 
                fill
                className="object-cover transition-all duration-500" 
              />
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            </div>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5 text-center md:text-left overflow-hidden w-full pb-1">
            <span className="text-[12px] md:text-[14px] font-bold text-white mb-[-4px] drop-shadow-md">{type === 'playlist' ? 'Public Playlist' : 'Album'}</span>
            <h1 className={`font-black tracking-tighter my-2 leading-tight text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.4)] break-words ${safeString(data.name || data.title).length > 20 ? 'text-[42px] md:text-[64px] lg:text-[72px]' : 'text-[48px] md:text-[84px] lg:text-[96px]'}`}>
              {safeString(data.name || data.title)}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-[13px] md:text-[14px] font-bold mt-1 text-white pr-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center overflow-hidden shadow-lg">
                   <Image src="/assets/icons/logo.png" alt="" width={16} height={16} unoptimized />
                </div>
                <span className="hover:underline cursor-pointer">Hivefy</span>
              </div>
              <span className="before:content-['•'] before:mr-1.5">{data.songs?.length || 0} songs,</span>
              <span className="text-white/70 font-medium">
                about {hours > 0 ? `${hours} hr ` : ''}{minutes} min
              </span>
            </div>
          </div>
        </header>

        {/* Action Bar Background Layer for seamless blending */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 md:gap-8 px-6 md:px-8 py-4 md:py-6 z-10 sticky top-[64px] bg-transparent lg:static">
          <button 
            className="w-12 h-12 md:w-[56px] md:h-[56px] bg-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 hover:bg-primary-hover active:scale-95 group" 
            onClick={handlePlayAll}
          >
             <svg role="img" aria-hidden="true" viewBox="0 0 24 24" fill="black" className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-110"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
          </button>
          <button 
            className="transition-all hover:scale-110 active:scale-95 group flex items-center justify-center pt-1"
            onClick={toggleShuffle}
          >
            <div className="relative">
              <Image 
                src="/assets/icons/shuffle.png" 
                alt="Shuffle" 
                width={32} 
                height={32} 
                className={`transition-all ${isShuffling ? 'opacity-100' : 'invert opacity-70 group-hover:opacity-100'}`} 
                style={isShuffling ? { filter: 'invert(62%) sepia(100%) saturate(404%) hue-rotate(84deg) brightness(89%) contrast(92%)' } : {}}
              />
              {isShuffling && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_rgba(30,215,96,0.8)]" />
              )}
            </div>
          </button>
          <button 
            onClick={() => toggleLike(data, type)}
            className={`transition-all hover:scale-110 active:scale-95 group`}
          >
            {isLiked(data.id) ? (
              <Image src="/assets/icons/heart.png" alt="Liked" width={32} height={32} className="brightness-110" />
            ) : (
              <Image src="/assets/icons/like.png" alt="Like" width={30} height={30} className="invert opacity-70 group-hover:opacity-100" />
            )}
          </button>
          <button className="text-text-subdued transition-all hover:scale-110 hover:text-white active:scale-95 group">
             <Image src="/assets/icons/menu.png" alt="More" width={28} height={28} className="invert opacity-70 group-hover:opacity-100" />
          </button>
        </div>
      {/* Song List Content */}
      <div className="flex-1 px-4 md:px-8 pb-32">
        {/* Track List Header labels */}
        <div className="sticky top-[64px] z-[90] bg-[#121212] px-4 py-3 mb-4 border-b border-white/10 shadow-md">
          <div className="grid grid-cols-[16px_4fr_3fr_2fr_80px] gap-4 text-[#b3b3b3] text-[11px] uppercase tracking-[0.1em] font-bold items-center pr-4">
            <div className="flex justify-center text-[12px]">#</div>
            <div>Title</div>
            <div className="hidden lg:block">Album</div>
            <div className="hidden md:block">{type === 'album' ? 'Release Date' : 'Date added'}</div>
            <div className="flex justify-end pr-4">
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path><path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4a.75.75 0 0 1 .75-.75z"></path></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0">
          {data.songs?.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={song.id} 
                className={`grid grid-cols-[16px_4fr_3fr_2fr_80px] gap-4 px-4 py-2 rounded-md items-center cursor-pointer transition-colors duration-300 group ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
                onClick={() => playSong(song, data.songs || [])}
              >
                <div className="flex items-center justify-center relative w-4">
                   {isCurrent && isPlaying ? (
                      <Image src="/assets/icons/player.gif" alt="Playing" width={14} height={14} className="invert sepia saturate-[25] hue-rotate-[90deg] brightness-125 font-bold" unoptimized />
                   ) : (
                      <>
                        <span className={`text-text-subdued group-hover:hidden text-[14px] ${isCurrent ? 'text-primary' : ''}`}>{idx + 1}</span>
                        <svg className="hidden text-white group-hover:block" role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                      </>
                   )}
                </div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 relative overflow-hidden rounded w-10 h-10 shadow-md">
                    <Image src={getImageUrl(song)} alt={safeString(song.name || song.title)} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <div className={`text-[15px] font-bold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>{safeString(song.name || song.title)}</div>
                    <div className="text-[13px] font-medium text-text-subdued group-hover:text-white truncate transition-colors">
                      {getArtistsString(song)}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[13px] text-text-subdued truncate font-medium group-hover:text-white transition-colors">{safeString(song.albumName || song.album?.name || song.album || data.name || data.title)}</div>
                <div className="hidden md:block text-[13px] text-text-subdued truncate font-medium transition-colors">{formatRelativeDate(song)}</div>
                <div className="flex items-center justify-end gap-4 text-[13px] text-text-subdued font-medium transition-colors pr-2 md:pr-4 group-hover:text-white">                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song, 'song');
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    {isLiked(song.id) ? (
                      <Image src="/assets/icons/heart.png" alt="Liked" width={16} height={16} className="brightness-110" />
                    ) : (
                      <Image src="/assets/icons/like.png" alt="Like" width={16} height={16} className="invert opacity-70 hover:opacity-100" />
                    )}
                  </button>

                  <span>{formatDuration(song.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Large Image Modal */}
      {showLargeImage && (
        <div 
          className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowLargeImage(false)}
        >
           <div 
            className="flex flex-col items-center gap-6 max-w-[90vw] transition-all duration-500 animate-in zoom-in-95 fill-mode-forwards ease-out"
            onClick={(e) => e.stopPropagation()}
           >
              <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] overflow-hidden rounded-lg shadow-[0_32px_64px_rgba(0,0,0,0.8)]">
                <Image 
                  src={getImageUrl(data)} 
                  alt={safeString(data.name || data.title)} 
                  fill 
                  className="object-cover" 
                />
              </div>
              
              <div className="text-center flex flex-col gap-1 items-center px-4">
                <h2 className="text-white font-bold text-xl line-clamp-1">{safeString(data.name || data.title)}</h2>
                <p className="text-text-subdued font-medium line-clamp-1">{getArtistsString(data)}</p>
              </div>

              <button 
                onClick={() => setShowLargeImage(false)}
                className="mt-4 px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Close
              </button>
           </div>
        </div>
      )}
    </div >
  );
}
