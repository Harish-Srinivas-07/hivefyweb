"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import Sidebar from "@/components/Sidebar";
import QueuePanel from "@/components/QueuePanel";
import Player from "@/components/Player";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import AudioController from "@/components/AudioController";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentSong, showQueue } = usePlayerStore();

  return (
    <div className="flex flex-col h-screen bg-bg-base font-spotify">
      {/* Desktop Grid Layout */}
      <div 
        className="hidden md:grid h-full w-full gap-2 p-2 overflow-hidden bg-black"
        style={{
          gridTemplateAreas: '"topbar topbar" "sidebar main" "player player"',
          gridTemplateColumns: 'var(--sidebar-width) 1fr',
          gridTemplateRows: currentSong ? 'var(--topbar-height) 1fr var(--player-height)' : 'var(--topbar-height) 1fr 0px',
          gap: '8px'
        }}
      >
        <header 
          className="flex items-center backdrop-blur-md bg-black px-4 h-topbar z-[1001]"
          style={{ gridArea: 'topbar' }}
        >
          <TopBar />
        </header>

        <aside 
          className="flex flex-col gap-2 overflow-hidden bg-bg-base"
          style={{ gridArea: 'sidebar' }}
        >
          {showQueue ? <QueuePanel /> : <Sidebar />}
        </aside>

        <main 
          className="relative flex flex-col overflow-hidden rounded-lg bg-surface-base"
          style={{ gridArea: 'main' }}
        >
          <div className="flex-1 px-8 pb-32 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {children}
          </div>
        </main>
        {currentSong && (
          <footer 
            className="flex items-center px-4 bg-bg-base z-[2000]"
            style={{ gridArea: 'player' }}
          >
            <AudioController />
            <Player />
          </footer>
        )}
      </div>

      {/* Mobile Layout Wrapper */}
      <div className="flex md:hidden flex-col h-full overflow-hidden relative">
        <header className="sticky top-0 z-10 flex items-center px-4 backdrop-blur-md bg-black/50 h-[64px] border-b border-white/5">
          <TopBar />
        </header>
        
        <main className="flex-1 overflow-y-auto pb-[180px]">
          <div className="px-2 py-4">
            {children}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-[3000] flex flex-col pointer-events-none">
          {/* Mobile Floating Player */}
          {currentSong && (
            <div className="px-2 mb-2 pointer-events-auto">
              <div className="bg-[#181818]/95 backdrop-blur-2xl rounded-xl p-2.5 border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.6)] flex items-center gap-3 active:scale-[0.99] transition-transform">
                 <AudioController />
                 <Player />
              </div>
            </div>
          )}
          <div className="pointer-events-auto shadow-[0_-12px_32px_rgba(0,0,0,0.4)]">
             <BottomNav />
          </div>
        </div>
      </div>
      
      {/* Fallback styling for images to ensure transparency */}
      <style jsx global>{`
        img[src*="logo.png"], 
        .logo-img,
        [data-testid="logo"] {
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
