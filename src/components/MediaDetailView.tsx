"use client";

import React from 'react';
import Image from 'next/image';
import { SongDetail, Playlist, Album } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { decodeHtml } from '@/services/api';

interface MediaDetailViewProps {
  data: Playlist | Album;
  type: 'playlist' | 'album';
}

export default function MediaDetailView({ data, type }: MediaDetailViewProps) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();

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

  const formatDuration = (secondsStr?: string | number) => {
    if (!secondsStr) return "0:00";
    const totalSeconds = typeof secondsStr === 'string' ? parseInt(secondsStr, 10) : secondsStr;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getArtistsString = (item: any) => {
    if (typeof item.primaryArtists === 'string') return item.primaryArtists;
    if (Array.isArray(item.primaryArtists)) {
      const names = item.primaryArtists.map((a: any) => a.name || a.title || '').filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    const artistVal = item.artist || item.artists?.primary?.[0]?.name || item.artists?.[0]?.name;
    if (artistVal && typeof artistVal === 'object') {
      return (artistVal as any).name || (artistVal as any).title || 'Various Artists';
    }
    return typeof artistVal === 'string' ? artistVal : 'Various Artists';
  };

  const totalDuration = data.songs?.reduce((acc, song) => acc + (parseInt(song.duration || '0', 10)), 0) || 0;
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-full font-spotify flex flex-col">
      {/* Dynamic Background Gradient */}
      <div className="relative flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-[#404040] to-surface-base h-[300px] md:h-[400px] -z-1" />
        
        <header className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 px-4 md:px-8 pt-10 md:pt-20 pb-6 md:pb-8 z-10 transition-all duration-500">
          <div className="flex-shrink-0 group relative cursor-pointer active:scale-95 transition-transform duration-300 shadow-2xl">
            <div className="w-[192px] h-[192px] md:w-[232px] md:h-[232px] relative overflow-hidden rounded-lg">
              <Image 
                src={getImageUrl(data)} 
                alt={safeString(data.name || data.title)} 
                fill
                className="object-cover shadow-[0_20px_60px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_80px_rgba(0,0,0,0.8)] transition-all duration-500" 
              />
            </div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
               <svg role="img" height="64" width="64" aria-hidden="true" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-center md:text-left overflow-hidden w-full">
            <span className="text-[10px] md:text-[12px] font-bold uppercase tracking-wider text-glow">{type === 'playlist' ? 'Public Playlist' : 'Album'}</span>
            <h1 className={`font-black tracking-tighter my-1 md:my-2 leading-none text-glow break-words ${safeString(data.name || data.title).length > 20 ? 'text-[32px] md:text-[48px] lg:text-[64px]' : 'text-[40px] md:text-[64px] lg:text-[88px]'}`}>
              {safeString(data.name || data.title)}
            </h1>
            <p className="text-text-subdued text-[13px] md:text-[14px] font-medium max-w-[600px] line-clamp-2 hover:line-clamp-none transition-all cursor-default" dangerouslySetInnerHTML={{ __html: data.description || '' }} />
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-[12px] md:text-sm font-bold mt-2">
              <span className="hover:underline cursor-pointer">{getArtistsString(data)}</span>
              <span className="text-text-subdued">•</span>
              <span className="text-text-base">{(data as any).year || ''}</span>
              <span className="text-text-subdued">•</span>
              <span className="text-text-base">{(data as any).songCount || data.songs?.length || 0} songs,</span>
              <span className="text-text-subdued font-normal hidden sm:inline">
                {hours > 0 ? `${hours} hr ` : ''}{minutes} min
              </span>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex items-center gap-6 md:gap-8 px-6 md:px-8 py-4 md:py-6 z-10 sticky top-[64px] bg-transparent lg:static">
          <button 
            className="w-12 h-12 md:w-[56px] md:h-[56px] bg-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 hover:bg-primary-hover active:scale-95 group" 
            onClick={handlePlayAll}
          >
             <svg role="img" aria-hidden="true" viewBox="0 0 24 24" fill="black" className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-110"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
          </button>
          <button className="text-text-subdued transition-all hover:scale-110 hover:text-white active:scale-95 group">
            <Image src="/assets/icons/shuffle.png" alt="Shuffle" width={28} height={28} className="invert opacity-70 group-hover:opacity-100" />
          </button>
          <button className="text-text-subdued transition-all hover:scale-110 hover:text-white active:scale-95 group">
             <Image src="/assets/icons/like.png" alt="Like" width={28} height={28} className="invert opacity-70 group-hover:opacity-100" />
          </button>
          <button className="text-text-subdued transition-all hover:scale-110 hover:text-white active:scale-95 group">
             <Image src="/assets/icons/menu.png" alt="More" width={24} height={24} className="invert opacity-70 group-hover:opacity-100" />
          </button>
        </div >
      </div>

      {/* Song List Content */}
      <div className="flex-1 px-4 md:px-8 pb-32">
        <div className="grid grid-cols-[16px_4fr_3fr_80px] md:grid-cols-[16px_4fr_3fr_120px] gap-4 px-4 text-text-subdued text-[11px] uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-2 cursor-default italic">
          <div className="flex justify-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="flex justify-end pr-2 md:pr-4">
            <Image src="/assets/icons/timer.png" alt="Duration" width={16} height={16} className="invert opacity-70" />
          </div>
        </div>

        <div className="flex flex-col gap-[2px]">
          {data.songs?.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={song.id} 
                className={`grid grid-cols-[16px_4fr_3fr_80px] md:grid-cols-[16px_4fr_3fr_120px] gap-2 md:gap-4 px-2 md:px-4 py-2 rounded-lg items-center cursor-pointer transition-all duration-300 group ${isCurrent ? 'bg-white/10 shadow-inner ring-1 ring-white/5' : 'hover:bg-white/5'}`}
                onClick={() => playSong(song, data.songs || [])}
              >
                <div className="flex items-center justify-center relative">
                   {isCurrent && isPlaying ? (
                      <Image src="/assets/icons/player.gif" alt="Playing" width={14} height={14} className="invert sepia saturate-[25] hue-rotate-[90deg] brightness-125 font-bold" unoptimized />
                   ) : (
                      <>
                        <span className={`text-text-subdued group-hover:hidden text-[13px] md:text-[14px] ${isCurrent ? 'text-primary font-bold' : ''}`}>{idx + 1}</span>
                        <svg className="hidden text-white group-hover:block transition-all hover:scale-110" role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                      </>
                   )}
                </div>
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className="flex-shrink-0 relative overflow-hidden rounded shadow-md group-hover:shadow-lg transition-all duration-300 w-10 h-10">
                    <Image src={getImageUrl(song)} alt={safeString(song.name || song.title)} fill className="object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <div className={`text-[14px] md:text-base font-bold truncate ${isCurrent ? 'text-primary' : 'text-text-base'}`}>{safeString(song.name || song.title)}</div>
                    <div className="text-[12px] md:text-[13px] font-medium text-text-subdued truncate group-hover:text-text-base transition-colors">{getArtistsString(song)}</div>
                  </div>
                </div>
                <div className="hidden md:block text-[13px] text-text-subdued truncate group-hover:text-text-base transition-colors font-medium">{safeString(song.albumName || song.album || data.name || data.title)}</div>
                <div className="text-[12px] md:text-[13px] text-text-subdued flex justify-end group-hover:text-text-base transition-colors font-medium pr-2 md:pr-4">{formatDuration(song.duration)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div >
  );
}
