import React from 'react';
import { SaavnAPI, decodeHtml } from '@/services/api';
import SongList from '@/components/SongList';
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
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center max-w-[400px]">
          <Image src="/assets/icons/search.png" alt="Search" width={64} height={64} className="mx-auto mb-6 transition-opacity invert opacity-50" />
          <h2 className="mb-2 text-2xl font-bold text-white">Play what you love</h2>
          <p className="text-base text-[#a7a7a7]">Search for artists, songs, podcasts, and more.</p>
        </div>
      </div>
    );
  }

  // Fetch from the search API endpoint using the global search for all media types
  const [searchResults, searchSongsResult] = await Promise.all([
    SaavnAPI.globalSearch(query),
    SaavnAPI.searchSongs(query, 0, 20)
  ]);

  const globalSongs = searchResults?.songs?.results || [];
  const albums = searchResults?.albums?.results || [];
  const playlists = searchResults?.playlists?.results || [];

  // Combine global top songs with deeper song search results, deduplicating by ID
  // Prioritize deeper search results as they often have better metadata (like duration)
  const songMap = new Map();
  searchSongsResult.forEach(s => songMap.set(s.id, s));
  globalSongs.forEach(s => {
    if (!songMap.has(s.id)) songMap.set(s.id, s);
  });
  const songs = Array.from(songMap.values());

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white">Total Results for &quot;{decodeHtml(query)}&quot;</h2>
      </div>
      
      {songs.length > 0 && (
         <div>
            <h3 className="mb-4 text-xl font-bold text-white">Songs</h3>
            <SongList songs={songs} />
         </div>
      )}

      {albums.length > 0 && (
        <div className="mt-8">
           <h3 className="mb-4 text-xl font-bold text-white">Albums</h3>
           <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
             {albums.map((album: any) => (
               <Link key={album.id} href={`/album/${album.id}`}>
                 <div className="h-full p-4 transition-colors rounded-lg cursor-pointer bg-[#181818] hover:bg-[#282828] group">
                   <div className="relative w-full mb-4 overflow-hidden shadow-2xl aspect-square rounded">
                    <Image src={album.images?.[album.images.length-1]?.url || '/assets/icons/disc.png'} alt={album.title} width={180} height={180} className="object-cover w-full h-full" />
                   </div>
                   <div className="mb-1 text-base font-bold text-white truncate">{album.title || album.name}</div>
                   <div className="text-sm text-[#a7a7a7] truncate">{album.year || album.artist || 'Album'}</div>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="mt-8">
           <h3 className="mb-4 text-xl font-bold text-white">Playlists</h3>
           <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
             {playlists.map((playlist: any) => (
               <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                 <div className="h-full p-4 transition-colors rounded-lg cursor-pointer bg-[#181818] hover:bg-[#282828] group">
                   <div className="relative w-full mb-4 overflow-hidden shadow-2xl aspect-square rounded">
                    <Image src={playlist.images?.[playlist.images.length-1]?.url || '/assets/icons/playlist.png'} alt={playlist.title} width={180} height={180} className="object-cover w-full h-full" />
                   </div>
                   <div className="mb-1 text-base font-bold text-white truncate">{playlist.title || playlist.name}</div>
                   <div className="text-sm text-[#a7a7a7] truncate">{playlist.artist || 'Playlist'}</div>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      )}

      {songs.length === 0 && albums.length === 0 && playlists.length === 0 && (
        <div className="py-16 text-center text-white">
           <p className="mb-3 text-xl font-bold">No results found for &quot;{query}&quot;</p>
           <p className="text-base font-normal text-[#a7a7a7]">Please make sure your words are spelled correctly or use less or different keywords.</p>
        </div>
      )}
    </div>
  );
}
