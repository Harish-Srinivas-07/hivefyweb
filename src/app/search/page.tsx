import React from 'react';
import { SaavnAPI, decodeHtml } from '@/services/api';
import SongList from '@/components/SongList';
import './SearchPage.css';
import Image from 'next/image';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = params.q;
  const query = typeof rawQuery === 'string' ? rawQuery : '';

  if (!query) {
    return (
      <div className="search-empty-state">
        <div className="empty-content">
          <Image src="/assets/icons/search.png" alt="Search" width={64} height={64} className="icon-invert opacity-50 mb-6" />
          <h2>Play what you love</h2>
          <p>Search for artists, songs, podcasts, and more.</p>
        </div>
      </div>
    );
  }

  // Fetch from the search API endpoint using the global search for all media types
  const searchResults = await SaavnAPI.globalSearch(query);

  const songs = searchResults?.songs?.results || [];
  const albums = searchResults?.albums?.results || [];
  const playlists = searchResults?.playlists?.results || [];

  return (
    <div className="search-results-page">
      <div className="search-header-area">
        <h2 className="search-title">Total Results for &quot;{decodeHtml(query)}&quot;</h2>
      </div>
      
      {songs.length > 0 && (
         <div className="search-section">
            <h3 className="section-subtitle">Songs</h3>
            <SongList songs={songs} />
         </div>
      )}

      {albums.length > 0 && (
        <div className="search-section mt-8">
           <h3 className="section-subtitle">Albums</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
             {albums.map((album: any) => (
               <Link key={album.id} href={`/album/${album.id}`} className="media-card-link">
                 <div className="media-card">
                   <Image src={album.images?.[album.images.length-1]?.url || '/assets/icons/disc.png'} alt={album.title} width={180} height={180} className="card-img" />
                   <div className="card-title">{album.title || album.name}</div>
                   <div className="card-subtitle">{album.year || album.artist || 'Album'}</div>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="search-section mt-8">
           <h3 className="section-subtitle">Playlists</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
             {playlists.map((playlist: any) => (
               <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="media-card-link">
                 <div className="media-card">
                   <Image src={playlist.images?.[playlist.images.length-1]?.url || '/assets/icons/playlist.png'} alt={playlist.title} width={180} height={180} className="card-img" />
                   <div className="card-title">{playlist.title || playlist.name}</div>
                   <div className="card-subtitle">{playlist.artist || 'Playlist'}</div>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      )}

      {songs.length === 0 && albums.length === 0 && playlists.length === 0 && (
        <div className="no-results">
           <p>No results found for &quot;{query}&quot;</p>
           <p className="no-results-sub">Please make sure your words are spelled correctly or use less or different keywords.</p>
        </div>
      )}
    </div>
  );
}
