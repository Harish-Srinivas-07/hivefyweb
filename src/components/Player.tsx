"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useLikesStore } from '@/store/likesStore';
import { pipService } from '@/services/pipService';
import { decodeHtml } from '@/services/api';
import { getSaavnImageUrl } from '@/utils/image';

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
  const { toggleLike, isLiked } = useLikesStore();

  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getArtistsString = (song: any) => {
    if (!song) return '';
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

  useEffect(() => {
    if (isPlaying && currentSong) {
      const songTitle = decodeHtml(currentSong.title || (currentSong as any).name || 'Unknown Track');
      const songArtist = decodeHtml(artistsStr);
      document.title = `${songTitle} • ${songArtist} - Hivefy`;
    } else {
      document.title = "Hivefy Web | Music Reimagined";
    }
  }, [isPlaying, currentSong, artistsStr]);

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

  return (
    <div className="flex items-center justify-between w-full h-full font-spotify px-2 md:px-0">
      
      <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none min-w-0">
        <div className="relative flex-shrink-0 group overflow-hidden rounded-md shadow-lg w-10 h-10 md:w-[52px] md:h-[52px]">
          <img 
            src={getSaavnImageUrl(highestResImage, 500)} 
            alt={currentSong.title || (currentSong as any).name || 'Album Art'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            decoding="async"
            width={52}
            height={52}
          />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="text-[13px] md:text-[14px] font-bold text-white hover:underline cursor-pointer truncate transition-colors">
            {decodeHtml(currentSong.title || (currentSong as any).name || 'Unknown Track')}
          </div>
          <div className="text-[11px] md:text-[12px] text-text-subdued truncate transition-colors">
            {decodeHtml(artistsStr)}
          </div>
        </div>
        <button 
          onClick={() => toggleLike(currentSong, 'song')}
          className="hidden md:flex flex-shrink-0 w-8 h-8 items-center justify-center transition-all hover:scale-110 active:scale-90 ml-2"
        >
          {isLiked(currentSong.id) ? (
            <Image src="/assets/icons/heart.png" alt="Liked" width={18} height={18} className="brightness-110" />
          ) : (
            <Image src="/assets/icons/like.png" alt="Like" width={18} height={18} className="invert opacity-70 hover:opacity-100" />
          )}
        </button>
      </div>

      <div className="flex-none md:flex-1 flex flex-col items-center gap-1.5 px-2">
        <div className="flex items-center gap-3 md:gap-8">
          <button 
            onClick={toggleShuffle}
            className="hidden md:flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-90"
          >
            <div className="relative flex flex-col items-center">
               <Image 
                src="/assets/icons/shuffle.png" 
                alt="Shuffle" 
                width={16} 
                height={16} 
                className={`transition-all ${isShuffling ? 'opacity-100' : 'invert opacity-50 hover:opacity-100'}`} 
                style={isShuffling ? { filter: 'invert(62%) sepia(100%) saturate(404%) hue-rotate(84deg) brightness(89%) contrast(92%)' } : {}}
              />
              {isShuffling && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-primary rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]" />
              )}
            </div>
          </button>
          
          <button 
            onClick={prevSong}
            className="text-text-subdued hover:text-white transition-all hover:scale-110 active:scale-90"
          >
            <svg role="img" height="20" width="20" viewBox="0 0 16 16" fill="currentColor" className="md:w-4 md:h-4"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"></path></svg>
          </button>

          <button 
            onClick={togglePlayPause}
            className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-all active:scale-95 shadow-lg"
          >
            {isPlaying ? (
              <svg role="img" height="18" width="18" viewBox="0 0 16 16" fill="currentColor" className="md:w-4 md:h-4"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
            ) : (
              <svg role="img" height="18" width="18" viewBox="0 0 16 16" fill="currentColor" className="ml-0.5 md:w-4 md:h-4"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>
            )}
          </button>

          <button 
            onClick={nextSong}
            className="text-text-subdued hover:text-white transition-all hover:scale-110 active:scale-90"
          >
            <svg role="img" height="20" width="20" viewBox="0 0 16 16" fill="currentColor" className="md:w-4 md:h-4"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path></svg>
          </button>

          <button 
            onClick={toggleRepeat}
            className="hidden md:flex transition-all hover:scale-110 active:scale-90"
          >
            <div className="relative">
              <Image 
                src="/assets/icons/repeat.png" 
                alt="Repeat" 
                width={16} 
                height={16} 
                className={`invert transition-all ${repeatMode !== 'NONE' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`} 
              />
              {repeatMode === 'ONE' && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-black rounded-full w-2.5 h-2.5 flex items-center justify-center font-bold">1</span>
              )}
            </div>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 w-full max-w-[500px]">
          <span className="text-[11px] text-text-subdued min-w-[32px] text-right">{formatTime(currentTime)}</span>
          <div 
            className="relative flex-1 h-3 flex items-center cursor-pointer group/progress"
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const per = x / rect.width;
              seek(per * duration);
            }}
          >
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-colors duration-200 ${isHoveringProgress ? 'bg-primary' : 'bg-white'}`}
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-text-subdued min-w-[32px]">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1.5 md:gap-3 w-[180px] md:w-[220px] lg:w-[260px] justify-end">
        <button 
          onClick={() => setShowQueue(!showQueue)}
          className="hidden sm:flex transition-all hover:scale-110 active:scale-95 p-1.5"
        >
          <div className="relative flex flex-col items-center">
            <Image 
              src="/assets/icons/queue.png" 
              alt="Queue" 
              width={16} 
              height={16} 
              className={`transition-all ${showQueue ? 'opacity-100' : 'invert opacity-50 hover:opacity-100'}`} 
              style={showQueue ? { filter: 'invert(62%) sepia(100%) saturate(404%) hue-rotate(84deg) brightness(89%) contrast(92%)' } : {}}
            />
            {showQueue && (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] bg-primary rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]" />
            )}
          </div>
        </button>
        
        <button 
          onClick={async () => {
            if (currentSong && pipService) {
              const img = currentSong.images?.[currentSong.images.length-1]?.url || 
                        currentSong.image?.[currentSong.image?.length-1]?.url || 
                        '/assets/icons/logo.png';
              
              const artistName = currentSong.artist || 
                               (Array.isArray(currentSong.artists?.primary) ? currentSong.artists.primary[0]?.name : '') || 
                               'Unknown Artist';

              await pipService.enterPiP(img, currentSong.title || currentSong.name, artistName);
            }
          }}
          className="text-text-subdued hover:text-white transition-all hover:scale-110 active:scale-90 p-1.5 flex-shrink-0"
          title="Mini Player"
        >
          <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M11.848 1H4.152A1.152 1.152 0 0 0 3 2.152v11.696A1.152 1.152 0 0 0 4.152 15h7.696A1.152 1.152 0 0 0 13 13.848V2.152A1.152 1.152 0 0 0 11.848 1zM4 2.152a.152.152 0 0 1 .152-.152h7.696a.152.152 0 0 1 .152.152v11.696a.152.152 0 0 1-.152.152H4.152a.152.152 0 0 1-.152-.152V2.152z"></path><path d="M8 8a1 1 0 1 1-1-1 1 1 0 0 1 1 1z"></path></svg>
        </button>

        <div className="flex items-center gap-2 group/volume w-24 md:w-32">
          <button className="text-text-subdued hover:text-white transition-all hover:scale-110 active:scale-90 p-1.5 flex-shrink-0">
             <Image src="/assets/icons/sound.png" alt="Volume" width={16} height={16} className="invert opacity-70 group-hover/volume:opacity-100" />
          </button>
          <div 
            className="relative flex-1 h-3 flex items-center cursor-pointer group/vol-prog overflow-visible"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
              const per = x / rect.width;
              setVolume(per);
            }}
          >
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white group-hover/vol-prog:bg-primary transition-colors"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <div 
              className="absolute w-3 h-3 bg-white rounded-full shadow-lg transition-transform group-hover/vol-prog:scale-125 pointer-events-none"
              style={{ left: `calc(${volume * 100}% - 6px)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
