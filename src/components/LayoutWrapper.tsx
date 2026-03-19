"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import TopBar from "@/components/TopBar";
import AudioController from "@/components/AudioController";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentSong } = usePlayerStore();

  const containerStyle = {
    gridTemplateRows: currentSong ? '1fr var(--player-height)' : '1fr 0px',
    gap: currentSong ? '8px' : '0px'
  };

  return (
    <div className="layout-container" style={containerStyle}>
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <main className="main-view">
        <header className="topbar">
          <TopBar />
        </header>
        <div className="content">
          {children}
        </div>
      </main>
      {currentSong && (
        <footer className="player-bar">
          <AudioController />
          <Player />
        </footer>
      )}
    </div>
  );
}
