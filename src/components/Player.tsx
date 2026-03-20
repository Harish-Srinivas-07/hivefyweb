"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { decodeHtml } from '@/services/api';

const Player = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    nextSong, 
    prevSong,
    isShuffling,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    currentTime,
    duration,
    volume,
    seek,
    setVolume,
    showQueue,
    setShowQueue
  } = usePlayerStore();

  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

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

  const highestResImage = getImageUrl(currentSong);

  const getArtistsString = (song: any) => {
    if (typeof song.primaryArtists === 'string') return song.primaryArtists;
    if (Array.isArray(song.primaryArtists)) {
      const names = song.primaryArtists.map((a: any) => a.name || a.title || '').filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    const artistVal = song.artist || song.singers;
    if (typeof artistVal === 'string') return artistVal;
    if (Array.isArray(artistVal)) return artistVal.map((a: any) => a.name || a.title || '').join(', ');
    return 'Unknown Artist';
  };

  const artistsStr = getArtistsString(currentSong);

  return (
    <div className="flex items-center justify-between w-full h-full font-spotify px-2 md:px-0">
      
      {/* Current Song Info */}
      <div className="flex items-center gap-3 md:gap-4 w-full md:w-[30%] min-w-0 md:min-w-[180px]">
        <div className="relative flex-shrink-0 group overflow-hidden rounded-md shadow-lg w-12 h-12 md:w-[58px] md:h-[58px]">
          <Image 
            src={highestResImage} 
            alt={currentSong.title || (currentSong as any).name || 'Album Art'} 
            fill
            className="transition-transform duration-500 group-hover:scale-110 object-cover" 
          />
        </div>
        <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 flex-1">
          <div className="text-[13.5px] md:text-[14px] font-bold text-white hover:underline cursor-pointer truncate transition-colors">
            {decodeHtml(currentSong.title || (currentSong as any).name || 'Unknown Track')}
          </div>
          <div className="text-[10.5px] md:text-[11px] text-text-subdued hover:text-white hover:underline cursor-pointer truncate transition-colors">
            {decodeHtml(artistsStr)}
          </div>
        </div>
        <button className="flex-shrink-0 text-primary transition-all hover:scale-110 active:scale-90 ml-1">
           <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z"></path></svg>
        </button>
        
        {/* Mobile-only Play button - simplified for the bar */}
        <button 
          className="md:hidden flex items-center justify-center w-10 h-10 text-white transition-all active:scale-90" 
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
          ) : (
            <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>
          )}
        </button>
      </div>

      {/* Controls and Progress (Desktop Only) */}
      <div className="hidden md:flex flex-col items-center flex-1 gap-2 max-w-[722px]">
        <div className="flex items-center gap-6">
          <ControlBtn 
            icon="/assets/icons/shuffle.png" 
            onClick={toggleShuffle} 
            active={isShuffling} 
            alt="Shuffle"
          />
          <ControlBtn 
            icon="/assets/icons/down_arrow.png" 
            onClick={prevSong} 
            className="rotate-90 scale-90"
            alt="Previous"
          />
          
          <button 
            className="flex items-center justify-center w-8 h-8 text-black transition-all rounded-full bg-text-base hover:scale-105 active:scale-95 shadow-md" 
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
            ) : (
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="ml-0.5"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>
            )}
          </button>
          
          <ControlBtn 
            icon="/assets/icons/down_arrow.png" 
            onClick={nextSong} 
            className="-rotate-90 scale-90"
            alt="Next"
          />
          <ControlBtn 
            icon="/assets/icons/repeat.png" 
            onClick={toggleRepeat} 
            active={repeatMode !== 'NONE'} 
            showDot={repeatMode === 'ONE'}
            alt="Repeat"
          />
        </div>

        <div className="flex items-center w-full gap-2 group/progress">
          <span className="text-[11px] text-text-subdued min-w-[32px] text-right">{formatTime(currentTime)}</span>
          <div 
            className="relative flex-1 h-1 flex items-center group/slider overflow-visible"
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
          >
            <div className="absolute w-full h-1 bg-white/10 rounded-full" />
            <div 
              className="absolute h-1 bg-white group-hover/slider:bg-primary rounded-full z-[11] transition-colors"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            {/* Round Dot Thumb */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl z-[12] pointer-events-none transition-opacity ${isHoveringProgress ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 6px)` }}
            />
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute w-full h-5 opacity-0 cursor-pointer z-20"
            />
          </div>
          <span className="text-[11px] text-text-subdued min-w-[32px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra Controls & Volume (Desktop Only) */}
      <div className="hidden md:flex items-center justify-end w-[30%] min-w-[180px] gap-2 lg:gap-4">
        
        {/* Queue Button */}
        <button 
          onClick={() => setShowQueue(!showQueue)}
          className={`relative flex items-center justify-center transition-all p-1.5 rounded-full hover:bg-white/10 active:scale-90 ${showQueue ? 'text-primary' : 'text-text-subdued hover:text-white'}`}
          title="Queue"
        >
          <svg role="img" height="18" width="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-3h14v-1.5H1v1.5zm14-4.5H1V1.5h14V3z" />
          </svg>
          {showQueue && <div className="absolute top-[3px] right-[3px] w-2 h-2 rounded-full bg-primary border-2 border-black" />}
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 w-[110px] lg:w-[140px] group/volume mr-2">
          <button className="text-text-subdued hover:text-white transition-colors" onClick={() => setVolume(volume > 0 ? 0 : 0.5)}>
            {volume === 0 ? (
                <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.86 5.47a.75.75 0 0 0-1.06 1.06l1.47 1.47-1.47 1.47a.75.75 0 0 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L15.39 8l1.47-1.47a.75.75 0 0 0-1.06-1.06L14.33 6.94l-1.47-1.47zM9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35z"></path></svg>
            ) : (
                <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path></svg>
            )}
          </button>
          <div className="relative flex-1 h-1 bg-white/10 rounded-full group/volscroll overflow-visible transition-all group-hover/volume:h-1.5 focus-within:h-1.5">
             <div 
               className="absolute top-0 left-0 h-full bg-white group-hover/volscroll:bg-primary rounded-full transition-colors z-10" 
               style={{ width: `${volume * 100}%` }}
             />
             {/* Round Dot Thumb */}
             <div 
               className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover/volume:opacity-100 transition-opacity z-20 pointer-events-none"
               style={{ left: `calc(${volume * 100}% - 6px)` }}
             />
             <input 
               type="range"
               min="0"
               max="1"
               step="0.01"
               value={volume}
               onChange={(e) => setVolume(parseFloat(e.target.value))}
               className="absolute inset-0 w-full h-5 -top-2 opacity-0 cursor-pointer z-30"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerExtraBtn = ({ icon, onClick, active, showDot, className = "", alt }: any) => (
  <button 
    className={`relative flex items-center justify-center transition-all bg-transparent group active:scale-90 text-text-subdued hover:text-white px-1 ${className}`} 
    onClick={onClick}
    aria-label={alt}
  >
    {icon}
    {active && (
        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
    )}
  </button>
);

const ControlBtn = ({ icon, onClick, active, showDot, className = "", alt }: any) => (
  <button 
    className={`relative flex items-center justify-center transition-all bg-transparent group active:scale-90 ${className}`} 
    onClick={onClick}
    aria-label={alt}
  >
    <Image 
      src={icon} 
      alt={alt} 
      width={18} 
      height={18} 
      className={`transition-all ${active ? 'brightness-0 invert-[.5] sepia saturate-[25] hue-rotate-[90deg] scale-110' : 'invert opacity-70 group-hover:opacity-100 group-hover:scale-110'}`} 
    />
    {active && !showDot && (
        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
    )}
    {showDot && (
        <div className="absolute -bottom-1.5 flex flex-col items-center">
             <div className="w-1 h-1 rounded-full bg-primary" />
             <span className="text-[8px] font-bold text-primary mt-[-2px]">1</span>
        </div>
    )}
  </button>
);

export default Player;
