"use client";

import React from 'react';
import Image from 'next/image';
import { SongDetail, Playlist, Album } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { decodeHtml } from '@/services/api';
import './MediaDetailView.css';

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
    
    // Handle primaryArtists array (Saavn Songs)
    if (Array.isArray(item.primaryArtists)) {
      const names = item.primaryArtists.map((a: any) => a.name || a.title || '').filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    
    // Handle artist/artists property (Saavn Albums/Playlists)
    const artistVal = item.artist || item.artists?.primary?.[0]?.name || item.artists?.[0]?.name;
    if (artistVal && typeof artistVal === 'object') {
      return (artistVal as any).name || (artistVal as any).title || 'Various Artists';
    }
    
    return typeof artistVal === 'string' ? artistVal : 'Various Artists';
  };

  return (
    <div className="media-detail-container">
      <header className="media-header">
        <div className="media-cover">
          <Image src={getImageUrl(data)} alt={safeString(data.name || data.title)} width={232} height={232} className="cover-img shadow-lg" />
        </div>
        <div className="media-info">
          <span className="media-type-label">{type === 'playlist' ? 'Public Playlist' : 'Album'}</span>
          <h1 className="media-title">{safeString(data.name || data.title)}</h1>
          <p className="media-description" dangerouslySetInnerHTML={{ __html: data.description || '' }} />
          <div className="media-metadata">
            <span className="meta-artist-link">{getArtistsString(data)}</span>
            <span className="meta-separator">•</span>
            <span>{(data as any).songCount || data.songs?.length || 0} songs</span>
            {/* Optional: Add duration if available */}
          </div>
        </div>
      </header>

      <div className="media-controls-row">
        <button className="play-all-button" onClick={handlePlayAll}>
           <svg role="img" height="28" width="28" aria-hidden="true" viewBox="0 0 24 24" fill="black"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
        </button>
        <button className="control-icon-btn">
          <Image src="/assets/icons/shuffle.png" alt="Shuffle" width={32} height={32} className="icon-invert" />
        </button>
        <button className="control-icon-btn">
           <Image src="/assets/icons/like.png" alt="Like" width={32} height={32} className="icon-invert" />
        </button>
        <div className="flex-1"></div>
        <div className="list-view-selector">List view</div>
      </div >

      <div className="songs-table">
        <div className="table-header">
          <div className="col-idx">#</div>
          <div className="col-title">Title</div>
          <div className="col-album">Album</div>
          <div className="col-duration">
            <Image src="/assets/icons/timer.png" alt="Duration" width={16} height={16} className="icon-invert" />
          </div>
        </div>
        <div className="table-divider"></div>
        <div className="table-body">
          {data.songs?.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={song.id} 
                className={`song-row ${isCurrent ? 'active-row' : ''}`}
                onClick={() => playSong(song, data.songs || [])}
              >
                <div className="col-idx">
                   <span className="idx-text">{idx + 1}</span>
                   <svg className="play-icon" role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                </div>
                <div className="col-title">
                  <Image src={getImageUrl(song)} alt={safeString(song.name || song.title)} width={40} height={40} className="song-img" />
                  <div className="song-meta">
                    <div className={`song-name ${isCurrent ? 'text-green' : ''}`}>{safeString(song.name || song.title)}</div>
                    <div className="song-artist">{getArtistsString(song)}</div>
                  </div>
                </div>
                <div className="col-album">{safeString(song.albumName || song.album || data.name || data.title)}</div>
                <div className="col-duration">{formatDuration(song.duration)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div >
  );
}
