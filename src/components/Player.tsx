"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import './Player.css';
import { usePlayerStore } from '@/store/playerStore';

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
    toggleRepeat
  } = usePlayerStore();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // We rely on AudioController for actual playback logic, 
  // but we might want to poll or listen to audio events for the progress bar.
  // For now, we'll keep the bar static until we bind it fully to the audio ref.

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
    if (typeof song.artist === 'string') return song.artist;
    if (song.artist && typeof song.artist === 'object') return (song.artist as any).name || (song.artist as any).title || 'Unknown Artist';
    
    if (typeof song.singers === 'string') return song.singers;
    if (Array.isArray(song.singers)) {
      const names = song.singers.map((a: any) => a.name || a.title || '').filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    
    return 'Unknown Artist';
  };

  const artistsStr = getArtistsString(currentSong);

  return (
    <div className="player-container">
      
      <div className="now-playing">
        <div className="album-art">
          <Image src={highestResImage} alt={currentSong.title || (currentSong as any).name || 'Album Art'} width={56} height={56} className="now-playing-img" />
        </div>
        <div className="track-info">
          <div className="track-name">{currentSong.title || (currentSong as any).name || 'Unknown Track'}</div>
          <div className="artist-name">{artistsStr.length > 30 ? artistsStr.substring(0, 30) + '...' : artistsStr}</div>
        </div>
        <button className="like-button">
          <Image src="/assets/icons/like.png" alt="Like" width={16} height={16} className="icon-subdued icon-invert" />
        </button>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button className={`control-button ${isShuffling ? 'active-green' : ''}`} onClick={toggleShuffle}>
            <Image 
              src="/assets/icons/shuffle.png" 
              alt="Shuffle" 
              width={16} 
              height={16} 
              className={isShuffling ? 'green-icon' : 'icon-subdued icon-invert'} 
            />
          </button>
          <button className="control-button" onClick={prevSong}>
            <Image src="/assets/icons/down_arrow.png" alt="Previous" width={16} height={16} className="icon-subdued icon-invert" style={{ transform: 'rotate(90deg)' }} />
          </button>
          
          <button className="play-button" onClick={togglePlayPause}>
            {isPlaying ? (
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="play-static"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
            ) : (
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="play-static"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path></svg>
            )}
          </button>
          
          <button className="control-button" onClick={nextSong}>
            <Image src="/assets/icons/down_arrow.png" alt="Next" width={16} height={16} className="icon-subdued icon-invert" style={{ transform: 'rotate(-90deg)' }} />
          </button>
          <button className={`control-button ${repeatMode !== 'NONE' ? 'active-green' : ''}`} onClick={toggleRepeat}>
            <Image 
              src="/assets/icons/repeat.png" 
              alt="Repeat" 
              width={16} 
              height={16} 
              className={repeatMode !== 'NONE' ? 'green-icon' : 'icon-subdued icon-invert'} 
            />
          </button>
        </div>
         {/* Static progress bar for now until we bind it to HTMLAudioElement timeupdate event via a ref or global store */}
        <div className="progress-container">
          <span className="time">{formatTime(progress)}</span>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}></div>
          </div>
          <span className="time">{formatTime(currentSong.duration ? parseInt(currentSong.duration, 10) : 0)}</span>
        </div>
      </div>

      <div className="volume-controls">
        <button className="util-button">
          <svg role="presentation" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="icon-subdued"><path d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-3h14v-1.5H1v1.5zm14-4.5H1V1.5h14V3z"></path></svg>
        </button>
        <div className="volume-bar-wrapper">
          <button className="util-button">
            <svg role="presentation" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="icon-subdued"><path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path></svg>
          </button>
          <div className="volume-bar-bg">
            <div className="volume-bar-fill" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
