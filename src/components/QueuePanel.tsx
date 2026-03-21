"use client";

import React from 'react';
import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { decodeHtml } from '@/services/api';
import { getSaavnImageUrl } from '@/utils/image';

const QueuePanel = () => {
  const { queue, currentIndex, currentSong, playSong, setShowQueue, isPlaying } = usePlayerStore();

  if (!queue || queue.length === 0) {
    return (
      <div className="flex flex-col h-full bg-surface-base rounded-xl p-6 font-spotify">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Queue</h2>
          <button onClick={() => setShowQueue(false)} className="text-text-subdued hover:text-white transition-colors">
            <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.293 6.293a1 1 0 0 1 1.414 0L12 10.586l4.293-4.293a1 1 0 1 1 1.414 1.414L13.414 12l4.293 4.293a1 1 0 0 1-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L10.586 12 6.293 7.707a1 1 0 0 1 0-1.414z"></path></svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-60">
           <Image src="/assets/icons/queue.png" alt="" width={64} height={64} className="invert opacity-30" />
           <p className="text-text-subdued text-sm">Your queue is empty</p>
        </div>
      </div>
    );
  }

  const upcoming = queue.slice(currentIndex + 1);

  return (
    <div className="flex flex-col h-full bg-surface-base rounded-xl overflow-hidden font-spotify">
      <header className="px-6 py-5 flex items-center justify-between bg-surface-base/50 backdrop-blur-md z-10">
        <h2 className="text-xl font-bold text-white">Queue</h2>
        <button 
          onClick={() => setShowQueue(false)} 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-text-subdued hover:text-white transition-all active:scale-90"
        >
          <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.293 6.293a1 1 0 0 1 1.414 0L12 10.586l4.293-4.293a1 1 0 1 1 1.414 1.414L13.414 12l4.293 4.293a1 1 0 0 1-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L10.586 12 6.293 7.707a1 1 0 0 1 0-1.414z"></path></svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-2 pb-8 scrollbar-hide">
        {currentSong && (
          <div className="mb-6 px-4">
            <h3 className="text-sm font-bold text-text-subdued mb-3 uppercase tracking-wider">Now Playing</h3>
            <div className="flex items-center gap-4 p-2 rounded-lg bg-white/5 shadow-inner">
               <div className="w-12 h-12 relative flex-shrink-0 rounded overflow-hidden shadow-lg">
                  <img 
                    src={getSaavnImageUrl(currentSong.image?.[currentSong.image.length-1]?.url || '/assets/icons/logo.png', 150)} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                    decoding="async"
                    width={48}
                    height={48}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <Image src="/assets/icons/player.gif" alt="" width={16} height={16} className="invert" unoptimized />
                    </div>
                  )}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-primary truncate">{decodeHtml(currentSong.title || (currentSong as any).name)}</div>
                  <div className="text-xs text-text-subdued truncate">{decodeHtml(currentSong.artist || 'Unknown')}</div>
               </div>
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="px-4">
            <h3 className="text-sm font-bold text-text-subdued mb-3 uppercase tracking-wider">Next In Queue</h3>
            <div className="flex flex-col gap-1">
              {upcoming.map((song, idx) => (
                <div 
                  key={`${song.id}-${idx}`} 
                  onClick={() => playSong(song, queue)}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 relative flex-shrink-0 rounded overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    <img 
                      src={getSaavnImageUrl(song.image?.[song.image.length-1]?.url || '/assets/icons/logo.png', 150)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                      decoding="async"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{decodeHtml(song.title || (song as any).name)}</div>
                    <div className="text-xs text-text-subdued truncate group-hover:text-text-base transition-colors">{decodeHtml(song.artist || 'Unknown')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
