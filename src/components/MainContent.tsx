"use client";

import Link from 'next/link';
import './MainContent.css';
import { Playlist, Album, Artist } from '@/types';
import { decodeHtml } from '@/services/api';

interface MainContentProps {
  gridPlaylists: Playlist[];
  topLatest: Playlist[];
  topLatestAlbum: Album[];
  fresh: Playlist[];
  freshAlbum: Album[];
  party: Playlist[];
  love: Playlist[];
  artists: Artist[];
}

const MainContent: React.FC<MainContentProps> = ({
  gridPlaylists,
  topLatest,
  topLatestAlbum,
  fresh,
  freshAlbum,
  party,
  love,
  artists
}) => {
  const getImageUrl = (item: any) => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images[item.images.length - 1].url || item.images[item.images.length - 1].link || item.images[0].url || '/assets/icons/logo.png';
    }
    if (item.image) {
      if (typeof item.image === 'string') return item.image;
      if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[item.image.length - 1].url || item.image[item.image.length - 1].link || item.image[0].url || '/assets/icons/logo.png';
      }
    }
    return '/assets/icons/logo.png';
  };

  return (
    <div className="main-content">
      <div className="main-filters">
        <button className="chip active">All</button>
        <button className="chip">Music</button>
        <button className="chip">Podcasts</button>
      </div>

      {/* Top Grid Section */}
      <div className="grid-container">
        <FeaturedCard title="Liked Songs" image="/assets/icons/heart.png" special />
        {gridPlaylists.map((p) => {
          const img = getImageUrl(p); 
          return (
            <Link key={p.id} href={`/playlist/${p.id}`}>
              <FeaturedCard title={decodeHtml(p.name || p.title)} image={img} />
            </Link>
          );
        })}
      </div>

      {/* Dynamic Sections */}
      {topLatest.length > 0 && (
        <Section title="Top Latest" items={topLatest} type="playlist" />
      )}
      
      {topLatestAlbum.length > 0 && (
        <Section title="Today's biggest hits" items={topLatestAlbum} type="album" />
      )}

      {fresh.length > 0 && (
        <Section title="Fresh" items={fresh} type="playlist" />
      )}

      {freshAlbum.length > 0 && (
        <Section title="Recommended for today" items={freshAlbum} type="album" />
      )}

      {party.length > 0 && (
        <Section title="Party Mode" items={party} type="playlist" />
      )}

      {artists.length > 0 && (
        <ArtistSection title="Fav Artists" artists={artists.slice(0, 10)} />
      )}

      {love.length > 0 && (
        <Section title="Always Love" items={love} type="playlist" />
      )}

      <div style={{ height: 100 }} /> {/* Bottom padding */}
    </div>
  );
};

// Reusing FeaturedCard
const FeaturedCard = ({ title, image, special }: { title: string, image: string, special?: boolean }) => (
  <div className={`featured-card ${special ? 'special' : ''}`}>
    <div className="featured-image">
      <img src={image} alt={title} className="feat-img" /> 
    </div>
    <span className="featured-title">{title}</span>
    <div className="play-button-overlay">
      <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 24 24" fill="black"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
    </div>
  </div>
);

// Generic Section for Playlists and Albums
const Section = ({ title, items, type }: { title: string, items: any[], type: 'playlist' | 'album' }) => (
  <section className="content-section">
    <div className="section-header">
      <h2>{title}</h2>
      {items.length > 5 && <button className="show-all">Show all</button>}
    </div>
    <div className="scroll-row">
      {items.map((item: any, i: number) => {
        let img = '/assets/icons/logo.png';
        if (Array.isArray(item.images) && item.images.length > 0) img = item.images[item.images.length - 1].url || item.images[0].url;
        else if (typeof item.image === 'string') img = item.image;
        else if (Array.isArray(item.image) && item.image.length > 0) img = item.image[item.image.length - 1].url || item.image[0].url;

        const subtitle = type === 'playlist' 
            ? (item.artist || (item.songCount ? `${item.songCount} songs` : ''))
            : (item.artist || 'Unknown Artist');
            
        return (
          <Link 
            key={item.id || i} 
            href={`/${type}/${item.id}`} 
            className="music-card-anchor"
            onClick={() => console.log(`[MainContent] Navigating to ${type} with ID: ${item.id}`)}
          >
            <div className="music-card">
              <div className="card-image">
                <img src={img} alt={item.title} className="sec-img" />
                <div className="card-play-btn">
                  <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" fill="black"><path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                </div>
              </div>
              <div className="card-title">{decodeHtml(item.name || item.title)}</div>
              <div className="card-desc" dangerouslySetInnerHTML={{ __html: subtitle }} /> 
            </div>
          </Link>
        )
      })}
    </div>
  </section>
);

// Specific Artist Section for circular images
const ArtistSection = ({ title, artists }: { title: string, artists: Artist[] }) => (
  <section className="content-section">
    <div className="section-header">
      <h2>{title}</h2>
      {artists.length > 5 && <button className="show-all">Show all</button>}
    </div>
    <div className="scroll-row">
      {artists.map((artist: any, i) => {
        let img = '/assets/icons/logo.png';
        if (Array.isArray(artist.images) && artist.images.length > 0) img = artist.images[artist.images.length - 1].url || artist.images[0].url;
        else if (typeof artist.image === 'string') img = artist.image;
        else if (Array.isArray(artist.image) && artist.image.length > 0) img = artist.image[artist.image.length - 1].url || artist.image[0].url;

        return (
          <div key={artist.id || i} className="music-card artist-card">
             <div className="card-image circular">
              <img src={img} alt={artist.title} className="sec-img" style={{ borderRadius: '50%' }} />
            </div>
            <div className="card-title text-center" style={{ textAlign: 'center' }}>{decodeHtml(artist.name || artist.title)}</div>
            <div className="card-desc text-center" style={{ textAlign: 'center' }}>Artist</div>
          </div>
        )
      })}
    </div>
  </section>
);

export default MainContent;
