'use client';

import React from 'react';
import Image from 'next/image';
import { SongDetail } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import './SongList.css';

interface SongListProps {
  songs: SongDetail[];
  onSongClick?: (song: SongDetail, index: number) => void;
}

export default function SongList({ songs, onSongClick }: SongListProps) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const handlePlay = (song: SongDetail, index: number) => {
    // Dispatch to global Zustand store with the full array context
    playSong(song, songs);
    if (onSongClick) {
      onSongClick(song, index);
    }
  };

  const formatDuration = (secondsStr?: string | number) => {
    if (!secondsStr) return "0:00";
    const totalSeconds = typeof secondsStr === 'string' ? parseInt(secondsStr, 10) : secondsStr;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getArtistsString = (song: any) => {
    if (typeof song.primaryArtists === 'string') return song.primaryArtists;
    if (Array.isArray(song.primaryArtists)) {
      const names = song.primaryArtists.map((a: any) => a.name || a.title || '').filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    if (typeof song.artist === 'string') return song.artist;
    if (song.artist && typeof song.artist === 'object') return (song.artist as any).name || (song.artist as any).title || 'Unknown Artist';
    
    if (typeof song.singers === 'string') return song.singers;
    if (Array.isArray(song.singers)) {
      const names = song.singers.map((a: any) => a.name || a.title || '').filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    
    return 'Unknown Artist';
  };

  const getAlbumString = (song: any) => {
    if (typeof song.album === 'string') return song.album;
    if (song.album && typeof song.album === 'object') {
      return song.album.name || song.album.title || 'Unknown Album';
    }
    return 'Unknown Album';
  };

  if (!songs || songs.length === 0) {
    return <div className="song-list-empty">No songs available</div>;
  }

  return (
    <div className="song-list">
      <div className="song-list-header">
        <div className="header-col-index">#</div>
        <div className="header-col-title">Title</div>
        <div className="header-col-album">Album</div>
        <div className="header-col-duration">
           <Image src="/assets/icons/timer.png" alt="Duration" width={16} height={16} className="icon-subdued icon-invert" />
        </div>
      </div>
      
      <div className="song-list-body">
        {songs.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;
          const imageObj = song.images && song.images.length > 0 ? song.images[0] : null;
          
          return (
            <div 
              key={`${song.id}-${idx}`} 
              className={`song-row ${isCurrent ? 'active-row' : ''}`}
              onClick={() => handlePlay(song, idx)}
            >
              <div className="song-col-index">
                {isCurrent && isPlaying ? (
                  <Image src="/assets/icons/player.gif" alt="Playing" width={14} height={14} className="playing-indicator" unoptimized />
                ) : (
                  <span className="index-number">{idx + 1}</span>
                )}
                <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="play-icon-hover"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
              </div>
              
              <div className="song-col-title">
                {imageObj && (
                  <Image src={imageObj.url} alt={song.title} width={40} height={40} className="song-thumbnail" />
                )}
                <div className="song-title-meta">
                  <div className={`song-name ${isCurrent ? 'text-green' : ''}`}>
                    {song.title || (song as any).name || 'Unknown Title'}
                  </div>
                  <div className="song-artists">
                    {getArtistsString(song)}
                  </div>
                </div>
              </div>
              
              <div className="song-col-album">
                {getAlbumString(song)}
              </div>
              
              <div className="song-col-duration">
                {formatDuration(song.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
