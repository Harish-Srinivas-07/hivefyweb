'use client';

import React from 'react';
import Image from 'next/image';
import { SongDetail } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { getSaavnImageUrl } from '@/utils/image';

interface SongListProps {
  songs: SongDetail[];
  onSongClick?: (song: SongDetail, index: number) => void;
}

export default function SongList({ songs, onSongClick }: SongListProps) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const handlePlay = (song: SongDetail, index: number) => {
    playSong(song, songs);
    if (onSongClick) {
      onSongClick(song, index);
    }
  };

  const formatDuration = (dur?: string | number | null) => {
    if (!dur) return "0:00";
    
    if (typeof dur === 'string' && dur.includes(':')) {
       return dur;
    }

    const totalSeconds = typeof dur === 'string' ? parseInt(dur, 10) : dur;
    if (isNaN(totalSeconds)) return "0:00";

    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getArtistsString = (song: any) => {
    const artistVal = song.artist || 
                     (Array.isArray(song.artists?.primary) ? song.artists.primary.map((a: any) => a.name || a.title).join(', ') : '') ||
                     (Array.isArray(song.singers) ? song.singers.map((s: any) => s.name || s.title).join(', ') : '') ||
                     'Unknown Artist';
    
    return typeof artistVal === 'string' ? artistVal : 'Unknown Artist';
  };

  const getAlbumString = (song: any) => {
    if (typeof song.album === 'string') return song.album;
    if (song.album && typeof song.album === 'object') {
      return song.album.name || song.album.title || 'Unknown Album';
    }
    return 'Unknown Album';
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-40">
        <Image src="/assets/icons/radio.png" alt="Empty" width={64} height={64} className="invert opacity-20" />
        <span className="text-xl font-bold">No songs found in this collection</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-sm text-text-subdued font-spotify">
      <div className="grid grid-cols-[16px_4fr_3fr_80px] md:grid-cols-[16px_4fr_3fr_120px] gap-4 px-4 py-2 border-b border-white/5 mb-2 items-center uppercase text-[11px] tracking-widest font-bold">
        <div className="flex justify-center italic">#</div>
        <div>Title</div>
        <div className="hidden md:block">Album</div>
        <div className="flex justify-end pr-2 md:pr-4">
           <Image src="/assets/icons/timer.png" alt="Duration" width={16} height={16} className="transition-opacity invert opacity-70" />
        </div>
      </div>
      
      <div className="flex flex-col gap-[2px]">
        {songs.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;
          const imageObj = song.images && song.images.length > 0 ? song.images[0] : null;
          
          return (
            <div 
              key={`${song.id}-${idx}`} 
              className={`grid grid-cols-[16px_4fr_3fr_80px] md:grid-cols-[16px_4fr_3fr_120px] gap-2 md:gap-4 px-2 md:px-4 py-2 items-center rounded-lg cursor-pointer transition-all duration-300 group ${isCurrent ? 'bg-white/10 shadow-inner ring-1 ring-white/5' : 'hover:bg-white/5'}`}
              onClick={() => handlePlay(song, idx)}
            >
              <div className="flex items-center justify-center relative">
                {isCurrent && isPlaying ? (
                  <Image 
                    src="/assets/icons/player.gif" 
                    alt="Playing" 
                    width={14} 
                    height={14} 
                    className="invert sepia saturate-[25] hue-rotate-[90deg] brightness-125" 
                    unoptimized 
                  />
                ) : (
                  <>
                    <span className={`text-text-subdued group-hover:hidden transition-all text-[13px] md:text-[14px] ${isCurrent ? 'text-primary font-bold' : ''}`}>{idx + 1}</span>
                    <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="hidden text-white group-hover:block transition-all hover:scale-110"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                {imageObj && (
                  <div className="flex-shrink-0 relative overflow-hidden rounded shadow-md group-hover:shadow-lg transition-all duration-300 w-10 h-10">
                      <img 
                        src={getSaavnImageUrl(imageObj.url, 150)} 
                        alt={song.title || ''} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        loading="lazy"
                        decoding="async"
                        width={40}
                        height={40}
                      />
                  </div>
                )}
                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
                  <div className={`text-[14px] md:text-base font-bold truncate leading-tight ${isCurrent ? 'text-primary' : 'text-text-base'}`}>
                    {song.title || (song as any).name || 'Unknown Title'}
                  </div>
                  <div className="text-[12px] md:text-[13px] font-medium truncate group-hover:text-text-base transition-colors">
                    {getArtistsString(song)}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:block truncate text-text-subdued group-hover:text-text-base transition-colors text-[13px]">
                {getAlbumString(song)}
              </div>
              
              <div className="flex justify-end font-medium text-inherit group-hover:text-text-base pr-2 md:pr-4 text-[12px] md:text-[13px]">
                {formatDuration(song.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
