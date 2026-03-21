"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLikesStore } from '@/store/likesStore';
import { historyService } from '@/services/history';
import { decodeHtml } from '@/services/api';
import { getSaavnImageUrl } from '@/utils/image';

export default function LibraryPage() {
  const { getLikedSongs } = useLikesStore();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadItems = async () => {
      try {
        const history = await historyService.getHistory();
        setItems(history);
      } catch (e) {
        console.error("Failed to load library items:", e);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  const likedCount = getLikedSongs().length;

  return (
    <div className="min-h-screen bg-black px-4 pt-4 pb-32 font-spotify">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white px-2">Your Library</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 opacity-70 hover:opacity-100">
            <Image src="/assets/icons/search.png" alt="" width={24} height={24} className="invert" />
          </button>
          <button className="p-2 opacity-70 hover:opacity-100">
             <Image src="/assets/icons/add.png" alt="" width={24} height={24} className="invert" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <Link href="/playlist/liked" className="group">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 active:scale-[0.98] transition-transform">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center relative overflow-hidden">
               <Image src="/assets/icons/heart.png" alt="" width={24} height={24} className="brightness-200 z-10" />
               <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="flex flex-col gap-1">
               <h2 className="text-base font-bold text-white">Liked Songs</h2>
               <div className="flex items-center gap-1.5 text-text-subdued text-[13px] font-medium">
                  <span className="text-primary text-[10px] transform rotate-[15deg]">📌</span>
                  <span>Playlist • {likedCount} songs</span>
               </div>
            </div>
          </div>
        </Link>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-subdued px-2">Recently Visited</h3>
          
          {loading ? (
            <div className="space-y-4 px-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-14 h-14 bg-white/5 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-8 opacity-40">
                <Image src="/assets/icons/playlist.png" alt="" width={48} height={48} className="invert" />
                <p className="text-sm font-bold leading-relaxed">Playlists or albums you visit will appear here. Start browsing!</p>
             </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <Link key={`${item.id}-${idx}`} href={`/${item.type}/${item.id}`} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors">
                  <div className={`relative flex-shrink-0 w-14 h-14 shadow-xl ${item.type === 'album' ? 'rounded-md' : 'rounded-full overflow-hidden'}`}>
                    <img 
                      src={getSaavnImageUrl(item.images?.[0]?.url || item.image?.[0]?.url || item.images?.[0]?.link || '/assets/icons/disc.png', 150)} 
                      alt={item.name} 
                      className="object-cover w-full h-full"
                      loading="lazy"
                      decoding="async"
                      width={56}
                      height={56}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-[15px] font-bold text-white truncate max-w-[200px]">
                      {decodeHtml(item.name || item.title || '')}
                    </h4>
                    <span className="text-[13px] text-text-subdued font-medium capitalize">
                      {item.type} • {decodeHtml(item.artist || item.primaryArtists || 'Various Artists')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
