"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="sidebar-container">
      <nav className="nav-links">
        <Link href="/" className="nav-item-link">
          <div className="nav-item">
            <Image src="/assets/icons/logo.png" alt="Hivefy" width={32} height={32} className="logo-img" />
            <span className="brand-name">Hivefy</span>
          </div>
        </Link>
        <Link href="/" className="nav-item-link">
          <div className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <Image src="/assets/icons/home.png" alt="Home" width={24} height={24} className={`icon-img ${pathname === '/' ? 'icon-invert' : ''}`} />
            <span>Home</span>
          </div>
        </Link>
        <Link href="/search" className="nav-item-link">
          <div className={`nav-item ${pathname === '/search' ? 'active' : ''}`}>
            <Image src="/assets/icons/search.png" alt="Search" width={24} height={24} className={`icon-img ${pathname === '/search' ? 'icon-invert' : ''}`} />
            <span>Search</span>
          </div>
        </Link>
      </nav>

      <div className="library-section">
        <header className="library-header">
          <div className="library-title">
            <Image src="/assets/icons/playlist.png" alt="Library" width={24} height={24} className="icon-img" />
            <span>Your Library</span>
          </div>
          <div className="library-actions">
            <button className="icon-button">
              <Image src="/assets/icons/add.png" alt="Add" width={16} height={16} />
            </button>
          </div>
        </header>

        <div className="filter-chips">
          <button className="chip active">Playlists</button>
          <button className="chip">Artists</button>
          <button className="chip">Albums</button>
        </div>

        <div className="library-controls">
          <button className="icon-button">
            <Image src="/assets/icons/search.png" alt="Search" width={16} height={16} />
          </button>
          <div className="recents">
            <span>Recents</span>
            <Image src="/assets/icons/menu.png" alt="Menu" width={16} height={16} />
          </div>
        </div>

        <div className="library-list">
          <LibraryItem 
            title="Liked Songs" 
            subtitle="Playlist • 385 songs" 
            image="/assets/icons/heart.png" 
            pinned 
          />
          <LibraryItem 
            title="Hiphop Tamizha Mix" 
            subtitle="Playlist • Spotify" 
            image="/assets/icons/equalizer.png" 
            active
          />
          <LibraryItem 
            title="Padayappa (Original Motion Picture)" 
            subtitle="Album • A.R. Rahman" 
            image="/assets/icons/disc.png" 
          />
          <LibraryItem 
            title="Sai Abhyankkar" 
            subtitle="Artist" 
            image="/assets/icons/artist.png" 
          />
           <LibraryItem 
            title="Love Failure Songs | Tamil" 
            subtitle="Playlist" 
            image="/assets/icons/song.png" 
          />
        </div>
      </div>
    </div>
  );
};

const LibraryItem = ({ title, subtitle, image, pinned, active }: any) => (
  <div className={`library-item ${active ? 'active' : ''}`}>
    <div className="item-image-container">
      <Image src={image} alt={title} width={48} height={48} className="item-image" />
    </div>
    <div className="item-info">
      <div className="item-title">
        {pinned && <span className="pinned-icon">📌</span>}
        <span className={active ? 'active-text' : ''}>{title}</span>
      </div>
      <div className="item-subtitle">{subtitle}</div>
    </div>
    {active && <div className="playing-status"><Image src="/assets/icons/player.gif" alt="Playing" width={14} height={14} unoptimized /></div>}
  </div>
);

export default Sidebar;
